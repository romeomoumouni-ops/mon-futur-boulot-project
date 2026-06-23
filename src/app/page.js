'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useContext(AppContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link href="#features" style={styles.navLink}>Fonctionnalités</Link>
            <Link href="#jobs-info" style={styles.navLink}>Offres d'emploi</Link>
            <Link href="/pricing" style={styles.navLink}>Tarifs</Link>
          </nav>

          <div style={styles.navActions} className="landing-nav-actions">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Mon Tableau de Bord
              </Link>
            ) : (
              <>
                <Link href="/register?mode=login" style={styles.loginLink}>Connexion</Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Commencer maintenant
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div style={styles.mobileNav}>
          <Link href="#features" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</Link>
          <Link href="#jobs-info" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Offres d'emploi</Link>
          <Link href="/pricing" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Tarifs</Link>
          <hr style={{ borderColor: 'var(--dark-border)', margin: '10px 0' }} />
          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Mon Tableau de Bord
            </Link>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/register?mode=login" style={{ textAlign: 'center', padding: '10px' }}>Connexion</Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Commencer maintenant
              </Link>
            </div>
          )}
        </div>
      )}

      {/* HERO SECTION */}
      <section style={styles.heroSection}>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.badgeContainer}>
            <span style={styles.greenBadge}>🚀 Spécialement conçu pour les jeunes diplômés d'Afrique</span>
          </div>
          
          <h1 style={styles.heroTitle} className="hero-title-responsive">
            De diplômé à <span style={{color: 'var(--primary)'}}>embauché</span>. <br />
            En quelques jours.
          </h1>
          
          <p style={styles.heroSubtitle}>
            MonFuturBoulot.com est la plateforme tout-en-un qui transforme ton diplôme en opportunités.
            Des CV performants prêts à l'emploi, des lettres de motivation percutantes et des offres d'emploi exclusives — basés sur ce qui marche vraiment sur le marché pour maximiser tes chances de décrocher un poste.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '40px', width: '100%', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1.25 }}>
              <span style={{ fontWeight: 700 }}>Créer mon compte →</span>
              <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.9 }}>C'est ma première fois ici</span>
            </Link>
            <Link href="/register?mode=login" className="btn btn-secondary" style={{ width: '100%', padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--dark-border)', display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1.25 }}>
              <span style={{ fontWeight: 700 }}>Me connecter</span>
              <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.8 }}>(J'ai déjà un compte)</span>
            </Link>
            <Link href="/pricing" style={{ color: 'var(--dark-text-muted)', fontSize: '14px', textDecoration: 'underline', marginTop: '4px' }}>
              Voir les tarifs
            </Link>
          </div>

          {/* Social Proof rating */}
          <div style={styles.ratingContainer}>
            <div style={styles.avatarGroup}>
              <div style={{...styles.avatarSmall, backgroundColor: '#ff9900'}}>A</div>
              <div style={{...styles.avatarSmall, backgroundColor: '#0066cc'}}>Y</div>
              <div style={{...styles.avatarSmall, backgroundColor: '#00cc66'}}>K</div>
              <div style={{...styles.avatarSmall, backgroundColor: '#cc0066'}}>M</div>
            </div>
            <div>
              <span style={{color: '#ffb800'}}>★★★★★</span> <strong style={{color: '#fff'}}>4.9/5</strong>
              <p style={{fontSize: '12px', color: 'var(--dark-text-muted)'}}>Rejoint +12 000 jeunes diplômés déjà en poste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTRY BANNER */}
      <section style={styles.countrySection}>
        <div className="container">
          <p style={styles.countryTitle}>LES MEILLEURES ENTREPRISES RECRUTENT DANS CES PAYS :</p>
          <div style={styles.flagGrid}>
            <span style={styles.flagPill}>🇨🇮 Côte d'Ivoire</span>
            <span style={styles.flagPill}>🇸🇳 Sénégal</span>
            <span style={styles.flagPill}>🇨🇲 Cameroun</span>
            <span style={styles.flagPill}>🇧🇯 Bénin</span>
            <span style={styles.flagPill}>🇹🇬 Togo</span>
            <span style={styles.flagPill}>🇲🇱 Mali</span>
            <span style={styles.flagPill}>🇧🇫 Burkina Faso</span>
            <span style={styles.flagPill}>🇬🇦 Gabon</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabel}>FONCTIONNALITÉS</span>
            <h2>Tout ce dont tu as besoin pour décrocher ton premier emploi</h2>
            <p style={{color: 'var(--dark-text-muted)', maxWidth: '600px', margin: '10px auto 0 auto'}}>
              Trois outils puissants pensés pour les réalités du marché de l'emploi en Afrique.
            </p>
          </div>

          <div style={styles.gridFeatures}>
            {/* Feature 1 */}
            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, color: 'var(--primary)', backgroundColor: 'rgba(0,184,124,0.1)'}}>📄</div>
              <h3>CV performants prêts à l'emploi</h3>
              <p>Obtiens un CV structuré selon les modèles qui décrochent le plus d'entretiens sur le marché africain — optimisé pour les recruteurs.</p>
              <Link href="/register" style={styles.featureLink}>Créer mon CV →</Link>
            </div>

            {/* Feature 2 */}
            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, color: '#00aa50', backgroundColor: 'rgba(0,170,80,0.1)'}}>✉️</div>
              <h3>Lettres de motivation qui convertissent</h3>
              <p>Des lettres ciblées et percutantes, calquées sur ce qui fonctionne réellement auprès des recruteurs.</p>
              <Link href="/register" style={styles.featureLink}>Générer une lettre →</Link>
            </div>

            {/* Feature 3 */}
            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, color: 'var(--primary)', backgroundColor: 'rgba(0,184,124,0.1)'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 13h20"/></svg>
              </div>
              <h3>Offres en temps réel</h3>
              <p>Découvre les offres de stages et d'emplois de ta niche, dans ton pays, mises à jour en continu.</p>
              <Link href="/register" style={styles.featureLink}>Voir les offres →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{...styles.section, backgroundColor: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)'}}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabel}>COMMENT ÇA MARCHE ?</span>
            <h2>Du compte à l'embauche en 4 étapes</h2>
          </div>

          <div style={styles.stepsContainer}>
            <div style={styles.stepCard}>
              <div style={styles.stepNum}>1</div>
              <h4>Crée ton compte</h4>
              <p>Inscris-toi en quelques secondes, puis choisis ton plan.</p>
            </div>
            
            <div style={styles.stepCard}>
              <div style={styles.stepNum}>2</div>
              <h4>Génère ton CV</h4>
              <p>Remplis tes infos et obtiens un CV structuré selon les modèles qui performent le plus.</p>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNum}>3</div>
              <h4>Postule en 1 clic</h4>
              <p>Trouve des offres pertinentes et envoie ta candidature optimisée directement.</p>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNum}>4</div>
              <h4>Décroche le job</h4>
              <p>Fais la différence en entretien et commence ta nouvelle vie professionnelle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={styles.ctaSection}>
        <div className="container" style={styles.ctaContainer}>
          <h2>Prêt à transformer ton avenir ?</h2>
          <p>Rejoins les milliers de diplômés qui ont décroché leur premier emploi avec un CV qui fait la différence.</p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px' }}>
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div className="container footer-grid-responsive" style={styles.footerGrid}>
          <div style={styles.footerBrandCol}>
            <Link href="/" style={styles.logo}>
              <span style={styles.logoDot}>M</span>
              <strong>MonFuturBoulot</strong><span style={{color: 'var(--primary)'}}>.com</span>
            </Link>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--dark-text-muted)' }}>
              La plateforme de référence pour les jeunes diplômés en Afrique francophone.
            </p>
          </div>

          <div style={styles.footerCol}>
            <h4>Produit</h4>
            <Link href="/register" style={styles.footerLink}>Créateur de CV</Link>
            <Link href="/register" style={styles.footerLink}>Lettres de Motivation</Link>
            <Link href="/register" style={styles.footerLink}>Offres d'emploi</Link>
          </div>

          <div style={styles.footerCol}>
            <h4>Entreprise</h4>
            <Link href="#" style={styles.footerLink}>À propos</Link>
            <Link href="#" style={styles.footerLink}>Contact</Link>
            <Link href="#" style={styles.footerLink}>Blog</Link>
            <Link href="#" style={styles.footerLink}>Carrières</Link>
          </div>

          <div style={styles.footerCol}>
            <h4>Support</h4>
            <Link href="#" style={styles.footerLink}>FAQ</Link>
            <Link href="#" style={styles.footerLink}>CGU</Link>
            <Link href="#" style={styles.footerLink}>Confidentialité</Link>
          </div>
        </div>
        <div className="container footer-bottom-responsive" style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} MonFuturBoulot. Tous droits réservés.</p>
          <p>Fait avec ❤️ pour l'Afrique.</p>
        </div>
      </footer>

    </div>
  );
}

