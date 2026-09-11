import type {Metadata} from 'next';
import Link from 'next/link';
import {Suspense} from 'react';
import {HQNavigation} from './navigation';
import './admin.css';
export const metadata:Metadata={title:'HQ | GempakWey',robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className="hq"><a className="skip-link" href="#hq-main">Terus ke kandungan</a><header className="hq-header"><Link href="/admin" className="hq-wordmark">GempakWey<span>HQ</span></Link><span className="hq-header-note">Semua kedai. Satu ruang kerja.</span></header><div className="hq-frame"><Suspense><HQNavigation/></Suspense><main id="hq-main">{children}</main></div></div>}
