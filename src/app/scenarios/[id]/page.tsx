import { db } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const snapshot = await db().collection('scenarios').get();
  return snapshot.docs.map((doc) => ({ id: doc.id }));
}

export default async function ScenarioPage({ params }: Props) {
  const { id } = await params;
  const doc = await db().collection('scenarios').doc(id).get();
  if (!doc.exists) notFound();
  const data = doc.data();
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>{data?.title ?? id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
