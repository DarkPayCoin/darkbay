import dynamic from 'next/dynamic';
const EditStorefront = dynamic(() => import('../../components/storefronts/EditStorefront').then((mod: any) => mod.EditStorefront), { ssr: false });

export const page = () => <EditStorefront />
export default page
