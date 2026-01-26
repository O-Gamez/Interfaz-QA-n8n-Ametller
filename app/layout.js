import './globals.css'

export const metadata = {
  title: 'QA – Revisión de Casos',
  description: 'Herramienta de revisión de casos de prueba',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}