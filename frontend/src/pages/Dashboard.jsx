import { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  Users, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  BookOpen
} from 'lucide-react';

function Dashboard({ user, onNavigate }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handleBlogClick = () => {
    if (onNavigate) {
      onNavigate('blog');
    }
  };

  // Mock data
  const dashboardData = {
    totalBalance: 15750.50,
    monthlyIncome: 5200.00,
    monthlyExpenses: 3450.75,
    savings: 12300.25,
    activeLoans: 3,
    budgetProgress: 68
  };

  const recentTransactions = [
    { id: 1, type: 'income', description: 'Salary', amount: 5200.00, date: '2025-01-15', category: 'Work' },
    { id: 2, type: 'expense', description: 'Groceries', amount: -120.50, date: '2025-01-14', category: 'Food' },
    { id: 3, type: 'expense', description: 'Gas Bill', amount: -85.00, date: '2025-01-13', category: 'Utilities' },
    { id: 4, type: 'income', description: 'Freelance', amount: 450.00, date: '2025-01-12', category: 'Work' },
    { id: 5, type: 'expense', description: 'Restaurant', amount: -65.80, date: '2025-01-11', category: 'Food' }
  ];

  const expenseCategories = [
    { name: 'Food', amount: 850, percentage: 35, color: 'bg-red-500' },
    { name: 'Transport', amount: 420, percentage: 17, color: 'bg-blue-500' },
    { name: 'Entertainment', amount: 380, percentage: 16, color: 'bg-purple-500' },
    { name: 'Utilities', amount: 650, percentage: 27, color: 'bg-green-500' },
    { name: 'Other', amount: 150, percentage: 6, color: 'bg-gray-500' }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">${value.toLocaleString()}</p>
          {trend && (
            <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1 text-sm font-medium">{trendValue}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600">Here's your financial overview for this month.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Balance"
          value={dashboardData.totalBalance}
          icon={DollarSign}
          trend="up"
          trendValue="12.5"
          colorClass="bg-gradient-to-r from-emerald-500 to-green-600"
        />
        <StatCard
          title="Monthly Income"
          value={dashboardData.monthlyIncome}
          icon={TrendingUp}
          trend="up"
          trendValue="8.2"
          colorClass="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Monthly Expenses"
          value={dashboardData.monthlyExpenses}
          icon={TrendingDown}
          trend="down"
          trendValue="3.1"
          colorClass="bg-gradient-to-r from-red-500 to-pink-600"
        />
        <StatCard
          title="Savings"
          value={dashboardData.savings}
          icon={PiggyBank}
          trend="up"
          trendValue="15.8"
          colorClass="bg-gradient-to-r from-purple-500 to-violet-600"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight size={16} className="text-green-600" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className={`text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="font-bold">${Math.abs(transaction.amount).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Budget Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Budget Overview</h3>
              <Target size={20} className="text-blue-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Monthly Budget</span>
                  <span className="font-medium">{dashboardData.budgetProgress}% used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${dashboardData.budgetProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$2,347 spent</span>
                  <span>$3,450 limit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Categories</h3>
            <div className="space-y-3">
              {expenseCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${category.amount}</p>
                    <p className="text-xs text-gray-500">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                <Plus size={16} />
                <span>Add Income</span>
              </button>
              <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                <Plus size={16} />
                <span>Add Expense</span>
              </button>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                <Users size={16} />
                <span>Manage Loans</span>
              </button>
              <button 
                onClick={handleBlogClick}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <BookOpen size={16} />
                <span>Blog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;