@echo off
echo ========================================
echo   RESTAURATION BASE DE DONNEES
echo ========================================
echo.

REM Configuration - Modifiez ces valeurs selon votre configuration
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=petanque_noveant
set DB_USER=root
set DB_PASSWORD=root 

echo.
echo Fichiers de sauvegarde disponibles dans le dossier backup:
echo.
if exist "backup\*.sql" (
    dir backup\*.sql /b /o:d
) else (
    echo Aucun fichier de sauvegarde trouvé dans le dossier backup.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

echo.
set /p BACKUP_FILE=Entrez le nom du fichier de sauvegarde (avec .sql): 

if not exist "backup\%BACKUP_FILE%" (
    echo.
    echo ❌ ERREUR: Le fichier backup\%BACKUP_FILE% n'existe pas !
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

echo.
echo ⚠️  ATTENTION: Cette opération va REMPLACER toutes les données actuelles !
echo Fichier à restaurer: backup\%BACKUP_FILE%
echo Base de données: %DB_NAME%
echo.
set /p CONFIRM=Êtes-vous sûr de vouloir continuer ? (oui/non): 

if /i not "%CONFIRM%"=="oui" (
    echo.
    echo Restauration annulée.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 0
)

echo.
echo Restauration en cours...
echo.

REM Créer la base de données si elle n'existe pas
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

REM Restaurer la base de données
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < backup\%BACKUP_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ RESTAURATION REUSSIE !
    echo La base de données %DB_NAME% a été restaurée avec succès.
) else (
    echo.
    echo ❌ ERREUR lors de la restauration !
    echo Vérifiez vos paramètres de connexion MySQL et le fichier de sauvegarde.
)

echo.
echo Appuyez sur une touche pour continuer...
pause >nul