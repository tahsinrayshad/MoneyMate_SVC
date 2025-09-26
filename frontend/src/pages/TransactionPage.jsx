import { useState } from 'react';
import CreateTransactionModal from '../components/CreateTransactionModal';
import { Plus, Search, Filter, Calendar, ArrowUpRight, ArrowDownRight, CreditCard as Edit, Trash2, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

function TransactionPage({ user }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  // Mock transaction data
  const transactions = [
    { id: 1, type: 'income', description: 'Salary Payment', amount: 5200.00, date: '2025-01-15', category: 'Work', method: 'Bank Transfer' },
    { id: 2, type: 'expense', description: 'Grocery Shopping', amount: -120.50, date: '2025-01-14', category: 'Food', method: 'Credit Card' },
    { id: 3, type: 'expense', description: 'Electricity Bill', amount: -85.00, date: '2025-01-13', category: 'Utilities', method: 'Auto Pay' },
    { id: 4, type: 'income', description: 'Freelance Project', amount: 450.00, date: '2025-01-12', category: 'Work', method: 'PayPal' },
    { id: 5, type: 'expense', description: 'Dinner Out', amount: -65.80, date: '2025-01-11', category: 'Food', method: 'Debit Card' },
    { id: 6, type: 'expense', description: 'Gas Station', amount: -45.00, date: '2025-01-10', category: 'Transport', method: 'Credit Card' },
    { id: 7, type: 'income', description: 'Investment Dividend', amount: 125.75, date: '2025-01-09', category: 'Investment', method: 'Bank Transfer' },
    { id: 8, type: 'expense', description: 'Netflix Subscription', amount: -15.99, date: '2025-01-08', category: 'Entertainment', method: 'Credit Card' },
    { id: 9, type: 'expense', description: 'Coffee Shop', amount: -12.50, date: '2025-01-07', category: 'Food', method: 'Cash' },
    { id: 10, type: 'income', description: 'Cash Gift', amount: 100.00, date: '2025-01-06', category: 'Gift', method: 'Cash' }
  ];

  const [transactionList, setTransactionList] = useState(transactions);

  const handleCreateTransaction = (newTransaction) => {
    setTransactionList([newTransaction, ...transactionList]);
  };

  // Calculate summary stats
  const totalIncome = transactionList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactionList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const netAmount = totalIncome - totalExpenses;

  const filteredTransactions = transactionList.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(transactions.map(t => t.category))];
  const paymentMethods = [...new Set(transactions.map(t => t.method))];

  const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">${Math.abs(value).toLocaleString()}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const TransactionRow = ({ transaction }) => (
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
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{transaction.category}</span>
              <span>•</span>
              <span>{transaction.date}</span>
              <span>•</span>
              <span>{transaction.method}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            <p className="font-bold text-lg">
              {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Edit size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          value={totalIncome}
          icon={TrendingUp}
          colorClass="bg-gradient-to-r from-green-500 to-emerald-600"
          trend={12.5}
        />
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          icon={TrendingDown}
          colorClass="bg-gradient-to-r from-red-500 to-pink-600"
          trend={-3.2}
        />
        <StatCard
          title="Net Amount"
          value={netAmount}
          icon={DollarSign}
          colorClass={`bg-gradient-to-r ${netAmount >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'}`}
          trend={8.7}
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
          
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Transactions ({filteredTransactions.length})
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>Showing results for {selectedMonth}</span>
          </div>
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <PieChart size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Transaction
            </button>
          </div>
        )}
      </div>

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