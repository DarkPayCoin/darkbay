import dynamic from 'next/dynamic';
const NewStorefront = dynamic(() => import('../../components/storefronts/EditStorefront'), { ssr: false });

export const page = () => <NewStorefront />
export default page
