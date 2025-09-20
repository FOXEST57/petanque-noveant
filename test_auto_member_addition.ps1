# Script PowerShell pour tester l'ajout automatique de membres lors de l'approbation
Write-Host " Test de l'ajout automatique de membres lors de l'approbation" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:8080/api"
$adminEmail = "admin@petanque-noveant.fr"
$adminPassword = "admin123"

try {
    # 1. Connexion admin
    Write-Host "
1 Connexion en tant qu'admin..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json)
    
    $token = $loginResponse.token
    $headers = @{ "Authorization" = "Bearer $token" }
    Write-Host " Connexion réussie" -ForegroundColor Green

    # 2. Créer une nouvelle demande d'adhésion pour le test
    Write-Host "
2 Création d'une demande d'adhésion de test..." -ForegroundColor Yellow
    $testRequest = @{
        nom = "TestMembre"
        prenom = "Nouveau"
        email = "test.membre@example.com"
        telephone = "06.12.34.56.78"
        numero_licence = "TEST123"
        message = "Demande de test pour vérifier l'ajout automatique"
    }
    
    $requestResponse = Invoke-RestMethod -Uri "$baseUrl/membership/submit-request" -Method POST -ContentType "application/json" -Body ($testRequest | ConvertTo-Json)
    Write-Host " Demande créée avec l'ID: $($requestResponse.requestId)" -ForegroundColor Green
    $requestId = $requestResponse.requestId

    # 3. Vérifier le nombre de membres avant approbation
    Write-Host "
3 Vérification du nombre de membres avant approbation..." -ForegroundColor Yellow
    $membersBefore = Invoke-RestMethod -Uri "$baseUrl/members" -Method GET -Headers $headers
    $countBefore = $membersBefore.Count
    Write-Host "Nombre de membres avant: $countBefore" -ForegroundColor Blue

    # 4. Approuver la demande
    Write-Host "
4 Approbation de la demande..." -ForegroundColor Yellow
    $approvalData = @{
        comment = "Approbation automatique pour test"
        sendInvitation = $false
    }
    
    $approvalResponse = Invoke-RestMethod -Uri "$baseUrl/membership/approve/$requestId" -Method POST -ContentType "application/json" -Headers $headers -Body ($approvalData | ConvertTo-Json)
    Write-Host " Demande approuvée: $($approvalResponse.message)" -ForegroundColor Green

    # 5. Vérifier le nombre de membres après approbation
    Write-Host "
5 Vérification du nombre de membres après approbation..." -ForegroundColor Yellow
    $membersAfter = Invoke-RestMethod -Uri "$baseUrl/members" -Method GET -Headers $headers
    $countAfter = $membersAfter.Count
    Write-Host "Nombre de membres après: $countAfter" -ForegroundColor Blue

    # 6. Vérifier que le membre a été ajouté
    if ($countAfter -gt $countBefore) {
        Write-Host "
 SUCCESS: Le membre a été ajouté automatiquement!" -ForegroundColor Green
        Write-Host "Différence: +$($countAfter - $countBefore) membre(s)" -ForegroundColor Green
        
        # Chercher le nouveau membre
        $newMember = $membersAfter | Where-Object { $_.email -eq "test.membre@example.com" }
        if ($newMember) {
            Write-Host "
 Détails du nouveau membre:" -ForegroundColor Cyan
            Write-Host "  - ID: $($newMember.id)" -ForegroundColor White
            Write-Host "  - Nom: $($newMember.nom) $($newMember.prenom)" -ForegroundColor White
            Write-Host "  - Email: $($newMember.email)" -ForegroundColor White
            Write-Host "  - Téléphone: $($newMember.telephone)" -ForegroundColor White
            Write-Host "  - Licence: $($newMember.numero_licence)" -ForegroundColor White
            Write-Host "  - Type: $($newMember.type_nom)" -ForegroundColor White
        }
    } else {
        Write-Host "
 ÉCHEC: Le membre n'a pas été ajouté automatiquement" -ForegroundColor Red
        Write-Host "Le nombre de membres est resté le même: $countBefore" -ForegroundColor Red
    }

} catch {
    Write-Host "
 Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur: $errorBody" -ForegroundColor Red
    }
}

Write-Host "
 Test terminé" -ForegroundColor Cyan
