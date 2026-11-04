import 'server-only';
import { cache } from 'react';
import { demoEnabled, demoVehicles } from './demo';
import type { Vehicle } from './api';
export type PublicVehicle = Pick<Vehicle,'id'|'vin'|'make'|'model'|'year'|'mileage'|'asking_price'|'description'|'images'>;
const base = (process.env.API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
function publicFields(v:Vehicle):PublicVehicle {
  return {id:v.id,vin:v.vin,make:v.make,model:v.model,year:v.year,mileage:v.mileage,asking_price:v.asking_price,description:v.description,images:v.images||[]};
}
export async function publicInventory(offset:number):Promise<PublicVehicle[]> {
  if (demoEnabled) return demoVehicles.slice(offset, offset + 13);
  const response = await fetch(`${base}/public/vehicles?limit=13&offset=${offset}`, {cache:'no-store'});
  if (!response.ok) throw new Error('Unable to load inventory.');
  const vehicles:Vehicle[] = await response.json();
  return vehicles.map(publicFields);
}
export const publicVehicle = cache(async (id:string):Promise<PublicVehicle|null> => {
  if (!/^[1-9]\d*$/.test(id)) return null;
  if (demoEnabled) return demoVehicles.find(v => v.id === Number(id)) || null;
  const response = await fetch(`${base}/public/vehicles/${id}`, {cache:'no-store'});
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load vehicle.');
  const vehicle:Vehicle = await response.json();
  return publicFields(vehicle);
});
