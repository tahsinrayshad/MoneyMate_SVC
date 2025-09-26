import { useState, useEffect, useCallback } from "react";
import { transactionService } from "../services/api";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

function Dashboard({ user, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username] = useState("test_user"); // You can get this from auth context or props

  // Real data from API
  const [financialSummary, setFinancialSummary] = useState({
    total_income: "0.00",
    total_expense: "0.00",
    current_balance: "0.00",
    income_transactions_count: 0,
    expense_transactions_count: 0,
    total_transactions_count: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  const handleBlogClick = () => {
    if (onNavigate) {
      onNavigate("blog");
    }
  };

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load financial summary
      const summaryResponse = await transactionService.getFinancialSummary(
        username
      );
      if (summaryResponse.data.success) {
        setFinancialSummary(summaryResponse.data.data);
      }

      // Load recent transactions (limit to 5 for dashboard)
      const transactionsResponse = await transactionService.getTransactions(
        username
      );
      if (transactionsResponse.data.success) {
        const sortedTransactions = transactionsResponse.data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentTransactions(sortedTransactions);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const StatCard = ({ title, value, icon: IconComponent, colorClass }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            ${parseFloat(value || 0).toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          {IconComponent && <IconComponent size={24} className="text-white" />}
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
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 uppercase">{user?.firstname ? `${user.firstname} ${user.lastname}` : user?.username || "User"}</span>!
            </h1>
            <p className="text-gray-600">
              Here's your financial overview.
            </p>
          </div>
          
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={loadDashboardData}
              className="ml-auto text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current Balance"
          value={financialSummary.current_balance}
          icon={DollarSign}
          colorClass={`bg-gradient-to-r ${
            parseFloat(financialSummary.current_balance) >= 0
              ? "from-emerald-500 to-green-600"
              : "from-red-500 to-pink-600"
          }`}
        />
        <StatCard
          title="Total Income"
          value={financialSummary.total_income}
          icon={TrendingUp}
          colorClass="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Total Expenses"
          value={financialSummary.total_expense}
          icon={TrendingDown}
          colorClass="bg-gradient-to-r from-red-500 to-pink-600"
        />
        <StatCard
          title="Transaction Count"
          value={financialSummary.total_transactions_count}
          icon={PiggyBank}
          colorClass="bg-gradient-to-r from-purple-500 to-violet-600"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Transactions
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={() => onNavigate && onNavigate("transactions")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 animate-pulse"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const formatDate = (dateString) => {
                    try {
                      return new Date(dateString).toLocaleDateString();
                    } catch {
                      return dateString;
                    }
                  };

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight
                              size={16}
                              className="text-green-600"
                            />
                          ) : (
                            <ArrowDownRight
                              size={16}
                              className="text-red-600"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description || "No description"}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{transaction.username} •{" "}
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-right ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <p className="font-bold">
                          $
                          {parseFloat(transaction.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by adding your first transaction
                </p>
                <button
                  onClick={() => onNavigate && onNavigate("transactions")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Financial Summary
              </h3>
              <Target size={20} className="text-blue-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Income</span>
                <span className="font-bold text-green-600">
                  ${parseFloat(financialSummary.total_income).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="font-bold text-red-600">
                  ${parseFloat(financialSummary.total_expense).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-900">
                  Net Balance
                </span>
                <span
                  className={`font-bold ${
                    parseFloat(financialSummary.current_balance) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  $
                  {parseFloat(
                    financialSummary.current_balance
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Transaction Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">
                    Income Transactions
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {financialSummary.income_transactions_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-700">
                    Expense Transactions
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {financialSummary.expense_transactions_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Total Transactions
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {financialSummary.total_transactions_count}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
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
