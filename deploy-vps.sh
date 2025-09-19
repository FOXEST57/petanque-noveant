#!/bin/bash

# Script de déploiement automatisé pour VPS OVH
# Pétanque Noveant

echo "🚀 Début du déploiement sur VPS OVH..."

# Variables de configuration
APP_NAME="petanque-noveant"
APP_DIR="/var/www/$APP_NAME"
REPO_URL="https://github.com/votre-username/petanque-noveant.git"
DOMAIN="votre-domaine.com"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then
    error "Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

# 1. Mise à jour du système
log "Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation des dépendances
log "Installation de Node.js, npm, nginx, mariadb..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx mariadb-server git pm2

# 3. Configuration de MariaDB
log "Configuration de MariaDB..."
mysql_secure_installation

# 4. Création du répertoire de l'application
log "Création du répertoire de l'application..."
mkdir -p $APP_DIR
cd $APP_DIR

# 5. Clone du repository (ou mise à jour)
if [ -d ".git" ]; then
    log "Mise à jour du code..."
    git pull origin main
else
    log "Clone du repository..."
    git clone $REPO_URL .
fi

# 6. Installation des dépendances npm
log "Installation des dépendances..."
npm install

# 7. Configuration des variables d'environnement
log "Configuration des variables d'environnement..."
cat > /etc/environment << EOF
VITE_API_URL="https://$DOMAIN"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-app"
NODE_ENV="production"
PORT="3002"
DB_HOST="localhost"
DB_USER="petanque_user"
DB_PASSWORD="votre_mot_de_passe_db"
DB_NAME="petanque_noveant"
EOF

# Recharger les variables d'environnement
source /etc/environment

# 8. Build de l'application
log "Build de l'application..."
npm run build:prod

# 9. Configuration de Nginx
log "Configuration de Nginx..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirection vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Certificats SSL (à configurer avec Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Racine du site (fichiers statiques)
    root $APP_DIR/dist;
    index index.html;
    
    # Gestion des fichiers statiques
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy pour l'API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Gestion des uploads
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
nginx -t

# 10. Configuration de PM2 pour le serveur API
log "Configuration de PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME-api',
    script: 'api/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME-combined.log',
    time: true
  }]
}
EOF

# Créer le répertoire de logs
mkdir -p /var/log/pm2

# Démarrer l'application avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 11. Installation de Let's Encrypt (optionnel)
read -p "Voulez-vous installer Let's Encrypt pour HTTPS ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Installation de Certbot..."
    apt install -y certbot python3-certbot-nginx
    
    log "Génération du certificat SSL..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN
    
    # Configuration du renouvellement automatique
    crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
fi

# 12. Redémarrage des services
log "Redémarrage des services..."
systemctl restart nginx
systemctl enable nginx
pm2 restart all

# 13. Configuration du firewall
log "Configuration du firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

log "✅ Déploiement terminé !"
log "🌐 Votre site est accessible à : https://$DOMAIN"
log "📊 Monitoring PM2 : pm2 monit"
log "📝 Logs : pm2 logs"

echo ""
warn "N'oubliez pas de :"
warn "1. Configurer votre base de données MariaDB"
warn "2. Modifier les variables d'environnement dans /etc/environment"
warn "3. Pointer votre domaine vers l'IP de ce serveur"
warn "4. Configurer vos clés SMTP"