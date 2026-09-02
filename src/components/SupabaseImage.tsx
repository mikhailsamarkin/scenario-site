// Компонент для отображения изображений из Supabase Storage (бакет games).
// Принимает imageRef — путь внутри бакета (например 'games/{id}/image.jpg'),
// строит публичный URL через supabasePublicUrl.

import Image from 'next/image';
import {supabasePublicUrl} from '../lib/supabase';

type Props = {
  imageRef: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

export default function SupabaseImage({
  imageRef,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
}: Props) {
  const src = supabasePublicUrl(imageRef);
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}