// CTA установки МП (SP-E4-03, FR-W-3).
//
// Переиспользуемый блок с ссылками на сторы (iOS/Android). Используется в
// шапке/подвале и на контентных страницах сценария/игры.

import Link from 'next/link';
import { STORE_URLS } from '../lib/stores';

export default function InstallCta() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Link
        href={STORE_URLS.ios}
        style={{ padding: '0.75rem 1.25rem', background: '#000', color: '#fff', borderRadius: 8 }}
      >
        Скачать в App Store
      </Link>
      <Link
        href={STORE_URLS.android}
        style={{
          padding: '0.75rem 1.25rem',
          background: '#1a73e8',
          color: '#fff',
          borderRadius: 8,
        }}
      >
        Скачать в Google Play
      </Link>
    </div>
  );
}
