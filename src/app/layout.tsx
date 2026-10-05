import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Property Hunter — Prospecção e Alertas Imobiliários em Portugal',
  description: 'Prospecção contínua de imóveis com análise de preço por metro quadrado (€/m²), alertas de oportunidade e histórico de alterações de preço.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
