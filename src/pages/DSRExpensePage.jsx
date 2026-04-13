// // src/pages/DSRExpensePage.jsx
// import React, { useEffect, useState } from "react";
// import api from "../api/axios";
// import Pagination from "../components/Pagination";

// export default function DSRExpensePage() {
//   const [expenses, setExpenses] = useState([]);
//   const [reason, setReason] = useState("");
//   const [amount, setAmount] = useState("");
//   const [type, setType] = useState("expense");
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const limit = 8;

//   // 🔹 Get DSR ID from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));
//   const dsrId = user?.id;

//   // 🔹 Load expense list
//   const loadExpenses = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/dsr-expenses");
//       // Only this DSR expenses
//       const filtered = res.data.filter(
//         (e) => e.dsrId?._id === dsrId
//       );
//       setExpenses(filtered);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadExpenses();
//   }, []);

//   // 🔹 Add expense
//   const handleAddExpense = async () => {
//     if (!reason || !amount) {
//       alert("Please enter reason and amount");
//       return;
//     }

//     try {
//       await api.post("/dsr-expenses", {
//         dsrId,
//         reason,
//         amount: Number(amount),
//         type
//       });

//       setReason("");
//       setAmount("");
//       setType("expense");
//       loadExpenses();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add expense");
//     }
//   };

//   // 🔹 Pagination
//   const pages = Math.ceil(expenses.length / limit);
//   const start = (page - 1) * limit;
//   const paginated = expenses.slice(start, start + limit);

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">
//         DSR Expense / Collection
//       </h1>

//       {/* 🔹 Add Expense Form */}
//       <div className="grid md:grid-cols-4 gap-3 mb-6 bg-white p-4 rounded shadow">
//         <input
//           type="text"
//           placeholder="Reason"
//           className="p-2 border rounded"
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//         />

//         <input
//           type="number"
//           placeholder="Amount"
//           className="p-2 border rounded"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//         />

//         <select
//           className="p-2 border rounded"
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//         >
//           <option value="collection">Collection</option>
//           <option value="expense">Expense</option>
//         </select>

//         <button
//           onClick={handleAddExpense}
//           className="bg-blue-600 text-white p-2 rounded"
//         >
//           Add
//         </button>
//       </div>

//       {/* 🔹 Table */}
//       <div className="overflow-x-auto bg-white rounded shadow">
//         <table className="w-full border text-sm">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 border">Reason</th>
//               <th className="p-2 border">Type</th>
//               <th className="p-2 border">Amount</th>
//               <th className="p-2 border">Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan="4" className="p-4 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading &&
//               paginated.map((exp) => (
//                 <tr key={exp._id}>
//                   <td className="p-2 border">{exp.reason}</td>
//                   <td
//                     className={`p-2 border font-semibold ${
//                       exp.type === "expense"
//                         ? "text-red-600"
//                         : "text-green-600"
//                     }`}
//                   >
//                     {exp.type}
//                   </td>
//                   <td className="p-2 border">{exp.amount} ৳</td>
//                   <td className="p-2 border">
//                     {new Date(exp.date).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}

//             {!loading && paginated.length === 0 && (
//               <tr>
//                 <td colSpan="4" className="p-4 text-center text-gray-500">
//                   No records found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* 🔹 Pagination */}
//       {pages > 1 && (
//         <Pagination page={page} pages={pages} onChange={setPage} />
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import {
  MdAdd,
  MdSearch,
  MdRefresh,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdReceipt,
  MdCalendarToday,
  MdInfo,
  MdFilterList,
  MdClose,
  MdCheckCircle,
  MdError
} from "react-icons/md";
import { FiDownload, FiFilter } from "react-icons/fi";

