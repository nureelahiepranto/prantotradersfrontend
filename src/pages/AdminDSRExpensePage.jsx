import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Pagination from "../components/Pagination";

export default function AdminDSRExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [dsrs, setDsrs] = useState([]);
  const [dsrId, setDsrId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const [dsrDue, setDsrDue] = useState(0);
  const limit = 10;

  // 🔹 Load DSR list
  const loadDsrs = async () => {
    const res = await api.get("/auth/dsrs");
    setDsrs(res.data || []);
  };

  const loadDSRDue = async (dsrId) => {
  if (!dsrId) return setDsrDue(0);
  try {
    const res = await api.get(`/dsr-expenses/due/${dsrId}`); // ✅ ঠিক URL
    setDsrDue(res.data.due || 0);
  } catch (err) {
    console.error("DSR Due fetch error:", err);
    setDsrDue(0);
  }
};

  // 🔹 Load expenses
  const loadExpenses = async () => {
    const params = {};
    if (dsrId) params.dsrId = dsrId;
    if (from && to) {
      params.from = from;
      params.to = to;
    }

    const res = await api.get("/dsr-expenses/admin", { params });
    setExpenses(res.data || []);
    setPage(1);
  };

  // 🔹 Auto reload on filter change
  useEffect(() => {
    loadExpenses();
  }, [dsrId, from, to]);

  useEffect(() => {
    loadDsrs();
    loadExpenses();
  }, []);

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/dsr-expenses/${id}`);
    loadExpenses();
  };

  // 🔹 Update
  const handleUpdate = async () => {
    await api.put(`/dsr-expenses/${editItem._id}`, {
      reason: editItem.reason,
      amount: editItem.amount,
      type: editItem.type,
    });

    alert("Updated successfully ✅");
    setEditItem(null);
    loadExpenses();
  };

  // 🔹 Totals
  const totalExpense = expenses
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const totalCollection = expenses
    .filter((e) => e.type === "collection")
    .reduce((s, e) => s + e.amount, 0);

  // 🔹 Pagination
  const pages = Math.ceil(expenses.length / limit);
  const start = (page - 1) * limit;
  const paginated = expenses.slice(start, start + limit);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Admin – DSR Expense & Collection
      </h1>

      {/* 🔍 Filters */}
      <div className="grid md:grid-cols-5 gap-3 bg-white p-4 rounded shadow mb-6">
        <select
  className="border p-2 rounded"
  value={dsrId}
  onChange={(e) => {
    setDsrId(e.target.value);
    loadDSRDue(e.target.value);
  }}
>
         <option value="">All DSR</option>
  {dsrs.map((d) => (
    <option key={d._id} value={d._id}>
      {d.name}
    </option>
  ))}
</select>

        <input
          type="date"
          className="border p-2 rounded"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* 🔢 Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-100 p-4 rounded">
          <p>Total Expense</p>
          <h2 className="text-xl font-bold text-red-600">৳ {totalExpense}</h2>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <p>Total Collection</p>
          <h2 className="text-xl font-bold text-green-600">
            ৳ {totalCollection}
          </h2>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <p>Net Balance</p>
          <h2 className="text-xl font-bold">
            ৳ {totalCollection - totalExpense}
          </h2>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
  <p>Due Amount</p>
  <h2 className="text-xl font-bold text-yellow-700">৳ {dsrDue}</h2>
</div>
      </div>

      {/* 📊 Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">DSR</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((e) => (
              <tr key={e._id}>
                <td className="p-2 border">{e.dsrId?.name}</td>
                <td className="p-2 border">{e.reason}</td>
                <td
                  className={`p-2 border font-semibold ${
                    e.type === "expense"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {e.type}
                </td>
                <td className="p-2 border">{e.amount} ৳</td>
                <td className="p-2 border">
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td className="p-2 border text-center space-x-2">
                  <button
                    onClick={() => setEditItem(e)}
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {/* ✏️ Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-96">
            <h2 className="font-bold mb-3">Edit Expense</h2>

            <input
              className="w-full border p-2 mb-2"
              value={editItem.reason}
              onChange={(e) =>
                setEditItem({ ...editItem, reason: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border p-2 mb-2"
              value={editItem.amount}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  amount: Number(e.target.value),
                })
              }
            />

            <select
              className="w-full border p-2 mb-4"
              value={editItem.type}
              onChange={(e) =>
                setEditItem({ ...editItem, type: e.target.value })
              }
            >
              <option value="expense">Expense</option>
              <option value="collection">Collection</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-1 bg-green-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import api from "../api/axios";
// import Pagination from "../components/Pagination";
// import {
//   MdSearch,
//   MdFilterList,
//   MdRefresh,
//   MdEdit,
//   MdDelete,
//   MdAttachMoney,
//   MdReceipt,
//   MdTrendingUp,
//   MdTrendingDown,
//   MdCalendarToday,
//   MdPerson,
//   MdClose,
//   MdSave,
//   MdDownload,
//   MdMoreVert
// } from "react-icons/md";
// import { FiDownload, FiFilter } from "react-icons/fi";

// export default function AdminDSRExpensePage() {
//   const [expenses, setExpenses] = useState([]);
//   const [dsrs, setDsrs] = useState([]);
//   const [dsrId, setDsrId] = useState("");
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [page, setPage] = useState(1);
//   const [editItem, setEditItem] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [stats, setStats] = useState({
//     totalExpense: 0,
//     totalCollection: 0,
//     netBalance: 0,
//     expenseCount: 0,
//     collectionCount: 0
//   });

//   const limit = 10;

//   // 🔹 Load DSR list
//   const loadDsrs = async () => {
//     try {
//       const res = await api.get("/auth/dsrs");
//       setDsrs(res.data || []);
//     } catch (error) {
//       console.error("Error loading DSRs:", error);
//     }
//   };

//   // 🔹 Load expenses
//   const loadExpenses = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (dsrId) params.dsrId = dsrId;
//       if (from && to) {
//         params.from = from;
//         params.to = to;
//       }

//       const res = await api.get("/dsr-expenses/admin", { params });
//       setExpenses(res.data || []);
      
//       // Calculate stats
//       const expenseItems = res.data.filter(e => e.type === "expense");
//       const collectionItems = res.data.filter(e => e.type === "collection");
      
//       const totalExpense = expenseItems.reduce((s, e) => s + e.amount, 0);
//       const totalCollection = collectionItems.reduce((s, e) => s + e.amount, 0);
      
//       setStats({
//         totalExpense,
//         totalCollection,
//         netBalance: totalCollection - totalExpense,
//         expenseCount: expenseItems.length,
//         collectionCount: collectionItems.length
//       });
      
//       setPage(1);
//     } catch (error) {
//       console.error("Error loading expenses:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Auto reload on filter change
//   useEffect(() => {
//     loadExpenses();
//   }, [dsrId, from, to]);

//   useEffect(() => {
//     loadDsrs();
//     loadExpenses();
//   }, []);

//   // 🔹 Delete
//   const handleDelete = async (id, dsrName) => {
//     if (!window.confirm(`Delete this record for ${dsrName}?`)) return;
//     try {
//       await api.delete(`/dsr-expenses/${id}`);
//       loadExpenses();
//     } catch (error) {
//       console.error("Error deleting expense:", error);
//     }
//   };

//   // 🔹 Update
//   const handleUpdate = async () => {
//     try {
//       await api.put(`/dsr-expenses/${editItem._id}`, {
//         reason: editItem.reason,
//         amount: editItem.amount,
//         type: editItem.type,
//       });

//       alert("Updated successfully ✅");
//       setEditItem(null);
//       loadExpenses();
//     } catch (error) {
//       console.error("Error updating expense:", error);
//     }
//   };

//   // 🔹 Clear filters
//   const clearFilters = () => {
//     setDsrId("");
//     setFrom("");
//     setTo("");
//     setSearchQuery("");
//   };

//   // 🔹 Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-BD', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   // 🔹 Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // 🔹 Filter by search
//   const filteredExpenses = expenses.filter(expense => {
//     if (!searchQuery) return true;
//     const query = searchQuery.toLowerCase();
//     return (
//       expense.dsrId?.name?.toLowerCase().includes(query) ||
//       expense.reason?.toLowerCase().includes(query) ||
//       expense.type?.toLowerCase().includes(query)
//     );
//   });

//   // 🔹 Pagination
//   const pages = Math.ceil(filteredExpenses.length / limit);
//   const start = (page - 1) * limit;
//   const paginated = filteredExpenses.slice(start, start + limit);

//   // 🔹 Export to CSV
//   const exportToCSV = () => {
//     const headers = ["DSR", "Reason", "Type", "Amount", "Date"];
//     const rows = filteredExpenses.map(e => [
//       e.dsrId?.name || "N/A",
//       e.reason,
//       e.type,
//       e.amount,
//       formatDate(e.date)
//     ]);
    
//     const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `dsr-expenses-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">DSR Expense & Collection</h1>
//             <p className="text-gray-600 mt-1">Manage and track all DSR expenses and collections</p>
//           </div>
          
//           <div className="flex flex-wrap gap-3">
//             <button 
//               onClick={exportToCSV}
//               className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
//             >
//               <MdDownload className="text-lg" />
//               Export CSV
//             </button>
//             <button 
//               onClick={loadExpenses}
//               className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
//               disabled={loading}
//             >
//               <MdRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />
//               {loading ? "Refreshing..." : "Refresh"}
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
//           <StatCard 
//             title="Total Expense" 
//             value={formatCurrency(stats.totalExpense)}
//             icon={<MdTrendingDown className="text-2xl" />}
//             color="red"
//             count={stats.expenseCount}
//           />
//           <StatCard 
//             title="Total Collection" 
//             value={formatCurrency(stats.totalCollection)}
//             icon={<MdTrendingUp className="text-2xl" />}
//             color="emerald"
//             count={stats.collectionCount}
//           />
//           <StatCard 
//             title="Net Balance" 
//             value={formatCurrency(stats.netBalance)}
//             icon={<MdAttachMoney className="text-2xl" />}
//             color={stats.netBalance >= 0 ? "blue" : "amber"}
//             count={expenses.length}
//           />
//           <StatCard 
//             title="Active DSRs" 
//             value={new Set(expenses.map(e => e.dsrId?._id)).size}
//             icon={<MdPerson className="text-2xl" />}
//             color="purple"
//             count=""
//           />
//           <StatCard 
//             title="Filtered Records" 
//             value={filteredExpenses.length}
//             icon={<MdReceipt className="text-2xl" />}
//             color="indigo"
//             count="total"
//           />
//         </div>

//         {/* Search and Filters Section */}
//         <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//             <div className="relative flex-1">
//               <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
//               <input
//                 type="text"
//                 placeholder="Search by DSR name, reason, or type..."
//                 className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
            
//             <div className="flex items-center gap-3">
//               <button 
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="px-4 py-3 bg-gray-50 text-gray-700 rounded-lg flex items-center gap-2 font-medium hover:bg-gray-100 transition-all duration-200 border border-gray-200"
//               >
//                 <FiFilter />
//                 Filters
//                 {(dsrId || from || to) && (
//                   <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {(dsrId ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0)}
//                   </span>
//                 )}
//               </button>
              
//               <button 
//                 onClick={clearFilters}
//                 className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>

//           {/* Advanced Filters */}
//           {showFilters && (
//             <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Filter by DSR</label>
//                 <div className="relative">
//                   <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <select
//                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
//                     value={dsrId}
//                     onChange={(e) => setDsrId(e.target.value)}
//                   >
//                     <option value="">All DSRs</option>
//                     {dsrs.map((d) => (
//                       <option key={d._id} value={d._id}>
//                         {d.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
//                 <div className="relative">
//                   <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="date"
//                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     value={from}
//                     onChange={(e) => setFrom(e.target.value)}
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
//                 <div className="relative">
//                   <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="date"
//                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                     value={to}
//                     onChange={(e) => setTo(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Active Filters */}
//           {(dsrId || from || to) && (
//             <div className="mt-4 flex flex-wrap gap-2">
//               {dsrId && (
//                 <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full">
//                   DSR: {dsrs.find(d => d._id === dsrId)?.name || "Selected"}
//                   <button onClick={() => setDsrId("")} className="text-blue-800 hover:text-blue-900 ml-1">
//                     ×
//                   </button>
//                 </span>
//               )}
//               {from && (
//                 <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm rounded-full">
//                   From: {new Date(from).toLocaleDateString('en-GB')}
//                   <button onClick={() => setFrom("")} className="text-emerald-800 hover:text-emerald-900 ml-1">
//                     ×
//                   </button>
//                 </span>
//               )}
//               {to && (
//                 <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 text-sm rounded-full">
//                   To: {new Date(to).toLocaleDateString('en-GB')}
//                   <button onClick={() => setTo("")} className="text-amber-800 hover:text-amber-900 ml-1">
//                     ×
//                   </button>
//                 </span>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Results Count */}
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-gray-600">
//             Showing <span className="font-semibold">{paginated.length}</span> of <span className="font-semibold">{filteredExpenses.length}</span> records
//           </div>
//           <div className="text-sm text-gray-500">
//             Page {page} of {pages || 1}
//           </div>
//         </div>

//         {/* Expenses Table */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           {loading && filteredExpenses.length === 0 ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
//               <p className="mt-4 text-gray-600">Loading expense data...</p>
//             </div>
//           ) : filteredExpenses.length === 0 ? (
//             <div className="p-12 text-center">
//               <div className="text-5xl mb-4">💸</div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No expense records found</h3>
//               <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
//               <button 
//                 onClick={clearFilters}
//                 className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
//               >
//                 Clear all filters
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="text-left p-4 font-semibold text-gray-700">DSR</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Reason</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Type</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
//                     <th className="text-left p-4 font-semibold text-gray-700">Date</th>
//                     <th className="text-left p-4 font-semibold text-gray-700 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {paginated.map((expense) => (
//                     <tr key={expense._id} className="hover:bg-gray-50 transition-colors duration-150">
//                       <td className="p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                             <MdPerson className="text-blue-600 text-sm" />
//                           </div>
//                           <span className="font-medium text-gray-800">{expense.dsrId?.name || "Unknown"}</span>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div className="max-w-xs">
//                           <span className="text-gray-700 line-clamp-1" title={expense.reason}>
//                             {expense.reason}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                           expense.type === "expense" 
//                             ? "bg-red-100 text-red-800" 
//                             : "bg-emerald-100 text-emerald-800"
//                         }`}>
//                           {expense.type === "expense" ? (
//                             <>
//                               <MdTrendingDown className="mr-1" />
//                               Expense
//                             </>
//                           ) : (
//                             <>
//                               <MdTrendingUp className="mr-1" />
//                               Collection
//                             </>
//                           )}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <div className={`font-bold ${
//                           expense.type === "expense" ? "text-red-600" : "text-emerald-600"
//                         }`}>
//                           {formatCurrency(expense.amount)}
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div className="text-gray-700">{formatDate(expense.date)}</div>
//                         <div className="text-xs text-gray-500">
//                           {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             onClick={() => setEditItem(expense)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
//                             title="Edit record"
//                           >
//                             <MdEdit className="text-lg" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(expense._id, expense.dsrId?.name)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//                             title="Delete record"
//                           >
//                             <MdDelete className="text-lg" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
          
//           {/* Pagination */}
//           {filteredExpenses.length > 0 && pages > 1 && (
//             <div className="border-t border-gray-100 p-4">
//               <Pagination page={page} pages={pages} onChange={setPage} />
//             </div>
//           )}
//         </div>

//         {/* Edit Modal */}
//         {editItem && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-2xl w-full max-w-md">
//               <div className="p-6 border-b border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">Edit Record</h2>
//                     <p className="text-gray-600 text-sm">Update expense/collection details</p>
//                   </div>
//                   <button
//                     onClick={() => setEditItem(null)}
//                     className="text-gray-500 hover:text-gray-700 text-2xl"
//                   >
//                     ×
//                   </button>
//                 </div>
//               </div>
              
//               <div className="p-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
//                     <textarea
//                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
//                       rows="3"
//                       value={editItem.reason}
//                       onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
//                       <input
//                         type="number"
//                         className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                         value={editItem.amount}
//                         onChange={(e) => setEditItem({ ...editItem, amount: Number(e.target.value) })}
//                         min="0"
//                         step="1"
//                       />
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
//                     <div className="grid grid-cols-2 gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setEditItem({ ...editItem, type: "expense" })}
//                         className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
//                           editItem.type === "expense" 
//                             ? "bg-red-50 text-red-700 border-2 border-red-200" 
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
//                         }`}
//                       >
//                         <MdTrendingDown />
//                         Expense
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setEditItem({ ...editItem, type: "collection" })}
//                         className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
//                           editItem.type === "collection" 
//                             ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200" 
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
//                         }`}
//                       >
//                         <MdTrendingUp />
//                         Collection
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="p-6 border-t border-gray-200 bg-gray-50">
//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() => setEditItem(null)}
//                     className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleUpdate}
//                     className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
//                   >
//                     <MdSave />
//                     Update Record
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Footer Info */}
//         <div className="mt-8 text-center text-gray-500 text-sm">
//           <p>Data refreshes automatically. Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // StatCard Component
// const StatCard = ({ title, value, icon, color, count }) => {
//   const colorClasses = {
//     red: 'bg-red-50 text-red-700 border-red-200',
//     emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     blue: 'bg-blue-50 text-blue-700 border-blue-200',
//     amber: 'bg-amber-50 text-amber-700 border-amber-200',
//     purple: 'bg-purple-50 text-purple-700 border-purple-200',
//     indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
//   };

//   return (
//     <div className={`rounded-xl p-5 border ${colorClasses[color]} transition-all duration-300 hover:shadow-lg`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium opacity-80">{title}</p>
//           <p className="text-xl font-bold mt-2">{value}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${color === 'red' ? 'bg-red-100' : color === 'emerald' ? 'bg-emerald-100' : color === 'blue' ? 'bg-blue-100' : color === 'amber' ? 'bg-amber-100' : color === 'purple' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
//           {icon}
//         </div>
//       </div>
//       {count && (
//         <p className="text-xs opacity-70 mt-3">
//           {typeof count === 'number' ? `${count} records` : count}
//         </p>
//       )}
//     </div>
//   );
// };