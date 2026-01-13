import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { Menu, X, ChefHat, User, LogOut, Settings, Shield } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load user data on app start if token exists
    if (!user && localStorage.getItem('authToken')) {
      loadUser();
    }
  }, [user, loadUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm relative" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
                aria-label="Recipe Keeper - Home"
              >
                <ChefHat className="h-6 w-6" />
                <span>Recipe Keeper</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/recipes" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="View my recipes"
                  >
                    My Recipes
                  </Link>
                  <Link
                    to="/recipes/public"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="View community recipes"
                  >
                    Community Recipes
                  </Link>
                  {authService.isAdmin() && (
                    <>
                      <Link
                        to="/admin/users"
                        className="flex items-center space-x-1 text-purple-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Admin users management"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Users</span>
                      </Link>
                      <Link
                        to="/admin/recipes"
                        className="flex items-center space-x-1 text-purple-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Admin recipes management"
                      >
                        <Shield className="h-4 w-4" />
                        <span>All Recipes</span>
                      </Link>
                    </>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-700">
                      <User className="h-4 w-4" />
                      <span>Welcome, {user?.name}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Profile settings"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Login to your account"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Create a new account"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white border-t border-gray-200`}>
          <div className="px-4 py-2 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user?.name}</span>
                </div>
                <Link
                  to="/recipes"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                  aria-label="View my recipes"
                >
                  My Recipes
                </Link>
                <Link
                  to="/recipes/public"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                  aria-label="View community recipes"
                >
                  Community Recipes
                </Link>
                {authService.isAdmin() && (
                  <>
                    <Link
                      to="/admin/users"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 px-3 py-2 text-purple-700 hover:text-purple-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                      aria-label="Admin users management"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin: Users</span>
                    </Link>
                    <Link
                      to="/admin/recipes"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 px-3 py-2 text-purple-700 hover:text-purple-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                      aria-label="Admin recipes management"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin: All Recipes</span>
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                  aria-label="Profile settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200"
                  aria-label="Login to your account"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors duration-200"
                  aria-label="Create a new account"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="flex-1" role="main">
        {children}
      </main>
    </div>
  );
};