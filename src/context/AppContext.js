'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const AppContext = createContext();

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
  const [atsScore, setAtsScore] = useState(0);
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
    const savedJobs = localStorage.getItem('mfb_jobs_v2');
    if (savedCV) setCvData(JSON.parse(savedCV));
    if (savedApps) setApplications(JSON.parse(savedApps));
    if (savedLetters) setLetters(JSON.parse(savedLetters));
    if (savedJobs) setJobs(JSON.parse(savedJobs));
  }, []);

  // Session réelle Supabase (auth) + plan effectif + CV du compte
  useEffect(() => {
    const applySession = async (session) => {
      const u = session?.user;
      if (!u) {
        setUser(null);
        setAccessPlan(null);
        setAccessExpiresAt(null);
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

  // Save changes to localStorage helper
  const saveState = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
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
      // Connecté immédiatement -> doit choisir un plan d'abonnement
      router.push('/pricing?access=required');
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

  // ATS Score Calculator
  const recalculateATS = (cv) => {
    let score = 50; // base score
    if (cv.summary && cv.summary.length > 50) score += 10;
    if (cv.experiences && cv.experiences.length > 0) score += 15;
    if (cv.experiences && cv.experiences.length > 1) score += 5;
    if (cv.educations && cv.educations.length > 0) score += 10;
    if (cv.skills && cv.skills.length > 4) score += 5;
    if (cv.skills && cv.skills.length > 7) score += 5;
    
    // Random fluctuation to make it feel "computed" by an AI engine
    const finalScore = Math.min(100, score);
    setAtsScore(finalScore);
  };

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
      stats,
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
      canUseProFeatures: accessPlan === 'standard' || accessPlan === 'premium'
    }}>
      {children}
    </AppContext.Provider>
  );
};
