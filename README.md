# MonFuturBoulot.com

Plateforme tout-en-un pour aider les **jeunes diplômés d'Afrique francophone** à décrocher leur premier emploi : CV performants, lettres de motivation et offres d'emploi ciblées.

> **Positionnement** : on ne met **pas l'IA en avant**. Le discours est : *« des CV performants basés sur ce qui fonctionne réellement sur le marché de l'emploi, pour maximiser tes chances de décrocher un poste. »*

---

## 🧱 Stack technique

| Couche | Techno |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, JavaScript |
| État (temporaire) | React Context + `localStorage` (`AppContext`) |
| Base de données | **Supabase** (PostgreSQL + Auth + RLS) |
| Accès données | Supabase **directement depuis Next.js** (pas de NestJS séparé) — `@supabase/supabase-js` + `@supabase/ssr` |
| Style | CSS inline + `globals.css` (design system) |
| Langue | 100% français (sélecteur FR/EN dans le dashboard) |

**Lancement local** : `npm run dev` → http://localhost:3001 (port 3001 pour ne pas entrer en conflit avec l'autre projet « Recrute freelance » sur 3000).

---

## 💳 Modèle économique — 3 paliers payants

| Plan | Prix | Contenu |
|---|---|---|
| **Basique** | 2 500 FCFA / mois | CV + lettres de motivation illimités (sans les offres / opportunités / ATS) |
| **Standard** | 5 000 FCFA / mois | Tout le Basique + modifications illimitées, toutes les offres, opportunités de ta niche |
| **Premium** ⭐ *(le plus populaire)* | 15 000 FCFA / 6 mois (≈ 2 500/mois, −50%) | Tout le Standard + accès prioritaire aux opportunités, analyse ATS avancée, support WhatsApp prioritaire |

- **Pas de plan gratuit.** Valeurs de `plan` : `basique` / `standard` / `premium` (défaut `standard`).
- Les formations / certifications ont été **entièrement retirées** du produit.

---

## 📄 Pages

- `/` — Landing (3 fonctionnalités : CV performants, lettres qui convertissent, offres en temps réel)
- `/register` — Inscription / connexion (**email + mot de passe uniquement** ; boutons Google/Facebook retirés)
- `/pricing` — Tarifs (Mensuel + Semestriel)
- `/dashboard` — Tableau de bord (+ vues `cv`, `letters`, `jobs`, `applications`, `pricing`, `profile`, `settings`, `admin`)
- `/cv-builder` — Éditeur de CV (wizard 4 étapes, aperçu live, templates Modern/Classic/Creative, score ATS, export PDF)

---

## 🗄️ Base de données Supabase

**Projet** : « Mon future boulot project »
**ID** : `fiiuzywjytzevtaepbzm` · **Région** : eu-west-1
**URL** : `https://fiiuzywjytzevtaepbzm.supabase.co`

### Tables (schéma `public`)

| Table | Rôle |
|---|---|
| `profiles` | Profil utilisateur (1-1 avec `auth.users`). Création **automatique à l'inscription** (trigger `handle_new_user`). Champs : role (candidate/admin), plan (mensuel/semestriel), coordonnées |
| `cvs` | CV de l'utilisateur (titre, résumé, template, couleur, score ATS…) |
| `cv_experiences` · `cv_educations` · `cv_skills` · `cv_languages` | Sections détaillées du CV |
| `cover_letters` | Lettres de motivation générées |
| `jobs` | Offres d'emploi (gérées par les admins) |
| `applications` | Candidatures envoyées + statut |
| `subscriptions` | Abonnements payants |

### Sécurité (RLS activée partout)

- Chaque utilisateur ne voit / modifie **que ses propres données**.
- Les **offres** (`jobs`) sont lisibles par tous les utilisateurs connectés, mais **modifiables uniquement par les admins** (fonction `is_admin()`).
- Fonctions durcies (`search_path` fixe, exécution RPC restreinte).

### Connexion dans le code

- `.env.local` : `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé publishable).
- `src/lib/supabase/client.js` — client navigateur (composants client).
- `src/lib/supabase/server.js` — client serveur (Server Components / Actions, cookies Next 14).

---

## ✅ Dernières modifications effectuées

1. **Reprise & relance locale** du projet (corrigé un bug de compilation : clés CSS en kebab-case dans `pricing`).
2. **Retrait complet des formations** (pages, nav, dashboard, admin, FAQ, tableau comparatif).
3. **Repositionnement marketing** : suppression de la mise en avant « créé par IA » → CV performants basés sur le marché (FR + EN).
4. **Refonte des tarifs** : Mensuel 5 000 / Semestriel 15 000 ; suppression de l'annuel.
5. **Suppression du plan gratuit** et de tout le système de crédits → **100% payant, accès illimité pour tous**.
6. **Connexion à Supabase** : création de toute la base (tables + RLS + auth trigger) et branchement du client Next.js.
7. **Inscription simplifiée** : retrait des boutons **Google** et **Facebook** → email + mot de passe uniquement.

---

## 🔜 Prochaines étapes

> ⚠️ L'application fonctionne **encore en `localStorage`** (via `AppContext`). La base Supabase est prête mais pas encore branchée à la logique métier.

1. **Auth réelle** : brancher `/register` (email + mot de passe) sur **Supabase Auth** + middleware de session.
2. **Migration des données** : remplacer la lecture/écriture `localStorage` par des requêtes Supabase (CV, lettres, candidatures, profil).
3. **Espace admin** : connecter la gestion des offres à la table `jobs`.
4. **Paiement** : écran de choix de plan + intégration paiement (Wave / Orange Money / carte).

---

## 🚀 Déploiement automatique (règle du projet)

- Le repo GitHub `romeomoumouni-ops/mon-futur-boulot-project` est relié à **Vercel** → **chaque push sur `main` déclenche un redéploiement automatique** sur le domaine `monfuturboulot.com`.
- **Règle de travail** : chaque modification validée est **committée puis poussée automatiquement** sur `main` → elle devient visible en ligne sans action manuelle.
- Authentification : un jeton GitHub est enregistré dans le **trousseau macOS** (helper `osxkeychain`), donc `git push` fonctionne sans ressaisie. (Si le jeton expire, en recréer un sur https://github.com/settings/tokens avec le scope `repo`.)

---

*Dernière mise à jour : 20 juin 2026.*
