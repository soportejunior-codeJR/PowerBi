import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panel de Datos — Fundación ROFÉ',
  description:
    'Estadísticas públicas de Jóvenes creaTIvos y Fundación ROFÉ: cursos, emprendimiento y demografía. Solo datos agregados, sin información personal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white/85 backdrop-blur-md">
          <p className="max-w-[1600px] mx-auto px-4 py-3 text-xs text-slate-400">
            “Si quieres cambiar el mundo, toca una vida” — Fundación ROFÉ. Datos
            sincronizados diariamente desde Q10 vía Supabase.
          </p>
        </footer>
      </body>
    </html>
  );
}
