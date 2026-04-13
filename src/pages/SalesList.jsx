// src/pages/SalesList.jsx
// import React, { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import { Link } from "react-router-dom";

// export default function SalesList() {
//   const { user } = useContext(AuthContext);
//   const [sales, setSales] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const loadSales = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/sales?dsrId=${user._id || user.id}&page=1&limit=50`);
//       setSales(res.data.sales || []);
//     } catch (err) {
//       console.error("Load sales:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) loadSales();
//   }, [user]);

//   if (loading) return <p className="p-6">Loading...</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">My Sales</h2>
//       {sales.length === 0 ? (
//         <p>No sales found</p>
//       ) : (
//         <table className="w-full border">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 border">#</th>
//               <th className="p-2 border">Customer</th>
//               <th className="p-2 border">Total</th>
//               <th className="p-2 border">Paid</th>
//               <th className="p-2 border">Due</th>
//               <th className="p-2 border">Date</th>
//               <th className="p-2 border">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sales.map((s, i) => (
//               <tr key={s._id}>
//                 <td className="p-2 border">{i + 1}</td>
//                 <td className="p-2 border">{s.customer?.name || "-"}</td>
//                 <td className="p-2 border">{s.totalAmount} ৳</td>
//                 <td className="p-2 border">{s.paidAmount} ৳</td>
//                 <td className="p-2 border">{s.dueAmount} ৳</td>
//                 <td className="p-2 border">{new Date(s.date).toLocaleString()}</td>
//                 <td className="p-2 border">
//                   <Link to={`/invoice/${s._id}`} className="text-blue-600">Invoice</Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiShoppingCart,
  FiEye,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiRefreshCw,
  FiDownload,
  FiTrendingUp,
  FiUser,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

