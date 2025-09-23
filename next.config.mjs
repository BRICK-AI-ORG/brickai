/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // This becomes "[your-project-id].supabase.co"
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        pathname: '**',
      },
    ],
  },
  async headers() {
    const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    const csp = [
      "default-src 'self'",
      `img-src 'self' data: blob: https://${supabaseHost}`,
      // Allow HTTP(S) and WSS to Supabase; keep same-origin for others
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      // Allow inline scripts to support Next.js bootstrapping; avoid 'unsafe-eval' in production
      "script-src 'self' 'unsafe-inline' blob:",
      // Tailwind requires inline styles; fonts are self-hosted
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
