import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR決済モック',
    short_name: 'QR Pay',
    description: '撮影用QR決済モックアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#ff0033',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
