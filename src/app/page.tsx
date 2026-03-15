import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Scenario Site</h1>
      <p>Next.js SSG + Firebase.</p>
      <Link href="/scenarios">Сценарии</Link>
    </main>
  );
}
