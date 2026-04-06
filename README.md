# 📱 GagnezMobile — Gagnez de l'argent en Guinée

Application mobile qui permet aux utilisateurs de gagner de l'argent réel en Guinée en regardant des publicités, et de retirer leurs gains via Mobile Money.

## 🌟 Fonctionnalités

- 📺 **Regarder des publicités** — Gagnez 300 à 1 000 GNF par publicité
- 💳 **Retrait Mobile Money** — Orange Money, MTN MoMo, Wave
- 📊 **Historique complet** — Suivi de tous vos gains et retraits
- 🏆 **Système de niveaux** — Débutant → Intermédiaire → Expert → Maître
- 📈 **Tableau de bord** — Solde en temps réel avec barre de progression

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Expo Go sur votre téléphone

### Installation
```bash
git clone https://github.com/sowalseny841-dev/gagnez-mobile.git
cd gagnez-mobile
pnpm install
pnpm --filter @workspace/moneyapp run dev
```

Scannez le QR code avec **Expo Go** (disponible sur Play Store / App Store).

## 💰 Modèle de paiement

Voir le fichier [PAIEMENT.md](./PAIEMENT.md) pour le guide complet sur comment payer vos utilisateurs via Mobile Money.

## 🏗️ Architecture

```
artifacts/
  moneyapp/           # Application Expo (React Native)
    app/              # Écrans (Accueil, Historique, Profil)
    components/       # Composants réutilisables
    context/          # État global (solde, transactions)
    data/             # Catalogue de publicités
    constants/        # Couleurs et tokens de design
  api-server/         # Serveur Express (backend)
lib/
  api-spec/           # Spécification OpenAPI
  db/                 # Schéma base de données (Drizzle + PostgreSQL)
.github/
  workflows/          # CI/CD automatisé
```

## 🔧 CI/CD GitHub Actions

Le pipeline automatique effectue à chaque push sur `main` :
1. ✅ Vérification TypeScript
2. 🔒 Audit de sécurité
3. 🏗️ Build de l'application
4. 📦 Création d'une release GitHub

## 📲 Déploiement sur App Store

Via Replit Expo Launch — cliquez sur le bouton "Publish" dans Replit.

## 📄 Licence

MIT — Libre d'utilisation, de modification et de distribution.

## 👨‍💻 Auteur

Développé avec ❤️ pour les utilisateurs en Guinée.
