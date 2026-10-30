import Link from 'next/link';
import type { CSSProperties } from 'react';
import { colorContrast, landingCss } from '@/lib/landing';
import { LandingArt } from './LandingArt';

export type LandingTile = { id: string; label: string; descripcion: string; href: string; cuenta: string };
export type LandingProps = {
  system: { nombre: string; iniciales: string; color: string };
  inicio: string;
  tiles: LandingTile[];
};

// Portada: el mosaico de secciones a pantalla completa, sin shell. Las cajas giran en molinete alrededor
// de la casilla del sistema, que lleva a Inicio. Todo el movimiento es CSS (ver «Portada» en app/shell.css).
export function Landing({ system, inicio, tiles }: LandingProps) {
  const contrast = colorContrast(system.color);
  const style = { '--sys-color': system.color, '--sys-color-ink': contrast.ink, '--sys-color-art': contrast.art } as CSSProperties;

  return (
    <main className={`ds-landing${contrast.deep ? ' is-deep' : ''}`} style={style}>
      {/* La plantilla del mosaico depende de la proporción de la pantalla: lib/landing.ts elige la más armónica. */}
      <style dangerouslySetInnerHTML={{ __html: landingCss(tiles.length) }} />
      <h1 className="ds-sr-only">{system.nombre}</h1>
      <nav className="ds-landing-grid" aria-label="Secciones">
        {tiles.map((tile, i) => (
          <Link key={tile.id} href={tile.href} className="ds-landing-tile" style={{ gridArea: `t${i + 1}`, '--n': i + 1 } as CSSProperties}>
            <span className="ds-landing-tile-title">{tile.label}</span>
            <span className="ds-landing-tile-count">{tile.cuenta}</span>
            <span className="ds-landing-tile-text">{tile.descripcion}</span>
            <LandingArt id={tile.id} />
          </Link>
        ))}
        <Link href={inicio} className="ds-landing-home" style={{ gridArea: 'c' }} aria-label={`Inicio de ${system.nombre}`}>
          <span>{system.iniciales}</span>
          <small aria-hidden="true">Inicio</small>
        </Link>
      </nav>
    </main>
  );
}
