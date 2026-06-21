'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  
  // Simulated initial values based on user screenshots (Aminata Diallo)
  const defaultCV = {
    firstName: 'Aminata',
    lastName: 'Diallo',
    title: 'Marketing Digital Junior',
    email: 'aminata.diallo@gmail.com',
    phone: '+225 07 12 34 56 78',
    address: 'Abidjan, Côte d\'Ivoire',
    linkedin: 'in/aminata-d',
    summary: 'Jeune diplômée passionnée par le marketing digital, expérimentée en gestion de réseaux sociaux et création de contenu impactant.',
    experiences: [
      {
        id: 1,
        role: 'Stage Marketing',
        company: 'Wave CI',
        location: 'Abidjan',
        period: 'Juin - Sept 2025',
        desc: '• Géré la stratégie réseaux sociaux (+15k followers en 3 mois)\n• Créé 80+ visuels Canva pour campagnes promotionnelles\n• Analysé KPI avec Google Analytics et reporting hebdo\n• Coordonné 3 campagnes promo (+22% engagement)'
      },
      {
        id: 2,
        role: 'Community Manager Freelance',
        company: 'Plusieurs clients',
        location: 'Abidjan',
        period: 'Jan - Mai 2025',
        desc: '• Géré 4 comptes Instagram et TikTok pour PME locales\n• Élaboré des calendriers éditoriaux mensuels\n• Augmenté l\'engagement client de 35% en moyenne'
      }
    ],
    educations: [
      {
        id: 1,
        degree: 'Licence Marketing & Communication',
        school: 'Université Félix Houphouët-Boigny',
        location: 'Abidjan',
        period: '2022 - 2025',
        desc: 'Mention Bien. Spécialisation en marketing digital et communication web.'
      }
    ],
    skills: ['SEO', 'Canva', 'Google Analytics', 'Meta Ads', 'TikTok', 'Excel', 'Copywriting'],
    languages: [
      { name: 'Français', level: 'Natif' },
      { name: 'Anglais', level: 'B2' },
      { name: 'Dioula', level: 'Courant' }
    ],
    template: 'modern' // 'modern', 'classic', 'creative'
  };

  const initialJobs = [
    {
      id: 1,
      role: 'Assistant Marketing Digital',
      company: 'Orange CI',
      location: 'Abidjan',
      contract: 'CDI',
      salary: '250k FCFA',
      logo: 'O',
      logoBg: '#ff6600'
    },
    {
      id: 2,
      role: 'Community Manager Junior',
      company: 'MTN Côte d\'Ivoire',
      location: 'Abidjan',
      contract: 'CDD',
      salary: '220k FCFA',
      logo: 'M',
      logoBg: '#ffcc00'
    },
    {
      id: 3,
      role: 'Chargée de communication',
      company: 'Wave',
      location: 'Yopougon',
      contract: 'CDI',
      salary: '280k FCFA',
      logo: 'W',
      logoBg: '#1c93e3'
    },
    {
      id: 4,
      role: 'Assistante Brand Manager',
      company: 'SOLIBRA',
      location: 'Treichville',
      contract: 'Stage',
      salary: '150k FCFA',
      logo: 'S',
      logoBg: '#00aa50'
    }
  ];

  const [user, setUser] = useState(null);
  const [cvData, setCvData] = useState(defaultCV);
  const [jobs, setJobs] = useState(initialJobs);
  const [applications, setApplications] = useState([
    { id: 1, role: 'Stage Marketing', company: 'Wave CI', location: 'Abidjan', date: 'Il y a 2 heures', status: 'Consultée' },
    { id: 2, role: 'Community Manager', company: 'Wave', location: 'Yopougon', date: 'Hier - 18h32', status: 'Envoyée' }
  ]);
  const [letters, setLetters] = useState([
    { id: 1, company: 'Wave', role: 'Community Manager', date: 'Hier - 18h32', content: 'Bonjour Wave,\n\nJe suis très intéressée par le poste de Community Manager. Avec mon expérience en freelance auprès de PME locales et mes compétences en réseaux sociaux, je saurai accroître l\'impact de votre marque en ligne...' }
  ]);
  const [plan, setPlan] = useState('standard'); // 'basique', 'standard', 'premium'
  const [accessPlan, setAccessPlan] = useState(null); // plan effectif côté serveur (abonnement réel)
  const [atsScore, setAtsScore] = useState(85);
  const [stats, setStats] = useState({
    cvsCreated: 2,
    lettersGenerated: 12,
    applicationsSent: 8,
    interviewsObtained: 3
  });

  // Données locales (CV, lettres, candidatures) — conservées par navigateur pour le MVP.
  useEffect(() => {
    const savedCV = localStorage.getItem('mfb_cv');
    const savedApps = localStorage.getItem('mfb_apps');
    const savedLetters = localStorage.getItem('mfb_letters');
    const savedJobs = localStorage.getItem('mfb_jobs');
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

      // CV du compte (multi-appareils) : on charge depuis Supabase s'il existe
      try {
        const { data: row } = await supabase
          .from('user_cvs')
          .select('data')
          .eq('user_id', u.id)
          .maybeSingle();
        if (row?.data) {
          setCvData(row.data);
          saveState('mfb_cv', row.data);
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
    saveState('mfb_cv', updatedCV);

    if (data.session) {
      // Connecté immédiatement -> doit choisir un plan d'abonnement
      router.push('/pricing');
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
    saveState('mfb_cv', updated);
    recalculateATS(updated);
  };

  const addCVItem = (section, item) => {
    const updated = {
      ...cvData,
      [section]: [...cvData[section], { id: Date.now(), ...item }]
    };
    setCvData(updated);
    saveState('mfb_cv', updated);
    recalculateATS(updated);
  };

  const updateCVItem = (section, id, updatedItem) => {
    const updated = {
      ...cvData,
      [section]: cvData[section].map(item => item.id === id ? { ...item, ...updatedItem } : item)
    };
    setCvData(updated);
    saveState('mfb_cv', updated);
    recalculateATS(updated);
  };

  const deleteCVItem = (section, id) => {
    const updated = {
      ...cvData,
      [section]: cvData[section].filter(item => item.id !== id)
    };
    setCvData(updated);
    saveState('mfb_cv', updated);
    recalculateATS(updated);
  };

  const changeTemplate = (templateName) => {
    const updated = { ...cvData, template: templateName };
    setCvData(updated);
    saveState('mfb_cv', updated);
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
    saveState('mfb_letters', updated);
    
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
    saveState('mfb_apps', updated);
    
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
    saveState('mfb_jobs', updated);
  };

  const deleteJob = (id) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    saveState('mfb_jobs', updated);
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
      canUseProFeatures: accessPlan === 'standard' || accessPlan === 'premium'
    }}>
      {children}
    </AppContext.Provider>
  );
};
