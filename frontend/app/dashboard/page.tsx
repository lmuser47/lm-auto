import type { Metadata } from 'next';
import OwnerAccess from '../../components/OwnerAccess';
import Dashboard from '../../components/Dashboard';
export const metadata:Metadata = {title:'Owner dashboard',robots:{index:false,follow:false}};
export default function Page(){return <OwnerAccess><Dashboard/></OwnerAccess>}
