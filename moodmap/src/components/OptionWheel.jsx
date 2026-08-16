import { useEffect, useRef, useState, useCallback } from 'react';
import './OptionWheel.css';

export default function OptionWheel({
  items = [
    'Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave',
    'Trance', 'Funk', 'Disco', 'Hip-Hop', 'Chillwave', 'Drum & Bass'
  ],
  defaultSelected = 4,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 1.2,
  spacing = 1.35,
  curve = 0.9,
  tilt = 4,
  blur = 1.5,
  fade = 0.35,
  smoothing = 180,
  inset = 20,
  loop = true,
  draggable = true,
  onChange,
  className = '',
}) {
  const containerRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const scrollPos = useRef(defaultSelected);
  const targetPos = useRef(defaultSelected);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startPos = useRef(defaultSelected);
  const itemRefs = useRef([]);

  const numItems = items.length;

  const clampPos = useCallback((pos) => {
    if (loop) {
      return ((pos % numItems) + numItems) % numItems;
    }
    return Math.max(0, Math.min(numItems - 1, pos));
  }, [loop, numItems]);

  const snapTo = useCallback((index) => {
    targetPos.current = clampPos(index);
  }, [clampPos]);

  // Notify parent cleanly
  useEffect(() => {
    if (onChange) {
      onChange(selectedIndex, items[selectedIndex]);
    }
  }, [selectedIndex, items, onChange]);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const update = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth interpolation toward targetPos
      const factor = 1 - Math.exp(-dt * (1000 / smoothing));
      scrollPos.current += (targetPos.current - scrollPos.current) * factor;

      const currentRounded = Math.round(scrollPos.current);
      const clampedRounded = ((currentRounded % numItems) + numItems) % numItems;
      
      setSelectedIndex((prev) => (prev !== clampedRounded ? clampedRounded : prev));

      // Update position of each item along the curved wheel
      items.forEach((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return;

        let diff = i - scrollPos.current;
        if (loop) {
          diff = ((diff + numItems / 2) % numItems) - numItems / 2;
          if (diff < -numItems / 2) diff += numItems;
        }

        const absDiff = Math.abs(diff);
        const yOffset = diff * spacing * 26;
        const xOffset = Math.pow(absDiff, 1.1) * curve * 12 * (side === 'right' ? -1 : 1);
        const rotation = diff * tilt * (side === 'right' ? -1 : 1);
        const opacityVal = Math.max(0, 1 - absDiff * fade);
        const blurVal = Math.min(6, absDiff * blur);
        const proximity = Math.max(0, 1 - absDiff);

        el.style.transform = `translate3d(${xOffset}px, calc(-50% + ${yOffset}px), 0) rotate(${rotation}deg)`;
        el.style.opacity = opacityVal.toFixed(3);
        el.style.filter = blurVal > 0.1 ? `blur(${blurVal.toFixed(1)}px)` : 'none';
        el.style.setProperty('--ow-p', proximity.toFixed(3));
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [items, numItems, spacing, curve, tilt, blur, fade, smoothing, side, loop]);

  const handlePointerDown = (e) => {
    if (!draggable) return;
    isDragging.current = true;
    startY.current = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    startPos.current = scrollPos.current;
    if (containerRef.current) {
      containerRef.current.classList.add('option-wheel--dragging');
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const deltaY = startY.current - currentY;
    const deltaItems = deltaY / (spacing * 26);
    targetPos.current = clampPos(startPos.current + deltaItems);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('option-wheel--dragging');
    }
    targetPos.current = clampPos(Math.round(targetPos.current));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * 0.7;
    targetPos.current = clampPos(targetPos.current + delta);
  };

  return (
    <div
      ref={containerRef}
      className={`option-wheel option-wheel--${side} ${className}`.trim()}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {items.map((item, i) => {
        const isSelected = i === selectedIndex;
        return (
          <div
            key={item}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`option-wheel__item ${isSelected ? 'option-wheel__item--selected' : ''}`}
            onClick={() => snapTo(i)}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
