// Mosaico de la portada: las cajas giran en molinete alrededor de la casilla del sistema (como brand.dropbox.com).
// Hay varias plantillas por número de cajas. Para cada proporción de pantalla se elige la más armónica, la que deja
// la caja más alargada lo menos alargada posible, y se emite como media query. Todo se calcula en el servidor.

/**
 * Cada plantilla es una matriz en filas separadas por «/». 1–9 (y a–z) son las cajas en el orden de las secciones;
 * 0, la casilla del sistema. Los pesos de las pistas no se fijan: se prueban varios (ver `weightings`).
 */
type Grid = { cells: number[][]; cols: number[]; rows: number[] };

// Familias: apaisada (5 × 3), cuadrada (5 × 5), vertical (3 × 5) y mixtas de 4 pistas. También se prueban traspuestas.
const SHAPES: Record<number, string[]> = {
  4: ['112/402/433', '11122/44022/44333', '11122/11122/44022/44333/44333'],
  5: ['11122/34022/34555', '3112/3402/3455', '1122/3022/3445', '12233/12233/44033/44555/44555', '111/233/204/554', '12233/14033/14555'],
  6: ['11123/45023/45666', '12233/12233/44033/44556/44556', '122/322/304/554/556', '111/233/204/554/666', '12234/15034/15664'],
  7: ['12233/45033/45677', '12234/56034/56777', '12233/42233/55033/55667/55667', '122/344/305/665/777', '12234/15034/65774'],
  8: ['12234/15036/75886', '12233/42233/55033/55667/55668', '122/344/305/665/778'],
};

// Las mismas medidas que .ds-landing en app/shell.css (--gap y --c).
const MARGIN = 8;
const GAP = 8;
const WEIGHTS = [1, 1.5, 2];
const centerSize = (w: number, h: number) => Math.min(96, Math.max(64, Math.min(w, h) * 0.1));

const parse = (shape: string) => shape.split('/').map((row) => [...row].map((ch) => (ch === '.' ? -1 : parseInt(ch, 36))));
const transpose = (cells: number[][]) => cells[0].map((_, c) => cells.map((row) => row[c]));

/** Pesos posibles para las pistas de un eje: los de igual distancia a la casilla del sistema comparten peso. */
function weightings(length: number, center: number): number[][] {
  const distances = [...new Set(Array.from({ length }, (_, i) => Math.abs(i - center)).filter((d) => d > 0))];
  let options: number[][] = [Array.from({ length }, (_, i) => (i === center ? 0 : 1))];
  if (distances.length < 2) return options;
  for (const d of distances) {
    options = options.flatMap((weights) => WEIGHTS.map((w) => weights.map((v, i) => (Math.abs(i - center) === d ? w : v))));
  }
  return options;
}

/** Con menos de 4 cajas sobran huecos; con más de 8, las que no caben van en filas de dos bajo el molinete. */
function candidates(count: number): Grid[] {
  const shapes = (count <= 4 ? SHAPES[4] : SHAPES[Math.min(count, 8)]).map((shape) => {
    const cells = parse(shape).map((row) => row.map((n) => (n > count ? -1 : n)));
    for (let n = 9; n <= count; n += 2) {
      const half = Math.ceil(cells[0].length / 2);
      cells.push(cells[0].map((_, i) => (i < half || n + 1 > count ? n : n + 1)));
    }
    return cells;
  });
  return [...shapes, ...shapes.map(transpose)].flatMap((cells) => {
    const row = cells.findIndex((r) => r.includes(0)), col = cells[row].indexOf(0);
    const rows = weightings(cells.length, row);
    return weightings(cells[0].length, col).flatMap((cols) => rows.map((r) => ({ cells, cols, rows: r })));
  });
}

function tracks(weights: number[], total: number, c: number) {
  const centers = weights.filter((w) => w === 0).length;
  const free = total - GAP * (weights.length - 1) - c * centers;
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w === 0 ? c : (free * w) / sum));
}

/**
 * Lo alargada que queda la caja más alargada (1 = todas cuadradas) en una pantalla de w × h, más un poco
 * si la casilla del sistema no queda en el centro o si unas cajas son mucho mayores que otras.
 */
