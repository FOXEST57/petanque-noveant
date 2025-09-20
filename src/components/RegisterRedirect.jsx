import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const RegisterRedirect = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // Rediriger vers la nouvelle route avec le token dans le path
      navigate(`/register/${token}`, { replace: true })
    } else {
      // Si pas de token, rediriger vers la page de connexion
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate])

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  )
}

export default RegisterRedirect