/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático: todo el dato se consulta client-side a las vistas públicas
  // de Supabase (anon key + RLS/agregados). Sin SSR → deploy estático en Netlify
  // (publish "out"), sin plugin ni funciones.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
