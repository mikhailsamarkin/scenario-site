import Link from 'next/link';

const env = process.env.NEXT_PUBLIC_ENV ?? 'dev';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Hello World {env}</h1>
      <p>Next.js SSG + Firebase.</p>
      <Link href="/scenarios">Сценарии</Link>
    </main>
  );
}
