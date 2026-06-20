import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'MonFuturBoulot.com - Tout ce dont tu as besoin pour trouver ton premier emploi',
  description: "Plateforme tout-en-un pour jeunes diplômés en Afrique : CV professionnel généré par IA, lettres de motivation personnalisées, offres d'emploi en temps réel et formations gratuites.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
