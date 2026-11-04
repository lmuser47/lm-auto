export type Status = 'available' | 'pending' | 'sold';
export type VehicleInput = {vin:string;make:string;model:string;year:number;mileage:number;purchase_price:string;asking_price:string;status:Status;bought_date:string|null;description:string|null;sale_price:string|null;sold_date:string|null};
export type VehicleImage = {id:number;vehicle_id:number;position:number;created_at:string;url:string};
export type Vehicle = VehicleInput & {id:number;created_at:string;updated_at:string;images:VehicleImage[]};
export const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
export async function api<T>(path:string, options:RequestInit = {}):Promise<T> {
  let response:Response;
  const { getAuthClient } = await import('./auth');
  const { data: sessionData, error } = await getAuthClient().auth.getSession();
  if (error || !sessionData.session) throw new Error('Please sign in again.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${sessionData.session.access_token}`);
  try { response = await fetch(apiBase + path, { ...options, headers }); }
  catch { throw new Error('Cannot reach the backend. Check that FastAPI is running and the API URL is correct.'); }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(Array.isArray(detail) ? detail.map((e:{loc:string[];msg:string}) => `${e.loc.slice(1).join('.')}: ${e.msg}`).join(' · ') : typeof detail === 'string' ? detail : `Request failed (${response.status}).`);
  }
  return data as T;
}
export const money = (value:string) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value));
