import { docsMetadata, docsPage, docsParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = docsParams(null);
export const generateMetadata = docsMetadata(null);
export default docsPage(null);
