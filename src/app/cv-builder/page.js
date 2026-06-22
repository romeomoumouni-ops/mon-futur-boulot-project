'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { generateCvPdf } from '@/lib/pdf';

export default function CvBuilderPage() {
  const router = useRouter();
  const {
    cvData,
    updateCV,
    addCVItem,
    deleteCVItem,
    atsScore,
    changeTemplate,
    canUseProFeatures
  } = useContext(AppContext);

  // Stepper state
  const [activeStep, setActiveStep] = useState(2); // Step 2 (Expérience & Formation) matches Screenshot 3
  const [cvStyle, setCvStyle] = useState(cvData.template || 'modern');

  // Input states for dynamic additions
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newExpLocation, setNewExpLocation] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduSchool, setNewEduSchool] = useState('');
  const [newEduPeriod, setNewEduPeriod] = useState('');
  const [newEduLocation, setNewEduLocation] = useState('');

  // AI states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState('');

  const triggerAiCVHelp = (field) => {
    setIsAiLoading(true);
    setAiTip('Optimisation de ton CV en cours...');

    setTimeout(() => {
      if (field === 'summary') {
        const titleText = cvData.title || 'Candidat';
        const skillsText = cvData.skills && cvData.skills.length > 0 
          ? cvData.skills.slice(0, 4).join(', ') 
          : 'mes compétences clés';
        const latestCompany = cvData.experiences && cvData.experiences.length > 0 
          ? cvData.experiences[0].company 
          : '';
        const companyPhrase = latestCompany ? ` suite à mon expérience enrichissante chez ${latestCompany}` : '';
        
        const generatedSummary = `Jeune diplômée dynamique et rigoureuse, spécialisée en tant que ${titleText}${companyPhrase}. Passionnée par ce domaine, j'ai développé une solide maîtrise pratique de ${skillsText}. Orientée résultats, je souhaite mettre mon énergie et mes compétences au service d'équipes ambitieuses pour relever de nouveaux défis professionnels.`;
        
        updateCV('summary', generatedSummary);
      } else if (field === 'suggestion') {
        let suggestedTitle = 'Spécialiste en Communication';
        if (cvData.skills && (cvData.skills.includes('SEO') || cvData.skills.includes('Meta Ads') || cvData.skills.includes('Google Analytics'))) {
          suggestedTitle = 'Spécialiste Marketing Digital & Réseaux Sociaux';
        } else if (cvData.title && cvData.title.toLowerCase().includes('marketing')) {
          suggestedTitle = 'Consultante Marketing Digital Junior';
        }
        updateCV('title', suggestedTitle);
      }
      setIsAiLoading(false);
      setAiTip('CV optimisé selon les modèles qui performent ! ✨');
      setTimeout(() => setAiTip(''), 3000);
    }, 1200);
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExpRole || !newExpCompany) return;
    addCVItem('experiences', {
      role: newExpRole,
      company: newExpCompany,
      period: newExpPeriod || 'Juin - Sept 2025',
      location: newExpLocation || 'Abidjan',
      desc: newExpDesc || ''
    });
    setNewExpRole('');
    setNewExpCompany('');
    setNewExpPeriod('');
    setNewExpLocation('');
    setNewExpDesc('');
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!newEduDegree || !newEduSchool) return;
    addCVItem('educations', {
      degree: newEduDegree,
      school: newEduSchool,
      period: newEduPeriod || '2022 - 2025',
      location: newEduLocation || 'Abidjan',
      desc: ''
    });
    setNewEduDegree('');
    setNewEduSchool('');
    setNewEduPeriod('');
    setNewEduLocation('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      
      {/* CV TOP AUTO SAVE BAR */}
      <header style={styles.topBar} className="cv-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard" style={styles.logo}>
            <span style={styles.logoDot}>M</span>
            <strong>MonFuturBoulot</strong>
          </Link>
          <span style={{ color: '#cbd5e1' }} className="cv-topbar-hide-mobile">|</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }} className="cv-topbar-hide-mobile">
            Mon CV{(cvData.firstName || cvData.lastName) ? <> / <strong style={{ color: '#0f172a' }}>{cvData.firstName} {cvData.lastName}</strong></> : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }} className="cv-topbar-hide-mobile">Sauvegarde auto - il y a 12s</span>
          <button className="btn btn-secondary btn-sm" onClick={() => generateCvPdf('open', cvData.firstName, cvData.lastName)}>Aperçu</button>
          <button className="btn btn-primary btn-sm" onClick={() => generateCvPdf('save', cvData.firstName, cvData.lastName)}>Télécharger PDF ↓</button>
        </div>
      </header>

      {/* Progress Stepper (matching screen 3) */}
      <div style={styles.stepperContainer}>
        <div className="container db-cv-stepper" style={{ display: 'flex', justifyContent: 'space-between', padding: 0 }}>
          <div style={{...styles.stepIndicator, ...(activeStep >= 1 ? styles.stepIndicatorDone : {}), cursor: 'pointer'}} onClick={() => setActiveStep(1)}>
            <span style={styles.stepCircle}>✓</span>
            <span style={styles.stepText}>ÉTAPE 1<br /><strong>Informations</strong></span>
          </div>
          <div style={{...styles.stepIndicator, ...(activeStep >= 2 ? styles.stepIndicatorActive : {}), cursor: 'pointer'}} onClick={() => setActiveStep(2)}>
            <span style={styles.stepCircle}>2</span>
            <span style={styles.stepText}>ÉTAPE 2<br /><strong>Expérience & Formation</strong></span>
          </div>
          <div style={{...styles.stepIndicator, ...(activeStep >= 3 ? styles.stepIndicatorPending : {}), cursor: 'pointer'}} onClick={() => setActiveStep(3)}>
            <span style={styles.stepCircle}>3</span>
            <span style={styles.stepText}>ÉTAPE 3<br /><strong>Compétences</strong></span>
          </div>
          <div style={{...styles.stepIndicator, ...(activeStep >= 4 ? styles.stepIndicatorPending : {}), cursor: 'pointer'}} onClick={() => setActiveStep(4)}>
            <span style={styles.stepCircle}>4</span>
            <span style={styles.stepText}>ÉTAPE 4<br /><strong>Style & Téléchargement</strong></span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
        <div style={styles.cvWorkspace} className="db-cv-workspace">
          
          {/* Left Form Column */}
          <div style={styles.cvFormColumn}>
            
            {/* STEP 1: INFORMATIONS PERSONNELLES */}
            {activeStep === 1 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>ÉTAPE 1 / 4</span>
                <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>Informations personnelles</h1>
                <p style={{ color: 'var(--light-text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                  Saisis tes coordonnées de contact afin que les recruteurs puissent te joindre facilement.
                </p>

                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Photo de profil</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={styles.avatarLarge}>
                      {(cvData.firstName ? cvData.firstName[0] : '') || (cvData.lastName ? cvData.lastName[0] : '') || '👤'}
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert('Photo de profil mise à jour')}>Changer la photo</button>
                    <button className="btn btn-secondary btn-sm" style={{ border: 'none', color: '#ef4444' }} onClick={() => alert('Photo de profil supprimée')}>Supprimer</button>
                  </div>

                  <div style={styles.rowInputs}>
                    <div className="form-group" style={{ flex: 1, marginTop: '20px' }}>
                      <label className="form-label">Prénom</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cvData.firstName}
                        onChange={(e) => updateCV('firstName', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginTop: '20px' }}>
                      <label className="form-label">Nom</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cvData.lastName}
                        onChange={(e) => updateCV('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Titre du profil (ex: Marketing Digital Junior)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={cvData.title}
                      onChange={(e) => updateCV('title', e.target.value)}
                    />
                    <button 
                      style={styles.aiSuggestionLink}
                      onClick={() => triggerAiCVHelp('suggestion')}
                    >
                      ✨ Suggestion : optimiser le titre
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Résumé professionnel</label>
                    <textarea 
                      className="form-input" 
                      rows={4} 
                      value={cvData.summary}
                      onChange={(e) => updateCV('summary', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                    <button 
                      style={styles.aiSuggestionLink}
                      onClick={() => triggerAiCVHelp('summary')}
                    >
                      ✨ Générer un résumé d'impact
                    </button>
                  </div>
                </div>

                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Coordonnées de contact</h3>
                  
                  <div style={styles.rowInputs}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Adresse email</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={cvData.email}
                        onChange={(e) => updateCV('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Numéro de téléphone</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cvData.phone}
                        onChange={(e) => updateCV('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={styles.rowInputs}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Adresse physique (ex: Abidjan, Côte d'Ivoire)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cvData.address}
                        onChange={(e) => updateCV('address', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Lien LinkedIn (ex: in/nom-prenom)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cvData.linkedin}
                        onChange={(e) => updateCV('linkedin', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setActiveStep(2)}>Suivant : Expérience & Formation →</button>
                </div>
              </div>
            )}

            {/* STEP 2: EXPÉRIENCES & FORMATIONS */}
            {activeStep === 2 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>ÉTAPE 2 / 4</span>
                <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>Ton expérience et ta formation</h1>
                <p style={{ color: 'var(--light-text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                  Ajoute tes expériences (stages, projets, jobs étudiants). Elles seront reformulées en langage professionnel percutant.
                </p>

                {/* AI Assistant Banner */}
                <div style={styles.aiHelperBanner}>
                  <div style={styles.aiHelperPill}>✨ Optimise ton CV pour le marché</div>
                  <p style={{ fontSize: '13px', margin: '10px 0 16px 0', color: 'var(--dark-text-muted)', lineHeight: '1.4' }}>
                    Génère un résumé percutant ou suggère un titre optimisé pour les recruteurs.
                  </p>
                  {aiTip && <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>{aiTip}</div>}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => triggerAiCVHelp('summary')}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? 'Analyse en cours...' : 'Optimiser mon CV'}
                  </button>
                </div>

                {/* Experiences list & additions */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Expériences professionnelles</h3>
                  
                  {cvData.experiences.map((exp) => (
                    <div key={exp.id} style={styles.editorListItem}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: '#0f172a' }}>{exp.role} — {exp.company}</strong>
                        <p style={{ fontSize: '11px', color: 'var(--light-text-muted)' }}>{exp.period} • {exp.location}</p>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px', whiteSpace: 'pre-line' }}>{exp.desc}</p>
                      </div>
                      <button 
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        onClick={() => deleteCVItem('experiences', exp.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}

                  {/* Add form inline */}
                  <form onSubmit={handleAddExperience} style={styles.inlineForm}>
                    <h4>Ajouter une expérience</h4>
                    <div style={styles.rowInputs}>
                      <input type="text" placeholder="Poste (ex: Assistant Marketing)" className="form-input" value={newExpRole} onChange={(e) => setNewExpRole(e.target.value)} />
                      <input type="text" placeholder="Entreprise (ex: Wave CI)" className="form-input" value={newExpCompany} onChange={(e) => setNewExpCompany(e.target.value)} />
                    </div>
                    <div style={styles.rowInputs}>
                      <input type="text" placeholder="Période (ex: Juin 2025)" className="form-input" value={newExpPeriod} onChange={(e) => setNewExpPeriod(e.target.value)} />
                      <input type="text" placeholder="Ville (ex: Abidjan)" className="form-input" value={newExpLocation} onChange={(e) => setNewExpLocation(e.target.value)} />
                    </div>
                    <textarea placeholder="Description des tâches (une par ligne avec tiret)" className="form-input" rows={2} value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} />
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}>+ Ajouter au CV</button>
                  </form>
                </div>

                {/* Education list & additions */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Formation</h3>

                  {cvData.educations.map((edu) => (
                    <div key={edu.id} style={styles.editorListItem}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: '#0f172a' }}>{edu.degree}</strong>
                        <p style={{ fontSize: '11px', color: 'var(--light-text-muted)' }}>{edu.school} • {edu.period} • {edu.location}</p>
                      </div>
                      <button 
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        onClick={() => deleteCVItem('educations', edu.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}

                  <form onSubmit={handleAddEducation} style={styles.inlineForm}>
                    <h4>Ajouter une formation</h4>
                    <div style={styles.rowInputs}>
                      <input type="text" placeholder="Diplôme (ex: Licence)" className="form-input" value={newEduDegree} onChange={(e) => setNewEduDegree(e.target.value)} />
                      <input type="text" placeholder="Université / École" className="form-input" value={newEduSchool} onChange={(e) => setNewEduSchool(e.target.value)} />
                    </div>
                    <div style={styles.rowInputs}>
                      <input type="text" placeholder="Période (ex: 2022 - 2025)" className="form-input" value={newEduPeriod} onChange={(e) => setNewEduPeriod(e.target.value)} />
                      <input type="text" placeholder="Ville" className="form-input" value={newEduLocation} onChange={(e) => setNewEduLocation(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}>+ Ajouter au CV</button>
                  </form>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setActiveStep(1)}>← Précédent</button>
                  <button className="btn btn-primary" onClick={() => setActiveStep(3)}>Suivant : Compétences →</button>
                </div>
              </div>
            )}

            {/* STEP 3: COMPÉTENCES & LANGUES */}
            {activeStep === 3 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>ÉTAPE 3 / 4</span>
                <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>Tes compétences et langues</h1>
                <p style={{ color: 'var(--light-text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                  Ajoute tes forces professionnelles et les langues que tu parles.
                </p>

                {/* Skills Section */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Compétences clés</h3>
                  <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', marginBottom: '15px' }}>
                    Clique sur le "×" d'une compétence pour la supprimer, ou ajoute-en de nouvelles.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {cvData.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="cv-badge" 
                        style={{ 
                          fontSize: '13px', 
                          padding: '6px 12px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          backgroundColor: 'var(--primary-light)', 
                          color: 'var(--primary)',
                          fontWeight: '500'
                        }}
                      >
                        {skill}
                        <button 
                          type="button" 
                          style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                          onClick={() => updateCV('skills', cvData.skills.filter(s => s !== skill))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add skill input form */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      id="newSkillInput"
                      placeholder="Ajouter une compétence (ex: Meta Ads, Photoshop)" 
                      className="form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value.trim();
                          if (val && !cvData.skills.includes(val)) {
                            updateCV('skills', [...cvData.skills, val]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const input = document.getElementById('newSkillInput');
                        const val = input.value.trim();
                        if (val && !cvData.skills.includes(val)) {
                          updateCV('skills', [...cvData.skills, val]);
                          input.value = '';
                        }
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Languages Section */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Langues parlées</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {cvData.languages.map((lang, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '10px 16px', 
                          border: '1px solid var(--light-border)', 
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <div>
                          <strong>{lang.name}</strong> 
                          <span style={{ marginLeft: '10px', color: 'var(--light-text-muted)', fontSize: '12px' }}>— {lang.level}</span>
                        </div>
                        <button 
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                          onClick={() => updateCV('languages', cvData.languages.filter((l, i) => i !== index))}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add language inputs */}
                  <div style={styles.rowInputs}>
                    <input type="text" id="newLangName" placeholder="Langue (ex: Anglais)" className="form-input" style={{ flex: 1 }} />
                    <select id="newLangLevel" className="form-input" style={{ flex: 1 }}>
                      <option value="Natif">Natif</option>
                      <option value="Courant">Courant</option>
                      <option value="B2 (Intermédiaire)">B2 (Intermédiaire)</option>
                      <option value="B1 (Seuil)">B1 (Seuil)</option>
                      <option value="Débutant">Débutant</option>
                    </select>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const nameInput = document.getElementById('newLangName');
                        const levelSelect = document.getElementById('newLangLevel');
                        const name = nameInput.value.trim();
                        if (name) {
                          updateCV('languages', [...cvData.languages, { name, level: levelSelect.value }]);
                          nameInput.value = '';
                        }
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setActiveStep(2)}>← Précédent</button>
                  <button className="btn btn-primary" onClick={() => setActiveStep(4)}>Suivant : Style & Téléchargement →</button>
                </div>
              </div>
            )}

            {/* STEP 4: STYLE & TÉLÉCHARGEMENT */}
            {activeStep === 4 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>ÉTAPE 4 / 4</span>
                <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>Style & Téléchargement</h1>
                <p style={{ color: 'var(--light-text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                  Personnalise l'apparence visuelle et exporte ton CV finalisé au format PDF A4.
                </p>

                {/* Templates choices */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Modèle de template</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <button 
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        flexDirection: 'column', 
                        padding: '20px', 
                        backgroundColor: cvStyle === 'modern' ? 'var(--primary-light)' : '#fff',
                        borderColor: cvStyle === 'modern' ? 'var(--primary)' : 'var(--light-border)',
                        color: cvStyle === 'modern' ? 'var(--primary)' : 'var(--light-text)'
                      }} 
                      onClick={() => { setCvStyle('modern'); changeTemplate('modern'); }}
                    >
                      <span style={{ fontSize: '24px', marginBottom: '8px' }}>✨</span>
                      <strong>Modern</strong>
                    </button>
                    <button 
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        flexDirection: 'column', 
                        padding: '20px', 
                        backgroundColor: cvStyle === 'classic' ? 'var(--primary-light)' : '#fff',
                        borderColor: cvStyle === 'classic' ? 'var(--primary)' : 'var(--light-border)',
                        color: cvStyle === 'classic' ? 'var(--primary)' : 'var(--light-text)'
                      }} 
                      onClick={() => { setCvStyle('classic'); changeTemplate('classic'); }}
                    >
                      <span style={{ fontSize: '24px', marginBottom: '8px' }}>🏛️</span>
                      <strong>Classic</strong>
                    </button>
                    <button 
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        flexDirection: 'column', 
                        padding: '20px', 
                        backgroundColor: cvStyle === 'creative' ? 'var(--primary-light)' : '#fff',
                        borderColor: cvStyle === 'creative' ? 'var(--primary)' : 'var(--light-border)',
                        color: cvStyle === 'creative' ? 'var(--primary)' : 'var(--light-text)'
                      }} 
                      onClick={() => { setCvStyle('creative'); changeTemplate('creative'); }}
                    >
                      <span style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</span>
                      <strong>Creative</strong>
                    </button>
                  </div>
                </div>

                {/* Color and style settings */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Couleur de la marque</h3>
                  <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', marginBottom: '15px' }}>
                    Choisis la couleur dominante de ton CV.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      type="button" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#00b87c', border: '3px solid #fff', boxShadow: '0 0 0 2px #00b87c', cursor: 'pointer' }}
                      onClick={() => {
                        document.documentElement.style.setProperty('--primary', '#00b87c');
                        document.documentElement.style.setProperty('--primary-hover', '#009e6a');
                        document.documentElement.style.setProperty('--primary-light', '#e8f9f3');
                        alert('Couleur verte sélectionnée !');
                      }}
                    />
                    <button 
                      type="button" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0ea5e9', border: '3px solid #fff', boxShadow: '0 0 0 2px #0ea5e9', cursor: 'pointer' }}
                      onClick={() => {
                        document.documentElement.style.setProperty('--primary', '#0ea5e9');
                        document.documentElement.style.setProperty('--primary-hover', '#0284c7');
                        document.documentElement.style.setProperty('--primary-light', '#f0f9ff');
                        alert('Couleur bleu océan sélectionnée !');
                      }}
                    />
                    <button 
                      type="button" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#a855f7', border: '3px solid #fff', boxShadow: '0 0 0 2px #a855f7', cursor: 'pointer' }}
                      onClick={() => {
                        document.documentElement.style.setProperty('--primary', '#a855f7');
                        document.documentElement.style.setProperty('--primary-hover', '#8b5cf6');
                        document.documentElement.style.setProperty('--primary-light', '#faf5ff');
                        alert('Couleur violette créative sélectionnée !');
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={styles.editorSectionCard}>
                  <h3 style={styles.editorCardTitle}>Options de téléchargement</h3>
                  <p style={{ fontSize: '13px', color: 'var(--light-text-muted)', marginBottom: '20px' }}>
                    Exportez votre document au format universel. Votre mise en page est optimisée pour tenir sur une seule page.
                  </p>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => generateCvPdf('open', cvData.firstName, cvData.lastName)}
                    >
                      👁️ Aperçu du CV
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => generateCvPdf('save', cvData.firstName, cvData.lastName)}
                    >
                      📥 Télécharger le PDF ↓
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setActiveStep(3)}>← Précédent</button>
                </div>
              </div>
            )}

          </div>

          {/* Right Live Preview Column */}
          <div style={styles.cvPreviewColumn} className="cv-preview-col">
            
            <div style={styles.previewControls}>
              <span>APERÇU EN DIRECT</span>
              <div style={styles.previewTemplateSelect}>
                <button style={{...styles.templateBtn, ...(cvStyle === 'modern' ? styles.templateBtnActive : {})}} onClick={() => { setCvStyle('modern'); changeTemplate('modern'); }}>Modern</button>
                <button style={{...styles.templateBtn, ...(cvStyle === 'classic' ? styles.templateBtnActive : {})}} onClick={() => { setCvStyle('classic'); changeTemplate('classic'); }}>Classic</button>
                <button style={{...styles.templateBtn, ...(cvStyle === 'creative' ? styles.templateBtnActive : {})}} onClick={() => { setCvStyle('creative'); changeTemplate('creative'); }}>Creative</button>
              </div>
            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div className={`cv-preview-container cv-template-${cvStyle}`}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{cvData.firstName} {cvData.lastName}</h2>
                  <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>{cvData.title}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569' }}>
                  <div>📧 {cvData.email}</div>
                  <div>📞 {cvData.phone}</div>
                  <div>📍 {cvData.address}</div>
                  <div>🔗 {cvData.linkedin}</div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginTop: '12px' }}>
                <div className="cv-section-title">Profil</div>
                <p style={{ fontSize: '11px', color: '#334155' }}>{cvData.summary}</p>
              </div>

              {/* Split layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '15px', marginTop: '12px' }}>
                
                {/* Left */}
                <div>
                  <div className="cv-section-title">Expérience</div>
                  {cvData.experiences.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                        <span>{exp.role}</span>
                        <span style={{ color: '#64748b' }}>{exp.period}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--primary)', fontStyle: 'italic' }}>{exp.company} — {exp.location}</div>
                      <p style={{ fontSize: '10px', color: '#475569', whiteSpace: 'pre-line', marginTop: '3px' }}>{exp.desc}</p>
                    </div>
                  ))}

                  <div className="cv-section-title" style={{ marginTop: '12px' }}>Formation</div>
                  {cvData.educations.map((edu) => (
                    <div key={edu.id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                        <span>{edu.degree}</span>
                        <span style={{ color: '#64748b' }}>{edu.period}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#475569' }}>{edu.school} — {edu.location}</div>
                    </div>
                  ))}
                </div>

                {/* Right */}
                <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>
                  <div className="cv-section-title">Compétences</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {cvData.skills.map((skill, index) => (
                      <span key={index} className="cv-badge">{skill}</span>
                    ))}
                  </div>

                  <div className="cv-section-title" style={{ marginTop: '15px' }}>Langues</div>
                  {cvData.languages.map((lang, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span>{lang.name}</span>
                      <span style={{ fontWeight: '600', color: '#64748b' }}>{lang.level}</span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* ATS Score card — réservé Standard / Premium */}
            {canUseProFeatures ? (
            <div style={styles.atsCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                <span>🚀 Score • Compatibilité ATS</span>
                <span style={{ color: 'var(--primary)' }}>{atsScore}%</span>
              </div>
              <div style={styles.atsBarBackground}>
                <div style={{...styles.atsBarFill, width: `${atsScore}%`}}></div>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', margin: 0 }}>
                ✓ Excellent ! Pour atteindre 100%, ajoute 2 certifications ou un projet personnel.
              </p>
            </div>
            ) : (
            <div style={{ ...styles.atsCard, textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>🔒 Score ATS — Standard &amp; Premium</div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                L'analyse ATS avancée n'est pas incluse dans le plan Basique.{' '}
                <a href="/pricing" style={{ color: 'var(--primary)', fontWeight: 600 }}>Passer au Standard →</a>
              </p>
            </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}

const styles = {
  topBar: {
    height: '70px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--light-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    gap: '6px'
  },
  logoDot: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  stepperContainer: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--light-border)',
    padding: '16px 0'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    opacity: 0.5
  },
  stepIndicatorActive: {
    opacity: 1,
    color: '#0f172a'
  },
  stepIndicatorDone: {
    opacity: 1,
    color: 'var(--primary)'
  },
  stepIndicatorPending: {
    opacity: 0.3
  },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '11px'
  },
  stepText: {
    fontSize: '10px',
    lineHeight: '1.2'
  },
  cvWorkspace: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '30px'
  },
  cvFormColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  cvPreviewColumn: {
    position: 'sticky',
    top: '90px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: 'calc(100vh - 110px)',
    overflowY: 'auto',
    paddingBottom: '20px'
  },
  aiHelperBanner: {
    backgroundColor: '#0c1220',
    color: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--dark-border)'
  },
  aiHelperPill: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700'
  },
  editorSectionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)'
  },
  editorCardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#0f172a'
  },
  avatarLarge: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowInputs: {
    display: 'flex',
    gap: '16px'
  },
  aiSuggestionLink: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
    display: 'block',
    textAlign: 'left',
    padding: 0
  },
  editorListItem: {
    padding: '12px',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: '#f8fafc',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  inlineForm: {
    marginTop: '20px',
    borderTop: '1px solid var(--light-border)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  previewControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '13px'
  },
  previewTemplateSelect: {
    display: 'flex',
    backgroundColor: '#e2e8f0',
    padding: '2px',
    borderRadius: 'var(--radius-md)'
  },
  templateBtn: {
    border: 'none',
    background: 'none',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'var(--transition)'
  },
  templateBtnActive: {
    backgroundColor: '#fff',
    color: '#0f172a',
    boxShadow: 'var(--shadow-sm)'
  },
  atsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)'
  },
  atsBarBackground: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  atsBarFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    transition: 'width 0.4s ease-out'
  }
};
