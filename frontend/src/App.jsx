import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionPage from './pages/TransactionPage';
import BlogPage from './pages/BlogPage';
import Navigation from './components/Navigation';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
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
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} user={user} />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}


export default App;