export function stretch(grid: Grid, w: number, h: number): number {
  const c = centerSize(w, h);
  const xs = tracks(grid.cols, w - 2 * MARGIN, c), ys = tracks(grid.rows, h - 2 * MARGIN, c);
  const span = (sizes: number[], from: number, to: number) => sizes.slice(from, to + 1).reduce((a, b) => a + b, 0) + GAP * (to - from);
  const boxes = new Map<number, [number, number, number, number]>();
  grid.cells.forEach((row, r) => row.forEach((n, col) => {
    if (n <= 0) return;
    const b = boxes.get(n) ?? [col, r, col, r];
    boxes.set(n, [Math.min(b[0], col), Math.min(b[1], r), Math.max(b[2], col), Math.max(b[3], r)]);
  }));
  let worst = 1, minArea = Infinity, maxArea = 0;
  for (const [c0, r0, c1, r1] of boxes.values()) {
    const bw = span(xs, c0, c1), bh = span(ys, r0, r1);
    worst = Math.max(worst, bw / bh, bh / bw);
    minArea = Math.min(minArea, bw * bh);
    maxArea = Math.max(maxArea, bw * bh);
  }
  const row = grid.cells.findIndex((r) => r.includes(0)), col = grid.cells[row].indexOf(0);
  const cx = MARGIN + span(xs, 0, col) - c / 2, cy = MARGIN + span(ys, 0, row) - c / 2;
  return worst + 0.3 * (Math.abs(cx / w - 0.5) + Math.abs(cy / h - 0.5)) + 0.1 * Math.log2(maxArea / minArea);
}

const css = ({ cells, cols, rows }: Grid) => {
  const area = (n: number) => (n === 0 ? 'c' : n < 0 ? '.' : `t${n}`);
  const track = (w: number) => (w === 0 ? 'var(--c)' : `minmax(0,${w}fr)`);
  return `grid-template-areas:${cells.map((row) => `"${row.map(area).join(' ')}"`).join(' ')};` +
    `grid-template-columns:${cols.map(track).join(' ')};grid-template-rows:${rows.map(track).join(' ')}`;
};

// Proporciones (ancho / alto) que se prueban, con una altura de referencia de pantalla de portátil.
const ASPECTS = Array.from({ length: 131 }, (_, i) => 0.4 + i * 0.02);
const REFERENCE_HEIGHT = 860;

/** Para cada tramo de proporciones, la plantilla más armónica. */
export function landingPlan(count: number): { from: number; grid: Grid; stretch: number }[] {
  const grids = candidates(count);
  const plan: { from: number; grid: Grid; stretch: number }[] = [];
  for (const aspect of ASPECTS) {
    const w = aspect * REFERENCE_HEIGHT;
    const scored = grids.map((grid) => ({ grid, stretch: stretch(grid, w, REFERENCE_HEIGHT) }));
    const best = scored.reduce((a, b) => (b.stretch < a.stretch - 0.01 ? b : a));
    if (plan.at(-1)?.grid !== best.grid) plan.push({ from: aspect, ...best });
  }
  return plan;
}

const cache = new Map<number, string>();

/** Reglas CSS del mosaico para `count` cajas: una plantilla base y una media query por cada cambio de proporción. */
export function landingCss(count: number): string {
  if (!cache.has(count)) {
    const rules = landingPlan(count).map(({ from, grid }, i) => {
      const rule = `.ds-landing-grid{${css(grid)}}`;
      return i === 0 ? rule : `@media (min-aspect-ratio:${Math.round(from * 1000)}/1000){${rule}}`;
    });
    cache.set(count, rules.join('\n'));
  }
  return cache.get(count)!;
}

// Papel y tinta de las ilustraciones (los mismos que --art-paper y --art-ink en app/shell.css).
const PAPER = [250, 249, 245];
const INK = [31, 30, 29];

const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const mix = (from: number[], to: number[], t: number) => from.map((c, i) => Math.round(c + (to[i] - c) * t));
const hex = (rgb: number[]) => `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;

/**
 * Contraste del color del sistema: `ink` es el texto que va encima (blanco o casi negro); `deep` indica
 * que el color es tan oscuro que en modo oscuro se confunde con la superficie (la portada lo sustituye), y
 * `art` es la lámina de las ilustraciones: el mismo color, aclarado hacia el papel si la tinta no se vería
 * encima u oscurecido si el papel no destacaría.
 */
export function colorContrast(color: string): { ink: string; deep: boolean; art: string } {
  const raw = color.trim().replace(/^#/, '');
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw;
  if (!/^[\da-f]{6}$/i.test(full)) return { ink: '#fff', deep: false, art: hex(mix(INK, PAPER, 0.6)) };
  const rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const l = luminance(rgb);
  // Un gris oscuro aclarado se queda en gris de periódico: los colores casi neutros se aclaran más.
  const floor = Math.max(...rgb) - Math.min(...rgb) < 30 ? 0.36 : 0.24;
  let art = rgb;
  for (let t = 0.05; luminance(art) < floor && t <= 1; t += 0.05) art = mix(rgb, PAPER, t);
  for (let t = 0.05; luminance(art) > 0.55 && t <= 1; t += 0.05) art = mix(rgb, INK, t);
  return { ink: l > 0.2 ? '#1a1c1f' : '#fff', deep: l < 0.03, art: hex(art) };
}
