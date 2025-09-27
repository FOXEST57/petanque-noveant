import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader, Crown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const RegisterAdminInvitation = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp } = useAuth()
  
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    telephone: ''
  })

  // Vérifier le token d'invitation au chargement
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const response = await fetch(`http://localhost:3007/api/clubs/verify-admin-invitation/${token}`)
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setInvitation(data.invitation)
          // Pré-remplir les champs avec les données de l'invitation
          setFormData(prev => ({
            ...prev,
            nom: data.invitation.contactName.split(' ').pop() || '',
            prenom: data.invitation.contactName.split(' ').slice(0, -1).join(' ') || data.invitation.contactName
          }))
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

      // Validation des champs obligatoires
      if (!formData.nom || !formData.prenom || !formData.telephone) {
        setError('Tous les champs obligatoires doivent être remplis')
        setSubmitting(false)
        return
      }

      // Créer le compte administrateur
      const userData = {
        clubId: invitation.clubId,
        nom: formData.nom,
        prenom: formData.prenom,
        email: invitation.email,
        telephone: formData.telephone,
        role: 'admin'
      }

      await signUp(invitation.email, formData.password, userData)
      
      setSuccess(true)
      
      // Redirection vers la page d'accueil du club après 2 secondes
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (err) {
      console.error('Erreur lors de la création du compte:', err)
      setError(err.message || 'Erreur lors de la création du compte')
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
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invitation invalide
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <Link
                to="/club-finder"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Compte administrateur créé !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Votre compte administrateur a été créé avec succès. Vous allez être redirigé vers la page d'accueil du club...
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
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Créer votre compte administrateur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bienvenue ! Créez votre compte administrateur pour <strong>{invitation?.clubName}</strong>
          </p>
          {invitation?.clubVille && (
            <p className="text-sm text-gray-500">
              {invitation.clubVille}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (pré-rempli)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={invitation?.email || ''}
                disabled
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                required
                value={formData.telephone}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erreur
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création du compte...
                </>
              ) : (
                'Créer mon compte administrateur'
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

export default RegisterAdminInvitation