import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, UserCog, CheckCircle } from 'lucide-react';
import logo from '../images/Logo cabinet.png';

function Layout({ children, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Récupérer le rôle de l'utilisateur
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
    }
    return null;
  };

  const userRole = getUserRole();
  const isDoctor = userRole === 'docteur';

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-primary-100">
          <img src={logo} alt="Logo Cabinet" className="h-16 mx-auto" />
          <h1 className="text-center text-primary-600 font-bold text-xl mt-4">
            Cabinet Dr Benmoro 
          </h1>
        </div>
        
        <nav className="mt-8">
          <Link
            to="/dashboard"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 transition-colors ${
              isActive('/dashboard') || isActive('/') ? 'bg-primary-50 border-r-4 border-primary-600' : ''
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Tableau de bord
          </Link>
          
          <Link
            to="/patients"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 transition-colors ${
              isActive('/patients') ? 'bg-primary-50 border-r-4 border-primary-600' : ''
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Patients
          </Link>
          
          <Link
            to="/rendezvous"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 transition-colors ${
              isActive('/rendezvous') ? 'bg-primary-50 border-r-4 border-primary-600' : ''
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Rendez-vous
          </Link>
          
          <Link
            to="/controles"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 transition-colors ${
              isActive('/controles') ? 'bg-primary-50 border-r-4 border-primary-600' : ''
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-3" />
            Contrôles
          </Link>
          
          {isDoctor && (
            <Link
              to="/users"
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 transition-colors ${
                isActive('/users') ? 'bg-primary-50 border-r-4 border-primary-600' : ''
              }`}
            >
              <UserCog className="w-5 h-5 mr-3" />
              Utilisateurs
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-primary-100">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}

export default Layout;

