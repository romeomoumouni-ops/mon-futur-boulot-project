'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const AppContext = createContext();

// Analyse ATS réelle, basée sur le contenu effectif du CV.
// Retourne un score /100 + une checklist d'actions concrètes.
export const computeAts = (cv = {}) => {
  const skills = cv.skills || [];
  const langs = cv.languages || [];
  const exps = cv.experiences || [];
  const edus = cv.educations || [];
  const hasDetailedExp = exps.some((e) => (e.desc || '').trim().length >= 40);
  const hasQuantified = [...exps.map((e) => e.desc || ''), cv.summary || ''].some((txt) => /\d/.test(txt));

  const items = [
    { key: 'title', label: 'Titre professionnel clair', points: 10,
      done: !!(cv.title && cv.title.trim().length > 2),
      advice: 'Ajoute un titre de poste précis (ex : « Développeur web junior »).' },
    { key: 'contact', label: 'Coordonnées complètes (email + téléphone)', points: 10,
      done: !!(cv.email && cv.phone),
      advice: 'Renseigne ton email et ton téléphone dans la section Coordonnées.' },
    { key: 'summary', label: 'Résumé professionnel percutant', points: 15,
      done: !!(cv.summary && cv.summary.trim().length >= 60),
      advice: "Rédige un résumé d'au moins 2 phrases (60 caractères ou plus)." },
    { key: 'exp', label: 'Au moins une expérience', points: 15,
      done: exps.length >= 1,
      advice: 'Ajoute une expérience : stage, projet, job étudiant ou bénévolat.' },
    { key: 'expDetail', label: 'Expérience décrite en détail', points: 10,
      done: hasDetailedExp,
      advice: 'Décris tes missions et résultats (40 caractères min.) sur au moins une expérience.' },
    { key: 'quantified', label: 'Résultats chiffrés', points: 10,
      done: hasQuantified,
      advice: 'Ajoute des chiffres concrets (ex : « +20% de ventes », « 50 clients gérés »).' },
    { key: 'edu', label: 'Formation renseignée', points: 10,
      done: edus.length >= 1,
      advice: 'Ajoute au moins un diplôme ou une formation.' },
    { key: 'skills', label: 'Au moins 5 compétences', points: 10,
      done: skills.length >= 5,
      advice: `Ajoute tes compétences clés (${skills.length}/5).` },
    { key: 'langs', label: 'Au moins 2 langues', points: 10,
      done: langs.length >= 2,
      advice: `Indique les langues que tu parles (${langs.length}/2).` },
  ];

  const score = items.reduce((s, i) => s + (i.done ? i.points : 0), 0);
  return { score, checklist: items };
};

