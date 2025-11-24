import React from "react";
import { useApp } from "@/contexts/AppContext";

type Props = {
  frets: [number, number, number, number];
  fingers?: [number | null, number | null, number | null, number | null];
  barre?: { fromString: 1 | 2 | 3 | 4; toString: 1 | 2 | 3 | 4; fret: number } | null;
  startFret?: number;
  label?: string;
};

const ChordDiagram: React.FC<Props> = ({
  frets,
  fingers,
  barre,
  startFret = 1,
  label
}) => {
  const { leftHanded } = useApp();
  const strings = leftHanded ? [1, 2, 3, 4] : [4, 3, 2, 1];
  const width = 160;
  const height = 200;
  const margin = 30;
  const fretCount = 5;
  
  const colX = (i: number) => margin + (i * (width - 2 * margin)) / (strings.length - 1);
  const rowY = (i: number) => margin + (i * (height - 2 * margin - 20)) / fretCount;

  // Transform logic specifically for TEXT elements to un-mirror them
  const textAnchorStyle: React.CSSProperties = leftHanded ? {
    transformBox: "fill-box",
    transformOrigin: "center",
    transform: "scaleX(-1)"
  } : {};

  return (
    <div className="flex flex-col items-center gap-2">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto text-foreground"
        style={leftHanded ? { transform: "scaleX(-1)" } : undefined}
      >
        {/* Trastes */}
        {Array.from({ length: fretCount + 1 }).map((_, i) => (
          <line
            key={i}
            x1={margin}
            x2={width - margin}
            y1={rowY(i)}
            y2={rowY(i)}
            stroke="currentColor"
            strokeWidth={i === 0 ? 3 : 1.5}
            opacity={i === 0 ? 1 : 0.6}
          />
        ))}
        
        {/* Cordas */}
        {strings.map((s, i) => (
          <line
            key={s}
            x1={colX(i)}
            x2={colX(i)}
            y1={rowY(0)}
            y2={rowY(fretCount)}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.8}
          />
        ))}
        
        {/* Indicadores de corda (4 3 2 1) - FIXED: un-mirrored in left-handed mode */}
        {strings.map((s, i) => (
          <text
            key={`string-${s}`}
            x={colX(i)}
            y={height - 5}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            opacity={0.5}
            fontWeight="600"
            style={textAnchorStyle}
          >
            {s}
          </text>
        ))}
        
        {/* X/O marcadores - FIXED: un-mirrored in left-handed mode */}
        {strings.map((s, i) => {
          const f = frets[s === 4 ? 0 : s === 3 ? 1 : s === 2 ? 2 : 3];
          if (f < 0) {
            return (
              <text
                key={`x-${s}`}
                x={colX(i)}
                y={rowY(0) - 10}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="currentColor"
                style={textAnchorStyle}
              >
                ×
              </text>
            );
          }
          if (f === 0) {
            return (
              <circle
                key={`o-${s}`}
                cx={colX(i)}
                cy={rowY(0) - 10}
                r={6}
                stroke="currentColor"
                strokeWidth={2}
                fill="none"
              />
            );
          }
          return null;
        })}
        
        {/* Pestana */}
        {barre && (
          <rect
            x={colX(strings.indexOf(barre.fromString)) - 8}
            y={rowY(barre.fret) - (rowY(barre.fret) - rowY(barre.fret - 1)) / 2 - 7}
            width={colX(strings.indexOf(barre.toString)) - colX(strings.indexOf(barre.fromString)) + 16}
            height={14}
            rx={7}
            fill="hsl(var(--primary))"
            opacity={0.9}
          />
        )}
        
        {/* Dedos - FIXED: un-mirrored finger numbers in left-handed mode */}
        {strings.map((s, i) => {
          const f = frets[s === 4 ? 0 : s === 3 ? 1 : s === 2 ? 2 : 3];
          if (f <= 0) return null;
          
          const cx = colX(i);
          const cy = rowY(f) - (rowY(f) - rowY(f - 1)) / 2;
          const finger = fingers?.[s === 4 ? 0 : s === 3 ? 1 : s === 2 ? 2 : 3] ?? null;
          
          return (
            <g key={`dot-${s}`}>
              <circle
                cx={cx}
                cy={cy}
                r={10}
                fill="hsl(var(--primary))"
                className="drop-shadow-lg"
              />
              {finger && (
                <text
                  x={cx}
                  y={cy + 4}
                  fontSize={12}
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="white"
                  style={textAnchorStyle}
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {label && (
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      )}
    </div>
  );
};

export default ChordDiagram;
