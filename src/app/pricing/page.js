'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';

export default function PricingPage() {
  const { plan, selectPlan } = useContext(AppContext);

  // Accordion active state tracker
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Comment démarrer ?",
      a: "Choisis le plan Mensuel ou Semestriel, crée ton compte, et tu accèdes immédiatement à tout : CV et lettres de motivation illimités, modifications illimitées et toutes les offres d'emploi en temps réel."
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
          <nav style={styles.nav}>
            <Link href="/#features" style={styles.navLink}>Fonctionnalités</Link>
            <Link href="/#jobs-info" style={styles.navLink}>Offres d'emploi</Link>
            <Link href="/pricing" style={{...styles.navLink, ...styles.navLinkActive}}>Tarifs</Link>
          </nav>
          <div style={styles.navActions}>
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
          <span style={styles.greenBadge}>✨ INVESTIS DANS TON AVENIR, PAS DANS DES FRAIS CACHÉS</span>
          <h1 style={styles.title}>
            Un job en Afrique, ça vaut <br />
            bien <span style={{color: 'var(--primary)'}}>un café par semaine</span>.
          </h1>
          <p style={styles.subtitle}>
            Sans engagement de durée — annule quand tu veux. <br />
            Choisis le plan qui correspond à ta recherche d'emploi et accède à tout, sans limite.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section style={{ padding: '20px 0 80px 0' }}>
        <div className="container" style={styles.cardsGrid}>

          {/* Plan 1: Mensuel */}
          <div style={styles.priceCard}>
            <span style={styles.planName}>MENSUEL</span>
            <p style={styles.planDesc}>Pour une recherche d'emploi active, sans aucune limite.</p>

            <div style={styles.priceContainer}>
              <span style={styles.priceAmount}>5 000</span>
              <span style={styles.priceCurrency}>FCFA / mois</span>
            </div>

            <p style={styles.priceCaption}>Payé mensuellement</p>

            <Link href="/register" className="btn btn-secondary" style={styles.cardBtn} onClick={() => selectPlan('mensuel')}>
              Choisir ce plan
            </Link>

            <ul style={styles.featuresList}>
              <li>✓ CV performants illimités</li>
              <li>✓ Lettres de motivation illimitées</li>
              <li>✓ Modifications illimitées</li>
              <li>✓ Toutes les offres d'emploi en temps réel</li>
              <li>✓ Accès aux nouvelles opportunités de ta niche</li>
            </ul>
          </div>

          {/* Plan 2: Semestriel (Le Plus Populaire) */}
          <div style={styles.popularCard}>
            <div style={styles.popularBadge}>🔥 LE PLUS POPULAIRE</div>
            <span style={{...styles.planName, color: 'var(--primary)'}}>SEMESTRIEL</span>
            <p style={{...styles.planDesc, color: 'var(--dark-text-muted)'}}>Idéal pour maximiser tes chances de décrocher ton premier emploi.</p>

            <div style={styles.priceContainer}>
              <span style={{...styles.priceAmount, color: '#fff'}}>15 000</span>
              <span style={styles.priceCurrency}>FCFA / 6 mois</span>
            </div>

            <p style={styles.priceCaption}>Soit seulement <strong>2 500 FCFA / mois</strong> (-50% d'économie)</p>

            <Link href="/register" className="btn btn-primary" style={styles.cardBtn} onClick={() => selectPlan('semestriel')}>
              Choisir ce plan
            </Link>

            <ul style={styles.featuresList}>
              <li style={{color: '#fff'}}>✓ Tout ce qui est inclus dans le Mensuel</li>
              <li style={{color: '#fff'}}>✓ Accès prioritaire aux nouvelles opportunités de ta niche</li>
              <li style={{color: '#fff'}}>✓ Analyse ATS avancée du CV (Score)</li>
              <li style={{color: '#fff'}}>✓ Support prioritaire par WhatsApp</li>
            </ul>
          </div>

        </div>
      </section>

      {/* COMPARE TABLE */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--dark-border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Compare en un coup d'œil</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>FONCTIONNALITÉ</th>
                  <th style={styles.tableTh}>Mensuel</th>
                  <th style={styles.tableTh}>Semestriel</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.tableTd}>CV performants</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Lettres de motivation</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Modifications</td>
                  <td style={styles.tableTd}>Illimité</td>
                  <td style={styles.tableTd}>Illimité</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Offres d'emploi en temps réel</td>
                  <td style={styles.tableTd}>✓</td>
                  <td style={styles.tableTd}>✓</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Nouvelles opportunités de ta niche</td>
                  <td style={styles.tableTd}>✓</td>
                  <td style={styles.tableTd}>✓ (prioritaire)</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Compatibilité score ATS</td>
                  <td style={styles.tableTd}>—</td>
                  <td style={styles.tableTd}>✓</td>
                </tr>
                <tr>
                  <td style={styles.tableTd}>Support prioritaire WhatsApp</td>
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
