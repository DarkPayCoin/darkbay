import dynamic from 'next/dynamic';
const NewProduct = dynamic(() => import('../../../components/products/EditProduct').then((mod: any) => mod.NewProduct), { ssr: false });

export const page = () => <NewProduct />
export default page
