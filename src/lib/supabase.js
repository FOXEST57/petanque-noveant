import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://axqprnuyldvpkofanakt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cXBybnV5bGR2cGtvZmFuYWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTYxMzYsImV4cCI6MjA3MTc3MjEzNn0.33dMKXHVZ5j9yz3ll5zSyndLhgsX9zmRO1zeQ-wzxOU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for authentication
export const auth = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Helper functions for database operations
export const db = {
  // Users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    return { data, error }
  },

  getUserById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Teams
  getTeams: async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')
    return { data, error }
  },

  getTeamById: async (id) => {
    const { data, error } = await supabase
      .from('teams')
      .select('*, team_members(*, users(*))')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Events
  getEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
    return { data, error }
  },

  getEventById: async (id) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  getUpcomingEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date')
      .limit(5)
    return { data, error }
  },

  // Albums and Photos
  getAlbums: async () => {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getPhotosByAlbum: async (albumId) => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('uploaded_at', { ascending: false })
    return { data, error }
  },

  // Matches
  getMatches: async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*)')
      .order('match_date', { ascending: false })
    return { data, error }
  }
}