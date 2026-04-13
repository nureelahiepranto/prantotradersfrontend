import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { 
  FiDollarSign, 
  FiCreditCard, 
  FiClock, 
  FiPackage, 
  FiRefreshCw,
  FiTrendingUp,
  FiShoppingCart,
  FiArrowUpRight,
  FiArrowDownRight,
  FiActivity,
  FiCalendar
} from "react-icons/fi";
import { MdOutlineInventory } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";

export default function DSRDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCollections: 0,
    pendingCollections: 0,
    totalStock: 0,
    totalReturns: 0,
    totalCustomers: 0,
    todaySales: 0,
    todayCollections: 0
  });

  const [recentSales, setRecentSales] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today"); // today, week, month

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dsr/dashboard/${user.id}?period=${selectedPeriod}`);
      
      setStats({
        totalSales: res.data.stats.totalSales || 0,
        totalCollections: res.data.stats.totalCollections || 0,
        pendingCollections: res.data.stats.pendingCollections || 0,
        totalStock: res.data.totalStock || 0,
        totalReturns: res.data.totalReturns || 0,
        totalCustomers: res.data.stats.totalCustomers || 0,
        todaySales: res.data.stats.todaySales || 0,
        todayCollections: res.data.stats.todayCollections || 0
      });

      setRecentSales(res.data.recentSales || []);
      setRecentReturns(res.data.recentReturns || []);
      setTopProducts(res.data.topProducts || []);
    } catch (err) {
      console.log("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "dsr") {
      fetchDashboard();
    }
  }, [user, selectedPeriod]);

  // Calculate percentages and trends
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Welcome back, <span className="text-green-500">{user?.name || "DSR"}</span> !
              </h1>
              <p className="text-gray-600">Here's what's happening with your sales today</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex bg-white rounded-lg p-1">
                <button
                  onClick={() => setSelectedPeriod("today")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === "today" 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedPeriod("week")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === "week" 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setSelectedPeriod("month")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === "month" 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  This Month
                </button>
              </div>
              
              <button
                onClick={fetchDashboard}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Sales */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                  +12.5%
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Sales</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalSales)}</p>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <FiCalendar className="mr-1" size={12} />
                {selectedPeriod === "today" ? "Today" : 
                 selectedPeriod === "week" ? "This Week" : "This Month"}
              </div>
            </div>

            {/* Total Collections */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FiCreditCard className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                  +8.3%
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Collections</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalCollections)}</p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-600">Collected</span>
              </div>
            </div>

            {/* Pending Collections */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FiClock className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 rounded-full">
                  {stats.pendingCollections > 0 ? "Attention" : "Clear"}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Pending</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.pendingCollections)}</p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.pendingCollections > 0 ? 
                  <span className="text-red-600">Need to collect</span> : 
                  <span className="text-green-600">All clear</span>
                }
              </div>
            </div>

            {/* Available Stock */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MdOutlineInventory className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                  {stats.totalStock > 10 ? "Good" : "Low"}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Available Stock</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStock} items</p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalStock > 10 ? 
                  <span className="text-green-600">Stock level good</span> : 
                  <span className="text-yellow-600">Stock running low</span>
                }
              </div>
            </div>
          </div>

          {/* Secondary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Customers */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                  <FiActivity className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>

            {/* Total Returns */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                  <FiRefreshCw className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Returns</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalReturns}</p>
                </div>
              </div>
            </div>

            {/* Today's Performance */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today's Sales</p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.todaySales)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Sales - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiShoppingCart className="mr-2" size={20} />
                  Recent Sales
                </h2>
                <span className="text-sm text-gray-500">
                  Showing {recentSales.length} transactions
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left font-medium text-gray-700">Product</th>
                    <th className="p-4 text-left font-medium text-gray-700">Customer</th>
                    <th className="p-4 text-left font-medium text-gray-700">Quantity</th>
                    <th className="p-4 text-left font-medium text-gray-700">Total</th>
                    <th className="p-4 text-left font-medium text-gray-700">Date</th>
                    <th className="p-4 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <div className="text-gray-500">
                          <FiShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <h3 className="font-medium text-gray-700 mb-1">No Recent Sales</h3>
                          <p className="text-sm">Your recent sales will appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-800">{sale.productName || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-700">{sale.customerName || "Walk-in"}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                            {sale.quantity || 0}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-800">
                          {formatCurrency(sale.totalPrice || 0)}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {formatDate(sale.createdAt)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status || 'completed')}`}>
                            {sale.status || 'completed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar - Recent Activity & Top Products */}
          <div className="space-y-6">
            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiTrendingUp className="mr-2" size={20} />
                  Top Products
                </h2>
              </div>
              <div className="p-4">
                {topProducts.length === 0 ? (
                  <div className="text-center py-6">
                    <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No product data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 ${
                            index === 0 ? 'bg-yellow-50 text-yellow-600' :
                            index === 1 ? 'bg-gray-50 text-gray-600' :
                            index === 2 ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            <span className="font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-500">Sold: {product.totalSold || 0}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">{formatCurrency(product.totalRevenue || 0)}</div>
                          <div className="text-xs text-green-600 flex items-center justify-end">
                            <FiArrowUpRight className="mr-1" size={12} />
                            +{(product.growth || 0).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Returns */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiRefreshCw className="mr-2" size={20} />
                  Recent Returns
                </h2>
              </div>
              <div className="p-4">
                {recentReturns.length === 0 ? (
                  <div className="text-center py-6">
                    <FiRefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No recent returns</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReturns.slice(0, 5).map((rt) => (
                      <div key={rt._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="font-medium text-gray-800">{rt.productName || "N/A"}</div>
                          <div className="text-sm text-gray-500">{formatDate(rt.date)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{rt.quantity || 0} units</div>
                          {rt.reason && (
                            <div className="text-xs text-gray-500 truncate max-w-[100px]">{rt.reason}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl text-center transition-colors">
              <FiShoppingCart className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">New Sale</div>
            </button>
            <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-xl text-center transition-colors">
              <TbReportMoney className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Collect Payment</div>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-xl text-center transition-colors">
              <FiPackage className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Check Stock</div>
            </button>
            <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-xl text-center transition-colors">
              <FiRefreshCw className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Return Product</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}