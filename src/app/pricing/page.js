'use client';

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';
import CheckoutButton from '@/components/CheckoutButton';

export default function PricingPage() {
  const { plan, selectPlan } = useContext(AppContext);

  // Bandeau "abonnement requis" : UNIQUEMENT si on a été redirigé ici explicitement
  // (?access=required, posé par le middleware ou après inscription).
  // On ne se base PAS sur accessPlan côté client (chargé en différé) pour éviter
  // d'afficher le bandeau à tort à un utilisateur déjà abonné.
  const [accessRequired, setAccessRequired] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('access') === 'required') {
      setAccessRequired(true);
    }
  }, []);

  // Accordion active state tracker
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Comment démarrer ?",
      a: "Choisis le plan Basique, Standard ou Premium, crée ton compte, et tu accèdes immédiatement à tes outils. Le Basique couvre les CV et lettres de motivation ; le Standard et le Premium ajoutent les offres d'emploi et les opportunités de ta niche."
    },
    {
      q: "Comment se passe le paiement en FCFA ?",
      a: "Nous acceptons tous les moyens de paiement locaux africains : Wave, Orange Money, MTN Mobile Money, Moov, ainsi que les cartes bancaires Visa et Mastercard. Les transactions sont sécurisées à 100%."
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, sans engagement. Tu peux annuler le renouvellement de ton abonnement à tout moment directement depuis ton espace client en un seul clic."
    },
    {
      q: "Une nouvelle version est-elle disponible en anglais ?",
      a: "Oui, tu peux créer ton CV et tes lettres de motivation aussi bien en français qu'en anglais en changeant simplement la langue dans l'éditeur."
    }
  ];

  return (
    <div className="dark-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER NAVBAR */}
      <header style={styles.header}>
        <div className="container" style={styles.navContainer}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoDot}>M</span>
            <strong>MonFuturBoulot</strong><span style={{color: 'var(--primary)'}}>.com</span>
          </Link>
          <nav style={styles.nav} className="landing-nav">
            <Link href="/#features" style={styles.navLink}>Fonctionnalités</Link>
            <Link href="/#jobs-info" style={styles.navLink}>Offres d'emploi</Link>
            <Link href="/pricing" style={{...styles.navLink, ...styles.navLinkActive}}>Tarifs</Link>
          </nav>
          <div style={styles.navActions} className="landing-nav-actions">
            <Link href="/register" style={styles.loginLink}>Connexion</Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              S'abonner
            </Link>
          </div>
        </div>
      </header>

      {/* HERO / HEADER SECTION */}
      <section style={styles.heroSection}>
        <div className="container" style={{ textAlign: 'center' }}>
          {accessRequired && (
            <div style={{ maxWidth: '640px', margin: '0 auto 24px', padding: '14px 18px', backgroundColor: 'rgba(0,184,124,0.12)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
              🔒 Choisis ton abonnement ci-dessous pour accéder à ton espace MonFuturBoulot.
            </div>
          )}
          <h1 style={styles.title} className="hero-title-responsive">
            Tes études t'ont coûté cher. Maintenant tu es en concurrence avec des milliers de diplômés. Il est temps de <span style={{color: 'var(--primary)'}}>maximiser tes chances</span>.
          </h1>

          {/* Vidéo de découverte de la plateforme */}
          <div style={{ maxWidth: '760px', margin: '28px auto 24px' }}>
            <video
              controls
              playsInline
              preload="metadata"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dark-border)', backgroundColor: '#000', display: 'block' }}
            >
              <source src="/video-decouverte.mp4" type="video/mp4" />
              Ton navigateur ne peut pas lire cette vidéo.
            </video>
          </div>

          <p style={styles.subtitle}>
            Choisis le plan qui correspond à ta recherche d'emploi et accède à tout, sans limite.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section style={{ padding: '20px 0 80px 0' }}>
        <div className="container" style={styles.cardsGrid}>

          {/* Plan 1: Basique */}
          <div style={styles.priceCard}>
            <span style={styles.planName}>BASIQUE</span>
            <p style={styles.planDesc}>L'essentiel pour préparer ta candidature.</p>

            <div style={styles.priceContainer}>
              <span style={styles.priceAmount}>2 500</span>
              <span style={styles.priceCurrency}>FCFA / mois</span>
            </div>

            <p style={styles.priceCaption}>Payé mensuellement</p>

            <div style={styles.cardBtn}>
              <CheckoutButton plan="basique" primary={false} />
            </div>

            <ul style={styles.featuresList}>
              <li>✓ CV performants illimités</li>
              <li>✓ Lettres de motivation illimitées</li>
              <li style={{ color: '#ef4444' }}>✗ <span style={{ textDecoration: 'line-through' }}>Offres d'emploi en temps réel</span></li>
              <li style={{ color: '#ef4444' }}>✗ <span style={{ textDecoration: 'line-through' }}>Opportunités de ta niche</span></li>
              <li style={{ color: '#ef4444' }}>✗ <span style={{ textDecoration: 'line-through' }}>Analyse ATS avancée</span></li>
            </ul>
          </div>

          {/* Plan 2: Standard (Recommandé) */}
          <div style={styles.popularCard}>
            <div style={styles.popularBadge}>⭐ RECOMMANDÉ</div>
            <span style={{...styles.planName, color: 'var(--primary)'}}>STANDARD</span>
            <p style={{...styles.planDesc, color: 'var(--dark-text-muted)'}}>Pour une recherche d'emploi active, sans aucune limite.</p>

            <div style={styles.priceContainer}>
              <span style={{...styles.priceAmount, color: '#fff'}}>5 000</span>
              <span style={styles.priceCurrency}>FCFA / mois</span>
            </div>

            <p style={styles.priceCaption}>Payé mensuellement</p>

            <div style={styles.cardBtn}>
              <CheckoutButton plan="standard" />
            </div>

            <ul style={styles.featuresList}>
              <li style={{color: '#fff'}}>✓ CV performants illimités</li>
              <li style={{color: '#fff'}}>✓ Lettres de motivation illimitées</li>
              <li style={{color: '#fff'}}>✓ Modifications illimitées</li>
              <li style={{color: '#fff'}}>✓ Toutes les offres d'emploi en temps réel</li>
              <li style={{color: '#fff'}}>✓ Accès aux nouvelles opportunités de ta niche</li>
              <li style={{color: '#fff'}}>✓ Analyse ATS avancée du CV (Score)</li>
              <li style={{color: '#fff'}}>✓ Support prioritaire par WhatsApp</li>
            </ul>
          </div>

          {/* Plan 3: Premium (6 mois) */}
          <div style={styles.priceCard}>
            <span style={styles.planName}>PREMIUM</span>
            <p style={styles.planDesc}>Le meilleur tarif pour aller au bout de ta recherche.</p>

            <div style={styles.priceContainer}>
              <span style={styles.priceAmount}>15 000</span>
              <span style={styles.priceCurrency}>FCFA / 6 mois</span>
            </div>

            <p style={styles.priceCaption}>Soit seulement <strong>2 500 FCFA / mois</strong> (-50% d'économie)</p>

            <div style={styles.cardBtn}>
              <CheckoutButton plan="premium" primary={false} />
            </div>

            <ul style={styles.featuresList}>
              <li>✓ Tout ce qui est inclus dans le Standard</li>
              <li>✓ Engagement 6 mois — 2 500 FCFA/mois seulement</li>
              <li>✓ Accès prioritaire aux nouvelles opportunités de ta niche</li>
              <li>✓ Relecture humaine du CV</li>
            </ul>
          </div>

        </div>
      </section>

      {/* COMPARE TABLE */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--dark-border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Compare en un coup d'œil</h2>
          
          <div className="table-scroll">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>FONCTIONNALITÉ</th>
                  <th style={styles.tableTh}>Basique</th>
                  <th style={styles.tableTh}>Standard</th>
                  <th style={styles.tableTh}>Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.tableTd}>CV performants</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Lettres de motivation</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Modifications</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Offres d'emploi en temps réel</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>✓</td>
                  <td style={styles.tableTd}>✓</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Nouvelles opportunités de ta niche</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>✓</td>
                  <td style={styles.tableTd}>✓ (prioritaire)</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Compatibilité score ATS</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>✓</td>
                  <td style={styles.tableTd}>✓</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Support prioritaire WhatsApp</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>✓</td>
                  <td style={styles.tableTd}>✓</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Relecture humaine du CV</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: '60px 0 100px 0', borderTop: '1px solid var(--dark-border)' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Questions fréquentes</h2>
          <p style={{ textAlign: 'center', color: 'var(--dark-text-muted)', marginBottom: '40px' }}>
            Des réponses simples aux questions les plus posées.
          </p>

          <div style={styles.faqList}>
            {faqData.map((faq, index) => (
              <div key={index} className="faq-item" style={{ borderColor: 'var(--dark-border)', backgroundColor: 'var(--dark-card)' }}>
                <button style={{...styles.faqHeader, color: '#fff'}} onClick={() => toggleFaq(index)}>
                  <span>{faq.q}</span>
                  <span>{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="faq-content" style={{ color: 'var(--dark-text-muted)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} MonFuturBoulot. Tous droits réservés.</p>
          <p>
            <Link href="/" style={{ color: 'var(--primary)' }}>Retour à l'accueil</Link>
          </p>
        </div>
      </footer>

    </div>
  );
}

const styles = {
  header: {
    padding: '20px 0',
    borderBottom: '1px solid var(--dark-border)',
    backgroundColor: 'rgba(8, 12, 20, 0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 100
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: '800',
    color: '#fff',
    gap: '8px'
  },
  logoDot: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  nav: {
    display: 'flex',
    gap: '30px',
  },
  navLink: {
    color: 'var(--dark-text-muted)',
    fontWeight: '500',
    fontSize: '15px'
  },
  navLinkActive: {
    color: '#fff'
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  loginLink: {
    color: '#fff',
    fontWeight: '500',
    fontSize: '15px'
  },
  heroSection: {
    padding: '60px 0 40px 0',
    backgroundImage: 'radial-gradient(circle at top center, rgba(0, 184, 124, 0.05), transparent 40%)'
  },
  greenBadge: {
    backgroundColor: 'rgba(0, 184, 124, 0.1)',
    color: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    display: 'inline-block',
    marginBottom: '20px'
  },
  title: {
    fontSize: '42px',
    lineHeight: '1.2',
    color: '#fff',
    marginBottom: '20px',
    fontWeight: '800'
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--dark-text-muted)',
    lineHeight: '1.6',
    maxWidth: '650px',
    margin: '0 auto 30px auto'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1050px',
    margin: '0 auto'
  },
  priceCard: {
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'var(--transition)'
  },
  popularCard: {
    backgroundColor: '#0c1524',
    border: '2px solid var(--primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 36px 36px 36px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transform: 'scale(1.03)',
    boxShadow: '0 12px 40px rgba(0, 184, 124, 0.15)',
    zIndex: 2
  },
  popularBadge: {
    position: 'absolute',
    top: '-14px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 14px',
    borderRadius: 'var(--radius-full)',
    letterSpacing: '0.05em'
  },
  planName: {
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--dark-text-muted)',
    letterSpacing: '0.15em',
    marginBottom: '10px',
    display: 'block'
  },
  planDesc: {
    fontSize: '14px',
    color: 'var(--dark-text-muted)',
    lineHeight: '1.4',
    marginBottom: '24px'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '8px'
  },
  priceAmount: {
    fontSize: '44px',
    fontWeight: '800',
    color: '#fff',
    whiteSpace: 'nowrap'
  },
  priceCurrency: {
    fontSize: '18px',
    color: 'var(--dark-text-muted)',
    marginLeft: '6px',
    fontWeight: '600'
  },
  priceCaption: {
    fontSize: '13px',
    color: 'var(--dark-text-muted)',
    marginBottom: '30px'
  },
  cardBtn: {
    width: '100%',
    padding: '12px',
    marginBottom: '30px'
  },
  featuresList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '14px',
    color: 'var(--dark-text-muted)',
    marginTop: 'auto'
  },
  table: {
    width: '100%',
    minWidth: '560px',
    borderCollapse: 'collapse',
    textAlign: 'left',
    marginTop: '20px'
  },
  tableTh: {
    padding: '16px',
    borderBottom: '1px solid var(--dark-border)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px'
  },
  tableTd: {
    padding: '16px',
    borderBottom: '1px solid var(--dark-border)',
    color: 'var(--dark-text-muted)',
    fontSize: '14px'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  faqHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    outline: 'none'
  },
  footer: {
    backgroundColor: '#04060b',
    borderTop: '1px solid var(--dark-border)',
    padding: '40px 0',
    marginTop: 'auto'
  },
  footerBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--dark-text-muted)'
  }
};
