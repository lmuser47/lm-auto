import Link from 'next/link';
export default function NotFound(){return <section className="empty"><h1>Vehicle not found</h1><p>This listing is unavailable or no longer for sale.</p><Link href="/">Browse available vehicles</Link></section>}
