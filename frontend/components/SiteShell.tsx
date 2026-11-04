'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function SiteShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const dashboard = pathname.startsWith('/dashboard');
  if (dashboard) return <><aside><Link className="logo" href="/">LM<span>Motors</span></Link><p className="nav-label">WORKSPACE</p><Link className="nav" href="/dashboard" aria-current={pathname==='/dashboard'?'page':undefined}>Vehicle inventory</Link><Link className="nav" href="/dashboard/analytics" aria-current={pathname.startsWith('/dashboard/analytics')?'page':undefined}>Analytics</Link><Link className="nav" href="/">View public site ↗</Link></aside><main><header><span>LM Motors / Owner dashboard</span></header><nav className="owner-mobile-nav" aria-label="Owner navigation"><Link href="/dashboard" aria-current={pathname==='/dashboard'?'page':undefined}>Inventory</Link><Link href="/dashboard/analytics" aria-current={pathname.startsWith('/dashboard/analytics')?'page':undefined}>Analytics</Link></nav>{children}</main></>;
  return <div className="lm-site"><header className="lm-header"><Link href="/" className="lm-wordmark" aria-label="LM Motors home">LM<span>MOTORS</span><i/></Link><nav aria-label="Main navigation"><Link href="/" className="lm-nav-current">Inventory <span>↗</span></Link></nav><span className="lm-header-note"><i/> A better way forward</span></header><main className="lm-main">{children}</main><footer className="lm-footer"><Link href="/" className="lm-wordmark">LM<span>MOTORS</span></Link><span>Find your next chapter.</span><div><span>© {new Date().getFullYear()} LM Motors</span><Link href="/dashboard">Dealer access ↗</Link></div></footer></div>;
}
