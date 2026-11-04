import { photoCredits } from '../../lib/demo';
export const metadata = {title:'Demo photo credits',robots:{index:false,follow:false}};
export default function Credits(){return <section className="card-body"><h1>Demo photo credits</h1><p>Photos from Wikimedia Commons. Images are displayed with CSS cropping on cards; original photos remain unchanged. Demo years, mileage and prices are fictional.</p>{photoCredits.map((c,i)=><p key={i}><a href={c.source}>{c.vehicle}</a> — {c.author} · <a href={c.licenseUrl}>{c.license}</a></p>)}</section>}
