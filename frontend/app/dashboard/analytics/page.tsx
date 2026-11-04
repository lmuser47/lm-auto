import type { Metadata } from 'next';
import OwnerAccess from '../../../components/OwnerAccess';
import Analytics from '../../../components/Analytics';
import '../../analytics.css';
export const metadata:Metadata = {title:'Owner analytics',robots:{index:false,follow:false}};
export default function Page(){return <OwnerAccess><Analytics/></OwnerAccess>}
