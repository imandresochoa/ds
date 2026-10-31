import { sectionMetadata, sectionPage, sectionParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = sectionParams('en');
export const generateMetadata = sectionMetadata('en');
export default sectionPage('en');
