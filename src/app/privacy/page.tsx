import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика конфиденциальности приложения Scenario',
};

// Страница политики конфиденциальности (SP-E8-02, SR-PRIV-5).
// URL: https://scenario-games.ru/privacy — совпадает с kPrivacyPolicyUrl в МП
// (US-E6-04). Текст — placeholder до утверждения (US-E8-03).
export default function PrivacyPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Политика конфиденциальности</h1>
      <p>
        Приложение Scenario использует Firebase (Firestore, Analytics, Crashlytics,
        Remote Config) и Supabase Storage. Текст политики будет дополнен после
        юридического утверждения (US-E8-03).
      </p>
    </main>
  );
}