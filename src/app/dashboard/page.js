'use client';

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';
import { generateCvPdf, generateLetterPdf } from '@/lib/pdf';
import CheckoutButton from '@/components/CheckoutButton';

const INDUSTRIES = [
  { id: 'marketing', icon: '📈', label: 'Marketing & Com.', tip: 'Vocabulaire clé : KPI, ROI, engagement, funnel, stratégie de contenu. Ton conseillé : dynamique, créatif, orienté résultats. Valorise tes campagnes et leur impact mesurable.' },
  { id: 'tech', icon: '💻', label: 'Tech & Digital', tip: 'Mise en avant : agilité, esprit startup, veille technologique. Termes valorisés : data-driven, UX, MVP, scalable, API. Montre ta curiosité et ta capacité à apprendre vite.' },
  { id: 'finance', icon: '🏦', label: 'Finance & Banque', tip: 'Codes : rigueur, conformité, gestion des risques, confidentialité. Ton très formel et précis. Cite des chiffres et des métriques financières pour crédibiliser ton profil.' },
  { id: 'sante', icon: '🏥', label: 'Santé & Médical', tip: "Valeurs clés : éthique, empathie, rigueur clinique. Mettre en avant le sens du service, le respect des protocoles et la capacité à travailler sous pression." },
  { id: 'education', icon: '🎓', label: 'Éducation & Formation', tip: "Compétences valorisées : pédagogie, transmission, patience, adaptabilité. Montre ta passion pour l'apprentissage et ta capacité à rendre les savoirs accessibles." },
  { id: 'commerce', icon: '🛒', label: 'Commerce & Vente', tip: "Mots clés : chiffre d'affaires, fidélisation, relation client, objectifs, prospection. Ton accrocheur et orienté performance. Cite tes résultats commerciaux concrets." },
  { id: 'ong', icon: '🌍', label: 'ONG & Humanitaire', tip: 'Valeurs attendues : engagement, terrain, impact social, résilience. Parler en termes de mission, de communautés et de changement systémique. Sincérité primordiale.' },
  { id: 'juridique', icon: '⚖️', label: 'Juridique & Conseil', tip: 'Termes importants : conformité, déontologie, conseil stratégique, confidentialité. Ton neutre, extrêmement précis et très professionnel. Évite les formules trop commerciales.' },
  { id: 'creatif', icon: '🎨', label: 'Créatif & Design', tip: "Miser sur : portfolio, vision artistique, storytelling, créativité. Ton passionné mais professionnel. Mentionne tes outils et ta sensibilité aux tendances visuelles." },
  { id: 'btp', icon: '🏗️', label: 'BTP & Construction', tip: "Mettre en avant : normes de sécurité, gestion de chantier, respect des délais et des coûts, coordination d'équipes terrain. Valorise tes certifications techniques." },
  { id: 'agro', icon: '🌾', label: 'Agriculture & Agro', tip: 'Compétences valorisées : connaissance des filières, durabilité, optimisation des rendements, gestion de la chaîne de valeur. Terrain et pragmatisme sont essentiels.' },
  { id: 'industrie', icon: '🏭', label: 'Industrie & Ingénierie', tip: 'Langage technique attendu : qualité, performance, ISO, maintenance préventive, lean management. Sois précis sur tes compétences techniques et tes certifications.' },
];

// Classe une offre dans un domaine à partir de son intitulé (pour le filtre)
function jobDomain(role = '') {
  const t = role.toLowerCase();
  if (/d[ée]velopp|software|data|informat|r[ée]seau|web|devops|programm|\bit\b|cyber|tech/.test(t)) return 'Informatique & Tech';
  if (/market|communicat|community|digital|content|brand|seo/.test(t)) return 'Marketing & Com';
  if (/commerc|vente|sales|business|client[èe]le/.test(t)) return 'Commerce & Vente';
  if (/financ|comptab|account|audit|banqu/.test(t)) return 'Finance & Compta';
  if (/sant|m[ée]dic|infirm|pharma|soin/.test(t)) return 'Santé';
  if (/enseign|professeur|[ée]ducat|formation|teacher/.test(t)) return 'Éducation';
  if (/ing[ée]nieur|technicien|maintenance|[ée]lectro|m[ée]cani|btp|chantier|construction/.test(t)) return 'Technique & BTP';
  if (/logisti|transport|chauffeur|magasin|supply|entrep/.test(t)) return 'Logistique';
  if (/ressources humaines|\brh\b|recrut|talent/.test(t)) return 'RH';
  if (/assistant|secr[ée]taire|administ|direction|gestion/.test(t)) return 'Administration';
  if (/ouvrier|man[œo]euvre|emball|agent|nettoy|s[ée]curit|gardien/.test(t)) return 'Opérations & Terrain';
  return 'Autre';
}

