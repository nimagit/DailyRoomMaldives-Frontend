import { useEffect, useRef } from 'react';

/**
 * Animated ocean wave divider with 3 layered SVG waves.
 * Each layer moves at a different speed for a realistic water effect.
 *
 * Props:
 *  - topColor    : fill color above the wave (e.g. "white" or "transparent")
 *  - waveColors  : [back, mid, front] wave fill colors
 *  - bottomColor : fill color of the page below (blends seamlessly)
 *  - height      : total component height in px (default 90)
 *  - flip        : mirror vertically (waves pointing down)
 */
export default function WaveDivider({
  topColor     = 'transparent',
  waveColors   = ['#7dd3fc', '#38bdf8', '#0ea5e9'],
  bottomColor  = '#f0f9ff',
  height       = 90,
  flip         = false,
  className    = '',
}) {
  // Each layer's wave path (seamlessly tileable — total width = 2 × 1440 = 2880)
  const wavePaths = [
    // Back layer — long gentle swells
    'M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 C1680,90 1920,10 2160,50 C2400,90 2640,10 2880,50 L2880,90 L0,90 Z',
    // Mid layer — medium waves, opposite phase
    'M0,55 C180,20 360,90 540,55 C720,20 900,90 1080,55 C1260,20 1440,90 1620,55 C1800,20 1980,90 2160,55 C2340,20 2520,90 2700,55 C2880,20 2880,90 2880,55 L2880,90 L0,90 Z',
    // Front layer — shorter choppier waves
    'M0,60 C120,30 240,75 360,50 C480,25 600,80 720,55 C840,30 960,75 1080,50 C1200,25 1320,80 1440,55 C1560,30 1680,75 1800,50 C1920,25 2040,80 2160,55 C2280,30 2400,75 2520,50 C2640,25 2760,80 2880,55 L2880,90 L0,90 Z',
  ];

  const speeds = ['18s', '11s', '7s'];
  const opacities = [0.35, 0.55, 1];

  const transform = flip ? 'scaleY(-1)' : 'none';

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ height, background: topColor, transform }}
      aria-hidden="true"
    >
      {wavePaths.map((path, i) => (
        <div
          key={i}
          className="wave-layer absolute bottom-0 left-0"
          style={{
            width: '200%',
            height: '100%',
            animationDuration: speeds[i],
            animationDelay: `${i * -2}s`,
            opacity: opacities[i],
          }}
        >
          <svg
            viewBox="0 0 2880 90"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path d={path} fill={waveColors[i] || bottomColor} />
          </svg>
        </div>
      ))}

      {/* Solid bottom strip to fully cover the seam */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{ height: 2, background: bottomColor }}
      />
    </div>
  );
}
