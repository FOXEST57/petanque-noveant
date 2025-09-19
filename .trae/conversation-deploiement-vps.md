# Conversation - Configuration Déploiement VPS OVH avec MariaDB

## Résumé de la configuration préparée

### 🎯 **Objectif**
Configuration complète pour déployer l'application Pétanque Noveant sur un VPS Debian OVH avec MariaDB (remplaçant MySQL qui n'est plus supporté sur Debian récent).

### 📁 **Fichiers créés/modifiés**

1. **DEPLOYMENT.md** - Guide complet de déploiement VPS OVH
   - Instructions pour MariaDB au lieu de MySQL
   - Configuration Nginx, PM2, Let's Encrypt
   - Sécurité et monitoring

2. **deploy-vps.sh** - Script de déploiement automatique
   - Installation automatique de Node.js, Nginx, MariaDB, PM2
   - Configuration complète de l'environnement
   - Déploiement en une commande

3. **ecosystem.config.js** - Configuration PM2 pour la production
   - Gestion des processus en cluster
   - Variables d'environnement
   - Logs et redémarrage automatique

4. **.env.production** - Variables d'environnement de production
   - Configuration API et base de données
   - Paramètres SMTP

5. **src/config/env.js** - Gestion dynamique des environnements
   - Détection automatique dev/prod
   - Configuration des URLs d'API

### 🔧 **Architecture de déploiement**
- **Frontend**: Vite build statique servi par Nginx
- **Backend**: API Node.js/Express gérée par PM2
- **Base de données**: MariaDB (compatible MySQL)
- **Proxy**: Nginx avec configuration SSL
- **SSL**: Let's Encrypt automatique
- **Sécurité**: UFW firewall configuré

### 📋 **Scripts package.json ajoutés**
```json
{
  "build:prod": "vite build --mode production",
  "preview:prod": "vite preview --mode production",
  "server:prod": "NODE_ENV=production node api/server.ts",
  "start": "NODE_ENV=production node api/server.ts"
}
```

### 🚀 **Workflow de déploiement**

#### Automatique (recommandé)
```bash
# Sur le VPS Debian
wget https://raw.githubusercontent.com/username/petanque-noveant/main/deploy-vps.sh
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

#### Manuel
1. Installation des dépendances système
2. Configuration MariaDB
3. Clone du repository
4. Installation npm
5. Configuration Nginx
6. Démarrage PM2
7. Configuration SSL

### ⚙️ **Variables à modifier avant déploiement**
- `DOMAIN="votre-domaine.com"` dans deploy-vps.sh
- `REPO_URL="https://github.com/username/petanque-noveant.git"` dans deploy-vps.sh
- Variables de base de données dans .env.production

### 🔒 **Sécurité configurée**
- Firewall UFW (ports 22, 80, 443)
- MariaDB sécurisé avec mysql_secure_installation
- SSL/TLS avec Let's Encrypt
- Variables d'environnement système (non dans le code)

### 📊 **Monitoring inclus**
- Logs PM2 automatiques
- Logs Nginx
- Logs MariaDB
- Scripts de sauvegarde automatique
- Commandes de surveillance système

### ✅ **Avantages MariaDB vs MySQL**
- Natif sur Debian moderne
- Meilleure performance
- 100% compatible MySQL (drop-in replacement)
- Open source complet
- Même syntaxe et commandes

## 📝 **Notes importantes**

1. **Prérequis VPS**:
   - VPS Debian configuré
   - Accès root/sudo
   - Nom de domaine pointant vers le VPS

2. **Repository GitHub**:
   - Code pushé sur GitHub
   - URL du repository mise à jour dans le script

3. **Base de données**:
   - MariaDB remplace MySQL
   - Même syntaxe et compatibilité
   - Configuration automatique incluse

4. **SSL/HTTPS**:
   - Let's Encrypt configuré automatiquement
   - Renouvellement automatique

## 🎯 **Prochaines étapes**

Quand prêt pour le déploiement :
1. Pousser le code sur GitHub
2. Configurer le nom de domaine
3. Modifier les variables dans deploy-vps.sh
4. Exécuter le script de déploiement
5. Tester l'application en production

---

**Date de configuration**: Décembre 2024
**Status**: Prêt pour déploiement
**Plateforme cible**: VPS OVH Debian avec MariaDB