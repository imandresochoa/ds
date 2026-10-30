import {
  BookOpen, Component, FlaskConical, House, LayoutTemplate, Ruler, SwatchBook, type LucideIcon,
} from 'lucide-react';

/** Iconos del rail por sección. Trazo fino, como en Codex. */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  inicio: House,
  tokens: SwatchBook,
  fundamentos: Ruler,
  componentes: Component,
  patrones: LayoutTemplate,
  iniciativas: FlaskConical,
  metodologia: BookOpen,
};

export const STROKE = 1.6;
