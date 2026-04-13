// import React, { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";

// export default function PaymentList() {
//   const { user, loading } = useContext(AuthContext);
//   const [payments, setPayments] = useState([]);

//   useEffect(() => {
//     if (!loading && user?.id) {
//       loadPayments();
//     }
//   }, [loading, user]);

//   const loadPayments = async () => {
//     try {
//       const res = await api.get(`/payments?dsrId=${user.id}`);
//       setPayments(res.data.payments || []);
//     } catch (error) {
//       console.error("Payment fetch error:", error);
//     }
//   };

//   if (loading) return <div className="p-6 text-center">Loading...</div>;

//   if (!user?.id)
//     return (
//       <div className="p-6 text-center text-red-600">
//         User not loaded!
//       </div>
//     );

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-3">Payments</h2>

//       <div className="bg-white rounded shadow p-4 space-y-3">
//         {payments.map((p) => (
//           <div key={p._id} className="border-b pb-2">
//             <div className="font-medium">{p.customer?.name}</div>
//             <div className="text-sm text-gray-600">Amount: {p.amount}৳</div>
//             <div className="text-sm text-gray-600">Note: {p.note || "N/A"}</div>
//             <div className="text-xs text-gray-500">
//               {new Date(p.date).toLocaleString()}
//             </div>
//           </div>
//         ))}

//         {!payments.length && (
//           <div className="text-center text-gray-500">No payments found.</div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  FaCreditCard,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaReceipt,
  FaSync,
  FaDownload,
  FaPrint,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoice
} from "react-icons/fa";
import { MdPayments, MdInfo } from "react-icons/md";

export default function PaymentList() {
  const { user, loading } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    todayAmount: 0,
    averagePayment: 0
  });
  const [dateRange, setDateRange] = useState("all"); // all, today, week, month
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user?.id) {
      loadPayments();
    }
  }, [loading, user]);

  useEffect(() => {
    // Filter and sort payments when search term or sort config changes
    let result = [...payments];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(payment =>
        payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      result = result.filter(payment => {
        const paymentDate = new Date(payment.date);
        switch (dateRange) {
          case "today":
            return paymentDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return paymentDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return paymentDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortConfig.key === 'customer') {
        const aName = a.customer?.name || '';
        const bName = b.customer?.name || '';
        return sortConfig.direction === 'asc' 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      return 0;
    });

    setFilteredPayments(result);
  }, [payments, searchTerm, sortConfig, dateRange]);

  useEffect(() => {
    // Calculate statistics
    if (payments.length > 0) {
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const today = new Date().toDateString();
      const todayAmount = payments
        .filter(p => new Date(p.date).toDateString() === today)
        .reduce((sum, p) => sum + p.amount, 0);
      
      setStats({
        totalAmount,
        totalPayments: payments.length,
        todayAmount,
        averagePayment: payments.length > 0 ? totalAmount / payments.length : 0
      });
    }
  }, [payments]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/payments?dsrId=${user.id}`);
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("Payment fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const togglePaymentDetails = (paymentId) => {
    setExpandedPayment(prev => prev === paymentId ? null : paymentId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-3xl text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">User Not Loaded</h3>
          <p className="text-gray-600 mb-6">Please log in to view payment history</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <MdPayments className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment History</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaUser className="text-sm" />
                  {user.name || user.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadPayments}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <FaSync className={`${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => window.print()}
              >
                <FaPrint />
                Print Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalPayments}</p>
                </div>
                <FaReceipt className="text-2xl text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <FaDollarSign className="text-2xl text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Today's Collection</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.todayAmount)}</p>
                </div>
                <FaCalendarAlt className="text-2xl text-purple-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Average Payment</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.averagePayment)}</p>
                </div>
                <MdPayments className="text-2xl text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by customer name or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSort('date')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  sortConfig.key === 'date'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  sortConfig.key === 'amount'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
              </button>
            </div>
          </div>

          {/* Active Filters Info */}
          {(searchTerm || dateRange !== "all") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center">
                <MdInfo className="text-blue-600 mr-2" />
                <span className="text-blue-700">
                  Showing {filteredPayments.length} of {payments.length} payments
                  {searchTerm && ` matching "${searchTerm}"`}
                  {dateRange !== "all" && ` from ${dateRange}`}
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateRange("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading payment history...</p>
          </div>
        )}

        {/* Payments List */}
        {!isLoading && (
          <>
            {filteredPayments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileInvoice className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Payments Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || dateRange !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "No payment records available"}
                </p>
                {searchTerm || dateRange !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setDateRange("all");
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={loadPayments}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Data
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Payment Header */}
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => togglePaymentDetails(payment._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaCreditCard className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">
                                {payment.customer?.name || 'Unknown Customer'}
                              </h3>
                              <p className="text-gray-600 text-sm flex items-center gap-1">
                                <FaCalendarAlt className="text-xs" />
                                {formatDate(payment.date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm text-gray-500">
                              {expandedPayment === payment._id ? 'Show Less' : 'Show Details'}
                            </span>
                            {expandedPayment === payment._id ? (
                              <FaChevronUp className="text-gray-400" />
                            ) : (
                              <FaChevronDown className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details (Collapsible) */}
                    {expandedPayment === payment._id && (
                      <div className="border-t border-gray-100 p-5 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                              <FaUser className="mr-2" />
                              Customer Information
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Customer Name:</span>
                                <span className="font-medium">{payment.customer?.name || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{payment.customer?.phone || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Customer ID:</span>
                                <span className="font-medium text-sm">{payment.customer?._id?.slice(-8) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                              <MdInfo className="mr-2" />
                              Payment Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment ID:</span>
                                <span className="font-medium text-sm">{payment._id?.slice(-8) || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Date:</span>
                                <span className="font-medium">{new Date(payment.date).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium">{payment.method || 'Cash'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Note */}
                        {payment.note && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-700 mb-2">Payment Note</h4>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <p className="text-gray-700">{payment.note}</p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => window.print()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FaPrint />
                            Print Receipt
                          </button>
                          <button
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <FaDownload />
                            Download Invoice
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary Footer */}
            {filteredPayments.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{filteredPayments.length}</div>
                    <div className="text-gray-600">Payments Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </div>
                    <div className="text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {formatCurrency(
                        filteredPayments.length > 0
                          ? filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length
                          : 0
                      )}
                    </div>
                    <div className="text-gray-600">Average Payment</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
