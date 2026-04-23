# 🩷 Moody — Emotional Wellness Journal

> A compassionate emotional tracking app designed to help you understand yourself better, day after day.

**[→ Open the app](https://www.moodyapp.fr/)**

🇫🇷 [Lire en français](#-moody--journal-émotionnel-bienveillant)

---

> ⚕️ **Medical disclaimer** — Moody is a personal emotional tracking tool. It does not replace the advice of a doctor, psychologist or any other healthcare professional. If you are in distress, please contact a qualified professional.

---

## 💡 Why this project?

I built Moody for someone very dear to me. She lives with bipolar disorder, and tracking her emotions daily helps her understand herself better, anticipate difficult periods, and share a concrete history with her doctor.

This is not a startup. It's a personal project, built with care, offered for free to anyone who might need it.

---

## ✨ Features

### 📊 Daily tracking
- Mood selection via 7 emojis (from hardest to happiest)
- Last 7 days visible directly on the home screen (colored dots + streak 🔥)
- Positive mode for mixed-polarity days
- Free journal with predefined tags (30 activities & feelings)
- Sleep, nutrition and energy tracking

### 📅 History
- Monthly calendar color-coded by mood
- Edit any past entry directly from the calendar

### 📈 Stats & charts
- Monthly mood + sleep overlay chart
- Activity/mood correlation: what helps, what affects, comfort activities
- Streak, days tracked, top mood, % positive days

### 🏆 Badges & avatars
- Progression system (beginner → legend)
- Unlockable avatars based on earned badges
- Badge sharing via generated image (canvas + Web Share API)

### 💬 Supportive chatbot
- Conversational assistant with themed advice cards
- Proactive detection of negative tags from the day (stress, sadness, fatigue…)
- Automatic suggestion of relevant cards with yes/no confirmation
- Link to guided meditations when a relevant topic is detected

### 🎧 Guided meditations
- 5 short meditations (2–5 min) built into the PWA — no streaming, no external API
- Heart coherence, body scan, 5-4-3-2-1 grounding, sleep relaxation, gratitude
- Voice synthesis (Web Speech API) with automatic best-voice selection
- Manual voice picker with quality indicator
- Breathing tones (Web Audio API) synced with breath cycles
- Animated breathing circle (inhale / exhale)

### 🆘 Crisis mode
- Emergency numbers accessible in one tap (3114, 15, 17, 112)
- Breathing exercise (heart coherence 5s/5s)
- Guided sensory grounding (5-4-3-2-1)
- Personal trusted contact

### 🎨 Customisation
- 8 color themes (with dynamic PWA `theme-color` update)
- Adjustable text size (Small / Normal / Large / Extra large)
- Available in **French** and **English**
- Desktop version with animated decorative blobs

### 📄 Export
- Monthly PDF report with charts and activity analysis

### 🔔 Notifications
- Daily reminder at a chosen time (PWA, Android & iOS 16.4+)

### 📱 PWA
- Installable on home screen (Android & iOS)
- Works offline (service worker cache)
- iOS install banner with step-by-step guide

### 🔐 Authentication
- Secure registration: math captcha, honeypot, minimum delay, lockout after 3 attempts
- Mandatory email confirmation
- Login / logout
- Forgot password with reset link
- Full account deletion (data + profile + auth)

---

## 🛠 Tech stack

| Technology | Usage |
|---|---|
| [React 19](https://react.dev) | UI |
| [Vite 8](https://vitejs.dev) | Build & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styles |
| [React Router v7](https://reactrouter.com) | Routing |
| [Supabase](https://supabase.com) | Auth, database, RLS |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Voice synthesis for meditations |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Breathing tones |
| [OVH Zimbra](https://www.ovhcloud.com) | Transactional emails |

---

## 🚀 Running locally

### Prerequisites
- Node.js 18+
- A Supabase project with `profiles` and `moods` tables

### Setup

```bash
git clone https://github.com/florentdesmarets/moody.git
cd moody
npm install
```

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Start the dev server:

```bash
npm run dev
```

App available at **http://localhost:5173/**

---

## 🌿 Branches

| Branch | Role |
|---|---|
| `main` | Production — deployed at [www.moodyapp.fr](https://www.moodyapp.fr) |
| `dev` | Development — tests and new features |

Merges from `dev` to `main` automatically trigger deployment via GitHub Actions.

---

## 🗄 Supabase schema

### `profiles` table
| Column | Type | Description |
|---|---|---|
| id | uuid | Linked to `auth.users` |
| prenom | text | User's first name |
| langue | text | `fr` or `en` |
| avatar | text | Active badge avatar ID |
| theme | text | Chosen color theme |
| notif_active | boolean | Daily reminder enabled |
| reminder_time | text | Reminder time (e.g. `20:00`) |
| contact_urgence_nom | text | Trusted contact name |
| contact_urgence_tel | text | Trusted contact phone |

### `moods` table
| Column | Type | Description |
|---|---|---|
| id | uuid | |
| user_id | uuid | Linked to `auth.users` |
| date | date | Entry date |
| niveau | int | Mood level 1–7 |
| emoji | text | Corresponding emoji |
| commentaire | text | Activity tags (`, ` separated) |
| sommeil | float | Hours of sleep |
| nourriture | int | Nutrition 1–3 |
| fatigue | int | Energy level 1–3 |
| note | text | Free-text note |

---

## 📦 Deployment (GitHub Pages + custom domain)

Deployment is automated via GitHub Actions on every push to `main`.

The app is served at **[www.moodyapp.fr](https://www.moodyapp.fr)** via GitHub Pages with a custom OVH domain.

**Required GitHub secrets** (`Settings → Secrets → Actions`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Supabase URL configuration**:
- Site URL: `https://www.moodyapp.fr/`
- Redirect URLs: `https://www.moodyapp.fr/**`

---

## 💙 Support the project

Moody is free and open-source. If the app helps you and you'd like to contribute to hosting costs:

👉 [Buy Me a Coffee ☕](https://buymeacoffee.com/florent.d)

---

## 📲 Share the app

If you think Moody could help someone around you, feel free to share it!

**https://www.moodyapp.fr/**

---

## 🙏 About

Made with ❤️ by **Florent Desmarets** — non-profit, open source.

If this app helps even one person, that's all that matters.

> *"You don't have to be okay all the time."*

---
---

# 🩷 Moody — Journal émotionnel bienveillant

> Une application de suivi émotionnel bienveillante, conçue pour aider à mieux se comprendre au quotidien.

**[→ Voir l'application](https://www.moodyapp.fr/)**

🇬🇧 [Read in English](#-moody--emotional-wellness-journal)

---

> ⚕️ **Avertissement médical** — Moody est un outil de suivi émotionnel personnel. Il ne remplace en aucun cas l'avis d'un médecin, d'un psychologue ou de tout autre professionnel de santé. En cas de détresse, contacte un professionnel qualifié.

---

## 💡 Pourquoi ce projet ?

J'ai créé Moody pour une personne qui m'est chère. Suivre ses émotions au quotidien l'aide à mieux se connaître, à anticiper les moments difficiles, et à partager un historique concret avec son médecin.

Ce n'est pas une startup. C'est un projet personnel, fait avec soin, proposé gratuitement à toute personne qui pourrait en avoir besoin.

---

## ✨ Fonctionnalités

### 📊 Suivi quotidien
- Sélection de l'humeur via 7 emojis (du plus difficile au plus heureux)
- Historique des 7 derniers jours visible directement sur la page d'accueil (dots colorés + streak 🔥)
- Mode positif pour les jours à polarité mixte
- Journal libre avec tags prédéfinis (30 activités & ressentis)
- Suivi du sommeil, de l'alimentation et de l'énergie

### 📅 Historique
- Calendrier mensuel coloré selon l'humeur
- Modification d'une entrée passée directement depuis le calendrier

### 📈 Statistiques & graphiques
- Graphique mensuel humeur + sommeil croisés
- Corrélation activités / humeur : ce qui aide, ce qui affecte, activités de réconfort
- Streak, jours suivis, humeur fréquente, % positifs

### 🏆 Badges & avatars
- Système de progression (débutant → légende)
- Avatars débloquables selon les badges obtenus
- Partage d'un badge via une image générée (canvas + Web Share API)

### 💬 Chatbot bienveillant
- Assistant conversationnel avec fiches de conseils thématiques
- Détection proactive des tags négatifs du jour (stress, tristesse, fatigue…)
- Proposition automatique de fiches adaptées avec confirmation oui/non
- Lien vers les méditations guidées si un thème le nécessite

### 🎧 Méditations guidées
- 5 méditations courtes (2–5 min) intégrées dans le PWA, sans streaming ni API externe
- Cohérence cardiaque, scan corporel, ancrage 5-4-3-2-1, endormissement, gratitude
- Synthèse vocale (Web Speech API) avec sélection automatique de la meilleure voix disponible
- Sélecteur de voix manuel avec indicateur de qualité
- Tonalités de respiration (Web Audio API) synchronisées avec les cycles
- Cercle de respiration animé (inspiration / expiration)

### 🆘 Mode crise
- Numéros d'urgence accessibles en un clic (3114, 15, 17, 112)
- Exercice de respiration (cohérence cardiaque 5s/5s)
- Ancrage sensoriel guidé (5-4-3-2-1)
- Contact de confiance personnel

### 🎨 Personnalisation
- 8 thèmes de couleurs (avec mise à jour dynamique de la `theme-color` PWA)
- Taille du texte réglable (Petit / Normal / Grand / Très grand)
- Interface disponible en **français** et **anglais**
- Version desktop avec bulles décoratives animées

### 📄 Export
- Rapport mensuel PDF avec graphiques et analyse des activités

### 🔔 Notifications
- Rappel quotidien à l'heure choisie (PWA, Android & iOS 16.4+)

### 📱 PWA
- Installable sur l'écran d'accueil (Android & iOS)
- Fonctionne hors-ligne (cache service worker)
- Bannière d'installation iOS avec guide pas à pas

### 🔐 Authentification
- Inscription sécurisée : captcha mathématique, honeypot, délai minimum, blocage après 3 tentatives
- Confirmation par email obligatoire
- Connexion / déconnexion
- Mot de passe oublié avec lien de réinitialisation
- Suppression de compte complète (données + profil + auth)

---

## 🛠 Stack technique

| Technologie | Usage |
|---|---|
| [React 19](https://react.dev) | Interface utilisateur |
| [Vite 8](https://vitejs.dev) | Build & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styles |
| [React Router v7](https://reactrouter.com) | Navigation |
| [Supabase](https://supabase.com) | Auth, base de données, RLS |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Synthèse vocale pour les méditations |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Tonalités de respiration |
| [OVH Zimbra](https://www.ovhcloud.com) | Envoi des emails transactionnels |

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js 18+
- Un projet Supabase avec les tables `profiles` et `moods`

### Installation

```bash
git clone https://github.com/florentdesmarets/moody.git
cd moody
npm install
```

Crée un fichier `.env.local` :

```env
VITE_SUPABASE_URL=ta_url_supabase
VITE_SUPABASE_ANON_KEY=ta_cle_anon
```

Lance le serveur de développement :

```bash
npm run dev
```

L'app est disponible sur **http://localhost:5173/**

---

## 🌿 Branches

| Branche | Rôle |
|---|---|
| `main` | Production — déployée sur [www.moodyapp.fr](https://www.moodyapp.fr) |
| `dev` | Développement — tests et nouvelles fonctionnalités |

Les merges de `dev` vers `main` déclenchent automatiquement le déploiement via GitHub Actions.

---

## 🗄 Structure Supabase

### Table `profiles`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Lié à `auth.users` |
| prenom | text | Prénom de l'utilisateur |
| langue | text | `fr` ou `en` |
| avatar | text | ID du badge avatar actif |
| theme | text | Thème de couleur choisi |
| notif_active | boolean | Rappel quotidien activé |
| reminder_time | text | Heure du rappel (ex: `20:00`) |
| contact_urgence_nom | text | Nom du contact de confiance |
| contact_urgence_tel | text | Téléphone du contact de confiance |

### Table `moods`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | |
| user_id | uuid | Lié à `auth.users` |
| date | date | Date de l'entrée |
| niveau | int | Humeur de 1 à 7 |
| emoji | text | Emoji correspondant |
| commentaire | text | Tags activités (séparés par `, `) |
| sommeil | float | Heures de sommeil |
| nourriture | int | Alimentation 1–3 |
| fatigue | int | Énergie 1–3 |
| note | text | Note libre |

---

## 📦 Déploiement (GitHub Pages + domaine custom)

Le déploiement est automatisé via GitHub Actions à chaque push sur `main`.

L'app est servie sur **[www.moodyapp.fr](https://www.moodyapp.fr)** via GitHub Pages avec domaine custom OVH.

**Secrets GitHub requis** (`Settings → Secrets → Actions`) :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Supabase URL Configuration** :
- Site URL : `https://www.moodyapp.fr/`
- Redirect URLs : `https://www.moodyapp.fr/**`

---

## 💙 Soutenir le projet

Moody est gratuit et open-source. Si l'app t'aide et que tu souhaites participer aux frais d'hébergement :

👉 [Buy Me a Coffee ☕](https://buymeacoffee.com/florent.d)

---

## 📲 Partager l'app

Si tu penses que Moody peut aider quelqu'un autour de toi, n'hésite pas à le partager !

**https://www.moodyapp.fr/**

---

## 🙏 À propos

Fait avec ❤️ par **Florent Desmarets** — projet non lucratif, open source.

Si cette application aide ne serait-ce qu'une personne, c'est tout ce qui compte.

> *"Tu n'as pas à aller bien tout le temps."*
