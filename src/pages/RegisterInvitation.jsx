import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const RegisterInvitation = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp } = useAuth()
  
  // Fonction pour préserver les paramètres d'URL (notamment le paramètre club)
  const preserveUrlParams = (path) => {
    const searchParams = new URLSearchParams(location.search)
    const clubParam = searchParams.get('club')
    if (clubParam) {
      return `${path}?club=${clubParam}`
    }
    return path
  }
  
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  // Vérifier le token d'invitation au chargement
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        // Décoder le token pour obtenir le clubId
        let clubId = null;
        try {
          const decodedToken = JSON.parse(atob(token));
          clubId = decodedToken.clubId;
        } catch (decodeError) {
          console.error('Erreur lors du décodage du token:', decodeError);
        }

        // Construire l'URL avec le paramètre club si disponible
        const url = clubId 
          ? `/api/membership/verify-invitation/${token}?club=${clubId === 2 ? 'noveant' : 'demo'}`
          : `/api/membership/verify-invitation/${token}`;
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setInvitation(data.invitation)
        } else {
          setError(data.error || 'Token d\'invitation invalide ou expiré')
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'invitation:', err)
        setError('Erreur lors de la vérification de l\'invitation')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      verifyInvitation()
    } else {
      setError('Token d\'invitation manquant')
      setLoading(false)
    }
  }, [token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validation des mots de passe
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        setSubmitting(false)
        return
      }
      
      if (formData.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères')
        setSubmitting(false)
        return
      }

      // Inscription avec les données de l'invitation
      await signUp(invitation.email, formData.password, {
        clubId: invitation.clubId,
        nom: invitation.nom,
        prenom: invitation.prenom,
        surnom: invitation.surnom,
        telephone: invitation.telephone,
        numeroLicence: invitation.numeroLicence
      })
      
      // Afficher le message de succès
      setSuccess(true)
      
      // Redirection vers le profil après un délai pour laisser voir le message
      setTimeout(() => {
        navigate(preserveUrlParams('/profile'), { replace: true })
      }, 2000)
      
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err)
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Vérification de l'invitation...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invitation invalide
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Affichage du message de succès
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Bienvenue !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Votre compte a été créé avec succès. Vous allez être redirigé vers votre tableau de bord...
            </p>
            <div className="mt-4">
              <Loader className="mx-auto h-6 w-6 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Finaliser votre inscription
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vous avez été invité(e) à rejoindre le club
          </p>
        </div>

        {invitation && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informations de votre invitation
            </h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Club :</span> {invitation.clubName}</div>
              <div><span className="font-medium">Nom :</span> {invitation.nom} {invitation.prenom}</div>
              {invitation.surnom && (
                <div><span className="font-medium">Surnom :</span> {invitation.surnom}</div>
              )}
              <div><span className="font-medium">Email :</span> {invitation.email}</div>
              <div><span className="font-medium">Téléphone :</span> {invitation.telephone}</div>
              {invitation.numeroLicence && (
                <div><span className="font-medium">N° Licence :</span> {invitation.numeroLicence}</div>
              )}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Choisissez un mot de passe"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmez votre mot de passe"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterInvitation