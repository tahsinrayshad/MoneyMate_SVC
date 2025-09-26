import { useState, useEffect, useCallback } from 'react';
import CreateTransactionModal from '../components/CreateTransactionModal';
import { transactionService } from '../services/api';
import { Plus, Search, Filter, Calendar, ArrowUpRight, ArrowDownRight, CreditCard as Edit, Trash2, DollarSign, TrendingUp, TrendingDown, PieChart, AlertCircle, RefreshCw } from 'lucide-react';

function TransactionPage() {
  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionList, setTransactionList] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    total_income: '0.00',
    total_expense: '0.00',
    current_balance: '0.00',
    income_transactions_count: 0,
    expense_transactions_count: 0,
    total_transactions_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username] = useState('test_user'); // You can get this from auth context or props

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getTransactions(username);
      
      if (response.data.success) {
        setTransactionList(response.data.data || []);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  const loadFinancialSummary = useCallback(async () => {
    try {
      const response = await transactionService.getFinancialSummary(username);
      
      if (response.data.success) {
        setFinancialSummary(response.data.data);
      }
    } catch (err) {
      console.error('Error loading financial summary:', err);
    }
  }, [username]);

  // Load data on component mount
  useEffect(() => {
    loadTransactions();
    loadFinancialSummary();
  }, [loadTransactions, loadFinancialSummary]);

  const handleCreateTransaction = async (transactionData) => {
    try {
      const response = await transactionService.createTransaction({
        ...transactionData,
        username: username,
        user_id: 1 // You can get this from auth context
      });

      if (response.data.success) {
        // Reload data to get fresh information
        await loadTransactions();
        await loadFinancialSummary();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to create transaction');
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  };



  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await transactionService.deleteTransaction(id);
      
      if (response.data.success) {
        await loadTransactions();
        await loadFinancialSummary();
      } else {
        throw new Error(response.data.message || 'Failed to delete transaction');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  // Filter transactions based on search and filter criteria
  const filteredTransactions = transactionList.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ title, value, icon: IconComponent, colorClass }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">${parseFloat(value || 0).toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          {IconComponent && <IconComponent size={24} className="text-white" />}
        </div>
      </div>
    </div>
  );

  const TransactionRow = ({ transaction, onDelete }) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return dateString;
      }
    };

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight size={20} className="text-green-600" />
              ) : (
                <ArrowDownRight size={20} className="text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{transaction.description || 'No description'}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>@{transaction.username}</span>
                <span>•</span>
                <span>{formatDate(transaction.created_at)}</span>
                <span>•</span>
                <span className="capitalize">{transaction.type}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              <p className="font-bold text-lg">
                {transaction.type === 'income' ? '+' : ''}${parseFloat(transaction.amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit transaction (coming soon)"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(transaction.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete transaction"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Track and manage all your income and expenses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={financialSummary.total_income}
          icon={TrendingUp}
          colorClass="bg-gradient-to-r from-green-500 to-emerald-600"
        />
        <StatCard
          title="Total Expenses"
          value={financialSummary.total_expense}
          icon={TrendingDown}
          colorClass="bg-gradient-to-r from-red-500 to-pink-600"
        />
        <StatCard
          title="Current Balance"
          value={financialSummary.current_balance}
          icon={DollarSign}
          colorClass={`bg-gradient-to-r ${parseFloat(financialSummary.current_balance) >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'}`}
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
          
          <button 
            onClick={() => {loadTransactions(); loadFinancialSummary();}}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => {loadTransactions(); loadFinancialSummary();}}
              className="ml-auto text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={48} className="text-gray-300 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading transactions...</h3>
          <p className="text-gray-500">Please wait while we fetch your data.</p>
        </div>
      ) : (
        <>
          {/* Transactions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Transactions ({filteredTransactions.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Total: {financialSummary.total_transactions_count} transactions</span>
              </div>
            </div>
            
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map(transaction => (
                  <TransactionRow 
                    key={transaction.id} 
                    transaction={transaction} 
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <PieChart size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No transactions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedFilter !== 'all' 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Get started by adding your first transaction.'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Transaction
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}

export default TransactionPage;