export default function SalesList() {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, paid, unpaid, partial
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const loadSales = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dsrId: user._id || user.id,
        page: pageNum,
        limit: limit
      });
      
      if (searchTerm) params.set('search', searchTerm);
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await api.get(`/sales?${params.toString()}`);
      setSales(res.data.sales || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error("Load sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadSales();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadSales(1);
  };

  const handleFilterChange = (filter) => {
    setFilterStatus(filter);
    loadSales(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Sort locally for better UX
    const sorted = [...sales].sort((a, b) => {
      if (key === 'date') {
        const aDate = new Date(a.date || a.createdAt);
        const bDate = new Date(b.date || b.createdAt);
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (key === 'totalAmount' || key === 'paidAmount' || key === 'dueAmount') {
        return direction === 'asc' ? (a[key] || 0) - (b[key] || 0) : (b[key] || 0) - (a[key] || 0);
      }
      const aValue = a[key]?.toLowerCase?.() || a[key] || '';
      const bValue = b[key]?.toLowerCase?.() || b[key] || '';
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSales(sorted);
  };

  const SortIcon = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Calculate statistics
  const stats = {
    totalSales: sales.length,
    totalAmount: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    totalPaid: sales.reduce((sum, s) => sum + (s.paidAmount || 0), 0),
    totalDue: sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0),
    fullyPaid: sales.filter(s => (s.dueAmount || 0) === 0).length,
    partiallyPaid: sales.filter(s => (s.dueAmount || 0) > 0 && (s.paidAmount || 0) > 0).length,
    unpaid: sales.filter(s => (s.paidAmount || 0) === 0).length
  };

  // Get payment status
  const getPaymentStatus = (sale) => {
    if ((sale.dueAmount || 0) === 0) return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    if ((sale.paidAmount || 0) === 0) return { label: 'Unpaid', color: 'bg-red-100 text-red-800' };
    return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Generate CSV export
  const exportToCSV = () => {
    const headers = ['Date', 'Invoice #', 'Customer', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status'];
    const csvData = sales.map(sale => [
      formatDate(sale.date || sale.createdAt),
      sale.invoiceNumber || sale._id?.substring(0, 8) || 'N/A',
      sale.customer?.name || 'Walk-in',
      sale.totalAmount || 0,
      sale.paidAmount || 0,
      sale.dueAmount || 0,
      getPaymentStatus(sale).label
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">My Sales Records</h1>
              <p className="text-gray-600">Track and manage all your sales transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FiDownload className="mr-2" size={18} />
                Export CSV
              </button>
              <Link
                to="/dsr/create-sale"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FiShoppingCart className="mr-2" size={18} />
                New Sale
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <FiShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <FiCreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalPaid)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-50 rounded-lg mr-3">
                  <FiClock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Due</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalDue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-500">Fully Paid</p>
                    <p className="text-lg font-bold text-gray-800">{stats.fullyPaid}</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✓</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-500">Partially Paid</p>
                    <p className="text-lg font-bold text-gray-800">{stats.partiallyPaid}</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-medium">~</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-500">Unpaid</p>
                    <p className="text-lg font-bold text-gray-800">{stats.unpaid}</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700 flex items-center">
              <FiFilter className="mr-2" size={20} />
              Search & Filter
            </h3>
            <button
              onClick={() => loadSales(page)}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <FiRefreshCw className="mr-1.5" size={16} />
              Refresh
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by customer name or invoice number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(""); loadSales(1); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600">×</span>
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                Search Sales
              </button>
              <button type="button" onClick={() => { setSearchTerm(""); loadSales(1); }} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Clear
              </button>
            </div>
          </form>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === "all" 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Sales
            </button>
            <button
              onClick={() => handleFilterChange("paid")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === "paid" 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fully Paid
            </button>
            <button
              onClick={() => handleFilterChange("partial")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === "partial" 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Partially Paid
            </button>
            <button
              onClick={() => handleFilterChange("unpaid")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === "unpaid" 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unpaid
            </button>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterStatus !== "all") && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                <span className="text-blue-700">
                  Active filters: 
                  {filterStatus !== "all" ? ` ${filterStatus === "paid" ? "Fully Paid" : filterStatus === "partial" ? "Partially Paid" : "Unpaid"}` : ''}
                  {searchTerm ? ` Search: "${searchTerm}"` : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  loadSales(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading sales...</p>
          </div>
        )}

        {/* Sales Table - Desktop */}
        {!loading && (
          <>
            <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        Date{SortIcon({ sortKey: 'date' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('customer.name')}
                      >
                        Customer{SortIcon({ sortKey: 'customer.name' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Total{SortIcon({ sortKey: 'totalAmount' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('paidAmount')}
                      >
                        Paid{SortIcon({ sortKey: 'paidAmount' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('dueAmount')}
                      >
                        Due{SortIcon({ sortKey: 'dueAmount' })}
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center">
                          <div className="text-gray-500">
                            <FiShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="font-medium text-gray-700 mb-1">No Sales Found</h3>
                            <p className="text-sm">
                              {searchTerm || filterStatus !== "all" 
                                ? "Try adjusting your search or filters" 
                                : "Start by creating your first sale"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale, i) => {
                        const status = getPaymentStatus(sale);
                        return (
                          <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="text-gray-800 font-medium">
                                {formatDate(sale.date || sale.createdAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(sale.date || sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-gray-800">
                                {sale.customer?.name || "Walk-in"}
                              </div>
                              {sale.customer?.phone && (
                                <div className="text-sm text-gray-500">{sale.customer.phone}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-gray-800">{formatCurrency(sale.totalAmount || 0)}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-green-600 font-medium">{formatCurrency(sale.paidAmount || 0)}</div>
                            </td>
                            <td className="p-4">
                              <div className={`font-bold ${(sale.dueAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(sale.dueAmount || 0)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <Link
                                to={`/invoice/${sale._id}`}
                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                              >
                                <FiEye className="mr-1.5" size={14} />
                                View Invoice
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              {sales.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Sales Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Start by creating your first sale"}
                  </p>
                </div>
              ) : (
                sales.map((sale) => {
                  const status = getPaymentStatus(sale);
                  return (
                    <div key={sale._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            {formatDate(sale.date || sale.createdAt)}
                          </div>
                          <h3 className="font-semibold text-gray-800">{sale.customer?.name || "Walk-in"}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-gray-800">{formatCurrency(sale.totalAmount || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Paid</p>
                          <p className="font-bold text-green-600">{formatCurrency(sale.paidAmount || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Due</p>
                          <p className={`font-bold ${(sale.dueAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(sale.dueAmount || 0)}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/invoice/${sale._id}`}
                        className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                      >
                        <FiEye className="mr-1.5" size={16} />
                        View Invoice
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {sales.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {sales.length} of {stats.totalSales} sales • Page {page} of {pages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page <= 1}
                onClick={() => loadSales(page - 1)}
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  let pageNum;
                  if (pages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pages - 2) {
                    pageNum = pages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return pageNum <= pages && pageNum >= 1 ? (
                    <button
                      key={pageNum}
                      onClick={() => loadSales(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ) : null;
                })}
              </div>
              
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page >= pages}
                onClick={() => loadSales(page + 1)}
              >
                Next
                <FiChevronRight className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}