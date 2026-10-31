import { entryMetadata, entryPage, entryParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = entryParams(null);
export const generateMetadata = entryMetadata(null);
export default entryPage(null);
