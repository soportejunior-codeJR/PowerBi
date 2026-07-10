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
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Fundación ROFÉ" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-rofe-azul leading-tight">
                Panel de Datos
              </h1>
              <p className="text-xs text-slate-500">
                Jóvenes creaTIvos · Fundación ROFÉ — datos agregados, sin información personal
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <p className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-400">
            “Si quieres cambiar el mundo, toca una vida” — Fundación ROFÉ. Datos
            sincronizados diariamente desde Q10 vía Supabase.
          </p>
        </footer>
      </body>
    </html>
  );
}