export const AppProvider = ({ children }) => {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  
  // CV vierge par défaut (aucune donnée de démo). Pré-rempli avec le compte à l'inscription.
  const defaultCV = {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    summary: '',
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    template: 'modern', // 'modern', 'classic', 'creative'
  };

  // Aucune offre de démo : les offres réelles seront gérées par l'admin.
  const initialJobs = [];

  const [user, setUser] = useState(null);
  const [cvData, setCvData] = useState(defaultCV);
  const [jobs, setJobs] = useState(initialJobs);
  const [applications, setApplications] = useState([]);
  const [letters, setLetters] = useState([]);
  const [plan, setPlan] = useState('standard'); // 'basique', 'standard', 'premium'
  const [accessPlan, setAccessPlan] = useState(null); // plan effectif côté serveur (abonnement réel)
  const [accessExpiresAt, setAccessExpiresAt] = useState(null); // fin d'accès (null = illimité)
  const [isAdmin, setIsAdmin] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [atsChecklist, setAtsChecklist] = useState([]);
  const [stats, setStats] = useState({
    cvsCreated: 0,
    lettersGenerated: 0,
    applicationsSent: 0,
    interviewsObtained: 0,
  });

  // Données locales (CV, lettres, candidatures) — conservées par navigateur pour le MVP.
  useEffect(() => {
    const savedCV = localStorage.getItem('mfb_cv_v2');
    const savedApps = localStorage.getItem('mfb_apps_v2');
    const savedLetters = localStorage.getItem('mfb_letters_v2');
    if (savedCV) setCvData(JSON.parse(savedCV));
    if (savedApps) setApplications(JSON.parse(savedApps));
    if (savedLetters) setLetters(JSON.parse(savedLetters));
  }, []);

  // Offres d'emploi réelles depuis Supabase (alimentées par le cron JSearch)
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase
      .from('jobs')
      .select('id, role, company, location, contract, salary, logo, logo_bg, url, description, country, created_at')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (active && data) setJobs(data.map((j) => ({ ...j, logoBg: j.logo_bg })));
      });
    return () => { active = false; };
  }, [user, supabase]);

  // Session réelle Supabase (auth) + plan effectif + CV du compte
  useEffect(() => {
    const applySession = async (session) => {
      const u = session?.user;
      if (!u) {
        setUser(null);
        setAccessPlan(null);
        setAccessExpiresAt(null);
        setIsAdmin(false);
        return;
      }
      const meta = u.user_metadata || {};
      setUser({
        id: u.id,
        email: u.email,
        firstName: meta.first_name || '',
        lastName: meta.last_name || '',
        phone: meta.phone || '',
        country: meta.country || '',
        city: meta.city || '',
      });

      // Plan effectif (abonnement réel côté serveur)
      try {
        const { data: ap } = await supabase.rpc('current_access_plan');
        setAccessPlan(ap || null);
      } catch { setAccessPlan(null); }

      // Fin d'accès (pour les rappels de renouvellement en J-3/J-2)
      try {
        const { data: exp } = await supabase.rpc('current_access_expiry');
        setAccessExpiresAt(exp || null);
      } catch { setAccessExpiresAt(null); }

      // Admin ?
      try {
        const { data: adm } = await supabase.rpc('is_admin');
        setIsAdmin(adm === true);
      } catch { setIsAdmin(false); }

      // CV du compte (multi-appareils) : on charge depuis Supabase s'il existe
      try {
        const { data: row } = await supabase
          .from('user_cvs')
          .select('data')
          .eq('user_id', u.id)
          .maybeSingle();
        if (row?.data) {
          setCvData(row.data);
          saveState('mfb_cv_v2', row.data);
        }
        cvLoadedRef.current = true;
      } catch { cvLoadedRef.current = true; }
    };
    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => applySession(session));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Sauvegarde du CV dans le compte (Supabase), avec anti-rebond, dès qu'il change.
  const cvLoadedRef = React.useRef(false);
  useEffect(() => {
    if (!user?.id || !cvLoadedRef.current) return;
    const t = setTimeout(() => {
      supabase
        .from('user_cvs')
        .upsert({ user_id: user.id, data: cvData, updated_at: new Date().toISOString() })
        .then(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [cvData, user, supabase]);

  // Save changes to localStorage helper (résilient : un quota dépassé ne doit pas
  // casser la mise à jour ni bloquer la sauvegarde Supabase).
  const saveState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[localStorage] sauvegarde ignorée (quota ?)', key);
    }
  };

  // Auth réelle (Supabase). Retournent { error } | { ok, needsConfirmation? }.
  const registerUser = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || '',
          country: userData.country || '',
          city: userData.city || '',
        },
      },
    });
    if (error) return { error: error.message };

    // Pré-remplit le CV local avec le nom saisi
    const updatedCV = {
      ...cvData,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone || cvData.phone,
      address: `${userData.city || 'Abidjan'}, ${userData.country || 'Côte d\'Ivoire'}`,
    };
    setCvData(updatedCV);
    saveState('mfb_cv_v2', updatedCV);

    if (data.session) {
      // Compte créé + connecté immédiatement -> doit choisir un plan (bandeau de bienvenue)
      router.push('/pricing?welcome=1');
      return { ok: true };
    }
    // Confirmation e-mail requise par Supabase
    return { ok: true, needsConfirmation: true };
  };

  const loginUser = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // Le middleware redirige vers /pricing si aucun abonnement actif
    router.push('/dashboard');
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  // CV Operations
  const updateCV = (field, value) => {
    const updated = { ...cvData, [field]: value };
    setCvData(updated);
    saveState('mfb_cv_v2', updated);
    recalculateATS(updated);
  };

  const addCVItem = (section, item) => {
    const updated = {
      ...cvData,
      [section]: [...cvData[section], { id: Date.now(), ...item }]
    };
    setCvData(updated);
    saveState('mfb_cv_v2', updated);
    recalculateATS(updated);
  };

  const updateCVItem = (section, id, updatedItem) => {
    const updated = {
      ...cvData,
      [section]: cvData[section].map(item => item.id === id ? { ...item, ...updatedItem } : item)
    };
    setCvData(updated);
    saveState('mfb_cv_v2', updated);
    recalculateATS(updated);
  };

  const deleteCVItem = (section, id) => {
    const updated = {
      ...cvData,
      [section]: cvData[section].filter(item => item.id !== id)
    };
    setCvData(updated);
    saveState('mfb_cv_v2', updated);
    recalculateATS(updated);
  };

  const changeTemplate = (templateName) => {
    const updated = { ...cvData, template: templateName };
    setCvData(updated);
    saveState('mfb_cv_v2', updated);
  };

  // ATS Score Calculator — analyse réelle du contenu du CV
  const recalculateATS = (cv) => {
    const { score, checklist } = computeAts(cv);
    setAtsScore(score);
    setAtsChecklist(checklist);
  };

  // Recalcule le score ATS à chaque changement du CV (y compris au chargement initial)
  useEffect(() => {
    recalculateATS(cvData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvData]);

  // Cover Letter Operations
  const createCoverLetter = (letterData) => {
    const newLetter = {
      id: Date.now(),
      company: letterData.company,
      role: letterData.role,
      date: 'Aujourd\'hui - en temps réel',
      content: letterData.content
    };
    const updated = [newLetter, ...letters];
    setLetters(updated);
    saveState('mfb_letters_v2', updated);
    
    // Increment letter stats
    setStats(prev => ({ ...prev, lettersGenerated: prev.lettersGenerated + 1 }));
  };

  // Job Application
  const applyJob = (job) => {
    const newApp = {
      id: Date.now(),
      role: job.role,
      company: job.company,
      location: job.location,
      date: 'À l\'instant',
      status: 'Envoyée'
    };
    const updated = [newApp, ...applications];
    setApplications(updated);
    saveState('mfb_apps_v2', updated);
    
    // Increment application stats
    setStats(prev => ({ ...prev, applicationsSent: prev.applicationsSent + 1 }));
  };

  // Admin Job Operations
  const addJob = (job) => {
    const newJob = {
      id: Date.now(),
      role: job.role,
      company: job.company,
      location: job.location,
      contract: job.contract || 'CDI',
      salary: job.salary || 'Non spécifié',
      logo: job.logo || job.company[0],
      logoBg: job.logoBg || '#00b87c'
    };
    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveState('mfb_jobs_v2', updated);
  };

  const deleteJob = (id) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    saveState('mfb_jobs_v2', updated);
  };

  // Subscription
  const selectPlan = (planTier) => {
    setPlan(planTier);
    localStorage.setItem('mfb_plan', planTier);
  };

  // ---- Accès ----
  // Plus de plan gratuit : toute personne connectée a un accès illimité.
  // On conserve ces helpers (no-op) pour ne pas casser les composants existants.
  const isPremium = true;
  const canUse = () => true;
  const remaining = () => Infinity;
  const consume = () => true;

  return (
    <AppContext.Provider value={{
      user,
      cvData,
      jobs,
      applications,
      letters,
      plan,
      atsScore,
      atsChecklist,
      stats,
      supabase,
      registerUser,
      loginUser,
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
      // Accès / abonnement réel
      isPremium,
      canUse,
      remaining,
      consume,
      accessPlan, // 'basique' | 'standard' | 'premium' | null
      accessExpiresAt, // ISO string | null (null = accès illimité)
      isAdmin,
      canUseProFeatures: accessPlan === 'standard' || accessPlan === 'premium'
    }}>
      {children}
    </AppContext.Provider>
  );
};
