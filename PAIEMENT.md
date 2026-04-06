# 💰 Comment payer vos utilisateurs — Guide complet

## Circuit de paiement

```
Annonceur → Régie pub (AdMob) → Vous (auteur) → Utilisateurs (Mobile Money)
```

## Étape 1 : Monétisation avec Google AdMob

Google AdMob est la régie publicitaire la plus utilisée en Afrique.

### Inscription
1. Allez sur https://admob.google.com
2. Créez un compte avec votre Gmail
3. Créez une application (Android / iOS)
4. Récupérez votre **App ID** et vos **Ad Unit IDs**

### Revenus estimés en Guinée
| Type de pub | Revenu par vue (USD) |
|-------------|---------------------|
| Bannière | $0.001 – $0.005 |
| Interstitielle | $0.01 – $0.05 |
| Récompensée (Rewarded) | $0.02 – $0.10 |

> Google vous paie chaque mois par virement bancaire dès que vous atteignez **$100**.

---

## Étape 2 : Redistribution aux utilisateurs

### Option A — Mobile Money Manuel (petite échelle)
- Collectez les demandes de retrait dans votre app
- Effectuez les paiements manuellement via votre téléphone

### Option B — API Orange Money Guinée (automatique)
```
API: https://api.orange.com/orange-money-webpay/GIN/v1
```
Vous avez besoin de :
- Compte développeur Orange Business → https://developer.orange.com
- Clé API Orange Money
- Compte marchand Orange Money Guinée

### Option C — API Wave (automatique)
```
Contact: merchants@wave.com
```
Wave propose une API de paiement marchand pour les entreprises en Guinée.

---

## Étape 3 : Modèle économique recommandé

```
Revenus AdMob (100%)
    ├── 40% → Paiements utilisateurs
    ├── 30% → Votre bénéfice
    ├── 20% → Serveur & infrastructure
    └── 10% → Marketing & croissance
```

---

## Étape 4 : Variables d'environnement à configurer

Ajoutez ces secrets dans GitHub → Settings → Secrets :

```env
ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_REWARDED_AD_UNIT=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ORANGE_MONEY_API_KEY=votre_cle_api
ORANGE_MONEY_MERCHANT_KEY=votre_cle_marchand
WAVE_API_KEY=votre_cle_wave
```

---

## Contact pour démarrer

- **AdMob** : https://admob.google.com
- **Orange Money API Guinée** : https://developer.orange.com
- **Wave Merchants** : merchants@wave.com
- **MTN MoMo API** : https://momodeveloper.mtn.com
