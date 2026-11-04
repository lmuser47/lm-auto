'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="empty"><h1>Something went wrong</h1><p>Please try again.</p><button className="primary" onClick={reset}>Retry</button></section>}
