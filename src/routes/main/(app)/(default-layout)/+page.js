export async function load({ url, setHeaders }) {
  console.log(url.hostname);
  setHeaders({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Permissions-Policy': 'document-domain=(), geolocation=(), camera=(), microphone=()',
    ...(url.hostname.endsWith('.pages.dev') && { 'X-Robots-Tag': 'noindex' })
  });
}
