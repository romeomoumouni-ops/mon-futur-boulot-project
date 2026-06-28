import './globals.css';
import Script from 'next/script';
import { AppProvider } from '@/context/AppContext';

const META_PIXEL_ID = '1014378127969952';

export const metadata = {
  title: 'MonFuturBoulot.com - Tout ce dont tu as besoin pour trouver ton premier emploi',
  description: "Plateforme tout-en-un pour jeunes diplômés en Afrique : CV professionnel généré par IA, lettres de motivation personnalisées, offres d'emploi en temps réel et formations gratuites.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {/* Meta Pixel (Facebook) — chargé après l'hydratation, sans bloquer le rendu */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
