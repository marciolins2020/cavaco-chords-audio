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
  
  // Calcular a casa inicial real baseada nas notas (não no startFret passado)
  const activeFrets = frets.filter(f => f > 0);
  const minActiveFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
  const maxActiveFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 1;
  
  // Se todas as notas cabem nas primeiras 4 casas, mostra desde casa 1
  // Senão, ajusta o startFret para mostrar todas as notas
  const effectiveStartFret = minActiveFret <= 4 ? 1 : minActiveFret - 1;
  
  // Número de trastes a mostrar: mínimo 4, máximo 5
  const fretSpan = maxActiveFret - effectiveStartFret + 1;
  const fretCount = Math.max(4, Math.min(5, fretSpan + 1));
  
  const colX = (i: number) => margin + (i * (width - 2 * margin)) / (strings.length - 1);
  const rowY = (i: number) => margin + (i * (height - 2 * margin - 20)) / fretCount;

  // Ajuste horizontal para garantir que as notas das cordas extremas fiquem dentro do quadrado
  const fingerColX = (i: number) => {
    const base = colX(i);
    const offset = 8; // metade aproximada do raio do círculo do dedo
    if (i === 0) return base + offset; // corda mais à esquerda
    if (i === strings.length - 1) return base - offset; // corda mais à direita
    return base;
  };

  // Ajustar frets para serem relativos ao effectiveStartFret
  const relativeFrets: [number, number, number, number] = frets.map(f => {
    if (f < 0) return f; // Mute (X)
    if (f === 0) return 0; // Open string
    return f - effectiveStartFret + 1; // Ajusta para posição relativa
  }) as [number, number, number, number];

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
        
        {/* Marcadores de casas (dots) nas casas 3, 5, 7, 9, 12 */}
        {Array.from({ length: fretCount }).map((_, i) => {
          const actualFret = effectiveStartFret + i;
          const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
          if (!markerFrets.includes(actualFret)) return null;
          
          // Posição vertical: entre dois trastes
          const cy = (rowY(i + 1) + rowY(i)) / 2;
          const cx = width / 2; // Centro horizontal
          const isDoubleDot = actualFret === 12 || actualFret === 24;
          
          if (isDoubleDot) {
            // Dois pontos para casa 12 e 24
            return (
              <g key={`marker-${i}`}>
                <circle
                  cx={cx - 15}
                  cy={cy}
                  r={5}
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.5}
                />
                <circle
                  cx={cx + 15}
                  cy={cy}
                  r={5}
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.5}
                />
              </g>
            );
          }
          
          // Um ponto para outras casas
          return (
            <circle
              key={`marker-${i}`}
              cx={cx}
              cy={cy}
              r={5}
              fill="hsl(var(--muted-foreground))"
              opacity={0.5}
            />
          );
        })}
        
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
        
        {/* X/O marcadores */}
        {strings.map((s, i) => {
          const f = relativeFrets[s === 4 ? 0 : s === 3 ? 1 : s === 2 ? 2 : 3];
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
            return (
              <rect
                x={colX(strings.indexOf(barre.fromString)) - 8}
                y={rowY(relativeBarre) - (rowY(relativeBarre) - rowY(relativeBarre - 1)) / 2 - 7}
                width={colX(strings.indexOf(barre.toString)) - colX(strings.indexOf(barre.fromString)) + 16}
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
          const f = relativeFrets[s === 4 ? 0 : s === 3 ? 1 : s === 2 ? 2 : 3];
          if (f <= 0) return null;
          
          const cx = fingerColX(i);
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
        {/* Indicador de traste inicial quando effectiveStartFret > 1 */}
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
      </svg>
      {label && (
        <div className="text-sm text-muted-foreground font-medium mt-1">{label}</div>
      )}
    </div>
  );
};

export default ChordDiagram;
