@echo off
echo ========================================
echo    SAUVEGARDE BASE DE DONNEES
echo ========================================
echo.
echo ⚠️  mysqldump n'est pas disponible dans le PATH système.
echo.
echo 📋 INSTRUCTIONS POUR CRÉER LA SAUVEGARDE MANUELLEMENT :
echo.
echo 1️⃣  OPTION 1 - Avec MySQL Workbench :
echo    - Ouvrez MySQL Workbench
echo    - Connectez-vous à votre serveur MySQL (localhost:3306)
echo    - Clic droit sur la base "petanque_noveant"
echo    - Sélectionnez "Data Export"
echo    - Cochez "petanque_noveant"
echo    - Choisissez "Export to Self-Contained File"
echo    - Nommez le fichier : petanque_noveant_backup.sql
echo    - Sauvegardez dans le dossier backup\
echo    - Cliquez "Start Export"
echo.
echo 2️⃣  OPTION 2 - Avec phpMyAdmin :
echo    - Ouvrez phpMyAdmin dans votre navigateur
echo    - Sélectionnez la base "petanque_noveant"
echo    - Cliquez sur l'onglet "Exporter"
echo    - Choisissez "Méthode rapide" et format "SQL"
echo    - Cliquez "Exécuter"
echo    - Sauvegardez le fichier dans backup\
echo.
echo 3️⃣  OPTION 3 - Avec la ligne de commande MySQL :
echo    - Ouvrez l'invite de commande MySQL
echo    - Tapez : mysqldump -u root -proot petanque_noveant ^> backup\petanque_noveant_backup.sql
echo.
echo 📁 Le fichier de sauvegarde doit être placé dans le dossier backup\
echo 💾 Vous pourrez ensuite copier ce fichier sur l'autre ordinateur.
echo.
echo Appuyez sur une touche pour continuer...
pause >nul