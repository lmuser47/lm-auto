import type { Metadata } from 'next';
import { demoEnabled } from '../lib/demo';
import SiteShell from '../components/SiteShell';
import './globals.css';
import './public.css';
import './gallery.css';
import './analytics.css';
export const metadata:Metadata = {title:{default:'LM Motors | Cars for sale',template:'%s | LM Motors'},robots:demoEnabled?{index:false,follow:false}:undefined,description:'Explore available cars at LM Motors. Find your next vehicle in our current inventory.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteShell>{demoEnabled && <div className="demo-banner">DEMO PREVIEW · 20 sample listings with model-matching photos · Not actual stock</div>}{children}</SiteShell></body></html>}
