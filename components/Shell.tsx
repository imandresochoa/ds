'use client';

import {
  ArrowLeft, ArrowRight, BookOpen, Bot, Braces, Code2, Copy, Ellipsis, ExternalLink, FileText, Gauge, Link2, PanelLeft, Search, SquarePen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STATUSES } from '@/lib/meta.mjs';
import type { Nav, NavItem } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { CommandPalette, type PaletteAction } from './CommandPalette';
import { SECTION_ICONS, STROKE } from './icons';
import { Menu, type MenuEntry } from './Menu';
import { StatusPill } from './StatusPill';

type Align = 'start' | 'end' | 'right' | 'up';
type OpenMenu = { id: string; rect: DOMRect; align?: Align } | null;

const VISIBLE_ROWS = 8;
const recentsKey = (system: string) => `ds:recientes:${system}`;

export function Shell({ nav, children }: { nav: Nav; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menu, setMenu] = useState<OpenMenu>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const base = `/${nav.system.id}`;
  const path = pathname.replace(/\/$/, '');
  const sectionId = path.slice(base.length).split('/').filter(Boolean)[0] ?? 'inicio';
  const section = nav.sections.find((s) => s.id === sectionId) ?? nav.sections[0];
  const current = nav.items.find((i) => path === i.href || path.startsWith(`${i.href}/`)) ?? null;
  const byHref = useMemo(() => new Map(nav.items.map((i) => [i.href, i])), [nav.items]);
  const recents = recentHrefs.map((href) => byHref.get(href)).filter((i): i is NavItem => Boolean(i));
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }, []);
  const copy = useCallback(async (text: string, message = 'Copiado') => {
    await navigator.clipboard.writeText(text);
    notify(message);
  }, [notify]);
  const copyMarkdown = useCallback(async (href: string | null) => {
    if (!href) return notify('Esta página no tiene versión Markdown');
    const text = await fetch(sitePath(href)).then((r) => r.text());
    await copy(text, 'Markdown copiado');
  }, [copy, notify]);
  const agentContext = useCallback(() => {
    const text = `Trabaja con el sistema de diseño ${nav.system.nombre}.\n` +
      `Lee primero ${origin}${sitePath(`/${nav.system.id}/design.md`)} (reglas, API de clases y estados) y ${origin}${sitePath('/llms.txt')}.\n` +
      `Usa solo lo que esté «En producción» salvo que te pida lo contrario. Si algo no está documentado, no lo inventes: dilo.`;
    void copy(text, 'Contexto para agentes copiado');
  }, [copy, nav.system, origin]);

  // Recientes: se guardan en este navegador.
  useEffect(() => {
    try { setRecentHrefs(JSON.parse(localStorage.getItem(recentsKey(nav.system.id)) ?? '[]')); } catch { /* sin almacenamiento */ }
    if (window.matchMedia('(max-width: 900px)').matches) setCollapsed(true);
  }, [nav.system.id]);
  useEffect(() => {
    if (!current) return;
    setRecentHrefs((previous) => {
      const next = [current.href, ...previous.filter((h) => h !== current.href)].slice(0, 8);
      try { localStorage.setItem(recentsKey(nav.system.id), JSON.stringify(next)); } catch { /* sin almacenamiento */ }
      return next;
    });
  }, [current, nav.system.id]);
  useEffect(() => {
    if (window.matchMedia('(max-width: 900px)').matches) setCollapsed(true);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openMenu = (id: string, align?: Align) => (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu((m) => (m?.id === id ? null : { id, rect, align }));
  };
  // Abre archivos del sitio (.md, design.md…) con la ruta de publicación delante, o una URL externa tal cual.
  const open = (href: string) => window.open(sitePath(href), '_blank', 'noopener');
  const icon = (Icon: typeof Copy) => <Icon size={16} strokeWidth={STROKE} />;

  const railSections = nav.sections.filter((s) => s.id !== 'metodologia');
  const methodology = nav.sections.find((s) => s.id === 'metodologia');

  const agentLinks: MenuEntry[] = [
    { type: 'label', label: 'Para agentes' },
    { label: 'design.md', icon: icon(FileText), onSelect: () => open(`/${nav.system.id}/design.md`) },
    { label: 'llms.txt', icon: icon(FileText), onSelect: () => open('/llms.txt') },
    { label: 'registry.json', icon: icon(Braces), onSelect: () => open(`/${nav.system.id}/registry.json`) },
    { label: 'Copiar contexto para agentes', icon: icon(Bot), onSelect: agentContext },
  ];

  const menus: Record<string, MenuEntry[]> = {
    more: [
      ...agentLinks,
      { type: 'sep' },
      ...(methodology ? [{ label: 'Metodología', icon: icon(BookOpen), onSelect: () => router.push(methodology.href) }] : []),
      { label: 'Enlace con producción', icon: icon(Gauge), onSelect: () => router.push(`${base}/inicio#produccion`) },
    ],
    page: [
      { label: 'Copiar como Markdown', icon: icon(Copy), onSelect: () => void copyMarkdown(current?.md ?? null) },
      { label: 'Copiar enlace', icon: icon(Link2), onSelect: () => void copy(window.location.href, 'Enlace copiado') },
      { label: 'Abrir .md', icon: icon(FileText), onSelect: () => (current?.md ? open(current.md) : notify('Esta página no tiene versión Markdown')) },
      { type: 'sep' },
      { label: 'Ver código en producción', icon: icon(Code2), onSelect: () => (current?.fuente ? open(current.fuente) : notify('Sin fuente en producción')) },
      { label: 'Ver web en producción', icon: icon(ExternalLink), onSelect: () => nav.system.web && open(nav.system.web) },
    ],
    systems: [
      { type: 'label', label: 'Sistemas' },
      ...nav.systems.map((s) => ({ label: s.nombre, hint: s.id === nav.system.id ? 'Actual' : undefined, icon: <span className="ds-avatar" style={{ background: s.color }}>{s.iniciales}</span>, onSelect: () => router.push(`/${s.id}`) })),
    ],
  };

  const paletteActions: PaletteAction[] = [
    { label: 'Copiar contexto para agentes', icon: icon(Bot), run: agentContext },
    { label: 'Copiar esta página como Markdown', icon: icon(Copy), run: () => void copyMarkdown(current?.md ?? null) },
    { label: 'Abrir design.md', icon: icon(FileText), run: () => open(`/${nav.system.id}/design.md`) },
    { label: 'Mostrar u ocultar la barra lateral', icon: icon(PanelLeft), hint: '⌘\\', run: () => setCollapsed((c) => !c) },
  ];

  const latest = [...nav.items].filter((i) => i.creado).sort((a, b) => (b.creado ?? '').localeCompare(a.creado ?? '') || a.titulo.localeCompare(b.titulo, 'es')).slice(0, VISIBLE_ROWS);

  const row = (item: NavItem, key = item.href) => {
    const active = path === item.href || path.startsWith(`${item.href}/`);
    const drift = item.sync === 'desajuste' || item.sync === 'ausente';
    return (
      <Link key={key} href={item.href} className={`ds-row${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
        <span>{item.titulo}</span>
        {drift && <i className="ds-dot" data-s={item.sync} title="Cambió en producción" />}
        {item.estado !== 'produccion' && <small className="ds-row-tag">{STATUSES[item.estado as keyof typeof STATUSES]?.label}</small>}
      </Link>
    );
  };

  const group = (label: string, items: NavItem[], empty?: string) => {
    const key = `${section.id}:${label}`;
    const shown = expanded[key] ? items : items.slice(0, VISIBLE_ROWS);
    return (
      <div className="ds-group" key={key}>
        <div className="ds-label">{label}</div>
        {shown.map((item) => row(item, `${key}:${item.href}`))}
        {!items.length && empty && <p className="ds-empty-note">{empty}</p>}
        {items.length > VISIBLE_ROWS && (
          <button type="button" className="ds-row is-muted" onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}>
            <span>{expanded[key] ? 'Mostrar menos' : 'Mostrar más'}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`ds-app${collapsed ? ' is-collapsed' : ''}`}>
      <header className="ds-titlebar">
        <div className="ds-titlebar-title">
          <Link href={base} className="ds-titlebar-system">{nav.system.nombre}</Link>
          <button type="button" className="ds-icon-btn" aria-label="Atrás" onClick={() => router.back()}><ArrowLeft size={16} strokeWidth={STROKE} /></button>
          <button type="button" className="ds-icon-btn" aria-label="Adelante" onClick={() => router.forward()}><ArrowRight size={16} strokeWidth={STROKE} /></button>
        </div>
        <div className="ds-titlebar-actions">
          {current && current.seccion !== 'metodologia' && (
            <StatusPill item={current} />
          )}
          <button type="button" className="ds-icon-btn" data-tip="Abrir .md" aria-label="Abrir .md" disabled={!current?.md} onClick={() => current?.md && open(current.md)}><FileText size={16} strokeWidth={STROKE} /></button>
          <button type="button" className="ds-icon-btn" data-tip="Ver en producción" aria-label="Ver en producción" onClick={() => (current?.fuente ? open(current.fuente) : nav.system.web && open(nav.system.web))}><ExternalLink size={16} strokeWidth={STROKE} /></button>
          <button type="button" className="ds-icon-btn" aria-label="Más acciones" aria-expanded={menu?.id === 'page'} onClick={openMenu('page', 'end')}><Ellipsis size={16} strokeWidth={STROKE} /></button>
        </div>
      </header>

      <nav className="ds-rail" aria-label="Secciones">
        {railSections.map((s) => {
          const Icon = SECTION_ICONS[s.id];
          return (
            <Link key={s.id} href={s.href} className={`ds-rail-btn${s.id === section.id ? ' is-active' : ''}`} data-tip={s.label} aria-label={s.label} aria-current={s.id === section.id ? 'page' : undefined}>
              <Icon size={18} strokeWidth={STROKE} />
            </Link>
          );
        })}
        <div className="ds-rail-spacer" />
        <button type="button" className="ds-rail-btn" data-tip={collapsed ? 'Mostrar barra lateral' : 'Ocultar barra lateral'} aria-label="Barra lateral" aria-pressed={!collapsed} onClick={() => setCollapsed((c) => !c)}>
          <PanelLeft size={18} strokeWidth={STROKE} />
        </button>
        <button type="button" className={`ds-rail-btn${menu?.id === 'more' || section.id === 'metodologia' ? ' is-active' : ''}`} data-tip="Más" aria-label="Más" onClick={openMenu('more', 'up')}><Ellipsis size={18} strokeWidth={STROKE} /></button>
        <button type="button" className="ds-rail-btn" data-tip={nav.system.nombre} aria-label="Cambiar de sistema" onClick={openMenu('systems', 'up')}>
          <span className="ds-avatar" style={{ background: nav.system.color }}>{nav.system.iniciales}</span>
        </button>
      </nav>

      <div className="ds-panel">
        <aside className="ds-sidebar" aria-label={section.label}>
          <div className="ds-side-head">
            <h2 className="ds-side-system">{section.label}</h2>
            <div className="ds-side-tools">
              <button type="button" className="ds-icon-btn" aria-label="Copiar contexto para agentes" onClick={agentContext}><Bot size={16} strokeWidth={STROKE} /></button>
              <button type="button" className="ds-icon-btn" aria-label="Buscar (⌘K)" onClick={() => setPaletteOpen(true)}><Search size={16} strokeWidth={STROKE} /></button>
            </div>
          </div>

          {section.accion && (
            <button type="button" className="ds-row" onClick={() => void copy(section.accion!.prompt, 'Prompt copiado para tu agente')}>
              <SquarePen size={16} strokeWidth={STROKE} />
              <span>{section.accion.label}</span>
            </button>
          )}

          {section.id === 'inicio' ? (
            <>
              {group('Recientes', recents, 'Las fichas que abras aparecerán aquí.')}
              {group('Añadidos recientemente', latest)}
            </>
          ) : (
            section.groups.map((g) => group(g.label, g.items))
          )}
          {section.id !== 'inicio' && !section.groups.length && <p className="ds-empty-note" style={{ marginTop: 16 }}>Todavía no hay fichas en esta sección.</p>}
        </aside>

        <main className="ds-main" id="contenido">{children}</main>
      </div>

      {menu && <Menu anchor={menu.rect} align={menu.align} entries={menus[menu.id]} onClose={() => setMenu(null)} />}
      {paletteOpen && (
        <CommandPalette items={nav.items} sections={nav.sections} recents={recents} actions={paletteActions} onNavigate={(href) => router.push(href)} onClose={() => setPaletteOpen(false)} />
      )}
      {toast && <div className="ds-toast" role="status">{toast}</div>}
    </div>
  );
}
