import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'BR3 Academy • Diagnóstico Android',description:'Aprenda a medir, interpretar e diagnosticar antes de substituir componentes. Curso, biblioteca e laboratório BR3Tech.',icons:{icon:'/images/logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
