import Link from 'next/link';
import VehicleCard from '../components/VehicleCard';
import { publicInventory } from '../lib/public';
export const dynamic = 'force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{page?:string}>}) {
  const params = await searchParams;
  const parsed = Number(params.page || 1);
  const page = Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 1000000 ? parsed : 1;
  let vehicles:Awaited<ReturnType<typeof publicInventory>> = [], unavailable=false;
  try { vehicles = await publicInventory((page-1)*12); } catch { unavailable=true; }
  return <><section className="lm-intro lm-intro-compact"><div className="lm-kicker"><span className="lm-dot"/> CURRENT INVENTORY <span className="lm-kicker-line"/></div><div className="lm-title-row"><h1>Find your next car<span className="lm-period">.</span></h1><p>Browse what’s available at LM Motors.</p></div></section><section aria-labelledby="inventory-heading"><div className="lm-inventory-bar"><div><h2 id="inventory-heading">Cars for sale</h2><span className="lm-availability"><span className="lm-dot"/> Available now</span></div><span className="lm-inventory-note">Explore the collection <span>↓</span></span></div><div className="grid lm-grid">{unavailable?<div className="empty"><h2>We’ll be right back.</h2><p>Our inventory is temporarily unavailable. Please try again shortly.</p><Link className="lm-button" href="/">Refresh inventory</Link></div>:vehicles.length?vehicles.slice(0,12).map(v=><VehicleCard key={v.id} vehicle={v}/>):<div className="empty"><h2>A new lineup is on the way.</h2><p>{page>1?'No vehicles on this page. Browse the latest inventory.':'Check back soon to discover our latest arrivals.'}</p>{page>1&&<Link className="lm-button" href="/">Back to inventory</Link>}</div>}</div><div className="lm-pagination"><span>{!unavailable&&vehicles.length?`Page ${page} · ${Math.min(vehicles.length,12)} vehicles`:'LM Motors / Current inventory'}</span><div>{page>1&&<Link className="lm-button" href={`/?page=${page-1}`}>← Previous</Link>}{vehicles.length>12&&<Link className="lm-button" href={`/?page=${page+1}`}>Next →</Link>}</div></div></section></>;
}
