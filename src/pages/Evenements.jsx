import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'

const Evenements = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  
  // Récupérer l'ID de l'événement depuis l'URL
  const urlParams = new URLSearchParams(location.search)
  const eventId = urlParams.get('id')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    // Scroll vers l'événement spécifique si un ID est fourni
    if (eventId && events.length > 0) {
      const eventElement = document.getElementById(`event-${eventId}`)
      if (eventElement) {
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Ajouter une classe de surbrillance temporaire
        eventElement.classList.add('highlight-event')
        setTimeout(() => {
          eventElement.classList.remove('highlight-event')
        }, 3000)
      }
    }
  }, [eventId, events])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.slice(0, 5) // Format HH:MM
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Événements du Club</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez tous nos événements, tournois et animations organisés par le club de pétanque de Noveant-sur-Moselle.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement programmé</h3>
            <p className="text-gray-600">Revenez bientôt pour découvrir nos prochains événements !</p>
          </div>
        ) : (
          <div className="grid gap-8 md:gap-12">
            {events.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={`bg-white rounded-xl