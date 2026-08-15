import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

// Standard GLSL Shaders for SpecularButton
const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uRadius;
varying vec2 vUv;

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  vec2 mouse = uMouse / uResolution.xy;
  
  // Distance from mouse for specular highlight
  float dist = distance(st, mouse);
  float specular = pow(max(1.0 - dist * 1.5, 0.0), 3.0) * uIntensity;
  
  // Outer rim glow
  vec2 centerDist = abs(st - 0.5) * 2.0;
  float rim = pow(max(length(centerDist) - 0.2, 0.0), 2.0);
  
  vec3 color = mix(uBaseColor, uLineColor, specular * 0.8 + rim * 0.3);
  gl_FragColor = vec4(color, 1.0);
}
`;

// Helper to convert hex to RGB 0-1
function hexToRgb(hex) {
  let clean = (hex || '#7c3aed').replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

export default function SpecularButton({
  children,
  size = 'md',
  radius = 999,
  lineColor = '#8b5cf6',
  baseColor = '#1a1a1a',
  intensity = 1,
  followMouse = true,
  autoAnimate = false,
  className = '',
  onClick,
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    let renderer, gl, program, mesh, animationFrameId;

    try {
      renderer = new Renderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      gl = renderer.gl;

      const geometry = new Triangle(gl);
      const rgbLine = hexToRgb(lineColor);
      const rgbBase = hexToRgb(baseColor);

      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uResolution: { value: [canvasRef.current.clientWidth || 46, canvasRef.current.clientHeight || 46] },
          uMouse: { value: [23, 23] },
          uLineColor: { value: rgbLine },
          uBaseColor: { value: rgbBase },
          uIntensity: { value: intensity },
          uRadius: { value: radius },
        },
      });

      mesh = new Mesh(gl, { geometry, program });

      const handleResize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setSize(rect.width * dpr, rect.height * dpr);
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `${rect.height}px`;
        if (program.uniforms.uResolution) {
          program.uniforms.uResolution.value = [rect.width * dpr, rect.height * dpr];
        }
      };

      handleResize();
      renderer.render({ scene: mesh });

      const handleMouseMove = (e) => {
        if (!followMouse || !containerRef.current || !program) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const x = (e.clientX - rect.left) * dpr;
        const y = (rect.height - (e.clientY - rect.top)) * dpr;
        program.uniforms.uMouse.value = [x, y];
        renderer.render({ scene: mesh });
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', handleMouseMove);
      }

      window.addEventListener('resize', handleResize);

      return () => {
        if (container) container.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    } catch (err) {
      console.warn('WebGL SpecularButton initialization failed, using CSS fallback:', err);
      setWebGlSupported(false);
    }
  }, [lineColor, baseColor, intensity, radius, followMouse]);

  // Fallback to CSS styled glowing button if WebGL fails
  if (!webGlSupported) {
    return (
      <button
        onClick={onClick}
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{
          borderRadius: `${radius}px`,
          background: `radial-gradient(circle at center, ${lineColor}aa, ${baseColor})`,
          boxShadow: `0 0 20px ${lineColor}66`,
          border: `1px solid ${lineColor}88`,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center overflow-hidden select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        width: '46px',
        height: '46px',
        border: `1px solid ${lineColor}88`,
        boxShadow: `0 0 24px ${lineColor}66, 0 0 45px ${lineColor}33`,
      }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ borderRadius: typeof radius === 'number' ? `${radius}px` : radius }}
      />
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </div>
    </div>
  );
}
