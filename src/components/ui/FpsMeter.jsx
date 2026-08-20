import { useState, useEffect, useRef, memo } from "react";

export const FpsMeter = memo(function FpsMeter() {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef(performance.now());

  useEffect(() => {
    let raf;
    const loop = () => {
      const now = performance.now();
      frames.current++;
      if (now - last.current >= 500) {
        setFps(Math.round((frames.current * 1000) / (now - last.current)));
        frames.current = 0;
        last.current = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div className="fps-meter">FPS: {fps}</div>;
});
