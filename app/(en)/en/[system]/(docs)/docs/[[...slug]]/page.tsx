import { docsMetadata, docsPage, docsParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = docsParams('en');
export const generateMetadata = docsMetadata('en');
export default docsPage('en');
