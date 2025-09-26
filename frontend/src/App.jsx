import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionPage from './pages/TransactionPage';
import BlogPage from './pages/BlogPage';
import Navigation from './components/Navigation';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('http://localhost:9000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        console.error('Failed to fetch user info');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogin = async (loginData) => {
    // Store the token
    const token = loginData.access_token || localStorage.getItem('access_token');
    
    if (token) {
      // Fetch user info from API
      const userInfo = await fetchUserInfo(token);
      
      if (userInfo) {
        setUser(userInfo);
        setCurrentPage('dashboard');
      } else {
        // If fetching user info fails, clear tokens and stay on login
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('expires_in');
        console.error('Failed to fetch user information');
      }
    }
  };

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    
    // Clear user state and navigate to login
    setUser(null);
    setCurrentPage('login');
  };

  // Check for existing token on app load
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        const userInfo = await fetchUserInfo(token);
        
        if (userInfo) {
          setUser(userInfo);
          setCurrentPage('dashboard');
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('expires_in');
        }
      }
    };

    checkExistingAuth();
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      // Add cases for 'signup' and 'login' in the switch statement
      case 'signup':
        return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setCurrentPage('login')} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage('signup')} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'transactions':
        return <TransactionPage user={user} onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogPage user={user} onNavigate={handleNavigate} />;
      default:
        return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation currentPage={currentPage} onNavigate={handleNavigate} user={user} onLogout={handleLogout} />}
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}


export default App;