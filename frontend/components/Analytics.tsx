'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, money } from '../lib/api';

type Sales = { cars_sold:number; priced_sales:number; sales_revenue:string; gross_margin:string; average_days_to_sell:string|null; days_to_sell_samples:number };
type Report = {
 start_date:string|null; end_date:string|null; as_of:string; sales:Sales;
 inventory:{vehicles:number;available:number;pending:number;purchase_value:string;asking_value:string};
 monthly:(Sales & {month:string})[];
 aging_inventory:{id:number;year:number;make:string;model:string;status:string;bought_date:string|null;days_in_inventory:number|null;purchase_price:string}[];
 quality:{undated_sales:number;missing_sale_prices:number;invalid_sale_dates:number;missing_purchase_dates:number;future_inventory_purchase_dates:number};
};
const day = (value:string) => new Date(value+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const monthLabel = (value:string) => new Date(value+'-01T12:00:00').toLocaleDateString('en-US',{month:'short',year:'2-digit'});
function todayChicago(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export default function Analytics(){
 const [period,setPeriod]=useState({start:'',end:''});
 const [start,setStart]=useState(''),[end,setEnd]=useState('');
 const [data,setData]=useState<Report|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError('');
  const query=new URLSearchParams();if(period.start)query.set('start_date',period.start);if(period.end)query.set('end_date',period.end);
  api<Report>('/analytics?'+query,{cache:'no-store'}).then(result=>{if(active)setData(result);}).catch(e=>{if(active){setError((e as Error).message);setData(null);}}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[period,revision]);
 function preset(name:'all'|'month'|'year'){
  const today=todayChicago();const next={start:name==='all'?'':name==='month'?today.slice(0,7)+'-01':today.slice(0,4)+'-01-01',end:name==='all'?'':today};
  setStart(next.start);setEnd(next.end);setPeriod(next);
 }
 const trend=data?.monthly.slice(-12)||[];
 const maximum=Math.max(1,...trend.map(row=>Number(row.sales_revenue)));
 return <div className="analytics-page">
  <section className="intro"><div><p className="eyebrow">LM MOTORS / PERFORMANCE</p><h1>Know your numbers.</h1><p>Sales performance and the inventory you have on hand.</p></div><button className="secondary" disabled={loading} onClick={()=>setRevision(x=>x+1)}>↻ Refresh</button></section>
  <section className="analytics-filters" aria-label="Sales date range">
   <div className="analytics-presets"><button className="secondary" onClick={()=>preset('all')}>All time</button><button className="secondary" onClick={()=>preset('month')}>This month</button><button className="secondary" onClick={()=>preset('year')}>Year to date</button></div>
   <form onSubmit={e=>{e.preventDefault();if(start&&end&&start>end){setError('Start date must be on or before end date.');return;}setPeriod({start,end});}}><label>Sale date from<input type="date" value={start} max={end||undefined} onChange={e=>setStart(e.target.value)}/></label><label>Through<input type="date" value={end} min={start||undefined} onChange={e=>setEnd(e.target.value)}/></label><button className="primary" type="submit">Apply</button></form>
  </section>
  {error&&<div className="analytics-error" role="alert">{error} <button className="edit" onClick={()=>setRevision(x=>x+1)}>Retry</button></div>}
  {loading?<section className="empty" role="status">Loading your analytics…</section>:data&&<>
   <div className="analytics-period"><span>{data.start_date||data.end_date?`${data.start_date?day(data.start_date):'First sale'} — ${data.end_date?day(data.end_date):'Latest sale'}`:'All-time sales'}</span><span>USD · Calendar dates in America/Chicago</span></div>
   <section className="metric-grid" aria-label="Sales metrics">
    <Metric title="Sales revenue" value={money(data.sales.sales_revenue)} note={`Actual sale prices · ${data.sales.priced_sales} priced sales`}/>
    <Metric title="Gross margin" value={money(data.sales.gross_margin)} note="Sale price − purchase price, before expenses" negative={Number(data.sales.gross_margin)<0}/>
    <Metric title="Cars sold" value={String(data.sales.cars_sold)} note="Vehicles marked sold in this period"/>
    <Metric title="Average days to sell" value={data.sales.average_days_to_sell===null?'—':`${data.sales.average_days_to_sell} days`} note={`${data.sales.days_to_sell_samples} sales with valid purchase and sale dates`}/>
   </section>
   {(data.quality.undated_sales>0||data.quality.missing_sale_prices>0||data.quality.invalid_sale_dates>0)&&<aside className="analytics-quality" role="status"><strong>A few records need attention</strong>
    {data.quality.undated_sales>0&&<p>{data.quality.undated_sales} sold vehicles have no sale date. They appear in all-time totals when a price is recorded, but are excluded from dated reports and monthly trends.</p>}
    {data.quality.missing_sale_prices>0&&<p>{data.quality.missing_sale_prices} sales in this period have no sale price. They count as sold but are excluded from revenue and margin.</p>}
    {data.quality.invalid_sale_dates>0&&<p>{data.quality.invalid_sale_dates} sales have a sale date before their purchase date and are excluded from days-to-sell averages.</p>}
   </aside>}
   <section className="analytics-panel"><div className="analytics-heading"><div><h2>Monthly sales</h2><p>Revenue from dated sales. Missing months are shown as zero.</p></div><span>{trend.length?`Latest ${trend.length} months`:'No dated sales yet'}</span></div>
    {trend.length?<><div className="revenue-chart" role="img" aria-label="Monthly sales revenue chart. Exact figures are in the table below.">{trend.map(row=><div className="chart-column" key={row.month}><span className="chart-tooltip">{money(row.sales_revenue)}</span><div className="chart-track"><div className="chart-bar" style={{height:`${Number(row.sales_revenue)/maximum*100}%`}}/></div><span>{monthLabel(row.month)}</span></div>)}</div><div className="analytics-table-wrap"><table><caption className="sr-only">Monthly sales and gross margin for the selected period</caption><thead><tr><th>Month</th><th>Cars sold</th><th>Revenue</th><th>Gross margin</th></tr></thead><tbody>{data.monthly.map(row=><tr key={row.month}><th scope="row">{monthLabel(row.month)}</th><td>{row.cars_sold}</td><td>{money(row.sales_revenue)}</td><td className={Number(row.gross_margin)<0?'negative':''}>{money(row.gross_margin)}</td></tr>)}</tbody></table></div></>:<div className="analytics-empty">Your first dated sale will start the trend. Mark a car sold and record its actual sale price and date.</div>}
   </section>
   <section className="analytics-current"><div className="analytics-heading"><div><h2>Inventory today</h2><p>As of {day(data.as_of)} · These figures do not change with the sales date filter.</p></div><Link href="/dashboard">Manage inventory ↗</Link></div><div className="metric-grid inventory-metrics"><Metric title="Inventory value at cost" value={money(data.inventory.purchase_value)} note="Purchase cost of available + pending vehicles"/><Metric title="Total asking value" value={money(data.inventory.asking_value)} note="Current asking prices, not realized revenue"/><Metric title="Vehicles on hand" value={String(data.inventory.vehicles)} note={`${data.inventory.available} available · ${data.inventory.pending} pending`}/></div></section>
   <section className="analytics-panel"><div className="analytics-heading"><div><h2>Aging inventory</h2><p>Oldest purchases first · Up to 20 vehicles</p></div></div>
    {(data.quality.missing_purchase_dates>0||data.quality.future_inventory_purchase_dates>0)&&<p className="analytics-note">{data.quality.missing_purchase_dates} vehicles have no purchase date; {data.quality.future_inventory_purchase_dates} have a future purchase date. Their inventory age is unknown.</p>}
    {data.aging_inventory.length?<div className="analytics-table-wrap"><table><caption className="sr-only">Current inventory age and purchase cost</caption><thead><tr><th>Vehicle</th><th>Status</th><th>Purchased</th><th>Days on lot</th><th>Cost</th></tr></thead><tbody>{data.aging_inventory.map(v=><tr key={v.id}><th scope="row"><Link href="/dashboard">{v.year} {v.make} {v.model}</Link><small>Stock #{v.id}</small></th><td><span className={`badge ${v.status}`}>{v.status}</span></td><td>{v.bought_date?day(v.bought_date):'—'}</td><td><span className={v.days_in_inventory!==null&&v.days_in_inventory>=90?'aging-old':''}>{v.days_in_inventory===null?'—':`${v.days_in_inventory} days`}</span></td><td>{money(v.purchase_price)}</td></tr>)}</tbody></table></div>:<div className="analytics-empty">No available or pending vehicles currently in inventory.</div>}
   </section>
   <p className="analytics-footnote">Gross margin excludes repairs, transport, fees, taxes and other expenses. These reports use your current vehicle records; deleting a sold vehicle removes it from historical totals.</p>
  </>}
 </div>;
}
function Metric({title,value,note,negative=false}:{title:string;value:string;note:string;negative?:boolean}){return <article className="metric-card"><h2>{title}</h2><p className={negative?'metric-value negative':'metric-value'}>{value}</p><p className="metric-note">{note}</p></article>;}
