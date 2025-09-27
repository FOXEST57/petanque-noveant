#!/bin/bash

echo "========================================"
echo "    SAUVEGARDE BASE DE DONNEES"
echo "========================================"
echo

# Configuration - Modifiez ces valeurs selon votre configuration
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="petanque_noveant"
DB_USER="root"

# Demander le mot de passe de manière sécurisée
echo -n "Entrez le mot de passe MySQL: "
read -s DB_PASSWORD
echo

# Créer le dossier backup s'il n'existe pas
mkdir -p backup

# Générer le nom du fichier avec la date et l'heure
DATESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="backup/petanque_noveant_backup_${DATESTAMP}.sql"

echo "Sauvegarde en cours..."
echo "Fichier de destination: $BACKUP_FILE"
echo

# Exécuter mysqldump
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
    --routines --triggers --single-transaction "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo
    echo "✅ SAUVEGARDE REUSSIE !"
    echo "Fichier créé: $BACKUP_FILE"
    echo "Taille du fichier: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo
    echo "❌ ERREUR lors de la sauvegarde !"
    echo "Vérifiez vos paramètres de connexion MySQL."
    exit 1
fi

echo
echo "Appuyez sur Entrée pour continuer..."
read