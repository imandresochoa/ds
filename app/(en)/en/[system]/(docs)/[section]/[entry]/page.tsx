import { entryMetadata, entryPage, entryParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = entryParams('en');
export const generateMetadata = entryMetadata('en');
export default entryPage('en');