export default function DSRExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, expense, collection
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalExpense: 0,
    totalCollection: 0,
    netBalance: 0,
    expenseCount: 0,
    collectionCount: 0
  });

  const limit = 10;

  // 🔹 Get DSR ID from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const dsrId = user?.id;
  const dsrName = user?.name || "DSR";

  // 🔹 Load expense list
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dsr-expenses");
      // Only this DSR expenses
      const filtered = res.data.filter((e) => e.dsrId?._id === dsrId);
      setExpenses(filtered);
      
      // Calculate stats
      const expenseItems = filtered.filter(e => e.type === "expense");
      const collectionItems = filtered.filter(e => e.type === "collection");
      
      const totalExpense = expenseItems.reduce((s, e) => s + e.amount, 0);
      const totalCollection = collectionItems.reduce((s, e) => s + e.amount, 0);
      
      setStats({
        totalExpense,
        totalCollection,
        netBalance: totalCollection - totalExpense,
        expenseCount: expenseItems.length,
        collectionCount: collectionItems.length
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // 🔹 Add expense
  const handleAddExpense = async () => {
    if (!reason.trim()) {
      alert("Please enter a reason");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/dsr-expenses", {
        dsrId,
        reason: reason.trim(),
        amount: Number(amount),
        type
      });

      // Reset form
      setReason("");
      setAmount("");
      setType("expense");
      setShowForm(false);
      
      // Show success message
      alert("Record added successfully!");
      
      // Reload expenses
      loadExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to add record");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 🔹 Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 🔹 Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    // Type filter
    if (filterType !== "all" && expense.type !== filterType) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        expense.reason?.toLowerCase().includes(query) ||
        expense.amount?.toString().includes(query) ||
        expense.type?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // 🔹 Pagination
  const pages = Math.ceil(filteredExpenses.length / limit);
  const start = (page - 1) * limit;
  const paginated = filteredExpenses.slice(start, start + limit);

  // 🔹 Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
  };

  // 🔹 Quick type buttons
  const quickReasons = [
    "Transport Cost",
    "Meal Expense",
    "Mobile Bill",
    "Stationery",
    "Customer Payment",
    "Advance Collection",
    "Other Expense"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Expense & Collection</h1>
            <p className="text-gray-600 mt-1">Manage your expenses and collections</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {dsrName.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium">{dsrName}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={loadExpenses}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              <MdRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <MdAdd className="text-lg" />
              Add Record
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Expense</p>
                <p className="text-xl font-bold text-red-800 mt-2">{formatCurrency(stats.totalExpense)}</p>
                <p className="text-xs text-red-600 mt-1">{stats.expenseCount} records</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <MdTrendingDown className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Collection</p>
                <p className="text-xl font-bold text-emerald-800 mt-2">{formatCurrency(stats.totalCollection)}</p>
                <p className="text-xs text-emerald-600 mt-1">{stats.collectionCount} records</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <MdTrendingUp className="text-2xl text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Net Balance</p>
                <p className={`text-xl font-bold mt-2 ${stats.netBalance >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>
                  {formatCurrency(stats.netBalance)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.netBalance >= 0 ? 'Positive' : 'Negative'} balance
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <MdAttachMoney className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Records</p>
                <p className="text-xl font-bold text-purple-800 mt-2">{expenses.length}</p>
                <p className="text-xs text-purple-600 mt-1">All time</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <MdReceipt className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Expense Form (Collapsible) */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Add New Record</h2>
                <p className="text-gray-600 text-sm">Enter your expense or collection details</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <MdClose />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                        type === "expense" 
                          ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      <MdTrendingDown />
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("collection")}
                      className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                        type === "collection" 
                          ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 shadow-sm" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      <MdTrendingUp />
                      Collection
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reason for expense or collection"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  
                  {/* Quick Reason Suggestions */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReasons.map((quickReason, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setReason(quickReason)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        >
                          {quickReason}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">৳</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <MdInfo className="text-blue-500 text-xl mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Note:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Use "Expense" for your spending</li>
                        <li>• Use "Collection" for money received</li>
                        <li>• Be specific with the reason</li>
                        <li>• Records cannot be edited after submission</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={submitting || !reason.trim() || !amount}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <MdAdd />
                    Add Record
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by reason or amount..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === "all" 
                      ? "bg-blue-100 text-blue-700 border border-blue-300" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("expense")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === "expense" 
                      ? "bg-red-100 text-red-700 border border-red-300" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  Expense
                </button>
                <button
                  onClick={() => setFilterType("collection")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === "collection" 
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  Collection
                </button>
              </div>
              
              {(searchQuery || filterType !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            Showing <span className="font-semibold">{paginated.length}</span> of <span className="font-semibold">{filteredExpenses.length}</span> records
          </div>
          <div className="text-sm text-gray-500">
            Page {page} of {pages || 1}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading your records...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No records found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterType !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start by adding your first expense or collection"}
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <MdAdd />
                Add First Record
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Reason</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((exp) => (
                      <tr key={exp._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="text-gray-800 font-medium">{exp.reason}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            exp.type === "expense" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {exp.type === "expense" ? (
                              <>
                                <MdTrendingDown className="mr-1.5" />
                                Expense
                              </>
                            ) : (
                              <>
                                <MdTrendingUp className="mr-1.5" />
                                Collection
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`font-bold text-lg ${
                            exp.type === "expense" ? "text-red-600" : "text-emerald-600"
                          }`}>
                            {formatCurrency(exp.amount)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-gray-700 font-medium">{formatDate(exp.date)}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <MdCheckCircle className="text-emerald-500" />
                            <span className="text-sm text-gray-600">Recorded</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pages > 1 && (
                <div className="border-t border-gray-100 p-4">
                  <Pagination page={page} pages={pages} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Your personal expense & collection tracker • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
}