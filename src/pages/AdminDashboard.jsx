import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  FaBox, FaUsers, FaMoneyBillWave, FaChartLine, 
  FaSyncAlt, FaChevronDown, FaArrowRight, FaUser,
  FaPlus, FaUserPlus, FaFileAlt, FaShoppingCart,
  FaExclamationTriangle, FaCheckCircle, FaClock,
  FaSearch, FaBell, FaCog
} from 'react-icons/fa';
import { FiPackage, FiUsers, FiDollarSign, FiTrendingUp, FiSettings } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [dsrs, setDsrs] = useState([]);
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    totalDSR: 0, 
    totalDue: 0,
    totalSales: 0,
    totalCollections: 0,
    lowStockProducts: 0,
    pendingReturns: 5,
    activeCustomers: 156
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('week');
  const [topProducts, setTopProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);
  
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'New product added', user: 'Admin', time: '10 min ago', type: 'product' },
    { id: 2, action: 'DSR created', user: 'John Doe', time: '25 min ago', type: 'user' },
    { id: 3, action: 'Stock issued to DSR', user: 'System', time: '1 hour ago', type: 'issue' },
    { id: 4, action: 'Payment received', user: 'Mike Smith', time: '2 hours ago', type: 'payment' },
    { id: 5, action: 'Return processed', user: 'System', time: '3 hours ago', type: 'return' },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProducts(),
        loadDSRs(),
        loadAdditionalStats(),
        loadTopProducts()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products?page=1&limit=8");
      setProducts(res.data.products || []);
      setStats(prev => ({ 
        ...prev, 
        totalProducts: res.data.total || (res.data.products || []).length,
        lowStockProducts: (res.data.products || []).filter(p => p.adminStock < 20).length
      }));
    } catch (err) { console.error(err); }
  };

  const loadDSRs = async () => {
    try {
      const res = await api.get("/auth/dsrs");
      setDsrs(res.data || []);
      setStats(prev => ({ ...prev, totalDSR: (res.data || []).length }));
    } catch (err) { console.error(err); }
  };

  const loadAdditionalStats = async () => {
    try {
      setStats(prev => ({ 
        ...prev, 
        totalDue: 125000,
        totalSales: 450000,
        totalCollections: 325000
      }));
    } catch (err) { console.error(err); }
  };

  const loadTopProducts = async () => {
    const mockTopProducts = [
      { name: 'Product A', sales: 150, revenue: 75000 },
      { name: 'Product B', sales: 120, revenue: 60000 },
      { name: 'Product C', sales: 95, revenue: 47500 },
      { name: 'Product D', sales: 80, revenue: 40000 },
      { name: 'Product E', sales: 65, revenue: 32500 },
    ];
    setTopProducts(mockTopProducts);
  };

  // Chart Data
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (৳)',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (৳)',
        data: [450000, 520000, 480000, 610000, 590000, 730000],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(217, 70, 239, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const categoryData = {
    labels: ['Electronics', 'Clothing', 'Home', 'Sports', 'Others'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(99, 102, 241, 0.9)',
          'rgba(139, 92, 246, 0.9)',
          'rgba(168, 85, 247, 0.9)',
          'rgba(217, 70, 239, 0.9)',
          'rgba(236, 72, 153, 0.9)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return '৳' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
    },
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">    
      <div className="flex">    
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-10' : 'lg:ml-0'} ${sidebarOpen ? 'ml-0' : ''}`}>
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FiTrendingUp size={22} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                      <p className="text-gray-600 mt-1 text-sm md:text-base">
                        Welcome back, <span className="font-semibold text-indigo-600">{user?.name || 'Admin'}</span>! Here's what's happening today.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select 
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <option value="week">📅 This Week</option>
                      <option value="month">📆 This Month</option>
                      <option value="quarter">📊 This Quarter</option>
                      <option value="year">📈 This Year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <FaChevronDown size={14} />
                    </div>
                  </div>
                  <button 
                    onClick={loadDashboardData}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                  >
                    <FaSyncAlt size={16} className={`${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{stats.totalProducts}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${stats.lowStockProducts > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {stats.lowStockProducts} {stats.lowStockProducts > 0 ? 'Low Stock' : 'All Good'}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shadow">
                    <FiPackage size={24} className="text-blue-600" />
                  </div>
                </div>
                <Link to="/admin/products" className="flex items-center gap-2 text-blue-600 text-sm font-medium mt-4 hover:underline">
                  <span>View all products</span>
                  <FaArrowRight size={12} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Active DSRs</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{stats.totalDSR}</h3>
                    <p className="text-sm text-gray-500 mt-1">{stats.activeCustomers} customers</p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-100 to-green-50 rounded-xl flex items-center justify-center shadow">
                    <FiUsers size={24} className="text-green-600" />
                  </div>
                </div>
                <Link to="/admin/dsr-list" className="flex items-center gap-2 text-green-600 text-sm font-medium mt-4 hover:underline">
                  <span>Manage DSRs</span>
                  <FaArrowRight size={12} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Due</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">৳{stats.totalDue.toLocaleString()}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {stats.pendingReturns} pending returns
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl flex items-center justify-center shadow">
                    <FiDollarSign size={24} className="text-amber-600" />
                  </div>
                </div>
                <Link to="/admin/daily-collection" className="flex items-center gap-2 text-amber-600 text-sm font-medium mt-4 hover:underline">
                  <span>View collections</span>
                  <FaArrowRight size={12} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Sales</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">৳{stats.totalSales.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-sm text-green-600 font-medium flex items-center">
                        <FiTrendingUp size={14} className="mr-1" />
                        ↑ 12% from last month
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl flex items-center justify-center shadow">
                    <FaChartLine size={24} className="text-purple-600" />
                  </div>
                </div>
                <Link to="/admin/dsr-summary" className="flex items-center gap-2 text-purple-600 text-sm font-medium mt-4 hover:underline">
                  <span>View reports</span>
                  <FaArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales Chart */}
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Sales Overview</h2>
                    <p className="text-sm text-gray-500">Revenue trend for the last 7 days</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Last 7 days
                  </span>
                </div>
                <div className="h-72">
                  <Line data={salesData} options={chartOptions} />
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Monthly Revenue</h2>
                    <p className="text-sm text-gray-500">Performance for the last 6 months</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Last 6 months
                  </span>
                </div>
                <div className="h-72">
                  <Bar data={revenueData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Products & DSRs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Products */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Recent Products</h2>
                    <p className="text-sm text-gray-500">Latest products in inventory</p>
                  </div>
                  <Link to="/admin/products" className="flex items-center gap-2 text-indigo-600 font-medium hover:underline text-sm">
                    <span>View All</span>
                    <FaArrowRight size={12} />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-gray-600 font-medium text-sm">Product</th>
                        <th className="text-left py-3 text-gray-600 font-medium text-sm">SKU</th>
                        <th className="text-left py-3 text-gray-600 font-medium text-sm">Price</th>
                        <th className="text-left py-3 text-gray-600 font-medium text-sm">Stock</th>
                        <th className="text-left py-3 text-gray-600 font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                <FaBox size={16} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-500">{p.category || 'Uncategorized'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                              {p.sku || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-gray-800 text-sm">৳{Number(p.sellPrice).toFixed(2)}</td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <span className="font-medium mr-2 text-sm">{p.adminStock}</span>
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    p.adminStock > 50 ? 'bg-green-500' : 
                                    p.adminStock > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(p.adminStock, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              p.adminStock > 50 ? 'bg-green-100 text-green-800 border border-green-200' : 
                              p.adminStock > 20 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {p.adminStock > 50 ? 'In Stock' : p.adminStock > 20 ? 'Low' : 'Critical'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DSRs & Activities */}
              <div className="space-y-6">
                {/* DSR List */}
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-800">Active DSRs</h2>
                      <p className="text-sm text-gray-500">Currently working DSRs</p>
                    </div>
                    <Link to="/admin/dsr-list" className="flex items-center gap-2 text-indigo-600 font-medium hover:underline text-sm">
                      <span>View All</span>
                      <FaArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {dsrs.slice(0, 5).map(d => (
                      <div key={d._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mr-3">
                            <FaUser size={14} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                              {d.name}
                            </p>
                            <p className="text-xs text-gray-500">{d.phone || 'No phone'}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          ID: {d._id.slice(-6)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6">Recent Activities</h2>
                  <div className="space-y-4">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'product' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'user' ? 'bg-green-100 text-green-600' :
                          activity.type === 'issue' ? 'bg-purple-100 text-purple-600' :
                          activity.type === 'payment' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {activity.type === 'product' && <FaBox size={14} />}
                          {activity.type === 'user' && <FaUser size={14} />}
                          {activity.type === 'issue' && <FaShoppingCart size={14} />}
                          {activity.type === 'payment' && <FaMoneyBillWave size={14} />}
                          {activity.type === 'return' && <FaExclamationTriangle size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">by {activity.user}</span>
                            <span className="text-xs text-gray-400">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Category Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Category Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Sales by Category</h2>
                    <p className="text-sm text-gray-500">Product category distribution</p>
                  </div>
                </div>
                <div className="h-64">
                  <Pie data={categoryData} options={pieChartOptions} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 md:p-6 shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="text-white mb-6">
                    <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
                    <p className="text-indigo-100 text-sm">Perform common tasks quickly</p>
                  </div>
                  <div className="space-y-3">
                    <Link 
                      to="/admin/products/add" 
                      className="flex items-center gap-3 bg-white text-indigo-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      <FaPlus size={16} />
                      <span>Add New Product</span>
                    </Link>
                    <Link 
                      to="/admin/create-dsr" 
                      className="flex items-center gap-3 bg-transparent border-2 border-white text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      <FaUserPlus size={16} />
                      <span>Create New DSR</span>
                    </Link>
                    <Link 
                      to="/admin/dsr-daily-report" 
                      className="flex items-center gap-3 bg-transparent border-2 border-white text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      <FaFileAlt size={16} />
                      <span>Generate Report</span>
                    </Link>
                    <Link 
                      to="/admin/issue" 
                      className="flex items-center gap-3 bg-transparent border-2 border-white text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      <FaShoppingCart size={16} />
                      <span>Issue to DSR</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                    <FaCheckCircle size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Products in Stock</p>
                    <h3 className="text-xl font-bold text-gray-800">{stats.totalProducts - stats.lowStockProducts}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                    <FaClock size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Returns</p>
                    <h3 className="text-xl font-bold text-gray-800">{stats.pendingReturns}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                    <FiTrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Growth</p>
                    <h3 className="text-xl font-bold text-gray-800">+12.5%</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">System is running smoothly</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
// import React, { useEffect, useState, useContext } from "react";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import { Link } from "react-router-dom";

// export default function AdminDashboard(){
//   const { user } = useContext(AuthContext);
//   const [products, setProducts] = useState([]);
//   const [dsrs, setDsrs] = useState([]);
//   const [stats, setStats] = useState({ totalProducts: 0, totalDSR: 0, totalDue: 0 });

//   useEffect(()=> {
//     loadProducts();
//     loadDSRs();
//   }, []);

//   const loadProducts = async () => {
//     try {
//       const res = await api.get("/products?page=1&limit=9");
//       setProducts(res.data.products || []);
//       setStats(prev => ({ ...prev, totalProducts: res.data.total || (res.data.products || []).length }));
//     } catch (err) { console.error(err); }
//   };

//   const loadDSRs = async () => {
//     try {
//       const res = await api.get("/auth/dsrs");
//       setDsrs(res.data || []);
//       setStats(prev => ({ ...prev, totalDSR: (res.data || []).length }));
//     } catch (err) { console.error(err); }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="container-max mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
//           <div><Sidebar role={user?.role} /></div>
//           <main>
//             <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//               <div className="bg-white p-4 rounded shadow">
//                 <div className="text-sm text-gray-500">Total Products</div>
//                 <div className="text-2xl font-bold">{stats.totalProducts}</div>
//               </div>
//               <div className="bg-white p-4 rounded shadow">
//                 <div className="text-sm text-gray-500">Total DSRs</div>
//                 <div className="text-2xl font-bold">{stats.totalDSR}</div>
//               </div>
//               <div className="bg-white p-4 rounded shadow">
//                 <div className="text-sm text-gray-500">Total Due</div>
//                 <div className="text-2xl font-bold">{stats.totalDue} ৳</div>
//               </div>
//             </div>

//             <section className="bg-white rounded shadow p-4 mb-6">
//               <div className="flex items-center justify-between mb-3">
//                 <h2 className="font-semibold">Products</h2>
//                 <Link to="/admin/products" className="text-blue-600 text-sm">View all</Link>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {products.map(p => (
//                   <div key={p._id} className="p-3 border rounded">
//                     <div className="font-medium">{p.name}</div>
//                     <div className="text-sm text-gray-500">SKU: {p.sku || '-'}</div>
//                     <div className="mt-2 flex items-center justify-between">
//                       <div className="text-lg font-bold">{Number(p.sellPrice).toFixed(2)} ৳</div>
//                       <div className={`px-2 py-1 rounded text-sm ${p.adminStock>50 ? 'bg-green-100 text-green-800' : p.adminStock>0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
//                         {p.adminStock}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             <section className="bg-white rounded shadow p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <h2 className="font-semibold">DSRs</h2>
//                 <div className="text-sm text-gray-500">{dsrs.length} DSR(s)</div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {dsrs.map(d => (
//                   <div key={d._id} className="p-3 border rounded flex items-center justify-between">
//                     <div>
//                       <div className="font-medium">{d.name}</div>
//                       <div className="text-sm text-gray-500">{d.phone || '—'}</div>
//                     </div>
//                     <div className="text-sm text-gray-500">ID: {d._id.slice(-6)}</div>
//                   </div>
//                 ))}
//               </div>
//             </section>

//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useEffect, useState, useContext } from "react";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import { Link } from "react-router-dom";

// export default function AdminDashboard() {
//   const { user } = useContext(AuthContext);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [products, setProducts] = useState([]);
//   const [dsrs, setDsrs] = useState([]);
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalDSR: 0,
//     totalDue: 0,
//   });

//   useEffect(() => {
//     loadProducts();
//     loadDSRs();
//   }, []);

//   const loadProducts = async () => {
//     try {
//       const res = await api.get("/products?page=1&limit=6");
//       setProducts(res.data.products || []);
//       setStats((prev) => ({
//         ...prev,
//         totalProducts:
//           res.data.total || (res.data.products || []).length,
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadDSRs = async () => {
//     try {
//       const res = await api.get("/auth/dsrs");
//       setDsrs(res.data || []);
//       setStats((prev) => ({
//         ...prev,
//         totalDSR: (res.data || []).length,
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Navbar */}
//       <Navbar onMenuClick={() => setSidebarOpen(true)} />

//       <div className="flex">
//         {/* Sidebar */}
//         <Sidebar
//           role={user?.role}
//           isOpen={sidebarOpen}
//           onClose={() => setSidebarOpen(false)}
//         />

//         {/* Main Content */}
//         <main className="flex-1 p-4 md:p-6">
//           {/* Page Title */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-800">
//               Admin Dashboard
//             </h1>
//             <p className="text-sm text-gray-500">
//               Overview of products, DSRs & system status
//             </p>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             <StatCard
//               title="Total Products"
//               value={stats.totalProducts}
//             />
//             <StatCard
//               title="Total DSRs"
//               value={stats.totalDSR}
//             />
//             <StatCard
//               title="Total Due"
//               value={`${stats.totalDue} ৳`}
//             />
//           </div>

//           {/* Products Section */}
//           <section className="bg-white rounded-xl shadow-sm p-4 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-semibold text-gray-700">
//                 Recent Products
//               </h2>
//               <Link
//                 to="/admin/products"
//                 className="text-sm text-blue-600 hover:underline"
//               >
//                 View all
//               </Link>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {products.map((p) => (
//                 <div
//                   key={p._id}
//                   className="border rounded-lg p-3 hover:shadow transition"
//                 >
//                   <div className="font-medium text-gray-800">
//                     {p.name}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     SKU: {p.sku || "-"}
//                   </div>

//                   <div className="mt-3 flex items-center justify-between">
//                     <div className="text-lg font-bold text-blue-600">
//                       {Number(p.sellPrice).toFixed(2)} ৳
//                     </div>

//                     <span
//                       className={`px-2 py-1 text-xs rounded-full
//                       ${
//                         p.adminStock > 50
//                           ? "bg-green-100 text-green-700"
//                           : p.adminStock > 0
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       Stock: {p.adminStock}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* DSR Section */}
//           <section className="bg-white rounded-xl shadow-sm p-4">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-semibold text-gray-700">
//                 DSR List
//               </h2>
//               <span className="text-sm text-gray-500">
//                 {dsrs.length} DSR(s)
//               </span>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {dsrs.map((d) => (
//                 <div
//                   key={d._id}
//                   className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition"
//                 >
//                   <div>
//                     <div className="font-medium text-gray-800">
//                       {d.name}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {d.phone || "No phone"}
//                     </div>
//                   </div>

//                   <div className="text-xs text-gray-400">
//                     ID: {d._id.slice(-6)}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }

// /* ---------------- Small Components ---------------- */

// function StatCard({ title, value }) {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-4">
//       <div className="text-sm text-gray-500">{title}</div>
//       <div className="text-2xl font-bold text-gray-800 mt-1">
//         {value}
//       </div>
//     </div>
//   );
// }
