import React, { useCallback, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { audioService } from "@/lib/audio";

type Props = {
  frets: [number, number, number, number];
  fingers?: [number | null, number | null, number | null, number | null];
  barre?: { fromString: 1 | 2 | 3 | 4; toString: 1 | 2 | 3 | 4; fret: number } | null;
  startFret?: number;
  label?: string;
  interactive?: boolean;
};

const ChordDiagram: React.FC<Props> = ({
  frets,
  fingers,
  barre,
  startFret = 1,
  label,
  interactive = true,
}) => {
  const { leftHanded } = useApp();
  const strings = leftHanded ? [1, 2, 3, 4] : [4, 3, 2, 1];
  const width = 160;
  const height = 200;
  const margin = 30;
  
  const activeFrets = frets.filter(f => f > 0);
  const minActiveFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
  const maxActiveFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 1;
  const fretCount = 6;

  const desiredStart = startFret
    ? startFret
    : minActiveFret <= 2
      ? 1
      : minActiveFret - 1;

  let effectiveStartFret = desiredStart;
  const spanFromDesired = maxActiveFret - effectiveStartFret + 1;
  if (spanFromDesired > fretCount) {
    effectiveStartFret = Math.max(1, maxActiveFret - fretCount + 1);
  }

  const colX = (i: number) => margin + (i * (width - 2 * margin)) / (strings.length - 1);
  const rowY = (i: number) => margin + (i * (height - 2 * margin - 20)) / fretCount;

  const fingerColX = (i: number) => {
    const base = colX(i);
    const offset = 8;
    if (i === 0) return base + offset;
    if (i === strings.length - 1) return base - offset;
    return base;
  };

  const relativeFrets: [number, number, number, number] = frets.map(f => {
    if (f < 0) return f;
    if (f === 0) return 0;
    return f - effectiveStartFret + 1;
  }) as [number, number, number, number];

  const textAnchorStyle: React.CSSProperties = leftHanded ? {
    transformBox: "fill-box",
    transformOrigin: "center",
    transform: "scaleX(-1)"
  } : {};

  const [pluckedString, setPluckedString] = useState<number | null>(null);

  const getStringIndex = (visualS: number) => visualS === 4 ? 0 : visualS === 3 ? 1 : visualS === 2 ? 2 : 3;

  const handleStringClick = useCallback((stringNum: number) => {
    if (!interactive) return;
    const stringIndex = getStringIndex(stringNum);
    const fret = frets[stringIndex];
    if (fret < 0) return;
    setPluckedString(stringNum);
    audioService.playNote(stringIndex, fret);
    setTimeout(() => setPluckedString(null), 400);
  }, [frets, interactive]);

  const stringHitArea = (s: number, i: number) => {
    if (!interactive) return null;
    const fret = frets[getStringIndex(s)];
    if (fret < 0) return null;
    const x = colX(i);
    const hitWidth = Math.max(0, (width - 2 * margin) / (strings.length - 1));
    const hitHeight = Math.max(0, rowY(fretCount) - rowY(0) + 36);
    return (
      <rect
        key={`hit-${s}`}
        x={x - hitWidth / 2}
        y={rowY(0) - 18}
        width={hitWidth}
        height={hitHeight}
        fill="transparent"
        className="cursor-pointer"
        onClick={() => handleStringClick(s)}
      >
        <title>Corda {s}</title>
      </rect>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto text-foreground"
        style={leftHanded ? { transform: "scaleX(-1)" } : undefined}
      >
        {/* Sombreamento das casas */}
        {Array.from({ length: fretCount }).map((_, i) => (
          <rect
            key={`shadow-${i}`}
            x={margin}
            y={rowY(i)}
            width={width - 2 * margin}
            height={rowY(i + 1) - rowY(i)}
            fill="hsl(var(--muted))"
            opacity={i % 2 === 0 ? 0.03 : 0.06}
            stroke="none"
          />
        ))}

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
        {strings.map((s, i) => {
          const isPlucked = pluckedString === s;
          return (
            <g key={s}>
              {/* Glow behind string when plucked */}
              {isPlucked && (
                <line
                  x1={colX(i)}
                  x2={colX(i)}
                  y1={rowY(0)}
                  y2={rowY(fretCount)}
                  stroke="hsl(var(--primary))"
                  strokeWidth={6}
                  opacity={0.3}
                  className="animate-[pulse_0.4s_ease-out]"
                />
              )}
              <line
                x1={colX(i)}
                x2={colX(i)}
                y1={rowY(0)}
                y2={rowY(fretCount)}
                stroke={isPlucked ? "hsl(var(--primary))" : "currentColor"}
                strokeWidth={isPlucked ? 2.5 : 1.5}
                opacity={isPlucked ? 1 : 0.8}
                style={isPlucked ? { transition: "all 0.1s ease-out" } : undefined}
              />
            </g>
          );
        })}
        
        {/* Marcadores de casas */}
        {Array.from({ length: fretCount }).map((_, i) => {
          const actualFret = effectiveStartFret + i;
          const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
          if (!markerFrets.includes(actualFret)) return null;
          
          const cy = (rowY(i + 1) + rowY(i)) / 2;
          const cx = width / 2;
          const isDoubleDot = actualFret === 12 || actualFret === 24;
          
          if (isDoubleDot) {
            return (
              <g key={`marker-${i}`}>
                <circle cx={cx - 15} cy={cy} r={5} fill="hsl(var(--muted-foreground))" opacity={0.5} />
                <circle cx={cx + 15} cy={cy} r={5} fill="hsl(var(--muted-foreground))" opacity={0.5} />
              </g>
            );
          }
          
          return (
            <circle key={`marker-${i}`} cx={cx} cy={cy} r={5} fill="hsl(var(--muted-foreground))" opacity={0.5} />
          );
        })}
        
        {/* Indicadores de corda */}
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
        
        {/* X/O marcadores */}
        {strings.map((s, i) => {
          const f = relativeFrets[getStringIndex(s)];
          const cx = fingerColX(i);
          if (f < 0) {
            return (
              <text
                key={`x-${s}`}
                x={cx}
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
                cx={cx}
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
        {barre && (() => {
          const relativeBarre = barre.fret - effectiveStartFret + 1;
          if (relativeBarre > 0 && relativeBarre <= fretCount) {
            const fromIdx = strings.indexOf(barre.fromString);
            const toIdx = strings.indexOf(barre.toString);
            const x1 = colX(Math.min(fromIdx, toIdx));
            const x2 = colX(Math.max(fromIdx, toIdx));
            const barreWidth = Math.max(0, x2 - x1 + 16);
            return (
              <rect
                x={x1 - 8}
                y={rowY(relativeBarre) - (rowY(relativeBarre) - rowY(relativeBarre - 1)) / 2 - 7}
                width={barreWidth}
                height={14}
                rx={7}
                fill="hsl(var(--primary))"
                opacity={0.9}
              />
            );
          }
          return null;
        })()}
        
        {/* Dedos */}
        {strings.map((s, i) => {
          const si = getStringIndex(s);
          const f = relativeFrets[si];
          if (f <= 0) return null;
          
          const cx = fingerColX(i);
          const cy = rowY(f) - (rowY(f) - rowY(f - 1)) / 2;
          const finger = fingers?.[si] ?? null;
          
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

        {/* Indicador de traste inicial */}
        {effectiveStartFret > 1 && (
          <text
            x={margin - 15}
            y={rowY(1)}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            opacity={0.6}
            fontWeight="600"
            style={textAnchorStyle}
          >
            {effectiveStartFret}fr
          </text>
        )}

        {/* Hit areas for individual string playback — rendered last for top z-order */}
        {strings.map((s, i) => stringHitArea(s, i))}
      </svg>
      {label && (
        <div className="text-sm text-muted-foreground font-medium mt-1">{label}</div>
      )}
    </div>
  );
};

export default ChordDiagram;