const TRANSLATIONS = {
  fr: {
    // Sidebar
    navPrincipal: "PRINCIPAL",
    navDashboard: "📊 Tableau de Bord",
    navCV: "📄 Mon CV",
    navLetters: "✉️ Lettres de motivation",
    navJobs: "💼 Offres d'emploi",
    navMyAccount: "MON COMPTE",
    navProfile: "👤 Profil",
    navApplications: "📥 Candidatures",
    navSettings: "⚙️ Paramètres",
    navLogout: "🚪 Déconnexion",
    navUpgradeTitle: "Passe au Premium",
    navUpgradeDesc: "CV et lettres illimités, modifications illimitées, toutes les offres de ta niche dès 5 000 FCFA/mois.",
    navUpgradeBtn: "Voir les plans →",

    // Topbar
    topSearchPlaceholder: "Rechercher une offre, un secteur, une entreprise...",
    topNotifications: "Notifications",
    topNoNotifications: "Aucune notification pour le moment.",

    // Dashboard View
    dashWelcomeTitle: "Bonjour {name}, prête à décrocher ton job ?",
    dashWelcomeText: "Crée ton CV performant, génère tes lettres de motivation et explore les offres d'emploi. Commence dès maintenant !",
    dashViewJobsBtn: "Voir les offres recommandées →",
    dashCompleteProfileBtn: "Compléter mon profil",
    dashProfileCompleted: "Profil complété",
    dashStepsLeft: "Plus que 3 étapes",
    
    // Dashboard Stats
    statCVs: "CV créés",
    statCVsTag: "+1 cette semaine",
    statLetters: "Lettres générées",
    statLettersTag: "+5 cette semaine",
    statApps: "Candidatures envoyées",
    statAppsTag: "+3 nouvelles",
    statInterviews: "Entretiens obtenus",
    statInterviewsTag: "+2 vues",

    // Dashboard Widget Columns
    dashRecJobsTitle: "Offres recommandées pour toi",
    dashViewAll: "Voir tout →",
    dashRecentActivity: "Activité récente",
    dashActivityOrangeViewed: "Ta candidature à Orange CI a été consultée par le recruteur.",
    dashActivityOrangeTime: "Il y a 2 heures",
    dashActivityWaveLetter: "Tu as généré une lettre de motivation pour Wave.",
    dashActivityWaveTime: "Hier - 18h52",
    dashActivityNewJobs: "3 nouvelles offres d'emploi correspondent à ton profil.",
    dashActivityNewJobsTime: "Hier - 09h00",
    dashActivityExcelStarted: "Ton CV a été optimisé selon les modèles qui performent sur le marché.",
    dashActivityExcelTime: "Il y a 2 jours",

    // Dashboard Quick Actions
    actionCreateCVTitle: "Créer un nouveau CV",
    actionCreateCVDesc: "Un CV performant prêt à l'emploi en 2 minutes",
    actionLetterTitle: "Lettre de motivation",
    actionLetterDesc: "Personnalisée par secteur d'activité",
    actionExploreJobsTitle: "Explorer les offres",
    actionExploreJobsDesc: "De nouvelles offres ajoutées automatiquement",
    actionFreeCoursesTitle: "Formations gratuites",
    actionFreeCoursesDesc: "Boostez vos compétences métiers",

    // CV Builder Step Bar & Stepper
    cvTopBarTitle: "Mon CV / Marketing Junior - {name}",
    cvAutoSave: "💾 Sauvegarde automatique",
    cvPreviewBtn: "Aperçu",
    cvDownloadPDF: "Télécharger PDF ↓",
    cvStep1: "ÉTAPE 1",
    cvStep1Label: "Informations",
    cvStep2: "ÉTAPE 2",
    cvStep2Label: "Expériences",
    cvStep3: "ÉTAPE 3",
    cvStep3Label: "Formation / Compétences",
    cvStep4: "ÉTAPE 4",
    cvStep4Label: "Style & Téléchargement",

    // CV Builder Form Left
    cvFormStep2Title: "Complète ton CV",
    cvFormStep2Desc: "Remplis chaque section ci-dessous : coordonnées, résumé, expériences, formation, compétences et langues. L'aperçu à droite se met à jour en direct.",
    cvAiHelperTitle: "✨ Optimise ton CV pour le marché",
    cvAiHelperDesc: "Décris tes expériences en quelques mots, on les reformule selon les modèles qui décrochent le plus d'entretiens.",
    cvAiHelperBtn: "Optimiser mon CV",
    cvAiLoading: "Traitement...",
    cvAiTipSuccess: "CV optimisé selon les modèles qui performent ! ✨",
    cvPhotoTitle: "Photo de profil",
    cvPhotoChange: "📷 Changer la photo",
    cvPhotoDelete: "Supprimer",
    cvLabelFirstName: "Prénom",
    cvLabelLastName: "Nom",
    cvLabelTitle: "Titre professionnel",
    cvLabelSummary: "Résumé professionnel",
    cvAiSuggestTitle: "✨ Suggestion : \"Spécialiste Marketing Digital & Réseaux Sociaux\"",
    cvAiSuggestSummary: "✨ Générer un résumé d'impact",
    cvExperiencesTitle: "Expériences professionnelles",
    cvAddBtn: "+ Ajouter",
    cvDeleteBtn: "Supprimer",
    cvAddExpTitle: "Poste (ex: Stage Marketing)",
    cvAddExpCompany: "Entreprise",
    cvAddExpPeriod: "Période (ex: Juin - Sept 2025)",
    cvAddExpDesc: "Description courte",
    cvAddExpBtn: "Ajouter cette expérience",
    cvEducationsTitle: "Formation / Compétences",
    cvAddEduDegree: "Diplôme (ex: Licence)",
    cvAddEduSchool: "Établissement",
    cvAddEduPeriod: "Période (ex: 2022 - 2025)",
    cvAddEduBtn: "Ajouter cette formation",

    // Step 3 Skills & Languages
    cvFormStep3Title: "Tes compétences et langues",
    cvFormStep3Desc: "Ajoute tes forces professionnelles et les langues que tu parles.",
    cvSkillsTitle: "Compétences clés",
    cvSkillsDesc: "Clique sur le \"×\" d'une compétence pour la supprimer, ou ajoute-en de nouvelles.",
    cvAddSkillPlaceholder: "Ajouter une compétence (ex: Meta Ads, Photoshop)",
    cvLanguagesTitle: "Langues parlées",
    cvLanguagesDesc: "— {level}",
    cvAddLangPlaceholder: "Langue (ex: Anglais)",

    // Step 4 Style
    cvFormStep4Title: "Style & Téléchargement",
    cvFormStep4Desc: "Personnalise l'apparence visuelle et exporte ton CV finalisé au format PDF A4.",
    cvTemplatesTitle: "Modèle de template",
    cvBrandColorTitle: "Couleur de la marque",
    cvBrandColorDesc: "Choisis la couleur dominante de ton CV.",
    cvDownloadTitle: "Options de téléchargement",
    cvDownloadDesc: "Exportez votre document au format universel. Votre mise en page est optimisée pour tenir sur une seule page.",
    cvPrintBtn: "👁️ Imprimer le CV",
    cvDownloadBtn: "📥 Télécharger le PDF ↓",

    // Preview
    cvPreviewTitle: "APERÇU EN DIRECT",
    cvSectionProfil: "Profil",
    cvSectionExperience: "Expérience",
    cvSectionFormation: "Formation",
    cvSectionSkills: "Compétences",
    cvSectionLanguages: "Langues",
    cvAtsTitle: "🚀 Score • Compatibilité ATS",
    cvAtsFeedback: "✓ Excellent ! Pour atteindre 100%, ajoute 2 certifications ou un projet personnel.",

    // Cover Letters
    letTitle: "Génère une lettre sur-mesure adaptée à ton secteur",
    letDesc: "Sélectionne ton industrie, renseigne 3 infos clés, et obtiens une lettre adaptée aux codes de ton secteur — vocabulaire, ton et attentes inclus.",
    letStep1Title: "🏢 Étape 1 — Choisis ton secteur d'activité",
    letStep1Desc: "Chaque secteur a ses propres codes et son vocabulaire. Sélectionne le tien pour une lettre réellement différenciante.",
    letCodesTitle: "Codes de l'industrie — {label}",
    letStep2Title: "✍️ Étape 2 — Personnalise ta lettre",
    letStep2Desc: "Plus tu donnes de détails, plus ta lettre sera unique et convaincante.",
    letPostLabel: "Titre du poste ciblé *",
    letCompanyLabel: "Nom de l'entreprise *",
    letHrLabel: "Nom du/de la responsable RH (optionnel)",
    letHrTip: "💡 Personnaliser l'en-tête augmente le taux de réponse de +40%",
    letAchievementLabel: "Une réalisation clé à mettre en avant",
    letAchievementTip: "💡 Un chiffre concret rend ta lettre 3× plus mémorable",
    letWhyLabel: "Pourquoi cette entreprise spécifiquement ?",
    letToneLabel: "Ton de la lettre",
    letToneProfessional: "💼 Professionnel & Formel",
    letToneConfident: "🔥 Confiant & Déterminé",
    letTonePassionate: "❤️ Passionné & Créatif",
    letSubmitBtn: "✨ Rédiger ma lettre personnalisée",
    letSubmitBtnGenerating: "⏳ Génération en cours...",
    letSubmitBtnSelectSector: "⬆️ Sélectionne d'abord ton secteur (Étape 1)",
    letGeneratedLetter: "✅ LETTRE GÉNÉRÉE — Secteur {sector}",
    letCopyBtn: "Copier le texte",
    letPreviousLetters: "📁 Lettres précédemment générées",
    letReviewBtn: "Revoir cette lettre",

    // Jobs Explorer
    jobsTitle: "Explorer les offres d'emploi en temps réel",
    jobsDesc: "Les recruteurs publient directement des offres de stages et CDI pour les jeunes diplômés d'Afrique.",
    jobsApplyBtn: "Postuler",

    // Formations Hub
    formTitle: "Renforce tes compétences et valide des certificats",
    formDesc: "Apprends les compétences les plus demandées sur le marché du travail africain.",
    formCloseCourse: "Fermer le cours",
    formInteractiveText: "Simulateur de lecteur vidéo - Cours interactif en cours",
    formTimeRemaining: "Durée restante : 14 minutes",
    formLessonTitle: "En direct : Lesson 3 - Travaux pratiques",
    formProgress: "Progression",
    formValidateBtn: "Valider et terminer le cours",
    formReviewCourse: "Revoir le cours",
    formResumeCourse: "Reprendre",
    formStartCourse: "Commencer",

    // User Profile
    profileTitle: "Mon Profil Candidat",
    profileDesc: "Modifie tes paramètres d'authentification et de contact.",
    profileNameLabel: "Prénom & Nom",
    profileEmailLabel: "Adresse email",
    profileCountryLabel: "Pays",
    profilePhoneLabel: "Téléphone",
    profilePlanLabel: "Plan d'abonnement actuel",
    profilePlanFree: "🆓 Plan Gratuit",
    profilePlanMonthly: "⭐ Plan Mensuel Premium",
    profilePlanVIP: "👑 Plan Semestriel VIP (6 mois)",
    profileChangePlanBtn: "Changer de plan",

    // Applications Tracker
    appsTitle: "Mes Candidatures Envoyées",
    appsDesc: "Suivi en temps réel des CVs consultés par les recruteurs partenaires.",

    // Pricing Layout
    priceTitle: "Choisis le plan qui correspond à tes ambitions",
    priceDesc: "Choisis ton plan et accède à tout, sans limite, pour décrocher ton job plus vite.",
    priceMonthlyTitle: "MENSUEL",
    priceFreeDesc: "Pour démarrer sans engagement",
    priceMonthlyDesc: "Flexibilité totale, sans engagement",
    priceSemestrielDesc: "6 mois — soit 2 500 FCFA/mois (−50%)",
    priceFreeBtn: "Choisir ce plan",
    priceFreeBtnActive: "✓ Plan Actuel",
    priceMonthlyBtn: "S'abonner maintenant",
    priceSemestrielBtn: "S'abonner — Économise 50%",
    priceSavingsTip: "💡 Conseil : Le plan Semestriel te fait économiser 15 000 FCFA sur 6 mois vs le mensuel.",

    // Admin Layout
    adminTitle: "Gestion de la Plateforme",
    adminDesc: "Ajoutez et gérez les offres d'emploi disponibles pour les candidats.",
    adminJobsActive: "Offres d'emploi actives",
    adminFormationsPublished: "Formations publiées",
    adminApplicationsReceived: "Candidatures reçues",
    adminPublishJob: "➕ Publier une nouvelle offre d'emploi",
    adminJobRole: "Titre du poste *",
    adminJobCompany: "Entreprise *",
    adminJobCity: "Ville (ex: Abidjan)",
    adminJobSalary: "Salaire (ex: 250k FCFA)",
    adminJobLogoBgLabel: "Couleur logo :",
    adminPublishBtn: "Publier l'offre →",
    adminPublishedJobs: "📋 Offres publiées ({count})",
    adminAddFormation: "➕ Ajouter une nouvelle formation",
    adminCourseTitle: "Titre de la formation *",
    adminCourseDuration: "Durée (ex: 6h)",
    adminCourseLevelLabel: "Niveau",
    adminCourseCategoryLabel: "Catégorie",
    adminPublishCourseBtn: "Publier la formation →",
    adminPublishedCourses: "📚 Formations publiées ({count})",

    // Settings
    settingsTitle: "⚙️ Paramètres du compte",
    settingsDesc: "Gère tes préférences, abonnements et sécurité.",
    settingsGeneral: "Général",
    settingsLang: "Langue",
    settingsLangDesc: "Langue de l'interface",
    settingsDarkMode: "Mode Sombre",
    settingsDarkModeDesc: "Activer le thème sombre sur le tableau de bord",
    settingsDarkModeDisable: "Désactiver",
    settingsDarkModeEnable: "Activer",
    settingsNotifications: "Notifications",
    settingsNotifOffers: "M'alerter lors de nouvelles offres d'emploi correspondantes",
    settingsNotifWeekly: "Conseils hebdomadaires pour ma recherche d'emploi",
    settingsNotifPartners: "Offres de nos partenaires",
    settingsDanger: "Zone Danger",
    settingsDangerDesc: "La suppression de ton compte est définitive. Toutes tes candidatures, CVs et lettres générées seront perdus.",
    settingsDeleteBtn: "Supprimer mon compte",
    // Applications additional
    justNow: "À l'instant",
    twoHoursAgo: "Il y a 2 heures",
    yesterdayTime: "Hier - 18h32",
    appsSentOn: "Envoyé le {date}",
    statusConsulted: "Consultée",
    statusSent: "Envoyée",

    // Pricing additional
    priceAbonnements: "ABONNEMENTS",
    priceFreeTitle: "GRATUIT",
    priceMonthlyTitle: "MENSUEL",
    priceSemestrielTitle: "SEMESTRIEL",
    pricePopular: "POPULAIRE",
    priceBestValue: "BEST VALUE",
    priceFreeFeature1: "📄 1 CV performant (1 modification)",
    priceFreeFeature2: "✉️ 1 lettre de motivation (1 modification)",
    priceFreeFeature3: "🔍 Consultation des offres d'emploi",
    priceFreeFeature4: "Modifications illimitées",
    priceFreeFeature5: "Opportunités de ta niche",
    priceFreeFeature6: "Score ATS avancé",
    pricePremiumFeature1: "✓ CV performants illimités",
    pricePremiumFeature2: "✓ Lettres de motivation illimitées",
    pricePremiumFeature3: "✓ Modifications illimitées",
    pricePremiumFeature4: "✓ Toutes les offres d'emploi",
    pricePremiumFeature5: "✓ Nouvelles opportunités de ta niche",
    pricePremiumFeature6: "✓ Candidatures en 1 clic",
    priceVipFeature1: "✓ Tout ce qu'inclut le plan Mensuel",
    priceVipFeature2: "⭐ Accès prioritaire aux opportunités de ta niche",
    priceVipFeature3: "⭐ Analyse ATS avancée du CV (Score)",
    priceVipFeature4: "⭐ Relecture humaine du CV",
    priceVipFeature5: "⭐ Support prioritaire par WhatsApp",
    priceVipFeature6: "⭐ Badges & certificats pro",

    // Admin additional
    adminSectionLabel: "ESPACE ADMINISTRATEUR",
    adminJobContractLabel: "Contrat",
    adminJobDeleteBtn: "Supprimer",
    adminContractCDI: "CDI",
    adminContractCDD: "CDD",
    adminContractStage: "Stage",
    adminContractFreelance: "Freelance",
    adminLevelDeb: "Débutant",
    adminLevelInt: "Intermédiaire",
    adminLevelAva: "Avancé",
    adminCatMarketing: "Marketing",
    adminCatBureautique: "Bureautique",
    adminCatDesign: "Design",
    adminCatRedaction: "Rédaction",
    adminCatFinance: "Finance",
    adminCatGeneral: "Général",

    // General Words & Alerts
    annuler: "Annuler",
    compris: "Compris",
    seDeconnecter: "Se déconnecter",
    dejaPostule: "Déjà postulé",
  },
  en: {
    // Sidebar
    navPrincipal: "MAIN",
    navDashboard: "📊 Dashboard",
    navCV: "📄 My CV",
    navLetters: "✉️ Cover Letters",
    navJobs: "💼 Job Offers",
    navMyAccount: "MY ACCOUNT",
    navProfile: "👤 Profile",
    navApplications: "📥 Applications",
    navSettings: "⚙️ Settings",
    navLogout: "🚪 Logout",
    navUpgradeTitle: "Upgrade to Premium",
    navUpgradeDesc: "Unlimited CVs, AI letters, access to all jobs from 5,000 FCFA/month.",
    navUpgradeBtn: "See plans →",

    // Topbar
    topSearchPlaceholder: "Search for a job, course, sector...",
    topNotifications: "Notifications",
    topNoNotifications: "No notifications for now.",

    // Dashboard View
    dashWelcomeTitle: "Hello {name}, ready to land your job?",
    dashWelcomeText: "Build your high-performing CV, generate your cover letters and explore job offers. Start now!",
    dashViewJobsBtn: "View recommended offers →",
    dashCompleteProfileBtn: "Complete my profile",
    dashProfileCompleted: "Profile completed",
    dashStepsLeft: "3 steps left",

    // Dashboard Stats
    statCVs: "CVs created",
    statCVsTag: "+1 this week",
    statLetters: "Letters generated",
    statLettersTag: "+5 this week",
    statApps: "Applications sent",
    statAppsTag: "+3 new",
    statInterviews: "Interviews obtained",
    statInterviewsTag: "+2 views",

    // Dashboard Widget Columns
    dashRecJobsTitle: "Recommended job offers for you",
    dashViewAll: "View all →",
    dashRecentActivity: "Recent activity",
    dashActivityOrangeViewed: "Your application to Orange CI has been viewed by the recruiter.",
    dashActivityOrangeTime: "2 hours ago",
    dashActivityWaveLetter: "You generated an AI cover letter for Wave.",
    dashActivityWaveTime: "Yesterday - 6:52 PM",
    dashActivityNewJobs: "3 new job offers match your profile.",
    dashActivityNewJobsTime: "Yesterday - 9:00 AM",
    dashActivityExcelStarted: "Your CV was optimized to match what performs on the market.",
    dashActivityExcelTime: "2 days ago",

    // Dashboard Quick Actions
    actionCreateCVTitle: "Create a new CV",
    actionCreateCVDesc: "A high-performing, ready-to-use CV in 2 minutes",
    actionLetterTitle: "Cover letter",
    actionLetterDesc: "Personalized by industry",
    actionExploreJobsTitle: "Explore job offers",
    actionExploreJobsDesc: "New offers added automatically",
    actionFreeCoursesTitle: "Free courses",
    actionFreeCoursesDesc: "Boost your professional skills",

    // CV Builder Step Bar & Stepper
    cvTopBarTitle: "My CV / Junior Marketing - {name}",
    cvAutoSave: "💾 Auto-saved",
    cvPreviewBtn: "Preview",
    cvDownloadPDF: "Download PDF ↓",
    cvStep1: "STEP 1",
    cvStep1Label: "Information",
    cvStep2: "STEP 2",
    cvStep2Label: "Experiences",
    cvStep3: "STEP 3",
    cvStep3Label: "Education / Skills",
    cvStep4: "STEP 4",
    cvStep4Label: "Style & Download",

    // CV Builder Form Left
    cvFormStep2Title: "Complete your CV",
    cvFormStep2Desc: "Fill in each section below: contact details, summary, experience, education, skills and languages. The preview on the right updates live.",
    cvAiHelperTitle: "✨ Optimize your CV for the market",
    cvAiHelperDesc: "Describe your experiences in a few words, we'll rephrase them like a pro.",
    cvAiHelperBtn: "Optimize my CV",
    cvAiLoading: "Processing...",
    cvAiTipSuccess: "CV optimized to match what performs on the market! ✨",
    cvPhotoTitle: "Profile picture",
    cvPhotoChange: "📷 Change photo",
    cvPhotoDelete: "Delete",
    cvLabelFirstName: "First name",
    cvLabelLastName: "Last name",
    cvLabelTitle: "Professional title",
    cvLabelSummary: "Professional summary",
    cvAiSuggestTitle: "✨ Suggestion: \"Digital Marketing & Social Media Specialist\"",
    cvAiSuggestSummary: "✨ Generate an impactful summary",
    cvExperiencesTitle: "Professional experiences",
    cvAddBtn: "+ Add",
    cvDeleteBtn: "Delete",
    cvAddExpTitle: "Role (e.g. Marketing Stage)",
    cvAddExpCompany: "Company",
    cvAddExpPeriod: "Period (e.g. June - Sept 2025)",
    cvAddExpDesc: "Short description",
    cvAddExpBtn: "Add this experience",
    cvEducationsTitle: "Education / Skills",
    cvAddEduDegree: "Degree (e.g. Bachelor's)",
    cvAddEduSchool: "Institution",
    cvAddEduPeriod: "Period (e.g. 2022 - 2025)",
    cvAddEduBtn: "Add this education",

    // Step 3 Skills & Languages
    cvFormStep3Title: "Your skills and languages",
    cvFormStep3Desc: "Add your professional strengths and the languages you speak.",
    cvSkillsTitle: "Key skills",
    cvSkillsDesc: "Click the \"×\" on a skill to delete it, or add new ones.",
    cvAddSkillPlaceholder: "Add a skill (e.g. Meta Ads, Photoshop)",
    cvLanguagesTitle: "Languages spoken",
    cvLanguagesDesc: "— {level}",
    cvAddLangPlaceholder: "Language (e.g. English)",

    // Step 4 Style
    cvFormStep4Title: "Style & Download",
    cvFormStep4Desc: "Customize the visual appearance and export your finalized CV to A4 PDF format.",
    cvTemplatesTitle: "Template model",
    cvBrandColorTitle: "Brand color",
    cvBrandColorDesc: "Choose the dominant color of your CV.",
    cvDownloadTitle: "Download options",
    cvDownloadDesc: "Export your document to universal format. Your layout is optimized to fit on a single page.",
    cvPrintBtn: "👁️ Print CV",
    cvDownloadBtn: "📥 Download PDF ↓",

    // Preview
    cvPreviewTitle: "LIVE PREVIEW",
    cvSectionProfil: "Profile",
    cvSectionExperience: "Experience",
    cvSectionFormation: "Education",
    cvSectionSkills: "Skills",
    cvSectionLanguages: "Languages",
    cvAtsTitle: "🚀 Score • ATS Compatibility",
    cvAtsFeedback: "✓ Excellent! To reach 100%, add 2 certifications or a personal project.",

    // Cover Letters
    letTitle: "Generate a custom letter adapted to your sector",
    letDesc: "Select your industry, enter 3 key pieces of information, and get a letter tailored to the codes of your sector — vocabulary, tone, and expectations included.",
    letStep1Title: "🏢 Step 1 — Choose your sector of activity",
    letStep1Desc: "Each sector has its own codes and vocabulary. Select yours for a truly stand-out letter.",
    letCodesTitle: "Industry codes — {label}",
    letStep2Title: "✍️ Step 2 — Personalize your letter",
    letStep2Desc: "The more details you provide, the more unique and convincing your letter will be.",
    letPostLabel: "Target job title *",
    letCompanyLabel: "Company name *",
    letHrLabel: "RH manager name (optional)",
    letHrTip: "💡 Personalizing the header increases the response rate by +40%",
    letAchievementLabel: "A key achievement to highlight",
    letAchievementTip: "💡 A concrete figure makes your letter 3× more memorable",
    letWhyLabel: "Why this company specifically?",
    letToneLabel: "Tone of the letter",
    letToneProfessional: "💼 Professional & Formal",
    letToneConfident: "🔥 Confident & Determined",
    letTonePassionate: "❤️ Passionate & Creative",
    letSubmitBtn: "✨ Write my personalized letter",
    letSubmitBtnGenerating: "⏳ Generating...",
    letSubmitBtnSelectSector: "⬆️ Select your sector first (Step 1)",
    letGeneratedLetter: "✅ LETTER GENERATED — Sector {sector}",
    letCopyBtn: "Copy text",
    letPreviousLetters: "📁 Previously generated letters",
    letReviewBtn: "Review this letter",

    // Jobs Explorer
    jobsTitle: "Explore job offers in real time",
    jobsDesc: "Recruiters publish internship and CDI offers directly for young African graduates.",
    jobsApplyBtn: "Apply",

    // Formations Hub
    formTitle: "Strengthen your skills and validate certificates",
    formDesc: "Learn the most in-demand skills on the African job market.",
    formCloseCourse: "Close course",
    formInteractiveText: "Video player simulator - Interactive course in progress",
    formTimeRemaining: "Time remaining: 14 minutes",
    formLessonTitle: "Live: Lesson 3 - Practical work",
    formProgress: "Progress",
    formValidateBtn: "Validate and complete course",
    formReviewCourse: "Review course",
    formResumeCourse: "Resume",
    formStartCourse: "Start",

    // User Profile
    profileTitle: "My Candidate Profile",
    profileDesc: "Edit your authentication and contact parameters.",
    profileNameLabel: "First Name & Last Name",
    profileEmailLabel: "Email address",
    profileCountryLabel: "Country",
    profilePhoneLabel: "Phone",
    profilePlanLabel: "Current subscription plan",
    profilePlanFree: "🆓 Free Plan",
    profilePlanMonthly: "⭐ Premium Monthly Plan",
    profilePlanVIP: "👑 VIP Semestriel Plan (6 months)",
    profileChangePlanBtn: "Change plan",

    // Applications Tracker
    appsTitle: "My Sent Applications",
    appsDesc: "Real-time tracking of CVs viewed by partner recruiters.",

    // Pricing Layout
    priceTitle: "Choose the plan that matches your ambitions",
    priceDesc: "Pick your plan and access everything, no limits, to land your job faster.",
    priceMonthlyTitle: "MONTHLY",
    priceFreeDesc: "To start without commitment",
    priceMonthlyDesc: "Total flexibility, without commitment",
    priceSemestrielDesc: "6 months — only 2 500 FCFA/month (−50%)",
    priceFreeBtn: "Choose this plan",
    priceFreeBtnActive: "✓ Current Plan",
    priceMonthlyBtn: "Subscribe now",
    priceSemestrielBtn: "Subscribe — Save 50%",
    priceSavingsTip: "💡 Tip: The Semestriel plan saves you 15,000 FCFA over 6 months vs monthly.",

    // Admin Layout
    adminTitle: "Platform Management",
    adminDesc: "Add and manage job offers available to candidates.",
    adminJobsActive: "Active job offers",
    adminFormationsPublished: "Published courses",
    adminApplicationsReceived: "Applications received",
    adminPublishJob: "➕ Publish a new job offer",
    adminJobRole: "Job title *",
    adminJobCompany: "Company *",
    adminJobCity: "City (e.g., Abidjan)",
    adminJobSalary: "Salary (e.g., 250k FCFA)",
    adminJobLogoBgLabel: "Logo color:",
    adminPublishBtn: "Publish job →",
    adminPublishedJobs: "📋 Published job offers ({count})",
    adminAddFormation: "➕ Add a new course",
    adminCourseTitle: "Course title *",
    adminCourseDuration: "Duration (e.g., 6h)",
    adminCourseLevelLabel: "Level",
    adminCourseCategoryLabel: "Category",
    adminPublishCourseBtn: "Publish course →",
    adminPublishedCourses: "📚 Published courses ({count})",

    // Settings
    settingsTitle: "⚙️ Account settings",
    settingsDesc: "Manage your preferences, subscriptions, and security.",
    settingsGeneral: "General",
    settingsLang: "Language",
    settingsLangDesc: "Interface language",
    settingsDarkMode: "Dark Mode",
    settingsDarkModeDesc: "Enable dark theme on dashboard",
    settingsDarkModeDisable: "Disable",
    settingsDarkModeEnable: "Enable",
    settingsNotifications: "Notifications",
    settingsNotifOffers: "Alert me when matching job offers are found",
    settingsNotifWeekly: "Weekly tips for my job search",
    settingsNotifPartners: "Partner offers",
    settingsDanger: "Danger Zone",
    settingsDangerDesc: "Account deletion is permanent. All your applications, CVs, and generated letters will be lost.",
    settingsDeleteBtn: "Delete my account",
    // Applications additional
    justNow: "Just now",
    twoHoursAgo: "2 hours ago",
    yesterdayTime: "Yesterday - 6:32 PM",
    appsSentOn: "Sent on {date}",
    statusConsulted: "Viewed",
    statusSent: "Sent",

    // Pricing additional
    priceAbonnements: "SUBSCRIPTIONS",
    priceFreeTitle: "FREE",
    priceMonthlyTitle: "MONTHLY",
    priceSemestrielTitle: "SEMESTRIEL",
    pricePopular: "POPULAR",
    priceBestValue: "BEST VALUE",
    priceFreeFeature1: "📄 1 high-performing CV (1 edit)",
    priceFreeFeature2: "✉️ 1 cover letter (1 edit)",
    priceFreeFeature3: "🔍 Browse job offers",
    priceFreeFeature4: "Unlimited edits",
    priceFreeFeature5: "Opportunities in your niche",
    priceFreeFeature6: "Advanced ATS Score",
    pricePremiumFeature1: "✓ Unlimited high-performing CVs",
    pricePremiumFeature2: "✓ Unlimited cover letters",
    pricePremiumFeature3: "✓ Unlimited edits",
    pricePremiumFeature4: "✓ All job offers",
    pricePremiumFeature5: "✓ New opportunities in your niche",
    pricePremiumFeature6: "✓ 1-click applications",
    priceVipFeature1: "✓ Everything included in Monthly plan",
    priceVipFeature2: "⭐ Priority access to opportunities in your niche",
    priceVipFeature3: "⭐ Advanced CV ATS analysis (Score)",
    priceVipFeature4: "⭐ Human CV review",
    priceVipFeature5: "⭐ Priority WhatsApp support",
    priceVipFeature6: "⭐ Badges & pro certificates",

    // Admin additional
    adminSectionLabel: "ADMIN PANEL",
    adminJobContractLabel: "Contract",
    adminJobDeleteBtn: "Delete",
    adminContractCDI: "CDI",
    adminContractCDD: "CDD",
    adminContractStage: "Internship",
    adminContractFreelance: "Freelance",
    adminLevelDeb: "Beginner",
    adminLevelInt: "Intermediate",
    adminLevelAva: "Advanced",
    adminCatMarketing: "Marketing",
    adminCatBureautique: "Office",
    adminCatDesign: "Design",
    adminCatRedaction: "Writing",
    adminCatFinance: "Finance",
    adminCatGeneral: "General",

    // General Words & Alerts
    annuler: "Cancel",
    compris: "Understood",
    seDeconnecter: "Log out",
    dejaPostule: "Already applied",
  }
};

