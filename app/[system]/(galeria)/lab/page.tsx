import { Lab, type LabBase } from '@/components/lab/Lab';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/site/PageHeader';
import { loadExperimentalTokens, loadProductionTokens, loadSyncReport, loadSystem, tokenModes } from '@/lib/core.mjs';

export const metadata = { title: 'Lab de primitivos', description: 'Color, texto, espaciado, radios, sombras y movimiento del sistema, en claro y oscuro, con el contraste a la vista.' };

type Values = Record<string, string | Record<string, string>>;

export default async function LabPage({ params }: { params: Promise<{ system: string }> }) {
  const { system: id } = await params;
  const system = loadSystem(id);
  const report = loadSyncReport(system);
  const production = loadProductionTokens(system) as Record<string, Values>;
  const names = system.produccion?.superficies ?? {};
  // Lo que se puede ajustar: los tokens de cada superficie de producción, sin los puentes de @theme
  // (--color-x: var(--x)), que cambian con su token.
  const bases: LabBase[] = Object.entries(production).map(([surface, values]) => {
    const theme = (report?.tokens?.[surface]?.theme ?? {}) as Record<string, string>;
    const own = Object.fromEntries(Object.entries(values).filter(([name]) => !theme[name]?.includes('var(')));
    const declared = (report?.tokens?.[surface]?.modos ?? null) as Record<string, string[]> | null;
    return { id: surface, nombre: names[surface]?.nombre ?? surface, valores: own, modos: tokenModes(own, declared), selectores: declared };
  });
  // Y los de experimental/ escritos a mano (desde una web o Figma). Si los generó el Lab, se vuelven a abrir en «Generar».
  const experimental = loadExperimentalTokens(system);
  if (experimental && !experimental.preset) bases.push({ id: 'experimental', nombre: 'Experimental', valores: experimental.values as Values, modos: tokenModes(experimental.values, experimental.info.modos), selectores: experimental.info.modos });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader>
        <PageHeaderHeading>Lab de primitivos</PageHeaderHeading>
        <PageHeaderDescription>Color, texto, espaciado, radios, sombras y movimiento, en claro y oscuro y con el contraste a la vista. Cuando te guste, pásale el preset a tu agente.</PageHeaderDescription>
      </PageHeader>
      <Lab systemId={system.id} bases={bases} saved={experimental?.preset ?? null} production={Boolean(system.produccion)} />
    </div>
  );
}
