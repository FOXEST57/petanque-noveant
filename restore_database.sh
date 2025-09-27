#!/bin/bash

echo "========================================"
echo "   RESTAURATION BASE DE DONNEES"
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
echo

echo "Fichiers de sauvegarde disponibles dans le dossier backup:"
echo
if ls backup/*.sql 1> /dev/null 2>&1; then
    ls -la backup/*.sql
else
    echo "Aucun fichier de sauvegarde trouvé dans le dossier backup."
    echo
    echo "Appuyez sur Entrée pour quitter..."
    read
    exit 1
fi

echo
echo -n "Entrez le nom du fichier de sauvegarde (avec .sql): "
read BACKUP_FILE

if [ ! -f "backup/$BACKUP_FILE" ]; then
    echo
    echo "❌ ERREUR: Le fichier backup/$BACKUP_FILE n'existe pas !"
    echo
    echo "Appuyez sur Entrée pour quitter..."
    read
    exit 1
fi

echo
echo "⚠️  ATTENTION: Cette opération va REMPLACER toutes les données actuelles !"
echo "Fichier à restaurer: backup/$BACKUP_FILE"
echo "Base de données: $DB_NAME"
echo
echo -n "Êtes-vous sûr de vouloir continuer ? (oui/non): "
read CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    echo
    echo "Restauration annulée."
    echo
    echo "Appuyez sur Entrée pour quitter..."
    read
    exit 0
fi

echo
echo "Restauration en cours..."
echo

# Créer la base de données si elle n'existe pas
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
    -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Restaurer la base de données
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
    "$DB_NAME" < "backup/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo
    echo "✅ RESTAURATION REUSSIE !"
    echo "La base de données $DB_NAME a été restaurée avec succès."
else
    echo
    echo "❌ ERREUR lors de la restauration !"
    echo "Vérifiez vos paramètres de connexion MySQL et le fichier de sauvegarde."
    exit 1
fi

echo
echo "Appuyez sur Entrée pour continuer..."
read