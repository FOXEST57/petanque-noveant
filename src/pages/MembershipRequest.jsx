import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MembershipRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    surnom: '',
    email: '',
    telephone: '',
    numeroLicence: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [clubId, setClubId] = useState(null);

  // Récupérer les informations du club depuis l'URL ou la configuration
  useEffect(() => {
    const loadClubInfo = async () => {
      try {
        // Si un clubId est fourni dans l'URL
        const urlClubId = searchParams.get('club');
        if (urlClubId) {
          setClubId(urlClubId);
          // Récupérer les infos du club depuis l'API
          const response = await fetch(`/api/clubs/${urlClubId}`);
          if (response.ok) {
            const club = await response.json();
            setClubInfo(club);
          }
        } else {
          // Club par défaut (pour l'instant, on utilise l'ID 1)
          setClubId(1);
          setClubInfo({
            nom: 'Club de Pétanque de Noveant-sur-Moselle',
            description: 'Rejoignez notre club convivial et participez à nos nombreuses activités !',
            adresse: 'Noveant-sur-Moselle, France'
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations du club:', error);
        toast.error('Erreur lors du chargement des informations du club');
      }
    };

    loadClubInfo();
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Format de téléphone invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/membership/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clubId
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Demande d\'adhésion envoyée avec succès!');
      } else {
        if (result.code === 'REQUEST_EXISTS') {
          toast.error(result.error);
        } else if (result.code === 'USER_EXISTS') {
          toast.error('Un compte existe déjà avec cet email. Essayez de vous connecter.');
        } else {
          toast.error(result.error || 'Erreur lors de l\'envoi de la demande');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Demande envoyée avec succès !
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Votre demande d'adhésion au <strong>{clubInfo?.nom}</strong> a été transmise au comité du club.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
              <ul className="text-blue-800 text-left space-y-1">
                <li>• Votre demande sera examinée par le comité du club</li>
                <li>• Vous recevrez une notification par email dès qu'une décision sera prise</li>
                <li>• En cas d'approbation, vous recevrez un lien pour créer votre compte</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#425e9b] hover:bg-[#364a82] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <UserPlus className="w-16 h-16 text-[#425e9b] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demande d'adhésion
          </h1>
          {clubInfo && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#425e9b] mb-2">
                {clubInfo.nom}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {clubInfo.description}
              </p>
              {clubInfo.adresse && (
                <div className="flex items-center justify-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{clubInfo.adresse}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations sur le club */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#425e9b]" />
                Pourquoi nous rejoindre ?
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <Trophy className="w-4 h-4 mr-2 mt-1 text-[#425e9b] flex-shrink-0" />
                  <span>Participez à nos tournois et compétitions</span>
                </li>
                <li className="flex items-start">
                  <Users className="w-4 h-4 mr-2 mt-1 text-[#425e9b] flex-shrink-0" />
                  <span>Rejoignez une communauté conviviale</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-1 text-[#425e9b] flex-shrink-0" />
                  <span>Profitez de nos installations et équipements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-1 text-[#425e9b] flex-shrink-0" />
                  <span>Bénéficiez de l'encadrement de joueurs expérimentés</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Information importante</h4>
                  <p className="text-yellow-700 text-sm">
                    Votre demande sera examinée par le comité du club. Vous recevrez une réponse par email dans les plus brefs délais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de demande */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Formulaire de demande
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors ${
                        errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Votre nom de famille"
                    />
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors ${
                        errors.prenom ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Votre prénom"
                    />
                    {errors.prenom && (
                      <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="surnom" className="block text-sm font-medium text-gray-700 mb-2">
                    Surnom <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="surnom"
                    name="surnom"
                    value={formData.surnom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors"
                    placeholder="Votre surnom ou pseudonyme"
                  />
                </div>

                {/* Coordonnées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="votre.email@exemple.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors ${
                        errors.telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="06 12 34 56 78"
                    />
                    {errors.telephone && (
                      <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="numeroLicence" className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de licence <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="numeroLicence"
                    name="numeroLicence"
                    value={formData.numeroLicence}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors"
                    placeholder="Si vous avez déjà une licence FFPJP"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent transition-colors resize-none"
                    placeholder="Parlez-nous de votre motivation, votre expérience en pétanque, ou toute autre information que vous souhaitez partager..."
                  />
                </div>

                {/* Bouton de soumission */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#425e9b] hover:bg-[#364a82] disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer ma demande
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour traiter votre demande d'adhésion.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipRequest;