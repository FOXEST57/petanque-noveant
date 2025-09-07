# Configuration du Formulaire de Contact

## Fonctionnalités

Le formulaire de contact permet aux visiteurs d'envoyer des messages directement à l'adresse `contact@petanque-noveant.fr`.

## Configuration requise

### Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
```

### Configuration Gmail

Pour utiliser Gmail comme serveur SMTP :

1. Activez la validation en 2 étapes sur votre compte Gmail
2. Générez un mot de passe d'application :
    - Allez dans les paramètres de votre compte Google
    - Sécurité > Validation en 2 étapes > Mots de passe des applications
    - Générez un nouveau mot de passe pour "Autre (nom personnalisé)"
    - Utilisez ce mot de passe dans `SMTP_PASS`

### Autres fournisseurs SMTP

Vous pouvez utiliser d'autres fournisseurs en modifiant les variables :

**Outlook/Hotmail :**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo :**

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## Structure du formulaire

Le formulaire comprend :

-   Nom complet (obligatoire)
-   Email (obligatoire)
-   Téléphone (optionnel)
-   Sujet (obligatoire, liste déroulante)
-   Message (obligatoire)

## Validation

-   Validation côté client avec HTML5
-   Validation côté serveur avec messages d'erreur détaillés
-   Protection contre les emails malformés
-   Vérification de la longueur des champs

## Gestion des erreurs

-   Affichage des erreurs de validation
-   Gestion des erreurs de configuration SMTP
-   Messages d'erreur utilisateur-friendly
-   États de chargement pendant l'envoi

## Test

1. Configurez les variables SMTP dans `.env`
2. Redémarrez le serveur de développement
3. Accédez à `/contact`
4. Remplissez et soumettez le formulaire
5. Vérifiez la réception à `contact@petanque-noveant.fr`

## Dépendances

-   `nodemailer` : Envoi d'emails
-   `@types/nodemailer` : Types TypeScript

## API Endpoint

`POST /api/contact/send`

**Body :**

```json
{
    "name": "string",
    "email": "string",
    "phone": "string (optionnel)",
    "subject": "string",
    "message": "string"
}
```

**Response (succès) :**

```json
{
    "success": true,
    "message": "Email envoyé avec succès"
}
```

**Response (erreur) :**

```json
{
    "success": false,
    "error": "Message d'erreur",
    "details": ["Détails de validation"]
}
```