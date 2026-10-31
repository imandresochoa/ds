import { platformMetadata, platformPage, platformParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = platformParams('en');
export const generateMetadata = platformMetadata('en');
export default platformPage('en');
