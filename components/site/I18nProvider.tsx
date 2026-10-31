'use client';

import { createContext, useContext } from 'react';
import { messages, type Lang } from '@/lib/i18n';

const LangContext = createContext<Lang>('es');

/** Idioma de la página para los componentes de cliente. Lo pone el layout del sistema. */
export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
/** Los textos de la interfaz en el idioma de la página. */
export const useT = () => messages(useContext(LangContext));
