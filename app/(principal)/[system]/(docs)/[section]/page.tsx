import { sectionMetadata, sectionPage, sectionParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = sectionParams(null);
export const generateMetadata = sectionMetadata(null);
export default sectionPage(null);
