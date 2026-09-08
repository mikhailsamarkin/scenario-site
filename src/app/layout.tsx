import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import InstallCta from '../components/InstallCta';

export const metadata: Metadata = {
  title: 'Scenario Site',
  description: 'SSG site with Firebase data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
          <Link href="/" style={{ fontWeight: 'bold', marginRight: '1rem' }}>
            Scenario
          </Link>
          <Link href="/scenarios">Сценарии</Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <InstallCta />
          </div>
        </header>
        {children}
        <footer style={{ padding: '1.5rem', borderTop: '1px solid #ddd', marginTop: '2rem' }}>
          <InstallCta />
        </footer>
      </body>
    </html>
  );
}
