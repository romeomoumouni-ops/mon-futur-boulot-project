'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';

export default function RegisterPage() {
  const { registerUser, loginUser } = useContext(AppContext);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Côte d\'Ivoire');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  const handleToggleMode = (mode) => {
    setIsLoginMode(mode);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      if (!email || !password) {
        setError('Veuillez remplir tous les champs.');
        return;
      }
      loginUser(email, password);
    } else {
      if (!firstName || !lastName || !email || !phone || !password) {
        setError('Veuillez remplir tous les champs.');
        return;
      }
      if (!agreeTerms) {
        setError('Vous devez accepter les conditions d\'utilisation.');
        return;
      }

      let registeredUsers = [];
      try {
        const savedList = localStorage.getItem('mfb_registered_users');
        if (savedList) {
          registeredUsers = JSON.parse(savedList);
        }
      } catch (err) {}
      
      if (!registeredUsers.some(u => u.email === email)) {
        registeredUsers.push({ firstName, lastName, email, country, phone, password });
        localStorage.setItem('mfb_registered_users', JSON.stringify(registeredUsers));
      }

      registerUser({
        firstName,
        lastName,
        email,
        country,
        phone,
        password
      });
    }
  };

  return (
    <div style={styles.pageContainer} className="auth-page">

      {/* LEFT PANE (WHITE BACKGROUND) */}
      <div style={styles.leftPane} className="auth-form-pane">
        <div style={styles.formWrapper}>
          
          <Link href="/" style={styles.logo}>
            <span style={styles.logoDot}>M</span>
            <strong>MonFuturBoulot</strong><span style={{color: 'var(--primary)'}}>.com</span>
          </Link>

          <h2 style={styles.formTitle}>
            {isLoginMode ? 'Connecte-toi à ton espace' : 'Crée ton compte'}
          </h2>
          <p style={styles.formSubtitle}>
            Rejoins +12 000 jeunes diplômés. Aucune carte requise.
          </p>

          {error && <div style={styles.errorMessage}>{error}</div>}

          {/* Actual Form */}
          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div style={styles.rowInputs}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Prénom</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Aminata" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nom</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Diallo" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="aminata.diallo@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isLoginMode && (
              <div style={styles.rowInputs}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Pays</label>
                  <select 
                    className="form-input" 
                    style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                    <option value="Sénégal">🇸🇳 Sénégal</option>
                    <option value="Cameroun">🇨🇲 Cameroun</option>
                    <option value="Bénin">🇧🇯 Bénin</option>
                    <option value="Togo">🇹🇬 Togo</option>
                    <option value="Mali">🇲🇱 Mali</option>
                    <option value="Burkina Faso">🇧🇫 Burkina Faso</option>
                    <option value="Gabon">🇬🇦 Gabon</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Téléphone</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+225 07 12 34 56 78" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLoginMode && (
              <div style={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="agree" style={styles.checkboxLabel}>
                  J'accepte les <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Conditions d'utilisation</span> et la <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Politique de confidentialité</span> de MonFuturBoulot.com.
                </label>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
              {isLoginMode ? 'Se connecter →' : 'Créer mon compte →'}
            </button>
          </form>

          <div style={styles.toggleModeText}>
            {isLoginMode ? (
              <>Tu n'as pas de compte ? <button onClick={() => handleToggleMode(false)} style={styles.inlineToggleBtn}>Créer un compte</button></>
            ) : (
              <>Tu as déjà un compte ? <button onClick={() => handleToggleMode(true)} style={styles.inlineToggleBtn}>Connexion</button></>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT PANE (DARK BACKGROUND) */}
      <div style={styles.rightPane} className="auth-promo-pane">
        <div style={styles.marketingWrapper}>
          
          <div style={styles.badgeContainer}>
            <span style={styles.greenBadge}>● TON PREMIER EMPLOI COMMENCE ICI</span>
          </div>

          <h2 style={styles.marketingTitle}>
            Tout ce dont tu as besoin pour trouver ton <span style={{color: 'var(--primary)'}}>premier emploi</span>.
          </h2>
          <p style={styles.marketingSubtitle}>
            Une seule plateforme. Des outils pensés pour décrocher ton premier emploi. Zéro complication.
          </p>

          <div style={styles.benefitList}>
            {/* Benefit 1 */}
            <div style={styles.benefitItem}>
              <span style={styles.checkmarkIcon}>✓</span>
              <div>
                <h4 style={styles.benefitTitle}>CV professionnel en 2 minutes</h4>
                <p style={styles.benefitDesc}>Un CV performant structuré selon les modèles qui décrochent le plus d'entretiens.</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div style={styles.benefitItem}>
              <span style={styles.checkmarkIcon}>✓</span>
              <div>
                <h4 style={styles.benefitTitle}>Lettres de motivation personnalisées</h4>
                <p style={styles.benefitDesc}>Une lettre unique pour chaque offre, en 30 secondes.</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div style={styles.benefitItem}>
              <span style={styles.checkmarkIcon}>✓</span>
              <div>
                <h4 style={styles.benefitTitle}>Offres d'emploi de ton pays en temps réel</h4>
                <p style={styles.benefitDesc}>Les nouvelles annonces s'ajoutent automatiquement chaque jour.</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div style={styles.testimonialCard}>
            <div style={{ color: '#ffb800', marginBottom: '10px' }}>★★★★★</div>
            <p style={styles.testimonialText}>
              "Grâce à MonFuturBoulot.com, j'ai décroché mon premier CDI 3 semaines après mon diplôme. Mon CV performant a vraiment fait la différence auprès des recruteurs."
            </p>
            <div style={styles.testimonialUser}>
              <div style={styles.avatarLarge}>YK</div>
              <div>
                <h5 style={{ color: '#fff', margin: 0, fontWeight: '700' }}>Yann Koffi, 23 ans</h5>
                <p style={{ color: 'var(--dark-text-muted)', margin: 0, fontSize: '12px' }}>Développeur Junior - Abidjan</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#ffffff'
  },
  leftPane: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    overflowY: 'auto'
  },
  formWrapper: {
    width: '100%',
    maxWidth: '480px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    gap: '8px',
    marginBottom: '32px'
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
  formTitle: {
    fontSize: '32px',
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: '10px'
  },
  formSubtitle: {
    fontSize: '15px',
    color: 'var(--light-text-muted)',
    marginBottom: '28px'
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px'
  },
  socialBtn: {
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)'
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '28px 0',
    borderBottom: '1px solid var(--light-border)'
  },
  dividerText: {
    position: 'absolute',
    top: '-9px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ffffff',
    padding: '0 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--light-text-muted)',
    letterSpacing: '0.05em'
  },
  rowInputs: {
    display: 'flex',
    gap: '16px'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    margin: '20px 0'
  },
  checkbox: {
    marginTop: '4px',
    accentColor: 'var(--primary)',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '13px',
    color: 'var(--light-text-muted)',
    lineHeight: '1.4'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    marginTop: '10px'
  },
  toggleModeText: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--light-text-muted)',
    marginTop: '24px'
  },
  inlineToggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid var(--error)',
    color: 'var(--error)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  socialBanner: {
    backgroundColor: 'rgba(0, 184, 124, 0.08)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  rightPane: {
    width: '50%',
    backgroundColor: 'var(--dark-bg)',
    color: 'var(--dark-text)',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundImage: 'radial-gradient(circle at center right, rgba(0, 184, 124, 0.08), transparent 55%)'
  },
  marketingWrapper: {
    maxWidth: '520px',
    margin: '0 auto'
  },
  badgeContainer: {
    marginBottom: '20px'
  },
  greenBadge: {
    backgroundColor: 'rgba(0, 184, 124, 0.1)',
    color: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  marketingTitle: {
    fontSize: '38px',
    color: '#fff',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '20px'
  },
  marketingSubtitle: {
    fontSize: '16px',
    color: 'var(--dark-text-muted)',
    lineHeight: '1.5',
    marginBottom: '36px'
  },
  benefitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '40px'
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  },
  checkmarkIcon: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
    marginTop: '2px'
  },
  benefitTitle: {
    fontSize: '16px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '4px'
  },
  benefitDesc: {
    fontSize: '14px',
    color: 'var(--dark-text-muted)',
    lineHeight: '1.4'
  },
  testimonialCard: {
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginTop: '40px'
  },
  testimonialText: {
    fontStyle: 'italic',
    color: 'var(--dark-text-muted)',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  testimonialUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarLarge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
