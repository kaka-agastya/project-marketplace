// components/CustomCursor.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      // Animasikan posisi kursor dengan sedikit delay untuk efek halus
      gsap.to(cursorDotRef.current, { x: clientX, y: clientY, duration: 0.2 });
      gsap.to(cursorOutlineRef.current, { x: clientX, y: clientY, duration: 0.6, ease: 'power2.out' });
    };

    const handleMouseEnter = () => {
      gsap.to(cursorOutlineRef.current, { scale: 1.5, duration: 0.3 });
    };
    const handleMouseLeave = () => {
      gsap.to(cursorOutlineRef.current, { scale: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);
    
    // Tambahkan interaksi ke semua link dan tombol
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.querySelectorAll('a, button').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={cursorOutlineRef} className="cursor-outline"></div>
      <div ref={cursorDotRef} className="cursor-dot"></div>
    </>
  );
}