import { db } from '@/lib/firebase-admin';
import Link from 'next/link';

export default async function ScenariosListPage() {
  const snapshot = await db().collection('scenarios').get();
  const scenarios = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Сценарии</h1>
      <ul>
        {scenarios.map((s: { id: string; title?: string }) => (
          <li key={s.id}>
            <Link href={`/scenarios/${s.id}`}>{s.title ?? s.id}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
