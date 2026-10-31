import { platformMetadata, platformPage, platformParams } from '@/components/rutas/sistema';

export const dynamicParams = false;
export const generateStaticParams = platformParams(null);
export const generateMetadata = platformMetadata(null);
export default platformPage(null);
