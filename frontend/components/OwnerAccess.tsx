'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getAuthClient } from '../lib/auth';
import { apiBase } from '../lib/api';

export default function OwnerAccess({children}:{children:React.ReactNode}){
 const [state,setState]=useState<'loading'|'login'|'owner'>('loading');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let active=true,sequence=0;
  async function check(session:Session|null){
   const current=++sequence;
   if(!session){if(active)setState('login');return;}
   try{
    const response=await fetch(`${apiBase}/auth/me`,{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});
    if(!active||current!==sequence)return;
    if(response.ok){setError('');setState('owner');return;}
    const data=await response.json().catch(()=>null);
    setError(data?.detail||'Unable to verify owner access.');setState('login');
   }catch{if(active&&current===sequence){setError('Cannot reach the backend to verify access. Start FastAPI and retry.');setState('login');}}
  }
  let unsubscribe=()=>{};
  try{
   const auth=getAuthClient().auth;
   const {data}=auth.onAuthStateChange((_event,session)=>{void check(session);});
   unsubscribe=()=>data.subscription.unsubscribe();
   auth.getSession().then(({data,error})=>{if(error)throw error;return check(data.session);}).catch(()=>{if(active){setError('Unable to restore your session. Please sign in.');setState('login');}});
  }catch(e){setError((e as Error).message);setState('login');}
  return()=>{active=false;unsubscribe();};
 },[attempt]);
 async function login(event:React.FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const {error}=await getAuthClient().auth.signInWithPassword({email:email.trim(),password});if(error)throw error;setPassword('');setAttempt(x=>x+1);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function logout(){setBusy(true);try{const {error}=await getAuthClient().auth.signOut();if(error)throw error;setState('login');setError('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 if(state==='loading')return <section className="empty" role="status">Checking owner access…</section>;
 if(state==='owner')return <><div className="owner-session"><span>Owner workspace</span><button className="secondary" disabled={busy} onClick={logout}>Sign out</button></div>{error&&<p role="alert">{error}</p>}{children}</>;
 return <section className="owner-login"><p className="eyebrow">LM MOTORS / OWNER ACCESS</p><h1>Welcome back.</h1><p>Sign in to manage your vehicles and photos.</p><form onSubmit={login}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><p role="alert">{error}</p><button className="primary" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><button className="edit" onClick={()=>{setState('loading');setAttempt(x=>x+1);}}>Retry session check</button><p className="form-note">Access is restricted to the approved owner account.</p></section>;
}
