import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import logo from '../images/Logo cabinet.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Try to parse error message, but handle HTML responses (404, etc.)
        let errorMessage = 'Erreur de connexion au serveur';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON (e.g., 404 HTML page), use default message
          if (response.status === 404) {
            errorMessage = 'Serveur non disponible. Vérifiez que le serveur backend est démarré.';
          }
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Sauvegarder les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin();
        navigate('/dashboard');
      } else {
        setError(data.error || 'Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo Cabinet" className="h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Cabinet Dr Benmoro</h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
          >
            Se connecter
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;