const styles = {
  header: {
    padding: '20px 0',
    borderBottom: '1px solid var(--dark-border)',
    position: 'sticky',
    top: 0,
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
  mobileToggle: {
    display: 'none', /* Controlled via .landing-mobile-toggle CSS class */
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer'
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--dark-card)',
    borderBottom: '1px solid var(--dark-border)',
    padding: '20px',
    gap: '15px'
  },
  mobileNavLink: {
    color: 'var(--dark-text-muted)',
    fontWeight: '500'
  },
  heroSection: {
    padding: '100px 0 80px 0',
    textAlign: 'center',
    flexGrow: 1,
    backgroundImage: 'radial-gradient(circle at top right, rgba(0, 184, 124, 0.08), transparent 45%)'
  },
  heroContainer: {
    maxWidth: '850px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badgeContainer: {
    marginBottom: '24px'
  },
  greenBadge: {
    display: 'inline-block',
    maxWidth: '100%',
    backgroundColor: 'rgba(0, 184, 124, 0.1)',
    color: 'var(--primary)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid rgba(0, 184, 124, 0.2)'
  },
  heroTitle: {
    fontSize: '52px',
    lineHeight: '1.15',
    color: '#fff',
    marginBottom: '24px',
    fontWeight: '800'
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--dark-text-muted)',
    lineHeight: '1.6',
    marginBottom: '32px',
    maxWidth: '750px'
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    marginBottom: '40px'
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    textAlign: 'left',
    border: '1px solid var(--dark-border)',
    padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--dark-card)'
  },
  avatarGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  avatarSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--dark-card)',
    marginLeft: '-8px'
  },
  countrySection: {
    padding: '30px 0',
    backgroundColor: '#05080f',
    borderTop: '1px solid var(--dark-border)',
    borderBottom: '1px solid var(--dark-border)'
  },
  countryTitle: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: 'var(--dark-text-muted)',
    textAlign: 'center',
    marginBottom: '15px'
  },
  flagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px'
  },
  flagPill: {
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    color: '#fff',
    padding: '8px 18px',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: '500'
  },
  section: {
    padding: '80px 0'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '50px'
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '0.15em',
    display: 'block',
    marginBottom: '8px'
  },
  gridFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px'
  },
  featureCard: {
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    padding: '32px',
    borderRadius: 'var(--radius-lg)',
    transition: 'var(--transition)'
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '20px'
  },
  featureLink: {
    display: 'block',
    marginTop: '20px',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '14px'
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px'
  },
  stepCard: {
    position: 'relative',
    paddingLeft: '20px'
  },
  stepNum: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  ctaSection: {
    padding: '100px 0',
    backgroundImage: 'radial-gradient(circle at bottom center, rgba(0, 184, 124, 0.12), transparent 50%)',
    borderTop: '1px solid var(--dark-border)'
  },
  ctaContainer: {
    textAlign: 'center',
    maxWidth: '600px'
  },
  footer: {
    backgroundColor: '#04060b',
    borderTop: '1px solid var(--dark-border)',
    padding: '60px 0 20px 0',
    marginTop: 'auto'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '40px',
    marginBottom: '40px'
  },
  footerBrandCol: {
    paddingRight: '40px'
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footerLink: {
    color: 'var(--dark-text-muted)',
    fontSize: '14px'
  },
  footerBottom: {
    borderTop: '1px solid var(--dark-border)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--dark-text-muted)'
  }
};
