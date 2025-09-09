# Guide de Finalisation du Système d'Authentification

## État Actuel du Système

### ✅ Fonctionnalités Opérationnelles
- Interface utilisateur complète (Header avec menu utilisateur)
- Hook `useAuth` avec simulation d'authentification
- Gestion des rôles (admin/membre)
- Redirection automatique vers Dashboard après connexion
- Affichage conditionnel des éléments selon le statut de connexion
- Base de données MySQL configurée et opérationnelle
- API backend avec endpoints de base

### ⚠️ Limitations Actuelles
- Données utilisateur simulées (pas de vraie authentification)
- Absence de persistance des sessions
- Pas de validation des credentials
- Pas d'intégration avec la base de données pour l'authentification

## Architecture Technique

### Backend (API)
- **Serveur**: Express.js sur port 8080
- **Base de données**: MySQL avec tables `events` et `members`
- **Structure**: `api/server.ts` avec routes modulaires

### Frontend
- **Framework**: React + Vite sur port 5173
- **Authentification**: Hook `useAuth` dans `src/hooks/useAuth.jsx`
- **Interface**: Composant `Header` avec menu utilisateur

## Plan d'Implémentation Complet

### Phase 1: Préparation de la Base de Données

#### 1.1 Création de la table `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('admin', 'membre') DEFAULT 'membre',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.2 Relation avec la table `members`
```sql
ALTER TABLE members ADD COLUMN user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

### Phase 2: Implémentation Backend

#### 2.1 Installation des dépendances
```bash
npm install bcryptjs jsonwebtoken express-rate-limit helmet
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

#### 2.2 Configuration des variables d'environnement
Ajouter dans `.env`:
```
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

#### 2.3 Middleware d'authentification
Créer `api/middleware/auth.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};
```

#### 2.4 Routes d'authentification
Créer `api/routes/auth.ts`:
```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS!));
    
    // Créer l'utilisateur
    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName]
    );
    
    const userId = result.insertId;
    
    // Générer le token
    const token = jwt.sign(
      { userId, email, firstName, lastName, role: 'membre' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      token,
      user: { id: userId, email, firstName, lastName, role: 'membre' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const users = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Profil utilisateur
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const users = await db.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

export default router;
```

### Phase 3: Modification du Frontend

#### 3.1 Service API
Créer `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur API');
    }

    return data;
  }

  // Méthodes d'authentification
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(data.token);
    return data;
  }

  async register(email, password, firstName, lastName) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, firstName, lastName },
    });
    this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();
```

#### 3.2 Modification du hook useAuth
Modifier `src/hooks/useAuth.jsx`:
```javascript
import { useState, useEffect, createContext, useContext } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiService.setToken(token);
        const userData = await apiService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiService.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiService.register(email, password, firstName, lastName);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isMembre = () => user?.role === 'membre';

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isMembre,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
```

#### 3.3 Formulaires de connexion/inscription
Créer `src/components/LoginForm.jsx`:
```javascript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      
      <button
        type="button"
        onClick={switchToRegister}
        className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
      >
        Pas encore de compte ? S'inscrire
      </button>
    </form>
  );
};

export default LoginForm;
```

### Phase 4: Tests et Validation

#### 4.1 Tests Backend
```bash
# Test de l'inscription
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"motdepasse123","firstName":"Test","lastName":"User"}'

# Test de la connexion
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"motdepasse123"}'

# Test du profil (avec token)
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4.2 Tests Frontend
- Inscription d'un nouvel utilisateur
- Connexion avec les credentials
- Persistance de la session après rechargement
- Déconnexion et nettoyage du token
- Gestion des erreurs (mauvais credentials, etc.)

### Phase 5: Sécurité et Optimisations

#### 5.1 Sécurité
- Rate limiting sur les endpoints d'authentification
- Validation des données d'entrée
- Sanitisation des inputs
- HTTPS en production
- Rotation des tokens JWT

#### 5.2 Optimisations
- Mise en cache des données utilisateur
- Refresh token pour les sessions longues
- Lazy loading des composants d'authentification

## Plan de Déploiement

### Étape 1: Préparation
1. Configurer les variables d'environnement de production
2. Sécuriser la base de données MySQL
3. Configurer HTTPS

### Étape 2: Déploiement Backend
1. Build de l'API TypeScript
2. Configuration du serveur de production
3. Migration de la base de données

### Étape 3: Déploiement Frontend
1. Build de l'application React
2. Configuration des URLs d'API de production
3. Déploiement sur CDN/serveur web

### Étape 4: Tests de Production
1. Tests d'intégration complets
2. Tests de charge
3. Validation de la sécurité

## Checklist de Finalisation

- [ ] Table `users` créée en base
- [ ] Routes d'authentification implémentées
- [ ] Middleware d'authentification configuré
- [ ] Service API frontend créé
- [ ] Hook `useAuth` modifié pour utiliser l'API
- [ ] Formulaires de connexion/inscription créés
- [ ] Tests backend effectués
- [ ] Tests frontend effectués
- [ ] Gestion d'erreurs implémentée
- [ ] Sécurité renforcée
- [ ] Documentation utilisateur créée
- [ ] Déploiement en production

## Ressources et Références

- [Documentation JWT](https://jwt.io/)
- [Bcrypt.js Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Authentication Patterns](https://reactjs.org/docs/context.html)

---

**Note**: Ce guide fournit une feuille de route complète pour finaliser le système d'authentification. Chaque phase peut être implémentée progressivement en testant à chaque étape.