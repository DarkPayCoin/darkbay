import dynamic from 'next/dynamic';
const EditProduct = dynamic(() => import('../../../../components/products/EditProduct').then((mod: any) => mod.EditProduct), { ssr: false });

export const page = () => <EditProduct />
export default page
