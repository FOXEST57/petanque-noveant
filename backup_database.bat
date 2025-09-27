@echo off
echo ========================================
echo    SAUVEGARDE BASE DE DONNEES
echo ========================================
echo.

REM Configuration - Modifiez ces valeurs selon votre configuration
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=petanque_noveant
set DB_USER=root
set /p DB_PASSWORD=Entrez le mot de passe MySQL: 

REM Créer le dossier backup s'il n'existe pas
if not exist "backup" mkdir backup

REM Générer le nom du fichier avec la date et l'heure
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set BACKUP_FILE=backup\petanque_noveant_backup_%datestamp%.sql

echo Sauvegarde en cours...
echo Fichier de destination: %BACKUP_FILE%
echo.

REM Exécuter mysqldump
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% --routines --triggers --single-transaction %DB_NAME% > %BACKUP_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SAUVEGARDE REUSSIE !
    echo Fichier créé: %BACKUP_FILE%
    echo Taille du fichier:
    for %%A in (%BACKUP_FILE%) do echo %%~zA octets
) else (
    echo.
    echo ❌ ERREUR lors de la sauvegarde !
    echo Vérifiez vos paramètres de connexion MySQL.
)

echo.
echo Appuyez sur une touche pour continuer...
pause >nul