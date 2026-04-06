# Guide de Publication — Google Play Store

## Étapes pour publier GagnezMobile sur le Play Store

---

## 1. Prérequis

### Compte Expo (EAS Build)
1. Créez un compte sur https://expo.dev
2. Connectez-vous : `eas login`
3. Initialisez le projet : `eas init`
4. Copiez l'`id` dans `app.json` > `expo.extra.eas.projectId`

### EXPO_TOKEN (pour GitHub Actions)
1. Sur https://expo.dev → Settings → Access Tokens
2. Créez un token "EXPO_TOKEN"
3. Dans votre dépôt GitHub → Settings → Secrets → Actions
4. Ajoutez `EXPO_TOKEN` avec la valeur copiée

### Compte Google Play Console
1. Inscrivez-vous sur https://play.google.com/console
2. Frais d'inscription unique : 25 USD
3. Vérifiez votre identité

---

## 2. Informations de la fiche Play Store

| Champ | Valeur |
|---|---|
| Nom de l'app | GagnezMobile |
| Package | com.gagnez.mobile |
| Catégorie | Finance |
| Public cible | 18 ans et plus |
| Pays cible | Guinée (GN) |
| Devise | GNF (Franc Guinéen) |
| Langue principale | Français (fr-GN) |

---

## 3. Assets requis pour le Play Store

| Asset | Taille |
|---|---|
| Icône | 512 × 512 px (PNG, pas de transparence) |
| Bannière feature graphic | 1024 × 500 px |
| Screenshots téléphone | Min. 2, 320–3840 px de large |
| Screenshots tablette (optionnel) | 1080 × 1920 px |

### Captures d'écran recommandées
1. Écran d'accueil (liste des pubs + solde)
2. Pub en cours de lecture
3. Toast "GNF gagné !"
4. Modal de retrait Mobile Money
5. Modal de rechargement FedaPay
6. Onglet Historique
7. Profil / Niveaux

---

## 4. Paramètres de contenu (Content Rating)

Répondez au questionnaire IARC :
- Contenu adulte : **Non**
- Violence : **Non**
- Gambling / Jeux d'argent : **Non** (les gains proviennent de publicités)
- Achats intégrés : **Oui** (rechargements FedaPay)
- Collecte de données utilisateur : **Oui** (numéro de téléphone pour retrait)

**Note :** Précisez que les gains viennent de la publicité, pas du gambling.

---

## 5. Politique de confidentialité

Hébergez `POLITIQUE_CONFIDENTIALITE.md` sur une URL publique et renseignez-la dans la fiche Play Store.

Options d'hébergement gratuit :
- GitHub Pages : https://sowalseny841-dev.github.io/gagnez-mobile/privacy
- Notion (page publique)

---

## 6. Construire l'AAB de production

### Via GitHub Actions (automatique)
Chaque push sur `main` déclenche le build si `EXPO_TOKEN` est configuré.

### En local
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

L'AAB sera disponible dans votre dashboard Expo : https://expo.dev

---

## 7. Soumettre sur le Play Store

### Option A — Manuel
1. Téléchargez l'`.aab` depuis votre dashboard Expo
2. Allez sur Play Console → Votre app → Production → Créer une nouvelle version
3. Téléversez le fichier `.aab`
4. Remplissez les informations de la version
5. Soumettez pour révision

### Option B — Via EAS Submit (automatique)
```bash
eas submit --platform android --profile production
```

Nécessite d'avoir configuré `serviceAccountKeyPath` dans `eas.json`.

---

## 8. Délais de révision

Google examine généralement les nouvelles apps en **3 à 7 jours ouvrables**.

---

## 9. Checklist finale

- [ ] Compte Expo créé et `EXPO_TOKEN` ajouté dans GitHub Secrets
- [ ] `projectId` mis à jour dans `app.json`
- [ ] Icône 512×512 px prête
- [ ] 2+ captures d'écran prêtes
- [ ] Feature graphic 1024×500 px prête
- [ ] Politique de confidentialité hébergée sur URL publique
- [ ] Questionnaire IARC rempli
- [ ] Build AAB généré par EAS
- [ ] Fiche Play Store complétée (description, catégorie, etc.)
