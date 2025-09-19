module.exports = {
  apps: [{
    name: 'petanque-noveant-api',
    script: 'api/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002,
      VITE_API_URL: 'https://votre-domaine.com',
      DB_HOST: 'localhost',
      DB_USER: 'petanque_user',
      DB_PASSWORD: 'votre_mot_de_passe_db',
      DB_NAME: 'petanque_noveant'
    },
    error_file: '/var/log/pm2/petanque-noveant-error.log',
    out_file: '/var/log/pm2/petanque-noveant-out.log',
    log_file: '/var/log/pm2/petanque-noveant-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // Redémarrage automatique en cas de crash
    min_uptime: '10s',
    max_restarts: 10,
    // Variables d'environnement spécifiques
    env_vars: {
      NODE_ENV: 'production'
    }
  }]
}