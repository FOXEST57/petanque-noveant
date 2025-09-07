import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Carousel */}
            <section className="relative">
                <Carousel />

                {/* Welcome overlay */}
                <div className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-40">
                    <div className="px-4 text-center text-white">
                        <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                            Bienvenue au Club de Pétanque
                        </h1>
                        <p className="mb-8 text-xl md:text-2xl">
                            Noveant-sur-Moselle
                        </p>
                        <div className="space-x-4">
                            <Link
                                to="/equipes"
                                className="bg-[#425e9b] hover:bg-[#3a5287] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                            >
                                Découvrir nos équipes
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-block px-6 py-3 font-semibold text-white bg-transparent rounded-lg border-2 border-white transition-colors duration-200 hover:bg-white hover:text-gray-900"
                            >
                                Nous rejoindre
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Info Section */}
            <section className="py-12 bg-white">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full">
                                <MapPin className="w-8 h-8 text-[#425e9b]" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Notre Localisation
                            </h3>
                            <p className="text-gray-600">
                                Veloroute Charles le téméraire
                                <br />
                                57680 Novéant-sur-Moselle, France
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full">
                                <Clock className="w-8 h-8 text-[#425e9b]" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Horaires d'ouverture
                            </h3>
                            <p className="text-gray-600">
                                Ouvert tous les jours
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full">
                                <Users className="w-8 h-8 text-[#425e9b]" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Nos Membres
                            </h3>
                            <p className="text-gray-600">
                                Plus de 80 licenciés
                                <br />
                                Toutes catégories d'âge
                                <br />
                                Ambiance conviviale
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                            Découvrez notre club
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Un club dynamique qui propose de nombreuses
                            activités tout au long de l'année
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Équipes */}
                        <Link to="/equipes" className="group">
                            <div className="overflow-hidden bg-white rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg transition-colors duration-200 group-hover:from-blue-100 group-hover:to-blue-200">
                                        <Users className="w-6 h-6 text-[#425e9b]" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                                        Nos Équipes
                                    </h3>
                                    <p className="text-gray-600">
                                        Découvrez nos équipes et leurs
                                        performances dans les différents
                                        championnats.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Animations */}
                        <Link to="/animations" className="group">
                            <div className="overflow-hidden bg-white rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg transition-colors duration-200 group-hover:from-blue-100 group-hover:to-blue-200">
                                        <Calendar className="w-6 h-6 text-[#425e9b]" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                                        Animations
                                    </h3>
                                    <p className="text-gray-600">
                                        Tournois, événements spéciaux et
                                        animations pour tous les âges.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Compétitions */}
                        <Link to="/competitions" className="group">
                            <div className="overflow-hidden bg-white rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-center items-center mb-4 w-12 h-12 bg-blue-100 rounded-lg transition-colors duration-200 group-hover:bg-blue-200">
                                        <Trophy className="w-6 h-6 text-[#425e9b]" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                                        Compétitions
                                    </h3>
                                    <p className="text-gray-600">
                                        Suivez nos résultats et classements dans
                                        les championnats régionaux.
                                    </p>
                                </div>
                            </div>
                        </Link>


                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="py-16 bg-white">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                            Actualités du club
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* News Item 1 */}
                        <article className="overflow-hidden bg-gray-50 rounded-lg">
                            <img
                                src="/image/AdobeStock_133397076.jpeg"
                                alt="Tournoi d'été"
                                className="object-cover w-full h-48"
                            />
                            <div className="p-6">
                                <div className="text-sm text-[#425e9b] font-semibold mb-2">
                                    15 Juin 2024
                                </div>
                                <h3 className="mb-3 text-xl font-semibold">
                                    Grand Tournoi d'Été
                                </h3>
                                <p className="mb-4 text-gray-600">
                                    Inscriptions ouvertes pour notre
                                    traditionnel tournoi d'été qui aura lieu le
                                    20 juillet.
                                </p>
                                <Link
                                    to="/animations"
                                    className="text-[#425e9b] hover:text-[#3a5287] font-semibold"
                                >
                                    En savoir plus →
                                </Link>
                            </div>
                        </article>

                        {/* News Item 2 */}
                        <article className="overflow-hidden bg-gray-50 rounded-lg">
                            <img
                                src="/image/AdobeStock_114710176.jpeg"
                                alt="Nouveaux équipements"
                                className="object-cover w-full h-48"
                            />
                            <div className="p-6">
                                <div className="text-sm text-[#425e9b] font-semibold mb-2">
                                    10 Juin 2024
                                </div>
                                <h3 className="mb-3 text-xl font-semibold">
                                    Nouveaux Équipements
                                </h3>
                                <p className="mb-4 text-gray-600">
                                    Le club s'équipe de nouvelles boules de
                                    compétition pour améliorer les conditions de
                                    jeu.
                                </p>
                                <Link
                                    to="/contact"
                                    className="text-[#425e9b] hover:text-[#3a5287] font-semibold"
                                >
                                    En savoir plus →
                                </Link>
                            </div>
                        </article>

                        {/* News Item 3 */}
                        <article className="overflow-hidden bg-gray-50 rounded-lg">
                            <img
                                src="/image/AdobeStock_645053.jpeg"
                                alt="Assemblée générale"
                                className="object-cover w-full h-48"
                            />
                            <div className="p-6">
                                <div className="text-sm text-[#425e9b] font-semibold mb-2">
                                    5 Juin 2024
                                </div>
                                <h3 className="mb-3 text-xl font-semibold">
                                    Assemblée Générale
                                </h3>
                                <p className="mb-4 text-gray-600">
                                    Retour sur l'assemblée générale du club et
                                    présentation des projets pour la saison.
                                </p>
                                <Link
                                    to="/contact"
                                    className="text-[#425e9b] hover:text-[#3a5287] font-semibold"
                                >
                                    En savoir plus →
                                </Link>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#425e9b]">
                <div className="px-4 mx-auto max-w-7xl text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        Rejoignez notre club !
                    </h2>
                    <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
                        Que vous soyez débutant ou joueur confirmé, notre club
                        vous accueille dans une ambiance conviviale et sportive.
                    </p>
                    <Link
                        to="/contact"
                        className="bg-white text-[#425e9b] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
                    >
                        Nous contacter
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
