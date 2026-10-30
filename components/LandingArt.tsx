// Ilustraciones de las cajas de la portada, al estilo de las de Claude: una lámina del color del sistema con
// grano, figuras de papel recortado y trazo de tinta a mano. El motivo es el icono de la sección en el rail,
// animado en bucle. Rejilla de 200. Colores y animaciones en «Portada» en app/shell.css. Una sección sin
// ilustración propia usa la genérica.

import type { CSSProperties, ReactNode } from 'react';

const vars = (v: Record<string, string | number>) => v as CSSProperties;

// Lámina: un recorte algo torcido. Lo que se sale (brazos, burbujas) queda cortado por su borde.
const FIELD = 'M14 16 187 11 190 186 10 189Z';

// Grano: motas en posiciones fijas (pseudoaleatorias) que se repiten en un patrón de 48.
const GRAIN = (() => {
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 70 }, () => [rand() * 48, rand() * 48, 0.3 + rand() * 0.45]);
})();

// Fundamentos. Marcas de la regla: largas cada cuatro, medianas cada dos.
const TICKS = Array.from({ length: 17 }, (_, i) => {
  const x = 36 + i * 8;
  const top = 102.5 - ((x - 24) * 3) / 153;
  return `M${x} ${top.toFixed(1)}v${i % 4 === 0 ? 15 : i % 2 === 0 ? 10 : 6}`;
}).join('');

// Lápiz y mano, con la punta en el origen y el lápiz en vertical (luego se inclina).
const PENCIL = 'M0 0-5.5-14V-80a5.5 5.5 0 0 1 11 0V-14Z';
const INDEX = 'M20-58C10-50 2-40-3-31C-7-24-6-18-1-19C5-21 11-30 18-36';

// Iniciativas. Matraz y dedos que rodean el cuello.
const FLASK = 'M86 36V84L53 151Q46 170 64 170H136Q154 170 147 151L114 84V36Z';
const FINGERS = [
  'M132 46C116 43 96 42 85 46C78 49 80 56 87 56C101 56 118 55 132 55',
  'M132 55C116 56 98 57 87 60C80 62 82 69 89 68C103 67 118 66 132 65',
  'M132 65C118 67 104 69 95 72C89 74 91 80 97 79C109 78 121 76 132 74',
];

const ART: Record<string, ReactNode> = {
  // Regla: una mano traza una línea a lo largo del borde con un lápiz.
  fundamentos: (
    <>
      <defs>
        <mask id="ds-art-pencil" maskUnits="userSpaceOnUse" x="-60" y="-120" width="160" height="160">
          <rect x="-60" y="-120" width="160" height="160" fill="#fff" />
          <path d={`${INDEX}Z`} fill="#000" />
        </mask>
      </defs>
      <g transform="rotate(-12 100 112)">
        <path d="M24 103 177 100 179 141 22 143Z" className="ds-art-paper" />
        <path d={TICKS} className="ds-art-thin" />
        <path d="M32 93.5H136" pathLength={1} className="ds-art-trace" />
        <g className="ds-art-writer">
          <g transform="translate(32 93.5) rotate(36)">
            <path d="M-4-52C-12-48-17-41-15-35C-13-30-7-32-5-36" />
            <g mask="url(#ds-art-pencil)">
              <path d={PENCIL} className="ds-art-card" />
              <path d="M-5.5-14q5.5 3 11 0M-5.5-70h11" />
              <path d="M0 0-2.3-5.8h4.6Z" className="ds-art-ink" />
            </g>
            <path d={INDEX} />
            <path d="M18-36C13-28 9-21 10-15C11-10 17-10 20-14C23-18 26-24 30-28" />
            <path d="M20-58C30-72 50-100 70-140L90-190M30-28C46-40 66-62 86-96L120-150" />
          </g>
        </g>
      </g>
    </>
  ),
  // Muestrario: las hojas se cierran sobre la primera y vuelven a abrirse en abanico.
  tokens: (
    <g transform="translate(100 156)">
      {[-32, 0, 32].map((angle, i) => (
        <g key={angle} className="ds-art-leaf" style={vars({ '--a': `${angle}deg`, '--i': i })}>
          <path d="M-23 12-25-104 24-106 23 12Z" className="ds-art-card" />
          <circle cy="-80" r="13" className={['ds-art-ink', 'ds-art-shade', 'ds-art-cut'][i]} />
          <path d="M-12-50H12M-12-38H4" className="ds-art-thin" />
        </g>
      ))}
      <circle r="5.5" className="ds-art-card" />
    </g>
  ),
  // Cuatro piezas que encajan y giran a cuartos; al encajar salta una chispa en el centro.
  componentes: (
    <g transform="translate(100 100)">
      <g className="ds-art-spin">
        {[[0, -40], [40, 0], [0, 40], [-40, 0]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              d="M1-30 30-1 0 31-30 1Z"
              className={`ds-art-piece ${i === 0 ? 'ds-art-ink' : 'ds-art-paper'}`}
              style={vars({ '--dx': `${x / 3.6}px`, '--dy': `${y / 3.6}px` })}
            />
          </g>
        ))}
      </g>
      <path d="M0-8V-3M0 3V8M-8 0H-3M3 0H8M-5-5-3.5-3.5M5 5 3.5 3.5M5-5 3.5-3.5M-5 5-3.5 3.5" className="ds-art-spark ds-art-thin" />
      <path d="M41-71A82 82 0 0 1 77-28l1.6-8.9M77-28l-6.9-5.8M-41 71A82 82 0 0 1-77 28l-1.6 8.9M-77 28l6.9 5.8" className="ds-art-turn" />
    </g>
  ),
  // Plantilla: las cajas intercambian filas y columnas sin dejar de formar una maqueta.
  patrones: (
    <>
      <g className="ds-art-box" data-box="top">
        <path d="M30 35 170 33 171 91 29 92Z" className="ds-art-paper" />
        <path d="M44 54H112M44 70H88" className="ds-art-thin" />
      </g>
      <g className="ds-art-box" data-box="wide">
        <path d="M29 106 110 105 111 165 30 166Z" className="ds-art-paper" />
        <circle cx="70" cy="135" r="13" className="ds-art-shade" />
      </g>
      <g className="ds-art-box" data-box="narrow">
        <path d="M124 106 170 105 171 165 125 166Z" className="ds-art-ink" />
        <path d="M156 146V170L162.5 164.5 167 174 172 171.5 167.5 162H176Z" className="ds-art-card ds-art-thin" />
      </g>
    </>
  ),
  // Matraz en la mano: el líquido se mece y burbujea.
  iniciativas: (
    <>
      <defs>
        <clipPath id="ds-art-flask"><path d={FLASK} /></clipPath>
        <mask id="ds-art-neck" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
          <rect width="200" height="200" fill="#fff" />
          {FINGERS.map((d) => <path key={d} d={`${d}Z`} fill="#000" />)}
        </mask>
      </defs>
      <g className="ds-art-swirl">
        <path d={FLASK} className="ds-art-paper" />
        <g clipPath="url(#ds-art-flask)">
          <g className="ds-art-level">
            <path d={`M20 118q10-6 20 0${'t20 0'.repeat(13)}V220H20Z`} className="ds-art-liquid ds-art-cut" />
            {[[84, 6, 2.2, 0], [112, 4.5, 1.9, 0.7], [98, 5.5, 2.4, 1.3], [122, 3.5, 2, 1.8]].map(([cx, r, t, d]) => (
              <circle key={cx} cx={cx} cy="162" r={r} className="ds-art-bubble ds-art-card ds-art-thin" style={vars({ '--t': `${t}s`, '--d': `${d}s` })} />
            ))}
          </g>
        </g>
        {[[96, 3.5, 0], [105, 2.5, 0.9], [100, 3, 1.7]].map(([cx, r, d]) => (
          <circle key={cx} cx={cx} cy="28" r={r} className="ds-art-fizz ds-art-thin" style={vars({ '--d': `${d}s` })} />
        ))}
        <path d={FLASK} transform="translate(-2.5 -1.5)" mask="url(#ds-art-neck)" />
        <path d="M80 34.5H120" />
        {FINGERS.map((d) => <path key={d} d={d} />)}
        <path d="M84 47C80 40 86 34 96 36C108 38 122 40 132 46M132 74C150 70 172 58 200 38M132 46C146 34 166 16 186-6" />
      </g>
    </>
  ),
  // Libro abierto: una página pasa de derecha a izquierda.
  metodologia: (
    <>
      <path d="M16 64Q58 52 100 66 142 52 184 64V168Q142 156 100 170 58 156 16 168Z" className="ds-art-ink" />
      <path d="M22 58Q60 46 97 60V161Q60 149 22 160Z" className="ds-art-paper" />
      <path d="M103 60Q140 46 178 58V160Q140 149 103 161Z" className="ds-art-paper" />
      <path d="M36 78Q58 72 84 80M36 96Q58 90 84 98M36 114Q58 108 84 116M36 132Q52 127 70 132" className="ds-art-thin" />
      <path d="M116 80Q142 72 164 78M116 98Q142 90 164 96M116 116Q138 109 156 113" className="ds-art-thin" />
      <g transform="translate(100 0)">
        <g className="ds-art-page">
          <path d="M3 60Q40 46 78 58V160Q40 149 3 161Z" className="ds-art-sheet" />
          <path d="M16 80Q42 72 64 78M16 98Q42 90 64 96M16 116Q38 109 56 113" className="ds-art-thin" />
        </g>
      </g>
      <path d="M146 44V86L153 79 160 86V43" className="ds-art-shade" />
    </>
  ),
};

// Genérica: cuatro recortes que se entintan por turnos.
const FALLBACK = (
  <>
    {[[36, 36], [104, 36], [104, 104], [36, 104]].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y + 1}l60-2 1 61-60 1Z`} className="ds-art-blink ds-art-paper" style={vars({ '--i': i })} />
    ))}
  </>
);

export function LandingArt({ id }: { id: string }) {
  return (
    <svg className="ds-landing-art" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <clipPath id={`ds-art-field-${id}`}><path d={FIELD} /></clipPath>
        <pattern id={`ds-art-grain-${id}`} width="48" height="48" patternUnits="userSpaceOnUse">
          {GRAIN.map(([x, y, r], i) => <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} />)}
        </pattern>
      </defs>
      <path d={FIELD} className="ds-art-field" />
      <path d={FIELD} fill={`url(#ds-art-grain-${id})`} className="ds-art-grain" />
      <g clipPath={`url(#ds-art-field-${id})`}>{ART[id] ?? FALLBACK}</g>
    </svg>
  );
}
