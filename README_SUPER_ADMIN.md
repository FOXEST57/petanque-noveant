# Guide de Création des Comptes Super Administrateur

## Vue d'ensemble

Ce guide explique comment créer des comptes super administrateur qui ont accès à tous les clubs via une liste déroulante après connexion.

## Scripts Disponibles

### 1. Script Interactif : `create_super_admin.js`

Script avec interface interactive qui vous guide étape par étape.

```bash
node create_super_admin.js
```

**Fonctionnalités :**
- Interface interactive avec questions/réponses
- Validation en temps réel des données
- Masquage du mot de passe lors de la saisie
- Sélection du club par défaut dans une liste
- Confirmation avant création

### 2. Script Rapide : `create_super_admin_simple.js`

Script avec paramètres en ligne de commande pour une création rapide.

```bash
node create_super_admin_simple.js [nom] [prenom] [email] [telephone] [password] [clubId]
```

**Exemple :**
```bash
node create_super_admin_simple.js "Dupont" "Jean" "jean.dupont@email.com" "06.12.34.56.78" "MonMotDePasse123!" 1
```

**Utilisation avec valeurs par défaut :**
```bash
node create_super_admin_simple.js
```

## Prérequis

1. **Migration Super Admin** : Assurez-vous que la migration `migration_super_admin.sql` a été exécutée
2. **Base de données** : La base de données doit être accessible
3. **Variables d'environnement** : Le fichier `.env` doit contenir les paramètres de connexion à la base

## Validation des Données

### Email
- Format valide requis (exemple@domaine.com)
- Unicité vérifiée dans la base de données

### Mot de passe
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial (@$!%*?&)

### Téléphone
- Formats acceptés :
  - `06.12.34.56.78`
  - `+33612345678`
  - `0612345678`

## Fonctionnalités du Compte Super Admin

### Accès Multi-Club
- Le flag `is_super_admin = TRUE` est automatiquement défini
- Accès à tous les clubs de la plateforme
- Interface de sélection de club après connexion

### Rôle et Permissions
- Rôle : `president`
- Statut : `actif`
- Permissions complètes sur tous les clubs

## Informations de Connexion

Après création, utilisez :
- **Email** : L'email que vous avez fourni
- **Mot de passe** : Le mot de passe que vous avez défini

## Dépannage

### Erreur : "La colonne is_super_admin n'existe pas"
```bash
# Exécutez la migration super admin
node run_migration_super_admin.js
```

### Erreur : "Cet email existe déjà"
Utilisez un email différent ou supprimez l'utilisateur existant.

### Erreur de connexion à la base
Vérifiez votre fichier `.env` :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=petanque_noveant
```

## Sécurité

- Les mots de passe sont hachés avec bcrypt (12 rounds)
- Validation stricte des données d'entrée
- Vérification de l'unicité des emails
- Gestion sécurisée des erreurs

## Support

En cas de problème, vérifiez :
1. La connexion à la base de données
2. L'exécution des migrations
3. La validité des données fournies
4. Les logs d'erreur pour plus de détails