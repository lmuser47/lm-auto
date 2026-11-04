import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicVehicle } from '../../../lib/public';
import { money } from '../../../lib/api';
import { demoEnabled, photoCredits } from '../../../lib/demo';
import VehicleGallery from '../../../components/VehicleGallery';
export const dynamic = 'force-dynamic';
type Props = {params:Promise<{id:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const v=await publicVehicle((await params).id);return v?{title:`${v.year} ${v.make} ${v.model}`,description:`${v.year} ${v.make} ${v.model} for ${money(v.asking_price)}. ${v.mileage.toLocaleString()} miles.`}:{title:'Vehicle not found',robots:{index:false,follow:false}};}
export default async function Details({params}:Props){const v=await publicVehicle((await params).id);if(!v)notFound();return <><section className="intro"><div><Link href="/">← Back to inventory</Link><h1 style={{marginTop:24}}>{v.year} {v.make} {v.model}</h1><p>{v.mileage.toLocaleString()} miles · VIN {v.vin}</p></div><div className="price">{money(v.asking_price)}</div></section><VehicleGallery images={v.images} title={`${v.year} ${v.make} ${v.model}`}/><section className="card-body"><h2>About this vehicle</h2><p style={{whiteSpace:'pre-wrap'}}>{v.description || 'Contact the dealership for more information about this vehicle.'}</p></section>{demoEnabled&&<p className="demo-credit">Photo: {photoCredits.find(c=>c.vehicle===`${v.year} ${v.make} ${v.model}`)?.author} · <Link href="/photo-credits">Photo credits & licenses</Link></p>}</>}
