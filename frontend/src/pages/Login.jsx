import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { RiLockLine, RiUserLine, RiAlertLine, RiLoginBoxLine } from 'react-icons/ri';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination after login
  const from = location.state?.from?.pathname || "/";

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
    
    // Check API status
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/test');
        const data = await response.json();
        setApiStatus({ ok: true, message: data.message });
      } catch (error) {
        console.error('API check failed:', error);
        setApiStatus({ ok: false, message: 'Could not connect to API' });
      }
    };
    
    checkApiStatus();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setLoginError('Veuillez saisir votre nom d\'utilisateur et votre mot de passe');
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      console.log('Attempting login with:', username, password);
      const response = await login(username, password);
      console.log('Login successful:', response);
      
      // Redirect to the intended destination
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(
        error.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">GestionMachines</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder à votre espace de gestion
          </p>
        </div>
        
        {apiStatus && !apiStatus.ok && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <RiAlertLine className="mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Problème de connexion à l'API</p>
              <p className="text-xs mt-1">
                Impossible de se connecter à l'API. Veuillez vérifier que le serveur backend est en cours d'exécution à l'adresse http://127.0.0.1:8000/api
              </p>
            </div>
          </div>
        )}
        
        {apiStatus && apiStatus.ok && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center">
            <div className="text-xs">
              API connectée: {apiStatus.message}
            </div>
          </div>
        )}
        
        {loginError && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <RiAlertLine className="mr-2 flex-shrink-0" />
            <p className="text-sm">{loginError}</p>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiUserLine className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiLockLine className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || (apiStatus && !apiStatus.ok)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <RiLoginBoxLine className="mr-2 h-5 w-5" />
                  Se connecter
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <p className="text-center text-xs text-gray-600">
            Si vous rencontrez des problèmes de connexion, veuillez contacter votre administrateur système.
          </p>
          
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-bold">Utilisateur de test:</p>
            <p>Nom: Admin</p>
            <p>Mot de passe: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;