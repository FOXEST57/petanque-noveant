# Guide de Déploiement VPS OVH - Pétanque Noveant

## 🔧 Configuration des Environnements

### Développement Local
- Utilise le fichier `.env` pour les variables locales
- API URL: `http://localhost:3002`
- Commande: `npm run dev`

### Production sur VPS OVH

#### Configuration des Variables d'Environnement
En production sur votre VPS OVH, **ne pas utiliser de fichier .env**. À la place, configurer les variables d'environnement système :

**Méthode 1: Variables système permanentes (Recommandé)**
```bash
# Éditer le fichier ~/.bashrc ou ~/.profile
nano ~/.bashrc

# Ajouter ces lignes à la fin du fichier :
export VITE_API_URL="https://votre-domaine.com"
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="votre-email@gmail.com"
export SMTP_PASS="votre-mot-de-passe-app"
export NODE_ENV="production"
export PORT="3002"

# Recharger la configuration
source ~/.bashrc
```

**Méthode 2: Fichier systemd (Pour service automatique)**
```bash
# Créer un fichier service
sudo nano /etc/systemd/system/petanque-noveant.service
```

Contenu du fichier service :
```ini
[Unit]
Description=Petanque Noveant API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/petanque-noveant
ExecStart=/usr/bin/node api/server.js
Restart=on-failure
RestartSec=10

# Variables d'environnement
Environment=NODE_ENV=production
Environment=PORT=3002
Environment=VITE_API_URL=https://votre-domaine.com
Environment=SMTP_HOST=smtp.gmail.com
Environment=SMTP_PORT=587
Environment=SMTP_USER=votre-email@gmail.com
Environment=SMTP_PASS=votre-mot-de-passe-app
Environment=DB_HOST=localhost
Environment=DB_USER=petanque_user
Environment=DB_PASSWORD=votre_mot_de_passe_db
Environment=DB_NAME=petanque_noveant

[Install]
WantedBy=multi-user.target
```

## 🚀 Déploiement sur VPS OVH

### Prérequis
- VPS OVH avec Ubuntu/Debian
- Nom de domaine pointant vers votre VPS
- Accès SSH root

### Déploiement Automatique (Recommandé)
J'ai créé un script de déploiement automatisé :

```bash
# Sur votre VPS, télécharger et exécuter le script
wget https://raw.githubusercontent.com/votre-username/petanque-noveant/main/deploy-vps.sh
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

### Déploiement Manuel

#### 1. Préparation du serveur
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx mariadb-server git pm2
```

#### 2. Configuration de MariaDB
```bash
# Sécurisation de MariaDB
sudo mysql_secure_installation

# Création de la base de données
sudo mysql -u root -p
CREATE DATABASE petanque_noveant;
CREATE USER 'petanque_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON petanque_noveant.* TO 'petanque_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Déploiement de l'application
```bash
# Création du répertoire
sudo mkdir -p /var/www/petanque-noveant
cd /var/www/petanque-noveant

# Clone du repository
sudo git clone https://github.com/votre-username/petanque-noveant.git .

# Installation des dépendances
sudo npm install

# Configuration des variables d'environnement
sudo nano /etc/environment
# Ajouter les variables mentionnées plus haut

# Build de l'application
sudo npm run build:prod
```

#### 4. Configuration Nginx
```bash
# Créer la configuration du site
sudo nano /etc/nginx/sites-available/petanque-noveant
```

Configuration Nginx :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    root /var/www/petanque-noveant/dist;
    index index.html;
    
    # Fichiers statiques
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/petanque-noveant/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 5. Activation du site
```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/petanque-noveant /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 6. Configuration PM2
```bash
# Démarrer l'application avec PM2
cd /var/www/petanque-noveant
sudo pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
sudo pm2 save
sudo pm2 startup

# Suivre les logs
sudo pm2 logs
```

#### 7. SSL avec Let's Encrypt
```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Génération du certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Maintenance et Monitoring

### Commandes utiles
```bash
# Monitoring PM2
sudo pm2 monit

# Redémarrer l'application
sudo pm2 restart petanque-noveant-api

# Voir les logs
sudo pm2 logs

# Mise à jour de l'application
cd /var/www/petanque-noveant
sudo git pull origin main
sudo npm install
sudo npm run build:prod
sudo pm2 restart petanque-noveant-api
```

### Sauvegarde automatique
```bash
# Script de sauvegarde (à placer dans /etc/cron.daily/)
#!/bin/bash
mysqldump -u petanque_user -p'votre_mot_de_passe' petanque_noveant > /backup/petanque_$(date +%Y%m%d).sql
find /backup -name "petanque_*.sql" -mtime +7 -delete

# Note: MariaDB utilise mysqldump (compatible MySQL)
```

## 🔒 Sécurité

### Firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Mise à jour automatique
```bash
# Configuration des mises à jour automatiques
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring

### Logs importants
- Nginx : `/var/log/nginx/`
- PM2 : `/var/log/pm2/`
- MariaDB : `/var/log/mysql/` (MariaDB utilise le même répertoire)
- Application : `sudo pm2 logs`

### Surveillance
```bash
# Statut des services
sudo systemctl status nginx
sudo systemctl status mariadb
sudo pm2 status

# Utilisation des ressources
htop
df -h
free -h
```