export default function DashboardPage({ defaultView = 'dashboard' }) {
  const {
    user,
    cvData,
    jobs,
    applications,
    letters,
    plan,
    atsScore,
    atsChecklist,
    stats,
    logout,
    updateCV,
    addCVItem,
    updateCVItem,
    deleteCVItem,
    changeTemplate,
    createCoverLetter,
    applyJob,
    selectPlan,
    addJob,
    deleteJob,
    // Freemium
    isPremium,
    remaining,
    canUse,
    consume,
    // Accès par palier d'abonnement
    accessPlan,
    accessExpiresAt,
    canUseProFeatures,
    supabase
  } = useContext(AppContext);

  // Current active view
  const [currentView, setCurrentView] = useState(defaultView); // 'dashboard', 'cv', 'letters', 'jobs', 'formations', 'applications', 'pricing', 'admin'

  // ---- Rappel de renouvellement (J-3 / J-2) ----
  const renewDaysLeft = React.useMemo(() => {
    if (!accessExpiresAt) return null; // null = accès illimité (proprio/admin)
    const ms = new Date(accessExpiresAt).getTime() - Date.now();
    if (isNaN(ms)) return null;
    return Math.ceil(ms / (24 * 60 * 60 * 1000));
  }, [accessExpiresAt]);
  const renewActive = renewDaysLeft !== null && renewDaysLeft > 0 && renewDaysLeft <= 3;
  const [showRenewModal, setShowRenewModal] = useState(false);
  useEffect(() => {
    if (!renewActive) { setShowRenewModal(false); return; }
    try {
      const todayKey = `mfb_renew_dismissed_${new Date().toISOString().slice(0, 10)}`;
      setShowRenewModal(localStorage.getItem(todayKey) !== '1');
    } catch { setShowRenewModal(true); }
  }, [renewActive]);
  const dismissRenewModal = () => {
    setShowRenewModal(false);
    try { localStorage.setItem(`mfb_renew_dismissed_${new Date().toISOString().slice(0, 10)}`, '1'); } catch {}
  };

  // ---- Messagerie support (Standard / Premium) ----
  // Réutilise le client Supabase du contexte (ne PAS créer un 2e client : conflit d'auth)
  const supabaseClient = supabase;
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSending, setSupportSending] = useState(false);

  const fetchSupportMessages = async () => {
    if (!user?.id) return;
    setSupportLoading(true);
    const { data } = await supabaseClient
      .from('support_messages')
      .select('id, sender, body, created_at')
      .order('created_at', { ascending: true });
    setSupportMessages(data || []);
    setSupportLoading(false);
  };

  const sendSupportMessage = async (e) => {
    e.preventDefault();
    const body = supportInput.trim();
    if (!body || !user?.id) return;
    setSupportSending(true);
    const { data, error } = await supabaseClient
      .from('support_messages')
      .insert({ user_id: user.id, email: user.email, sender: 'user', body })
      .select('id, sender, body, created_at')
      .single();
    setSupportSending(false);
    if (error) {
      openModal('Erreur', "Ton message n'a pas pu être envoyé. Réessaie dans un instant.", 'warning');
      return;
    }
    // Ajout optimiste (évite la course avec la relecture)
    setSupportMessages((prev) => [...prev, data]);
    setSupportInput('');
  };

  // Charge les messages quand on ouvre la vue Support
  useEffect(() => {
    if (currentView === 'support' && user?.id) fetchSupportMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, user]);

  // Search query in top bar
  const [searchQuery, setSearchQuery] = useState('');

  // Filtres de la vue Offres
  const [jobSearch, setJobSearch] = useState('');
  const [jobCountry, setJobCountry] = useState('all');
  const [jobDomainFilter, setJobDomainFilter] = useState('all');
  const jobCountries = Array.from(new Set((jobs || []).map((j) => j.country).filter(Boolean))).sort();
  const jobDomainsList = Array.from(new Set((jobs || []).map((j) => jobDomain(j.role)))).sort();
  const filteredJobs = (jobs || []).filter((j) => {
    if (jobCountry !== 'all' && j.country !== jobCountry) return false;
    if (jobDomainFilter !== 'all' && jobDomain(j.role) !== jobDomainFilter) return false;
    if (jobSearch.trim()) {
      const q = jobSearch.toLowerCase();
      const hay = `${j.role || ''} ${j.company || ''} ${j.location || ''} ${j.description || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  
  // Local states for inputs / forms
  const [activeStep, setActiveStep] = useState(2); // Step 2 (Expérience & Formation)
  const [cvStyle, setCvStyle] = useState('modern'); // 'modern', 'classic', 'creative'

  // CV form inputs states
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newExpLocation, setNewExpLocation] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduSchool, setNewEduSchool] = useState('');
  const [newEduPeriod, setNewEduPeriod] = useState('');
  const [newEduLocation, setNewEduLocation] = useState('');

  const [newSkill, setNewSkill] = useState('');
  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState('Courant');

  // Admin form inputs states
  const [adminJobRole, setAdminJobRole] = useState('');
  const [adminJobCompany, setAdminJobCompany] = useState('');
  const [adminJobLocation, setAdminJobLocation] = useState('');
  const [adminJobContract, setAdminJobContract] = useState('CDI');
  const [adminJobSalary, setAdminJobSalary] = useState('');
  const [adminJobLogoBg, setAdminJobLogoBg] = useState('#00b87c');

  const [adminCourseTitle, setAdminCourseTitle] = useState('');
  const [adminCourseCategory, setAdminCourseCategory] = useState('Marketing');
  const [adminCourseDuration, setAdminCourseDuration] = useState('5h');
  const [adminCourseLevel, setAdminCourseLevel] = useState('Débutant');

  // AI loading and output states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState('');

  // Cover letter generator states
  const [letterRole, setLetterRole] = useState('');
  const [letterCompany, setLetterCompany] = useState('');
  const [letterTone, setLetterTone] = useState('Professionnel');
  const [generatedLetterContent, setGeneratedLetterContent] = useState('');
  const [isLetterGenerating, setIsLetterGenerating] = useState(false);
  const [letterIndustry, setLetterIndustry] = useState('');
  const [letterRecipientName, setLetterRecipientName] = useState('');
  const [letterMotivation, setLetterMotivation] = useState('');
  const [letterKeyAchievement, setLetterKeyAchievement] = useState('');

  // Active training video state
  const [activeCourseId, setActiveCourseId] = useState(null);

  // Photo de profil
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = React.useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState('fr');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const t = (key, fallbackText, params = {}) => {
    let text = fallbackText;
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      text = TRANSLATIONS[lang][key];
    }
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
    return text;
  };

  const translateDate = (dateStr) => {
    if (dateStr === "À l'instant") return t("justNow", "À l'instant");
    if (dateStr === "Il y a 2 heures") return t("twoHoursAgo", "Il y a 2 heures");
    if (dateStr === "Hier - 18h32") return t("yesterdayTime", "Hier - 18h32");
    return dateStr;
  };

  const translateCategory = (cat) => {
    const map = {
      'Marketing': t("adminCatMarketing", "Marketing"),
      'Bureautique': t("adminCatBureautique", "Bureautique"),
      'Design': t("adminCatDesign", "Design"),
      'Rédaction': t("adminCatRedaction", "Rédaction"),
      'Finance': t("adminCatFinance", "Finance"),
      'Général': t("adminCatGeneral", "Général")
    };
    return map[cat] || cat;
  };

  const translateLevel = (lvl) => {
    const map = {
      'Débutant': t("adminLevelDeb", "Débutant"),
      'Intermédiaire': t("adminLevelInt", "Intermédiaire"),
      'Avancé': t("adminLevelAva", "Avancé")
    };
    return map[lvl] || lvl;
  };

  const translateContract = (contract) => {
    const map = {
      'CDI': t("adminContractCDI", "CDI"),
      'CDD': t("adminContractCDD", "CDD"),
      'Stage': t("adminContractStage", "Stage"),
      'Freelance': t("adminContractFreelance", "Freelance")
    };
    return map[contract] || contract;
  };

  const openModal = (title, message, type = 'info') => {
    setModalConfig({ isOpen: true, title, message, type });
  };
  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  // Get active username (depuis le compte réel)
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const userEmail = user?.email || '';
  const userCountry = user?.country || '';
  const userPhone = user?.phone || '';

  // Complétude réelle du profil/CV (0–100%) calculée sur le contenu rempli
  const profileCompletion = (() => {
    const checks = [
      !!cvData.title,
      (cvData.summary || '').length > 20,
      (cvData.experiences || []).length > 0,
      (cvData.educations || []).length > 0,
      (cvData.skills || []).length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  })();

  // Optimisation du CV — moteur heuristique (limité en version gratuite)
  const triggerAiCVHelp = (field) => {
    if (!canUse('cvEdits')) {
      openModal(
        'Limite de la version gratuite atteinte',
        'La version gratuite autorise une seule modification du CV. Passe à un plan payant pour des modifications illimitées.',
        'warning'
      );
      setCurrentView('pricing');
      return;
    }
    setIsAiLoading(true);
    setAiTip('Optimisation de ton CV en cours...');

    setTimeout(() => {
      if (field === 'summary') {
        const titleText = cvData.title || 'Candidat(e)';
        const skillsText = cvData.skills && cvData.skills.length > 0
          ? cvData.skills.slice(0, 4).join(', ')
          : 'mes compétences clés';
        const latestExp = cvData.experiences && cvData.experiences.length > 0
          ? ` Forte expérience acquise notamment chez ${cvData.experiences[0].company}.`
          : '';
        const generatedSummary = `Jeune diplômé(e) dynamique spécialisé(e) en tant que ${titleText}.${latestExp} Maîtrise avérée de ${skillsText}. Orienté(e) résultats, je souhaite mettre mon énergie et mes compétences au service d'équipes ambitieuses pour relever de nouveaux défis professionnels en Afrique et au-delà.`;
        updateCV('summary', generatedSummary);
      } else if (field === 'suggestion') {
        let suggestedTitle = 'Spécialiste en Communication';
        if (cvData.skills && (cvData.skills.includes('SEO') || cvData.skills.includes('Meta Ads') || cvData.skills.includes('Google Analytics'))) {
          suggestedTitle = 'Spécialiste Marketing Digital & Réseaux Sociaux';
        } else if (cvData.title && cvData.title.toLowerCase().includes('marketing')) {
          suggestedTitle = 'Consultant(e) Marketing Digital Junior';
        }
        updateCV('title', suggestedTitle);
      }
      consume('cvEdits');
      setIsAiLoading(false);
      setAiTip('CV optimisé selon les modèles qui performent ! ✨');
      setTimeout(() => setAiTip(''), 3000);
    }, 1200);
  };

  // Construit le texte de la lettre à partir des champs + du CV.
  // enhanced = version "améliorée" (accroche + paragraphe de valeur + appel à l'action plus fort).
  const buildLetterText = (enhanced = false) => {
    const INDUSTRY_VOCAB = {
      marketing: { keywords: 'stratégie de contenu, ROI, engagement digital et KPI', value: 'créativité et sens analytique', closing: 'porter votre marque à un niveau supérieur' },
      tech: { keywords: 'solutions data-driven, développement agile et veille technologique', value: 'adaptabilité et esprit d\'innovation', closing: 'contribuer à vos projets de transformation digitale' },
      finance: { keywords: 'gestion des risques, conformité réglementaire et analyse financière', value: 'rigueur et fiabilité absolue', closing: 'renforcer la solidité de vos activités' },
      sante: { keywords: 'protocoles cliniques, qualité des soins et éthique professionnelle', value: 'empathie et rigueur médicale', closing: 'servir vos patients avec excellence' },
      education: { keywords: 'méthodes pédagogiques innovantes, accompagnement et évaluation', value: 'passion pour la transmission du savoir', closing: 'contribuer au développement de vos apprenants' },
      commerce: { keywords: 'relation client, fidélisation et performance commerciale', value: 'sens du contact et orientation résultats', closing: 'dépasser vos objectifs commerciaux' },
      ong: { keywords: 'impact social, mobilisation communautaire et travail de terrain', value: 'engagement et sens de la mission', closing: 'amplifier l\'impact de vos actions sur le terrain' },
      juridique: { keywords: 'conformité légale, conseil stratégique et rédaction juridique', value: 'rigueur analytique et déontologie', closing: 'sécuriser et accompagner vos opérations' },
      creatif: { keywords: 'direction artistique, storytelling visuel et conception créative', value: 'vision créative et sensibilité esthétique', closing: 'apporter une nouvelle dimension à vos projets' },
      btp: { keywords: 'gestion de chantier, normes de sécurité et coordination terrain', value: 'rigueur technique et respect des délais', closing: 'mener à bien vos projets de construction' },
      agro: { keywords: 'gestion des filières, durabilité et optimisation des rendements', value: 'connaissance du terrain et vision durable', closing: 'renforcer votre chaîne de valeur agricole' },
      industrie: { keywords: 'optimisation des processus, maintenance préventive et contrôle qualité', value: 'expertise technique et culture de la performance', closing: 'optimiser vos lignes de production' },
    };

    const selectedIndustry = INDUSTRIES.find(i => i.id === letterIndustry);
    const industryLabel = selectedIndustry ? selectedIndustry.label : 'votre secteur';
    const vocab = INDUSTRY_VOCAB[letterIndustry] || { keywords: 'compétences clés', value: 'polyvalence et engagement', closing: 'contribuer à vos objectifs' };

    const recipientOpening = letterRecipientName ? `${letterRecipientName},` : 'Madame, Monsieur,';
    const recipientClosing = letterRecipientName ? letterRecipientName : 'Madame, Monsieur';

    const toneOpening = letterTone === 'Confiant'
      ? `Je suis convaincu(e) d'apporter une valeur immédiate à votre équipe`
      : letterTone === 'Passionné'
      ? `C'est avec une passion profonde pour le secteur ${industryLabel} que je vous soumets ma candidature`
      : `C'est avec enthousiasme et détermination que je vous adresse ma candidature`;

    const expPhrase = cvData.experiences && cvData.experiences.length > 0
      ? `Au cours de mon expérience en tant que ${cvData.experiences[0].role} chez ${cvData.experiences[0].company}, j'ai développé des compétences directement applicables dans le secteur ${industryLabel}.`
      : `À travers ma formation${cvData.educations && cvData.educations.length > 0 ? ` en ${cvData.educations[0].degree}` : ''}, j'ai acquis des bases solides adaptées au secteur ${industryLabel}.`;

    const skillsLine = cvData.skills && cvData.skills.length > 0
      ? `Ma maîtrise de ${vocab.keywords} — renforcée par ma pratique de ${cvData.skills.slice(0, 3).join(', ')} — me permet d'être rapidement opérationnel(le) et de ${vocab.closing}.`
      : `Ma maîtrise de ${vocab.keywords} me permet d'être rapidement opérationnel(le) et de ${vocab.closing}.`;

    const achievementPhrase = letterKeyAchievement
      ? `\n\nParmi mes réalisations concrètes : ${letterKeyAchievement}. Ce type de résultats mesurables témoigne de mon engagement à créer de la valeur réelle pour les équipes que j'intègre.`
      : '';

    const motivationPhrase = letterMotivation
      ? `\n\nCe qui me motive particulièrement à rejoindre ${letterCompany} : ${letterMotivation}.`
      : `\n\nRejoindre ${letterCompany} représente pour moi une opportunité unique d'exprimer pleinement mon ${vocab.value} dans un environnement de référence du secteur ${industryLabel}.`;

    const hook = enhanced
      ? `\n\nVotre recherche d'un(e) ${letterRole} a immédiatement retenu mon attention : le profil recherché correspond précisément à la valeur que je souhaite apporter à une équipe telle que la vôtre.`
      : '';
    const extraValue = enhanced
      ? ` Au-delà des compétences techniques, je me distingue par mon ${vocab.value} — des qualités déterminantes pour réussir dans le secteur ${industryLabel}.`
      : '';
    const cta = enhanced
      ? `Je serais ravi(e) d'échanger avec vous lors d'un entretien afin de vous démontrer concrètement comment je peux ${vocab.closing}. Je vous remercie par avance de l'attention portée à ma candidature.`
      : `Je suis disponible pour un entretien à votre convenance et reste à votre entière disposition pour tout complément d'information.`;

    return `Objet : Candidature au poste de ${letterRole} — ${firstName} ${lastName}\n\n${recipientOpening}\n\n${toneOpening} pour le poste de ${letterRole} au sein de ${letterCompany}.${hook}\n\n${expPhrase} ${skillsLine}${extraValue}${achievementPhrase}${motivationPhrase}\n\n${cta}\n\nVeuillez agréer, ${recipientClosing}, l'expression de mes salutations distinguées.\n\n${firstName} ${lastName}${cvData.phone ? `\n📞 ${cvData.phone}` : ''}${cvData.email ? `\n✉️ ${cvData.email}` : ''}`;
  };

  // Génère la lettre (animation de frappe) et l'enregistre dans l'historique
  const generateAiLetter = (e) => {
    e.preventDefault();
    if (!letterIndustry) { openModal('Information requise', 'Veuillez d\'abord sélectionner votre secteur d\'activité.', 'warning'); return; }
    setIsLetterGenerating(true);
    setGeneratedLetterContent('');
    const template = buildLetterText(false);
    let index = 0;
    const interval = setInterval(() => {
      if (index < template.length - 1) {
        setGeneratedLetterContent(prev => prev + template[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsLetterGenerating(false);
        createCoverLetter({ company: letterCompany, role: letterRole, content: template });
      }
    }, 5);
  };

  // Améliore la lettre : version plus développée et plus percutante
  const improveLetter = () => {
    if (!letterRole || !letterCompany) { openModal('Information requise', "Renseigne d'abord le poste et l'entreprise, puis génère une lettre.", 'warning'); return; }
    setIsLetterGenerating(true);
    setTimeout(() => {
      const enhanced = buildLetterText(true);
      setGeneratedLetterContent(enhanced);
      setIsLetterGenerating(false);
    }, 500);
  };

  // Télécharge la lettre actuelle en PDF
  const downloadLetter = () => {
    if (!generatedLetterContent) return;
    generateLetterPdf(generatedLetterContent, firstName, lastName);
  };

  // Photo de profil handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      // Redimensionne/compresse la photo (max 320px, JPEG) avant de la stocker :
      // une photo brute (plusieurs Mo en base64) dépasse le quota localStorage sur mobile
      // et ne se sauvegardait pas. Un thumbnail léger (~20-40 Ko) persiste partout.
      const img = new Image();
      img.onload = () => {
        try {
          const MAX = 320;
          let { width, height } = img;
          if (width >= height && width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          else if (height > width && height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setProfilePhoto(compressed);
          updateCV('photo', compressed);
        } catch (err) {
          // En cas d'échec (canvas non dispo, etc.) on retombe sur l'image d'origine
          setProfilePhoto(dataUrl);
          updateCV('photo', dataUrl);
        }
      };
      img.onerror = () => { setProfilePhoto(dataUrl); updateCV('photo', dataUrl); };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // CV editor sub-actions
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExpRole || !newExpCompany) return;
    addCVItem('experiences', {
      role: newExpRole.trim(),
      company: newExpCompany.trim(),
      period: newExpPeriod.trim(),
      location: newExpLocation.trim(),
      desc: newExpDesc.trim()
    });
    setNewExpRole(''); setNewExpCompany(''); setNewExpPeriod(''); setNewExpLocation(''); setNewExpDesc('');
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!newEduDegree || !newEduSchool) return;
    addCVItem('educations', {
      degree: newEduDegree.trim(),
      school: newEduSchool.trim(),
      period: newEduPeriod.trim(),
      location: newEduLocation.trim(),
      desc: ''
    });
    setNewEduDegree(''); setNewEduSchool(''); setNewEduPeriod(''); setNewEduLocation('');
  };

  // Compétences (tableau de chaînes) — ajout/suppression directe
  const handleAddSkill = (e) => {
    e.preventDefault();
    const v = newSkill.trim();
    if (!v) return;
    const current = cvData.skills || [];
    if (current.some((s) => s.toLowerCase() === v.toLowerCase())) { setNewSkill(''); return; }
    updateCV('skills', [...current, v]);
    setNewSkill('');
  };
  const handleRemoveSkill = (index) => {
    updateCV('skills', (cvData.skills || []).filter((_, i) => i !== index));
  };

  // Langues (tableau d'objets {name, level})
  const handleAddLanguage = (e) => {
    e.preventDefault();
    const name = newLangName.trim();
    if (!name) return;
    const current = cvData.languages || [];
    if (current.some((l) => l.name.toLowerCase() === name.toLowerCase())) { setNewLangName(''); return; }
    updateCV('languages', [...current, { name, level: newLangLevel }]);
    setNewLangName(''); setNewLangLevel('Courant');
  };
  const handleRemoveLanguage = (index) => {
    updateCV('languages', (cvData.languages || []).filter((_, i) => i !== index));
  };

  // Admin sub-actions
  const handleAdminAddJob = (e) => {
    e.preventDefault();
    if (!adminJobRole || !adminJobCompany) return;
    addJob({
      role: adminJobRole,
      company: adminJobCompany,
      location: adminJobLocation || 'Abidjan',
      contract: adminJobContract,
      salary: adminJobSalary || 'Non spécifié',
      logo: adminJobCompany[0].toUpperCase(),
      logoBg: adminJobLogoBg
    });
    setAdminJobRole(''); setAdminJobCompany(''); setAdminJobLocation(''); setAdminJobSalary('');
  };

  return (
    <div style={styles.dashboardLayout} className={`db-layout ${isDarkMode ? 'dark-theme' : ''}`}>
      
      {/* Sidebar overlay for mobile */}
      <div
        className={`db-sidebar-overlay ${sidebarOpen ? 'overlay-active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside style={styles.sidebar} className={`db-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Close button (mobile only) */}
        <button className="db-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

        <div style={styles.sidebarBrand}>
          <span style={styles.logoDot}>M</span>
          <span style={styles.brandText}>MonFuturBoulot</span>
        </div>

        <div style={styles.sidebarSectionLabel}>{t("navPrincipal", "PRINCIPAL")}</div>
        <nav style={styles.sidebarNav}>
          <button 
            style={{...styles.sidebarLink, ...(currentView === 'dashboard' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('dashboard')}
          >
            {t("navDashboard", "📊 Tableau de Bord")}
          </button>
          <button 
            style={{...styles.sidebarLink, ...(currentView === 'cv' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('cv')}
          >
            {t("navCV", "📄 Mon CV")}
          </button>
          <button 
            style={{...styles.sidebarLink, ...(currentView === 'letters' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('letters')}
          >
            {t("navLetters", "✉️ Lettres de motivation")}
          </button>
          <button
            style={{...styles.sidebarLink, ...(currentView === 'jobs' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('jobs')}
          >
            {t("navJobs", "💼 Offres d'emploi")}
          </button>
          {canUseProFeatures && (
            <button
              style={{...styles.sidebarLink, ...(currentView === 'support' ? styles.sidebarLinkActive : {}), display: 'flex', alignItems: 'center', gap: '10px'}}
              onClick={() => setCurrentView('support')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              {t("navSupport", "Support")}
            </button>
          )}
        </nav>

        <div style={styles.sidebarSectionLabel}>{t("navMyAccount", "MON COMPTE")}</div>
        <nav style={styles.sidebarNav}>
          <button 
            style={{...styles.sidebarLink, ...(currentView === 'profile' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('profile')}
          >
            {t("navProfile", "👤 Profil")}
          </button>
          <button 
            style={{...styles.sidebarLink, ...(currentView === 'applications' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('applications')}
          >
            {t("navApplications", "📥 Candidatures")}
          </button>
          <button 
            style={{...styles.sidebarLink, ...(currentView === 'settings' ? styles.sidebarLinkActive : {})}}
            onClick={() => setCurrentView('settings')}
          >
            {t("navSettings", "⚙️ Paramètres")}
          </button>
          <button 
            style={styles.sidebarLink}
            onClick={logout}
          >
            {t("navLogout", "🚪 Déconnexion")}
          </button>
        </nav>

        {/* Upgrade Banner */}
        {!isPremium && (
          <div style={styles.upgradeBanner}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>🚀</div>
            <h4 style={{ color: '#fff', fontSize: '13px', marginBottom: '6px', fontWeight: '700' }}>{t("navUpgradeTitle", "Passe au Premium")}</h4>
            <p style={{ color: 'var(--dark-text-muted)', fontSize: '11px', lineHeight: '1.5', marginBottom: '12px' }}>
              {t("navUpgradeDesc", "CV et lettres illimités, modifications illimitées, toutes les offres de ta niche dès 5 000 FCFA/mois.")}
            </p>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ width: '100%', fontSize: '12px' }}
              onClick={() => setCurrentView('pricing')}
            >
              {t("navUpgradeBtn", "Voir les plans →")}
            </button>
          </div>
        )}
      </aside>

      {/* MAIN WRAPPER */}
      <div style={styles.mainWrapper} className="db-main">
        
        {/* TOP BAR */}
        <header style={styles.topbar}>
          {/* Hamburger (mobile only) */}
          <button className="db-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div style={styles.topbarSearch} className="db-topbar-search">
            🔍 <input 
              type="text" 
              placeholder={t("topSearchPlaceholder", "Rechercher une offre, une formation, un secteur...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchField}
            />
          </div>
          
          <div style={styles.topbarActions}>
            <button style={styles.iconBtn} aria-label="Notifications" onClick={() => openModal('Notifications', 'Aucune notification pour le moment.', 'info')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
            <button style={styles.iconBtn} aria-label="Paramètres" onClick={() => setCurrentView('settings')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            
            <div style={styles.userProfilePill} onClick={() => setCurrentView('profile')}>
              <div style={{ ...styles.userAvatarSmall, overflow: 'hidden', padding: 0 }}>
                {(profilePhoto || cvData.photo) ? (
                  <img src={profilePhoto || cvData.photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '👤'
                )}
              </div>
            <div style={styles.userProfileMeta} className="db-user-meta">
                <span style={styles.userName}>{firstName || userEmail || 'Mon compte'}{lastName ? ` ${lastName[0]}.` : ''}</span>
                <span style={styles.userLocation}>{userCountry || ''}</span>
              </div>
            </div>
          </div>
        </header>

        {/* VIEW CONTENTS */}
        <main style={styles.viewContent} className="db-content">

          {/* Bandeau de renouvellement (J-3 / J-2) — visible sur toutes les vues */}
          {renewActive && (
            <div style={styles.renewBanner}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>⏳</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#7c2d12' }}>
                  Ton abonnement se termine {renewDaysLeft <= 1 ? "demain" : `dans ${renewDaysLeft} jours`}.
                </strong>
                <span style={{ fontSize: '13px', color: '#9a3412' }}>
                  Renouvelle-le pour garder l'accès à ton espace, tes documents et les offres.
                </span>
              </div>
              <Link href="/pricing?renew=1" className="btn btn-primary btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                Renouveler
              </Link>
            </div>
          )}

          {/* VIEW: MAIN DASHBOARD */}
          {currentView === 'dashboard' && (
            <div className="animate-fade-in">
              
              {/* Welcome Alert Card */}
              <div style={styles.welcomeCard}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>
                    {firstName ? `Bonjour ${firstName}, prêt à décrocher ton job ?` : 'Bienvenue sur ton espace 👋'}
                  </h2>
                  <p style={{ color: 'var(--light-text-muted)', fontSize: '15px', marginBottom: '20px' }}>
                    {t("dashWelcomeText", "Crée ton CV performant, génère tes lettres de motivation et explore les offres d'emploi. Commence dès maintenant !")}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }} className="db-welcome-btns">
                    <button className="btn btn-primary" onClick={() => setCurrentView('cv')}>{t("dashCompleteProfileBtn", "Créer mon CV")}</button>
                    <button className="btn btn-secondary" onClick={() => setCurrentView('letters')}>{t("dashLettersBtn", "Lettre de motivation")}</button>
                  </div>
                </div>

                {/* Circular completion gauge — complétude réelle du profil */}
                <div style={styles.gaugeContainer}>
                  <div style={styles.gaugeCircle}>
                    <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>{profileCompletion}%</span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginTop: '10px' }}>{t("dashProfileCompleted", "Profil complété")}</p>
                  <p style={{ fontSize: '10px', color: 'var(--light-text-muted)' }}>{profileCompletion < 100 ? 'Complète ton CV' : 'Profil complet ✅'}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={styles.statsGrid} className="db-stats-grid">
                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <span>{t("statCVs", "CV créés")}</span>
                  </div>
                  <div style={styles.statNumber}>{stats.cvsCreated}</div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <span>{t("statLetters", "Lettres générées")}</span>
                  </div>
                  <div style={styles.statNumber}>{stats.lettersGenerated}</div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <span>{t("statApps", "Candidatures envoyées")}</span>
                  </div>
                  <div style={styles.statNumber}>{stats.applicationsSent}</div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <span>{t("statInterviews", "Entretiens obtenus")}</span>
                  </div>
                  <div style={styles.statNumber}>{stats.interviewsObtained}</div>
                </div>
              </div>

              {/* Dashboard Layout: 2 Columns */}
              <div style={styles.dashboardSplit} className="db-split">
                
                {/* Left Column: Recommended Jobs */}
                <div style={styles.splitColLeft}>
                  <div style={styles.widgetHeader}>
                    <h3>{t("dashRecJobsTitle", "Offres recommandées pour toi")}</h3>
                    <button style={styles.widgetHeaderLink} onClick={() => setCurrentView('jobs')}>{t("dashViewAll", "Voir tout →")}</button>
                  </div>
                  
                  {canUseProFeatures ? (
                  jobs.length === 0 ? (
                  <div style={{ ...styles.jobItemCard, padding: '24px', color: 'var(--light-text-muted)', fontSize: '13px', justifyContent: 'center' }}>
                    Aucune offre disponible pour le moment. Reviens bientôt 👀
                  </div>
                  ) : (
                  <div style={styles.jobsList}>
                    {jobs.map((job) => (
                      <div key={job.id} style={styles.jobItemCard}>
                        <div style={{...styles.jobLogo, backgroundColor: job.logoBg}}>{job.logo}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>{job.role}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', margin: 0 }}>
                            {job.company} • {job.location} • {job.contract} • {job.salary}
                          </p>
                        </div>
                        <button className="btn btn-secondary btn-sm" disabled={!job.url} onClick={() => { if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer'); }}>
                          {t("apply", "Postuler")}
                        </button>
                      </div>
                    ))}
                  </div>
                  )
                  ) : (
                  <div style={{ ...styles.jobItemCard, flexDirection: 'column', alignItems: 'flex-start', gap: '10px', padding: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>🔒 Offres réservées aux plans Standard &amp; Premium</div>
                    <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', margin: 0 }}>
                      Le plan Basique te donne le CV et les lettres de motivation. Passe au Standard pour débloquer les offres d'emploi et les opportunités de ta niche.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('pricing')}>Passer au Standard →</button>
                  </div>
                  )}
                </div>

                {/* Right Column: Recent Activities */}
                <div style={styles.splitColRight}>
                  <div style={styles.widgetHeader}>
                    <h3>{t("dashRecentActivity", "Activité récente")}</h3>
                    <button style={styles.widgetHeaderLink} onClick={() => setCurrentView('applications')}>{t("dashViewAllShort", "Tout voir")}</button>
                  </div>

                  <div style={styles.feedList}>
                    {applications.length === 0 && letters.length === 0 ? (
                      <div style={{ padding: '20px 4px', color: 'var(--light-text-muted)', fontSize: '13px' }}>
                        Aucune activité pour le moment. Crée ton CV et postule pour voir ton activité ici.
                      </div>
                    ) : (
                      <>
                        {letters.slice(0, 3).map((l) => (
                          <div key={`l-${l.id}`} style={styles.feedItem}>
                            <span style={styles.feedCheckIcon}>✉️</span>
                            <div>
                              <p style={styles.feedText}>Lettre de motivation générée{l.company ? ` pour ${l.company}` : ''}.</p>
                              <span style={styles.feedTime}>{translateDate(l.date)}</span>
                            </div>
                          </div>
                        ))}
                        {applications.slice(0, 3).map((a) => (
                          <div key={`a-${a.id}`} style={styles.feedItem}>
                            <span style={styles.feedCheckIcon}>✓</span>
                            <div>
                              <p style={styles.feedText}>Candidature envoyée{a.company ? ` à ${a.company}` : ''}{a.role ? ` (${a.role})` : ''}.</p>
                              <span style={styles.feedTime}>{translateDate(a.date)}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Quick Actions Grid */}
              <div style={styles.bottomActionsGrid}>
                <div style={styles.bottomActionCard} onClick={() => setCurrentView('cv')}>
                  <span style={styles.actionIcon}>✨</span>
                  <h4>{t("actionCreateCVTitle", "Créer un nouveau CV")}</h4>
                  <p>{t("actionCreateCVDesc", "Un CV performant prêt à l'emploi en 2 minutes")}</p>
                </div>

                <div style={styles.bottomActionCard} onClick={() => setCurrentView('letters')}>
                  <span style={styles.actionIcon}>✉️</span>
                  <h4>{t("actionLetterTitle", "Lettre de motivation")}</h4>
                  <p>{t("actionLetterDesc", "Personnalisée par secteur d'activité")}</p>
                </div>

                <div style={styles.bottomActionCard} onClick={() => setCurrentView('jobs')}>
                  <span style={styles.actionIcon}>💼</span>
                  <h4>{t("actionExploreJobsTitle", "Explorer les offres")}</h4>
                  <p>{t("actionExploreJobsDesc", "De nouvelles offres ajoutées automatiquement")}</p>
                </div>

                <div style={styles.bottomActionCard} onClick={() => setCurrentView('applications')}>
                  <span style={styles.actionIcon}>📥</span>
                  <h4>{t("actionApplicationsTitle", "Mes candidatures")}</h4>
                  <p>{t("actionApplicationsDesc", "Suis l'état de tes candidatures envoyées")}</p>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: CV BUILDER (Screenshot 3) */}
          {currentView === 'cv' && (
            <div className="animate-fade-in">
              
              {/* CV TOP AUTO SAVE BAR */}
              <div style={styles.cvTopBar} className="db-cv-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>{t("navCV", "Mon CV")}</strong>{(firstName || lastName) ? <span style={{ color: 'var(--light-text-muted)' }}> / {firstName} {lastName}</span> : null}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--light-text-muted)' }}>{t("cvAutoSave", "Sauvegarde auto - il y a 12s")}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => generateCvPdf('open', cvData.firstName, cvData.lastName)}>{t("cvPreviewBtn", "Aperçu")}</button>
                  <button className="btn btn-primary btn-sm" onClick={() => generateCvPdf('save', cvData.firstName, cvData.lastName)}>{t("cvDownloadPDF", "Télécharger PDF ↓")}</button>
                </div>
              </div>

              {/* CV Editor Workspace */}
              <div style={styles.cvWorkspace} className="db-cv-workspace">

                {/* Left Side: Form Editor */}
                <div style={styles.cvFormColumn}>
                  <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '8px' }}>{t("cvFormStep2Title", "Complète ton CV")}</h2>
                  <p style={{ color: 'var(--light-text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                    {t("cvFormStep2Desc", "Remplis chaque section ci-dessous. L'aperçu à droite se met à jour en direct.")}
                  </p>

                  {/* Profile Section */}
                  <div style={styles.editorSectionCard}>
                    <h3 style={styles.editorCardTitle}>{t("cvPhotoTitle", "Photo de profil")}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                      {(profilePhoto || cvData.photo) ? (
                        <img
                          src={profilePhoto || cvData.photo}
                          alt="Photo de profil"
                          style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                        />
                      ) : (
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '800', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {((cvData.firstName?.[0] || '') + (cvData.lastName?.[0] || '')).toUpperCase() || '👤'}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => photoInputRef.current?.click()}>{t("cvPhotoChange", "📷 Changer la photo")}</button>
                        {(profilePhoto || cvData.photo) && (
                          <button className="btn btn-secondary btn-sm" style={{ border: 'none', color: '#ef4444' }} onClick={() => { setProfilePhoto(null); updateCV('photo', null); }}>{t("cvPhotoDelete", "Supprimer")}</button>
                        )}
                      </div>
                    </div>

                    <div style={styles.rowInputs}>
                      <div className="form-group" style={{ flex: 1, marginTop: '20px' }}>
                        <label className="form-label">{t("cvLabelFirstName", "Prénom")}</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={cvData.firstName}
                          onChange={(e) => updateCV('firstName', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1, marginTop: '20px' }}>
                        <label className="form-label">{t("cvLabelLastName", "Nom")}</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={cvData.lastName}
                          onChange={(e) => updateCV('lastName', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("cvLabelTitle", "Titre professionnel")}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ex : Développeur web junior, Assistant marketing"
                        value={cvData.title}
                        onChange={(e) => updateCV('title', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("cvLabelSummary", "Résumé professionnel")}</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Décris en 2-3 phrases qui tu es, ta valeur et ton objectif professionnel."
                        value={cvData.summary}
                        onChange={(e) => updateCV('summary', e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                      <button
                        style={styles.aiSuggestionLink}
                        onClick={() => triggerAiCVHelp('summary')}
                        disabled={isAiLoading}
                      >
                        {isAiLoading ? '⏳ Génération...' : '✨ Générer un résumé à partir de mes infos'}
                      </button>
                    </div>
                  </div>

                  {/* Coordonnées Section */}
                  <div style={styles.editorSectionCard}>
                    <h3 style={styles.editorCardTitle}>{t("cvContactTitle", "Coordonnées")}</h3>
                    <div style={styles.rowInputs}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">{t("cvLabelEmail", "Email")}</label>
                        <input type="email" className="form-input" placeholder="prenom@email.com" value={cvData.email || ''} onChange={(e) => updateCV('email', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">{t("cvLabelPhone", "Téléphone")}</label>
                        <input type="tel" className="form-input" placeholder="+225 07 00 00 00 00" value={cvData.phone || ''} onChange={(e) => updateCV('phone', e.target.value)} />
                      </div>
                    </div>
                    <div style={styles.rowInputs}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">{t("cvLabelAddress", "Ville / Pays")}</label>
                        <input type="text" className="form-input" placeholder="Abidjan, Côte d'Ivoire" value={cvData.address || ''} onChange={(e) => updateCV('address', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">{t("cvLabelLinkedin", "LinkedIn (optionnel)")}</label>
                        <input type="text" className="form-input" placeholder="linkedin.com/in/ton-profil" value={cvData.linkedin || ''} onChange={(e) => updateCV('linkedin', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Experiences Section */}
                  <div style={styles.editorSectionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0 }}>{t("cvExperiencesTitle", "Expériences professionnelles")}</h3>
                    </div>

                    {/* Experiences Items List */}
                    {cvData.experiences.map((exp) => (
                      <div key={exp.id} style={styles.editorListItem}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#0f172a' }}>{exp.role} — {exp.company}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--light-text-muted)' }}>{exp.period} • {exp.location}</p>
                          <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px', whiteSpace: 'pre-line' }}>{exp.desc}</p>
                        </div>
                        <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => deleteCVItem('experiences', exp.id)}>{t("cvDeleteBtn", "Supprimer")}</button>
                      </div>
                    ))}

                    {/* Add Experience inline Form */}
                    <form onSubmit={handleAddExperience} style={styles.inlineForm}>
                      <div style={styles.rowInputs}>
                        <input type="text" placeholder={t("cvAddExpTitle", "Poste (ex: Stage Marketing)")} className="form-input" value={newExpRole} onChange={(e) => setNewExpRole(e.target.value)} style={{ padding: '8px 12px' }} required />
                        <input type="text" placeholder={t("cvAddExpCompany", "Entreprise")} className="form-input" value={newExpCompany} onChange={(e) => setNewExpCompany(e.target.value)} style={{ padding: '8px 12px' }} required />
                      </div>
                      <div style={styles.rowInputs}>
                        <input type="text" placeholder={t("cvAddExpPeriod", "Période (ex: Juin - Sept 2025)")} className="form-input" value={newExpPeriod} onChange={(e) => setNewExpPeriod(e.target.value)} style={{ padding: '8px 12px' }} />
                        <input type="text" placeholder={t("cvAddExpLocation", "Lieu (ex: Abidjan)")} className="form-input" value={newExpLocation} onChange={(e) => setNewExpLocation(e.target.value)} style={{ padding: '8px 12px' }} />
                      </div>
                      <textarea placeholder={t("cvAddExpDesc", "Décris tes missions et résultats (ex: gestion des réseaux, +20% d'engagement...)")} className="form-input" rows={2} value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} style={{ padding: '8px 12px', resize: 'vertical' }} />
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>{t("cvAddExpBtn", "Ajouter cette expérience")}</button>
                    </form>
                  </div>

                  {/* Education Section */}
                  <div style={styles.editorSectionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0 }}>{t("cvEducationsTitle", "Formation")}</h3>
                    </div>

                    {cvData.educations.map((edu) => (
                      <div key={edu.id} style={styles.editorListItem}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#0f172a' }}>{edu.degree}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--light-text-muted)' }}>{[edu.school, edu.period, edu.location].filter(Boolean).join(' • ')}</p>
                        </div>
                        <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => deleteCVItem('educations', edu.id)}>{t("cvDeleteBtn", "Supprimer")}</button>
                      </div>
                    ))}

                    {/* Add Education inline Form */}
                    <form onSubmit={handleAddEducation} style={styles.inlineForm}>
                      <div style={styles.rowInputs}>
                        <input type="text" placeholder={t("cvAddEduDegree", "Diplôme (ex: Licence)")} className="form-input" value={newEduDegree} onChange={(e) => setNewEduDegree(e.target.value)} style={{ padding: '8px 12px' }} required />
                        <input type="text" placeholder={t("cvAddEduSchool", "Établissement")} className="form-input" value={newEduSchool} onChange={(e) => setNewEduSchool(e.target.value)} style={{ padding: '8px 12px' }} required />
                      </div>
                      <div style={styles.rowInputs}>
                        <input type="text" placeholder={t("cvAddEduPeriod", "Période (ex: 2022 - 2025)")} className="form-input" value={newEduPeriod} onChange={(e) => setNewEduPeriod(e.target.value)} style={{ padding: '8px 12px' }} />
                        <input type="text" placeholder={t("cvAddEduLocation", "Lieu (ex: Dakar)")} className="form-input" value={newEduLocation} onChange={(e) => setNewEduLocation(e.target.value)} style={{ padding: '8px 12px' }} />
                      </div>
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>{t("cvAddEduBtn", "Ajouter cette formation")}</button>
                    </form>
                  </div>

                  {/* Skills Section */}
                  <div style={styles.editorSectionCard}>
                    <h3 style={{ margin: '0 0 12px' }}>{t("cvSkillsTitle", "Compétences")}</h3>
                    {(cvData.skills || []).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                        {(cvData.skills || []).map((skill, index) => (
                          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', padding: '6px 10px', borderRadius: '999px' }}>
                            {skill}
                            <button type="button" onClick={() => handleRemoveSkill(index)} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }} aria-label="Supprimer">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder={t("cvAddSkill", "ex : Excel, Gestion de projet, SEO")} className="form-input" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} style={{ padding: '8px 12px', flex: 1 }} />
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>{t("cvAddBtn", "+ Ajouter")}</button>
                    </form>
                  </div>

                  {/* Languages Section */}
                  <div style={styles.editorSectionCard}>
                    <h3 style={{ margin: '0 0 12px' }}>{t("cvLanguagesTitle", "Langues")}</h3>
                    {(cvData.languages || []).map((lang, index) => (
                      <div key={index} style={styles.editorListItem}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#0f172a' }}>{lang.name}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--light-text-muted)' }}> — {lang.level}</span>
                        </div>
                        <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleRemoveLanguage(index)}>{t("cvDeleteBtn", "Supprimer")}</button>
                      </div>
                    ))}
                    <form onSubmit={handleAddLanguage} style={styles.inlineForm}>
                      <div style={styles.rowInputs}>
                        <input type="text" placeholder={t("cvAddLangName", "Langue (ex: Anglais)")} className="form-input" value={newLangName} onChange={(e) => setNewLangName(e.target.value)} style={{ padding: '8px 12px' }} />
                        <select className="form-input" value={newLangLevel} onChange={(e) => setNewLangLevel(e.target.value)} style={{ padding: '8px 12px' }}>
                          <option value="Débutant">{t("cvLangBeginner", "Débutant")}</option>
                          <option value="Intermédiaire">{t("cvLangIntermediate", "Intermédiaire")}</option>
                          <option value="Courant">{t("cvLangFluent", "Courant")}</option>
                          <option value="Bilingue">{t("cvLangBilingual", "Bilingue")}</option>
                          <option value="Langue maternelle">{t("cvLangNative", "Langue maternelle")}</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>{t("cvAddLangBtn", "Ajouter cette langue")}</button>
                    </form>
                  </div>

                </div>

                {/* Right Side: Live CV Preview */}
                <div style={styles.cvPreviewColumn}>
                  
                  <div style={styles.previewControls}>
                    <span>{t("cvPreviewTitle", "APERÇU EN DIRECT")}</span>
                    <div style={styles.previewTemplateSelect}>
                      <button style={{...styles.templateBtn, ...(cvStyle === 'modern' ? styles.templateBtnActive : {})}} onClick={() => setCvStyle('modern')}>Modern</button>
                      <button style={{...styles.templateBtn, ...(cvStyle === 'classic' ? styles.templateBtnActive : {})}} onClick={() => setCvStyle('classic')}>Classic</button>
                      <button style={{...styles.templateBtn, ...(cvStyle === 'creative' ? styles.templateBtnActive : {})}} onClick={() => setCvStyle('creative')}>Creative</button>
                    </div>
                  </div>

                  {/* Render CV Template in live rendering */}
                  <div className={`cv-preview-container cv-template-${cvStyle} print-cv-only`}>
                    
                    {/* CV Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(profilePhoto || cvData.photo) ? (
                          <img src={profilePhoto || cvData.photo} alt="Photo" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {((cvData.firstName?.[0] || '') + (cvData.lastName?.[0] || '')).toUpperCase() || '👤'}
                          </div>
                        )}
                        <div>
                          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{cvData.firstName} {cvData.lastName}</h2>
                          <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>{cvData.title}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569' }}>
                        {cvData.email && <div>📧 {cvData.email}</div>}
                        {cvData.phone && <div>📞 {cvData.phone}</div>}
                        {cvData.address && <div>📍 {cvData.address}</div>}
                        {cvData.linkedin && <div>🔗 {cvData.linkedin}</div>}
                      </div>
                    </div>

                    {/* Summary */}
                    {cvData.summary && (
                      <div style={{ marginTop: '12px' }}>
                        <div className="cv-section-title">{t("cvSectionProfil", "Profil")}</div>
                        <p style={{ fontSize: '11px', color: '#334155', whiteSpace: 'pre-line' }}>{cvData.summary}</p>
                      </div>
                    )}

                    {/* Split Layout for Experience & Skills */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '15px', marginTop: '12px' }}>

                      {/* Left: Experiences & Educations */}
                      <div>
                        {cvData.experiences.length > 0 && (
                          <>
                            <div className="cv-section-title">{t("cvSectionExperience", "Expérience")}</div>
                            {cvData.experiences.map((exp) => (
                              <div key={exp.id} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                                  <span>{exp.role}</span>
                                  <span style={{ color: 'var(--light-text-muted)' }}>{exp.period}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--primary)', fontStyle: 'italic' }}>{[exp.company, exp.location].filter(Boolean).join(' — ')}</div>
                                {exp.desc && <p style={{ fontSize: '10px', color: '#475569', whiteSpace: 'pre-line', marginTop: '3px' }}>{exp.desc}</p>}
                              </div>
                            ))}
                          </>
                        )}

                        {cvData.educations.length > 0 && (
                          <>
                            <div className="cv-section-title" style={{ marginTop: '12px' }}>{t("cvSectionFormation", "Formation")}</div>
                            {cvData.educations.map((edu) => (
                              <div key={edu.id} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                                  <span>{edu.degree}</span>
                                  <span style={{ color: 'var(--light-text-muted)' }}>{edu.period}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#475569' }}>{[edu.school, edu.location].filter(Boolean).join(' — ')}</div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Right: Skills & Languages */}
                      <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>
                        {(cvData.skills || []).length > 0 && (
                          <>
                            <div className="cv-section-title">{t("cvSectionSkills", "Compétences")}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {cvData.skills.map((skill, index) => (
                                <span key={index} className="cv-badge">{skill}</span>
                              ))}
                            </div>
                          </>
                        )}

                        {(cvData.languages || []).length > 0 && (
                          <>
                            <div className="cv-section-title" style={{ marginTop: '15px' }}>{t("cvSectionLanguages", "Langues")}</div>
                            {cvData.languages.map((lang, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                <span>{lang.name}</span>
                                <span style={{ fontWeight: '600', color: 'var(--light-text-muted)' }}>{lang.level}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* ATS Compatibility Meter — réservé Standard / Premium */}
                  {canUseProFeatures ? (
                  <div style={styles.atsCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                      <span>{t("cvAtsTitle", "🚀 Score • Compatibilité ATS")}</span>
                      <span style={{ color: atsScore >= 80 ? 'var(--primary)' : atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>{atsScore}%</span>
                    </div>
                    <div style={styles.atsBarBackground}>
                      <div style={{...styles.atsBarFill, width: `${atsScore}%`, backgroundColor: atsScore >= 80 ? 'var(--primary)' : atsScore >= 50 ? '#f59e0b' : '#ef4444'}}></div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--light-text-muted)', margin: '8px 0 12px' }}>
                      {atsScore >= 80
                        ? '✅ Excellent ! Ton CV est très bien optimisé pour les logiciels de recrutement (ATS).'
                        : atsScore >= 50
                        ? '⚠️ Bon début. Complète les points ci-dessous pour passer les filtres ATS plus facilement.'
                        : '❌ Ton CV est incomplet. Renseigne les éléments ci-dessous pour être repéré par les recruteurs.'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {(atsChecklist || []).map((it) => (
                        <div key={it.key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '11px' }}>
                          <span style={{ flexShrink: 0, fontWeight: 700, color: it.done ? 'var(--primary)' : '#cbd5e1' }}>{it.done ? '✓' : '○'}</span>
                          <span style={{ color: it.done ? '#94a3b8' : '#334155', textDecoration: it.done ? 'line-through' : 'none' }}>
                            {it.done ? it.label : it.advice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  ) : (
                  <div style={{ ...styles.atsCard, textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>🔒 Score ATS — Standard &amp; Premium</div>
                    <p style={{ fontSize: '11px', color: 'var(--light-text-muted)', margin: 0 }}>
                      L'analyse ATS avancée n'est pas incluse dans le plan Basique.{' '}
                      <span onClick={() => setCurrentView('pricing')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Passer au Standard →</span>
                    </p>
                  </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* VIEW: COVER LETTER GENERATOR */}
          {currentView === 'letters' && (
            <div className="animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto' }}>

              <div style={{ marginBottom: '30px' }}>
                <span style={styles.sectionLabel}>{t("navLetters", "LETTRES DE MOTIVATION")}</span>
                <h2>{t("letTitle", "Génère une lettre sur-mesure adaptée à ton secteur")}</h2>
                <p style={{ color: 'var(--light-text-muted)' }}>
                  {t("letDesc", "Sélectionne ton industrie, renseigne 3 infos clés, et notre IA rédige une lettre adaptée aux codes de ton secteur — vocabulaire, ton et attentes inclus.")}
                </p>
              </div>

              {/* ÉTAPE 1 : Sélecteur d'industrie */}
              <div style={styles.editorSectionCard}>
                <h3 style={{ fontSize: '15px', marginBottom: '6px', color: '#0f172a' }}>{t("letStep1Title", "🏢 Étape 1 — Choisis ton secteur d'activité")}</h3>
                <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', marginBottom: '20px' }}>
                  {t("letStep1Desc", "Chaque secteur a ses propres codes et son vocabulaire. Sélectionne le tien pour une lettre réellement différenciante.")}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setLetterIndustry(ind.id)}
                      style={{
                        padding: '14px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: letterIndustry === ind.id ? '2px solid var(--primary)' : '1.5px solid var(--light-border)',
                        backgroundColor: letterIndustry === ind.id ? 'var(--primary-light)' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'var(--transition)',
                        color: letterIndustry === ind.id ? 'var(--primary)' : '#475569',
                        fontWeight: letterIndustry === ind.id ? '700' : '500',
                        fontSize: '11px',
                        textAlign: 'center',
                        lineHeight: '1.3'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{ind.icon}</span>
                      {ind.label}
                    </button>
                  ))}
                </div>

                {/* Note industrie */}
                {letterIndustry && (() => {
                  const ind = INDUSTRIES.find(i => i.id === letterIndustry);
                  return (
                    <div style={{ marginTop: '20px', padding: '16px 20px', backgroundColor: '#e8f9f3', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '22px', marginTop: '1px', flexShrink: 0 }}>💡</span>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--primary)', display: 'block', marginBottom: '5px' }}>{t("letCodesTitle", "Codes de l'industrie — {label}", { label: ind.label })}</strong>
                        <p style={{ fontSize: '12px', color: '#334155', margin: 0, lineHeight: '1.65' }}>{ind.tip}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ÉTAPE 2 : Formulaire de personnalisation */}
              <div style={{ ...styles.editorSectionCard, marginTop: '24px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '6px', color: '#0f172a' }}>{t("letStep2Title", "✍️ Étape 2 — Personnalise ta lettre")}</h3>
                <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', marginBottom: '20px' }}>
                  {t("letStep2Desc", "Plus tu donnes de détails, plus ta lettre sera unique et convaincante.")}
                </p>
                <form onSubmit={generateAiLetter} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">{t("letPostLabel", "Titre du poste ciblé *")}</label>
                      <input type="text" className="form-input" value={letterRole} onChange={(e) => setLetterRole(e.target.value)} placeholder="ex: Community Manager" required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">{t("letCompanyLabel", "Nom de l'entreprise *")}</label>
                      <input type="text" className="form-input" value={letterCompany} onChange={(e) => setLetterCompany(e.target.value)} placeholder="ex: Wave" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("letHrLabel", "Nom du/de la responsable RH (optionnel)")}</label>
                    <input type="text" className="form-input" value={letterRecipientName} onChange={(e) => setLetterRecipientName(e.target.value)} placeholder="ex: Monsieur Koné, Madame Diallo" />
                    <span style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '5px', display: 'block', fontWeight: '600' }}>{t("letHrTip", "💡 Personnaliser l'en-tête augmente le taux de réponse de +40%")}</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("letAchievementLabel", "Une réalisation clé à mettre en avant")}</label>
                    <input type="text" className="form-input" value={letterKeyAchievement} onChange={(e) => setLetterKeyAchievement(e.target.value)} placeholder="ex: +15k followers en 3 mois, hausse de 22% de l'engagement" />
                    <span style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '5px', display: 'block', fontWeight: '600' }}>{t("letAchievementTip", "💡 Un chiffre concret rend ta lettre 3× plus mémorable")}</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("letWhyLabel", "Pourquoi cette entreprise spécifiquement ?")}</label>
                    <textarea className="form-input" rows={2} value={letterMotivation} onChange={(e) => setLetterMotivation(e.target.value)} placeholder="ex: J'admire votre mission d'inclusion financière en Afrique de l'Ouest et votre culture d'innovation..." style={{ resize: 'vertical' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("letToneLabel", "Ton de la lettre")}</label>
                    <select className="form-input" value={letterTone} onChange={(e) => setLetterTone(e.target.value)}>
                      <option value="Professionnel">{t("letToneProfessional", "💼 Professionnel & Formel")}</option>
                      <option value="Confiant">{t("letToneConfident", "🔥 Confiant & Déterminé")}</option>
                      <option value="Passionné">{t("letTonePassionate", "❤️ Passionné & Créatif")}</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={isLetterGenerating || !letterIndustry}>
                    {isLetterGenerating ? t("letSubmitBtnGenerating", "⏳ Génération en cours...") : !letterIndustry ? t("letSubmitBtnSelectSector", "⬆️ Sélectionne d'abord ton secteur (Étape 1)") : t("letSubmitBtn", "✨ Rédiger ma lettre personnalisée")}
                  </button>
                </form>
              </div>

              {/* Lettre générée */}
              {(generatedLetterContent || isLetterGenerating) && (
                <div style={{ ...styles.editorSectionCard, marginTop: '30px', backgroundColor: '#fafffe', border: '1.5px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--primary)', fontSize: '13px' }}>{t("letGeneratedLetter", "✅ TA LETTRE — Secteur {sector}", { sector: INDUSTRIES.find(i => i.id === letterIndustry)?.label })}</strong>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" disabled={isLetterGenerating || !generatedLetterContent} onClick={improveLetter}>{t("letImproveBtn", "✨ Améliorer")}</button>
                      <button className="btn btn-secondary btn-sm" disabled={!generatedLetterContent} onClick={() => { navigator.clipboard.writeText(generatedLetterContent); openModal(t('compris', 'Copiée !'), t('dashActivityWaveLetter', 'Le contenu de la lettre a été copié dans le presse-papier.'), 'success'); }}>{t("letCopyBtn", "Copier")}</button>
                      <button className="btn btn-primary btn-sm" disabled={!generatedLetterContent} onClick={downloadLetter}>{t("letDownloadBtn", "Télécharger PDF ↓")}</button>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--light-text-muted)', margin: '0 0 12px' }}>{t("letEditHint", "Tu peux modifier le texte ci-dessous avant de le copier ou le télécharger.")}</p>
                  <textarea
                    style={styles.letterPreviewArea}
                    value={generatedLetterContent}
                    onChange={(e) => setGeneratedLetterContent(e.target.value)}
                    rows={18}
                  />
                </div>
              )}

              {/* Lettres sauvegardées */}
              {letters.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '16px' }}>{t("letPreviousLetters", "📁 Lettres précédemment générées")}</h3>
                  <div style={styles.jobsList}>
                    {letters.map((letItem) => (
                      <div key={letItem.id} style={{ ...styles.jobItemCard, flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <strong>{letItem.role} chez {letItem.company}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--light-text-muted)' }}>{letItem.date}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#475569', whiteSpace: 'pre-line', maxHeight: '80px', overflow: 'hidden' }}>{letItem.content}</p>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setGeneratedLetterContent(letItem.content); window.scrollTo(0, 0); }}>{t("letReviewBtn", "Revoir cette lettre")}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: JOBS EXPLORER */}
          {currentView === 'jobs' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '30px' }}>
                <h2>{t("jobsTitle", "Explorer les offres d'emploi en temps réel")}</h2>
                <p style={{ color: 'var(--light-text-muted)' }}>
                  {t("jobsDesc", "Les recruteurs publient directement des offres de stages et CDI pour les jeunes diplômés d'Afrique.")}
                </p>
              </div>

              {/* Jobs List grid — réservé aux plans Standard / Premium */}
              {!canUseProFeatures ? (
                <div style={{ ...styles.editorSectionCard, textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{ marginBottom: '8px' }}>Réservé aux plans Standard et Premium</h3>
                  <p style={{ color: 'var(--light-text-muted)', maxWidth: '460px', margin: '0 auto 20px' }}>
                    Les offres d'emploi en temps réel et les opportunités de ta niche ne sont pas incluses dans le plan Basique. Passe au Standard pour y accéder.
                  </p>
                  <button className="btn btn-primary" onClick={() => setCurrentView('pricing')}>Passer au Standard →</button>
                </div>
              ) : jobs.length === 0 ? (
                <div style={{ ...styles.editorSectionCard, textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <h3 style={{ marginBottom: '8px' }}>{t("jobsEmptyTitle", "Aucune offre pour le moment")}</h3>
                  <p style={{ color: 'var(--light-text-muted)', maxWidth: '460px', margin: '0 auto' }}>
                    {t("jobsEmptyDesc", "De nouvelles offres d'emploi sont ajoutées automatiquement. Reviens très bientôt !")}
                  </p>
                </div>
              ) : (
              <>
                {/* Barre de recherche + filtres */}
                <div style={styles.jobsFilters} className="db-jobs-filters">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t("jobsSearchPlaceholder", "🔍 Rechercher un poste, une entreprise...")}
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    style={{ flex: 2, minWidth: '180px' }}
                  />
                  <select className="form-input" value={jobCountry} onChange={(e) => setJobCountry(e.target.value)} style={{ flex: 1, minWidth: '130px' }}>
                    <option value="all">{t("jobsAllCountries", "Tous les pays")}</option>
                    {jobCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="form-input" value={jobDomainFilter} onChange={(e) => setJobDomainFilter(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                    <option value="all">{t("jobsAllDomains", "Tous les domaines")}</option>
                    {jobDomainsList.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', margin: '0 0 16px' }}>
                  {filteredJobs.length} {filteredJobs.length > 1 ? t("jobsCountPlural", "offres") : t("jobsCountSingular", "offre")}
                  {(jobCountry !== 'all' || jobDomainFilter !== 'all' || jobSearch.trim()) ? t("jobsFiltered", " (filtré)") : ''}
                </p>

                {filteredJobs.length === 0 ? (
                  <div style={{ ...styles.editorSectionCard, textAlign: 'center', padding: '32px 24px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
                    <p style={{ color: 'var(--light-text-muted)', margin: 0 }}>{t("jobsNoMatch", "Aucune offre ne correspond à ta recherche. Essaie d'autres filtres.")}</p>
                  </div>
                ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredJobs.map((job) => (
                  <div key={job.id} style={{...styles.jobItemCard, flexDirection: 'column', alignItems: 'flex-start', padding: '24px', gap: '15px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <div style={{...styles.jobLogo, backgroundColor: job.logoBg}}>{job.logo}</div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>{job.role}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--light-text-muted)' }}>{job.company}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {job.location && <span className="cv-badge">📍 {job.location}</span>}
                      {job.contract && <span className="cv-badge">💼 {job.contract}</span>}
                      {job.salary && <span className="cv-badge">💰 {job.salary}</span>}
                    </div>

                    {job.description && (
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {job.description}
                      </p>
                    )}

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: 'auto' }}
                      disabled={!job.url}
                      onClick={() => { if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer'); }}
                    >
                      {job.url ? t("jobsApplyBtn", "Postuler") : t("jobsApplyBtnSoon", "Lien bientôt disponible")}
                    </button>
                  </div>
                ))}
                </div>
                )}
              </>
              )}
            </div>
          )}

          {/* VIEW: USER PROFILE */}
          {currentView === 'profile' && (
            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2>{t("profileTitle", "Mon Profil Candidat")}</h2>
              <p style={{ color: 'var(--light-text-muted)', marginBottom: '30px' }}>
                {t("profileDesc", "Modifie tes paramètres d'authentification et de contact.")}
              </p>

              <div style={styles.editorSectionCard}>
                {/* Photo de profil */}
                <div className="form-group">
                  <label className="form-label">Photo de profil</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '6px' }}>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    {(profilePhoto || cvData.photo) ? (
                      <img
                        src={profilePhoto || cvData.photo}
                        alt="Photo de profil"
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '800', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '👤'}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => photoInputRef.current?.click()}>📷 Changer la photo</button>
                      {(profilePhoto || cvData.photo) && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ border: 'none', color: '#ef4444' }} onClick={() => { setProfilePhoto(null); updateCV('photo', null); }}>Supprimer</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profileNameLabel", "Prénom & Nom")}</label>
                  <input type="text" className="form-input" value={`${firstName} ${lastName}`} readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profileEmailLabel", "Adresse email")}</label>
                  <input type="email" className="form-input" value={userEmail} readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profileCountryLabel", "Pays")}</label>
                  <input type="text" className="form-input" value={userCountry} readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profilePhoneLabel", "Téléphone")}</label>
                  <input type="text" className="form-input" value={userPhone} readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profilePlanLabel", "Plan d'abonnement actuel")}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <span className="cv-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', padding: '6px 12px' }}>
                      {plan === 'basique' ? '🥉 Plan Basique' : plan === 'standard' ? '⭐ Plan Standard' : '👑 Plan Premium (6 mois)'}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('pricing')}>{t("profileChangePlanBtn", "Changer de plan")}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: APPLICATIONS */}
          {currentView === 'applications' && (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2>{t("appsTitle", "Mes Candidatures Envoyées")}</h2>
              <p style={{ color: 'var(--light-text-muted)', marginBottom: '30px' }}>
                {t("appsDesc", "Suivi en temps réel des CVs consultés par les recruteurs partenaires.")}
              </p>

              <div style={styles.jobsList}>
                {applications.map((app) => (
                  <div key={app.id} style={styles.jobItemCard}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{app.role} chez {app.company}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--light-text-muted)', margin: '4px 0 0 0' }}>
                        📍 {app.location} • {t("appsSentOn", "Envoyé le {date}", { date: translateDate(app.date) })}
                      </p>
                    </div>
                    <span 
                      className="cv-badge" 
                      style={{
                        backgroundColor: app.status === 'Consultée' ? 'var(--primary-light)' : '#f1f5f9',
                        color: app.status === 'Consultée' ? 'var(--primary)' : '#475569',
                        fontWeight: 'bold',
                        padding: '6px 12px'
                      }}
                    >
                      {app.status === 'Consultée' ? t("statusConsulted", "Consultée") : t("statusSent", "Envoyée")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SUPPORT (messagerie — Standard / Premium) */}
          {currentView === 'support' && (
            <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                {t("supportTitle", "Support")}
              </h2>
              <p style={{ color: 'var(--light-text-muted)', marginBottom: '24px' }}>
                {t("supportDesc", "Une question, un blocage, une suggestion ? Écris-nous, notre équipe te répond directement ici.")}
              </p>

              {!canUseProFeatures ? (
                <div style={{ ...styles.editorSectionCard, textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{ marginBottom: '8px' }}>{t("supportLockedTitle", "Le support est inclus dans les plans Standard et Premium")}</h3>
                  <p style={{ color: 'var(--light-text-muted)', maxWidth: '460px', margin: '0 auto 20px' }}>
                    {t("supportLockedDesc", "Passe au plan Standard pour échanger directement avec notre équipe.")}
                  </p>
                  <button className="btn btn-primary" onClick={() => setCurrentView('pricing')}>{t("supportLockedBtn", "Passer au Standard →")}</button>
                </div>
              ) : (
                <div style={styles.editorSectionCard}>
                  <div style={styles.supportThread}>
                    {supportLoading ? (
                      <p style={{ color: 'var(--light-text-muted)', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>{t("supportLoading", "Chargement...")}</p>
                    ) : supportMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--light-text-muted)', fontSize: '13px', padding: '24px 8px' }}>
                        {t("supportEmpty", "Aucun message pour l'instant. Pose ta première question ci-dessous 👇")}
                      </div>
                    ) : (
                      supportMessages.map((m) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '78%',
                            padding: '10px 14px',
                            borderRadius: '14px',
                            fontSize: '13px',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            backgroundColor: m.sender === 'user' ? 'var(--primary)' : '#f1f5f9',
                            color: m.sender === 'user' ? '#fff' : '#1f2937',
                            borderBottomRightRadius: m.sender === 'user' ? '4px' : '14px',
                            borderBottomLeftRadius: m.sender === 'user' ? '14px' : '4px',
                          }}>
                            {m.sender === 'admin' && <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', marginBottom: '3px' }}>MonFuturBoulot · Équipe</div>}
                            {m.body}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={sendSupportMessage} style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'flex-end' }}>
                    <textarea
                      className="form-input"
                      placeholder={t("supportPlaceholder", "Écris ton message...")}
                      value={supportInput}
                      onChange={(e) => setSupportInput(e.target.value)}
                      rows={2}
                      style={{ flex: 1, resize: 'vertical', padding: '10px 12px' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={supportSending || !supportInput.trim()} style={{ flexShrink: 0 }}>
                      {supportSending ? t("supportSending", "Envoi...") : t("supportSend", "Envoyer")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* VIEW: PRICING */}
          {currentView === 'pricing' && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <span style={styles.sectionLabel}>{t("priceAbonnements", "ABONNEMENTS")}</span>
                <h2 style={{ fontSize: '30px', marginBottom: '12px' }}>{t("priceTitle", "Choisis le plan qui correspond à tes ambitions")}</h2>
                <p style={{ color: 'var(--light-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                  {t("priceDesc", "Commence gratuitement, puis débloque tout pour décrocher ton job plus vite.")}
                </p>
              </div>

              <div className="db-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '980px', margin: '0 auto' }}>

                {/* Plan Basique */}
                <div style={{ ...styles.priceCard, border: '1px solid var(--dark-border)' }}>
                  <span style={styles.planName}>BASIQUE</span>
                  <div style={styles.priceContainer}>
                    <span style={styles.priceAmount}>2 500</span>
                    <span style={styles.priceCurrency}>FCFA/mois</span>
                  </div>
                  <p style={styles.priceCaption}>L'essentiel pour préparer ta candidature</p>
                  <div style={styles.cardBtn}>
                    <CheckoutButton plan="basique" primary={false} />
                  </div>
                  <ul style={styles.featuresList}>
                    <li style={{ color: 'var(--dark-text-muted)' }}>✓ CV performants illimités</li>
                    <li style={{ color: 'var(--dark-text-muted)' }}>✓ Lettres de motivation illimitées</li>
                    <li style={{ color: '#ef4444', fontSize: '12px' }}>✗ <span style={{ textDecoration: 'line-through' }}>Offres d'emploi en temps réel</span></li>
                    <li style={{ color: '#ef4444', fontSize: '12px' }}>✗ <span style={{ textDecoration: 'line-through' }}>Opportunités de ta niche</span></li>
                    <li style={{ color: '#ef4444', fontSize: '12px' }}>✗ <span style={{ textDecoration: 'line-through' }}>Analyse ATS avancée</span></li>
                  </ul>
                </div>

                {/* Plan Standard */}
                <div style={{ ...styles.priceCard, border: '2px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '18px', right: '-30px', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '4px 40px', transform: 'rotate(45deg)', letterSpacing: '0.05em' }}>RECOMMANDÉ</div>
                  <span style={{ ...styles.planName, color: 'var(--primary)' }}>STANDARD</span>
                  <div style={styles.priceContainer}>
                    <span style={styles.priceAmount}>5 000</span>
                    <span style={styles.priceCurrency}>FCFA/mois</span>
                  </div>
                  <p style={styles.priceCaption}>Flexibilité totale, sans engagement</p>
                  <div style={styles.cardBtn}>
                    <CheckoutButton plan="standard" />
                  </div>
                  <ul style={styles.featuresList}>
                    <li style={{ color: '#fff' }}>✓ CV performants illimités</li>
                    <li style={{ color: '#fff' }}>✓ Lettres de motivation illimitées</li>
                    <li style={{ color: '#fff' }}>✓ Modifications illimitées</li>
                    <li style={{ color: '#fff' }}>✓ Toutes les offres d'emploi</li>
                    <li style={{ color: '#fff' }}>✓ Nouvelles opportunités de ta niche</li>
                    <li style={{ color: '#fff' }}>✓ Analyse ATS avancée du CV (Score)</li>
                    <li style={{ color: '#fff' }}>✓ Support prioritaire par WhatsApp</li>
                  </ul>
                </div>

                {/* Plan Premium */}
                <div style={{ ...styles.priceCard, border: '2px solid #a855f7', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '18px', right: '-30px', backgroundColor: '#a855f7', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '4px 40px', transform: 'rotate(45deg)', letterSpacing: '0.05em' }}>BEST VALUE</div>
                  <span style={{ ...styles.planName, color: '#c084fc' }}>PREMIUM</span>
                  <div style={styles.priceContainer}>
                    <span style={styles.priceAmount}>15 000</span>
                    <span style={styles.priceCurrency}>FCFA</span>
                  </div>
                  <p style={styles.priceCaption}>6 mois — soit 2 500 FCFA/mois (−50%)</p>
                  <div style={styles.cardBtn}>
                    <CheckoutButton plan="premium" primary={false} />
                  </div>
                  <ul style={styles.featuresList}>
                    <li style={{ color: '#fff' }}>✓ Tout ce qu'inclut le plan Standard</li>
                    <li style={{ color: '#c084fc', fontWeight: '700' }}>⭐ Engagement 6 mois — 2 500 FCFA/mois</li>
                    <li style={{ color: '#c084fc', fontWeight: '700' }}>⭐ Accès prioritaire aux opportunités de ta niche</li>
                    <li style={{ color: '#c084fc', fontWeight: '700' }}>⭐ Relecture humaine du CV</li>
                  </ul>
                </div>

              </div>

              {/* Savings callout */}
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <div style={{ display: 'inline-block', padding: '16px 28px', backgroundColor: 'var(--dark-card)', border: '1px solid #a855f7', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ color: 'var(--dark-text-muted)', fontSize: '13px', margin: 0 }}>
                    💡 Conseil : le plan Premium (6 mois) revient à 2 500 FCFA/mois, soit le prix du Basique mais avec tout l'accès du Standard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ESPACE ADMIN */}
          {currentView === 'admin' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '30px' }}>
                <span style={styles.sectionLabel}>{t("adminSectionLabel", "ESPACE ADMINISTRATEUR")}</span>
                <h2>{t("adminTitle", "Gestion de la Plateforme")}</h2>
                <p style={{ color: 'var(--light-text-muted)' }}>{t("adminDesc", "Ajoutez et gérez les offres d'emploi disponibles pour les candidats.")}</p>
              </div>

              {/* Admin Stats */}
              <div className="db-admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={{ ...styles.statCard, borderLeft: '4px solid var(--primary)' }}>
                  <div style={styles.statHeader}><span>{t("adminJobsActive", "Offres d'emploi actives")}</span></div>
                  <div style={styles.statNumber}>{jobs.length}</div>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #a855f7' }}>
                  <div style={styles.statHeader}><span>{t("adminApplicationsReceived", "Candidatures reçues")}</span></div>
                  <div style={styles.statNumber}>{applications.length}</div>
                </div>
              </div>

              <div className="db-admin-cols" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

                {/* Jobs Management */}
                <div>
                  <div style={styles.editorSectionCard}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>{t("adminPublishJob", "➕ Publier une nouvelle offre d'emploi")}</h3>
                    <form onSubmit={handleAdminAddJob} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder={t("adminJobRole", "Titre du poste *")} className="form-input" value={adminJobRole} onChange={e => setAdminJobRole(e.target.value)} required />
                        <input type="text" placeholder={t("adminJobCompany", "Entreprise *")} className="form-input" value={adminJobCompany} onChange={e => setAdminJobCompany(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder={t("adminJobCity", "Ville (ex: Abidjan)")} className="form-input" value={adminJobLocation} onChange={e => setAdminJobLocation(e.target.value)} />
                        <input type="text" placeholder={t("adminJobSalary", "Salaire (ex: 250k FCFA)")} className="form-input" value={adminJobSalary} onChange={e => setAdminJobSalary(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select className="form-input" value={adminJobContract} onChange={e => setAdminJobContract(e.target.value)}>
                          <option value="CDI">{t("adminContractCDI", "CDI")}</option>
                          <option value="CDD">{t("adminContractCDD", "CDD")}</option>
                          <option value="Stage">{t("adminContractStage", "Stage")}</option>
                          <option value="Freelance">{t("adminContractFreelance", "Freelance")}</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--light-text-muted)', whiteSpace: 'nowrap' }}>{t("adminJobLogoBgLabel", "Couleur logo :")}</label>
                          {['#00b87c', '#ff6600', '#0066cc', '#a855f7', '#ef4444'].map(color => (
                            <button key={color} type="button" onClick={() => setAdminJobLogoBg(color)} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color, border: adminJobLogoBg === color ? '3px solid #0f172a' : '2px solid #fff', cursor: 'pointer' }} />
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm">{t("adminPublishBtn", "Publier l'offre →")}</button>
                    </form>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '15px' }}>{t("adminPublishedJobs", "📋 Offres publiées ({count})", { count: jobs.length })}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {jobs.map(job => (
                        <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: job.logoBg, color: '#fff', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{job.logo}</div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '13px' }}>{job.role}</strong>
                            <p style={{ fontSize: '11px', color: 'var(--light-text-muted)', margin: 0 }}>{job.company} • {job.location} • {translateContract(job.contract)}</p>
                          </div>
                          <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => deleteJob(job.id)}>{t("adminJobDeleteBtn", "Supprimer")}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {currentView === 'settings' && (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '4px' }}>{t("settingsTitle", "⚙️ Paramètres du compte")}</h2>
                <p style={{ color: 'var(--light-text-muted)', fontSize: '14px' }}>{t("settingsDesc", "Gère tes préférences, abonnements et sécurité.")}</p>
              </div>

              <div style={{ backgroundColor: 'var(--light-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--light-border)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--light-border)', paddingBottom: '10px' }}>{t("settingsGeneral", "Général")}</h3>
                
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{t("settingsLang", "Langue")}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--light-text-muted)' }}>{t("settingsLangDesc", "Langue de l'interface")}</span>
                  </div>
                  <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--light-border)', minWidth: '150px' }}>
                    <option value="fr">{lang === 'en' ? 'French' : 'Français'}</option>
                    <option value="en">{lang === 'en' ? 'English' : 'Anglais'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{t("settingsDarkMode", "Mode Sombre")}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--light-text-muted)' }}>{t("settingsDarkModeDesc", "Activer le thème sombre sur le tableau de bord")}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? t("settingsDarkModeDisable", "Désactiver") : t("settingsDarkModeEnable", "Activer")}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--light-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--light-border)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--light-border)', paddingBottom: '10px' }}>{t("settingsNotifications", "Notifications")}</h3>
                
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="notif1" defaultChecked />
                  <label htmlFor="notif1" style={{ fontSize: '14px' }}>{t("settingsNotifOffers", "M'alerter lors de nouvelles offres d'emploi correspondantes")}</label>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="notif2" defaultChecked />
                  <label htmlFor="notif2" style={{ fontSize: '14px' }}>{t("settingsNotifWeekly", "Conseils hebdomadaires pour ma recherche d'emploi")}</label>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="notif3" />
                  <label htmlFor="notif3" style={{ fontSize: '14px' }}>{t("settingsNotifPartners", "Offres de nos partenaires")}</label>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--light-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--error)', borderLeft: '4px solid var(--error)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--error)' }}>{t("settingsDanger", "Zone Danger")}</h3>
                <p style={{ fontSize: '13px', color: 'var(--light-text-muted)', marginBottom: '15px' }}>
                  {t("settingsDangerDesc", "La suppression de ton compte est définitive. Toutes tes candidatures, CVs et lettres générées seront perdus.")}
                </p>
                <button className="btn btn-outline-dark btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => openModal(t('settingsDeleteBtn', 'Supprimer mon compte'), t('settingsDangerDesc', 'La suppression de ton compte est définitive. Toutes tes candidatures, CVs et lettres générées seront perdus.'), 'warning')}>
                  {t("settingsDeleteBtn", "Supprimer mon compte")}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CUSTOM MODAL OVERLAY */}
      {modalConfig.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalHeader, 
              borderBottomColor: modalConfig.type === 'success' ? 'var(--success)' : modalConfig.type === 'warning' ? 'var(--warning)' : 'var(--primary)'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {modalConfig.type === 'success' && '✅'}
                {modalConfig.type === 'warning' && '⚠️'}
                {modalConfig.type === 'info' && 'ℹ️'}
                {modalConfig.title}
              </h3>
              <button onClick={closeModal} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p>{modalConfig.message}</p>
            </div>
            <div style={styles.modalFooter}>
              {modalConfig.type === 'logout_confirm' ? (
                <>
                  <button className="btn btn-secondary" onClick={closeModal} style={{ marginRight: '10px' }}>{t("annuler", "Annuler")}</button>
                  <button className="btn btn-primary" onClick={logout}>{t("seDeconnecter", "Se déconnecter")}</button>
                </>
              ) : modalConfig.type === 'warning' ? (
                <>
                  <button className="btn btn-secondary" onClick={closeModal} style={{ marginRight: '10px' }}>{t("annuler", "Annuler")}</button>
                  <button className="btn btn-primary" onClick={closeModal}>{t("compris", "Compris")}</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={closeModal}>{t("compris", "Compris")}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RENOUVELLEMENT (J-3 / J-2) */}
      {showRenewModal && renewActive && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalHeader, borderBottomColor: 'var(--warning)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏳ {renewDaysLeft <= 1 ? 'Ton abonnement expire demain' : `Plus que ${renewDaysLeft} jours d'accès`}
              </h3>
              <button onClick={dismissRenewModal} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: 0 }}>
                Ton abonnement <strong>{accessPlan || ''}</strong> se termine {renewDaysLeft <= 1 ? 'demain' : `dans ${renewDaysLeft} jours`}.
                Renouvelle-le maintenant pour continuer à créer tes CV, tes lettres et accéder aux offres sans interruption.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button className="btn btn-secondary" onClick={dismissRenewModal} style={{ marginRight: '10px' }}>Plus tard</button>
              <Link href="/pricing?renew=1" className="btn btn-primary" onClick={dismissRenewModal}>Renouveler mon abonnement</Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  dashboardLayout: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--light-card)',
    borderRight: '1px solid var(--light-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    flexShrink: 0
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px'
  },
  logoDot: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  brandText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a'
  },
  sidebarSectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--light-text-muted)',
    letterSpacing: '0.05em',
    margin: '20px 0 10px 0'
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--light-text-muted)',
    fontWeight: '500',
    fontSize: '14px',
    border: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'var(--transition)'
  },
  sidebarLinkActive: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: '600'
  },
  upgradeBanner: {
    marginTop: 'auto',
    backgroundColor: '#0c1220',
    padding: '16px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--dark-border)'
  },
  mainWrapper: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    maxHeight: '100vh'
  },
  topbar: {
    height: '70px',
    backgroundColor: 'var(--light-card)',
    borderBottom: '1px solid var(--light-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    flexShrink: 0
  },
  topbarSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--light-text-muted)',
    width: '350px'
  },
  searchField: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#0f172a'
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBtn: {
    border: '1px solid var(--light-border)',
    background: 'var(--light-card)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px'
  },
  userProfilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--light-border)',
    backgroundColor: '#fff'
  },
  userAvatarSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userProfileMeta: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a'
  },
  userLocation: {
    fontSize: '10px',
    color: 'var(--light-text-muted)'
  },
  viewContent: {
    padding: '30px',
    flexGrow: 1
  },
  welcomeCard: {
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    boxShadow: 'var(--shadow-sm)'
  },
  gaugeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingLeft: '30px',
    borderLeft: '1px solid var(--light-border)'
  },
  gaugeCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '6px solid var(--primary-light)',
    borderTopColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--light-text-muted)',
    fontWeight: '600'
  },
  statTag: {
    fontSize: '10px',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '700'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--light-text)',
    marginTop: '10px'
  },
  dashboardSplit: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  splitColLeft: {
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)'
  },
  splitColRight: {
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)'
  },
  widgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--light-border)',
    paddingBottom: '10px'
  },
  widgetHeaderLink: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  jobItemCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--light-border)',
    backgroundColor: 'var(--light-card)',
    gap: '12px'
  },
  jobLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '800',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifycontent: 'center',
    flexShrink: 0
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  feedItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  feedCheckIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
    marginTop: '2px'
  },
  feedText: {
    fontSize: '13px',
    color: '#334155',
    margin: 0
  },
  feedTime: {
    fontSize: '11px',
    color: 'var(--light-text-muted)'
  },
  bottomActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  bottomActionCard: {
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition)'
  },
  bottomActionCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-md)'
  },
  actionIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '12px'
  },
  cvTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '20px'
  },
  stepperContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 30px',
    marginBottom: '30px'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifycontent: 'center',
    fontWeight: '700',
    fontSize: '12px'
  },
  stepText: {
    fontSize: '11px',
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
    maxHeight: 'calc(100vh - 120px)',
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
    backgroundColor: 'var(--light-card)',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)'
  },
  editorCardTitle: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#0f172a'
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
    backgroundColor: 'var(--light-bg)',
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
    backgroundColor: 'var(--light-card)',
    color: 'var(--light-text)',
    boxShadow: 'var(--shadow-sm)'
  },
  atsCard: {
    backgroundColor: 'var(--light-card)',
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
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '0.15em',
    display: 'block',
    marginBottom: '8px'
  },
  letterPreviewArea: {
    fontFamily: 'inherit',
    whiteSpace: 'pre-wrap',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.6',
    width: '100%',
    minHeight: '320px',
    padding: '14px 16px',
    border: '1px solid var(--light-border)',
    borderRadius: 'var(--radius-md)',
    background: '#fff',
    resize: 'vertical'
  },
  priceCard: {
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  planName: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--dark-text-muted)',
    letterSpacing: '0.1em',
    marginBottom: '5px',
    display: 'block'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '10px'
  },
  priceAmount: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    whiteSpace: 'nowrap'
  },
  priceCurrency: {
    fontSize: '14px',
    color: 'var(--dark-text-muted)',
    marginLeft: '4px'
  },
  priceCaption: {
    fontSize: '12px',
    color: 'var(--dark-text-muted)',
    marginBottom: '15px'
  },
  cardBtn: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px'
  },
  featuresList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--dark-text-muted)',
    marginTop: 'auto'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  mockVideoFrame: {
    height: '240px',
    backgroundColor: '#05070a',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--dark-text-muted)'
  },
  avatarLarge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  rowInputs: {
    display: 'flex',
    gap: '16px'
  },
  jobsFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '14px',
  },
  supportThread: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '440px',
    overflowY: 'auto',
    padding: '4px',
  },
  renewBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'linear-gradient(90deg, #fff7ed, #ffedd5)',
    border: '1px solid #fdba74',
    borderRadius: '14px',
    padding: '14px 16px',
    marginBottom: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 3000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '18px 20px',
    borderBottom: '2px solid var(--primary)'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    flexShrink: 0
  },
  modalBody: {
    padding: '20px',
    fontSize: '14px',
    lineHeight: 1.55,
    color: '#475569'
  },
  modalFooter: {
    padding: '14px 20px 18px',
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '8px',
    borderTop: '1px solid #eef2f7'
  }
};
