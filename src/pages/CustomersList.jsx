// // src/pages/CustomersList.jsx
// import React, { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import { Link, useSearchParams } from "react-router-dom";

// export default function CustomersList() {
//   const { user } = useContext(AuthContext);
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [q, setQ] = useState("");
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [limit] = useState(20);

//   const load = async (pg = 1, query = "") => {
//     try {
//       setLoading(true);
//       // If you want only DSR's customers, pass dsrId=user._id
//       const params = new URLSearchParams();
//       params.set("page", pg);
//       params.set("limit", limit);
//       if (query) params.set("q", query);
//       // optional: params.set("dsrId", user._id);

//       const res = await api.get(`/customers?${params.toString()}`);
//       setCustomers(res.data.customers || []);
//       setPage(res.data.page || 1);
//       setPages(res.data.pages || 1);
//     } catch (err) {
//       console.error("Load customers:", err);
//       alert("Failed to load customers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load(1, "");
//   }, []);

//   const onSearch = (e) => {
//     e.preventDefault();
//     load(1, q);
//   };

//   const onDelete = async (id) => {
//     if (!window.confirm("Delete this customer?")) return;
//     try {
//       await api.delete(`/customers/${id}`);
//       setCustomers((p) => p.filter((c) => c._id !== id));
//       alert("Deleted");
//     } catch (err) {
//       console.error("Delete customer:", err);
//       alert("Delete failed");
//     }
//   };

//   if (loading) return <div className="p-6">Loading customers...</div>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-semibold">Customers</h2>
//         <Link to="/customers/new" className="bg-blue-600 text-white px-3 py-1 rounded">Add Customer</Link>
//       </div>

//       <form onSubmit={onSearch} className="mb-4 flex gap-2">
//         <input value={q} onChange={(e) => setQ(e.target.value)} className="p-2 border rounded flex-1" placeholder="Search name or phone" />
//         <button className="px-3 py-2 bg-gray-200 rounded">Search</button>
//         <button type="button" onClick={() => { setQ(""); load(1, ""); }} className="px-3 py-2 bg-gray-100 rounded">Clear</button>
//       </form>

//       {customers.length === 0 ? (
//         <p className="text-gray-500">No customers found.</p>
//       ) : (
//         <table className="w-full border">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 border">Name</th>
//               <th className="p-2 border">Phone</th>
//               <th className="p-2 border">Due</th>
//               <th className="p-2 border">Created</th>
//               <th className="p-2 border">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {customers.map((c) => (
//               <tr key={c._id}>
//                 <td className="p-2 border">{c.name}</td>
//                 <td className="p-2 border">{c.phone || "-"}</td>
//                 <td className="p-2 border">{c.currentDue || 0} ৳</td>
//                 <td className="p-2 border">{new Date(c.createdAt).toLocaleDateString()}</td>
//                 <td className="p-2 border">
//                   <div className="flex gap-2">
//                     <Link to={`/customers/${c._id}`} className="text-blue-600">View</Link>
//                     <Link to={`/customers/edit/${c._id}`} className="text-green-600">Edit</Link>
//                     <button className="text-red-600" onClick={() => onDelete(c._id)}>Delete</button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* simple pagination */}
//       <div className="flex gap-2 mt-4 items-center">
//         <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => load(page - 1, q)}>Prev</button>
//         <div>Page {page} / {pages}</div>
//         <button className="px-3 py-1 border rounded" disabled={page >= pages} onClick={() => load(page + 1, q)}>Next</button>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  FiSearch, 
  FiUserPlus, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiDollarSign,
  FiPhone,
  FiCalendar,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX
} from "react-icons/fi";

export default function CustomersList() {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(20);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const load = async (pg = 1, query = "", filter = selectedFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", pg);
      params.set("limit", limit);
      if (query) params.set("q", query);
      
      // Fix: Check if user exists and has _id before adding dsrId
      if (user?.role === 'dsr' && user?._id) {
        params.set("dsrId", user._id);
      } else if (user?.role === 'dsr' && user?.id) {
        // Sometimes user object might have 'id' instead of '_id'
        params.set("dsrId", user.id);
      }
      
      if (filter !== "all") {
        params.set("hasDue", filter === "withDue" ? "true" : "false");
      }

      const res = await api.get(`/customers?${params.toString()}`);
      setCustomers(res.data.customers || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error("Load customers:", err);
      // Handle the error gracefully
      if (err.response?.status === 500) {
        // Try loading without dsrId if there's a server error
        if (user?.role === 'dsr') {
          console.log("Retrying without dsrId filter...");
          // Remove dsrId and retry
          const retryParams = new URLSearchParams();
          retryParams.set("page", pg);
          retryParams.set("limit", limit);
          if (query) retryParams.set("q", query);
          if (filter !== "all") {
            retryParams.set("hasDue", filter === "withDue" ? "true" : "false");
          }
          
          try {
            const retryRes = await api.get(`/customers?${retryParams.toString()}`);
            setCustomers(retryRes.data.customers || []);
            setPage(retryRes.data.page || 1);
            setPages(retryRes.data.pages || 1);
          } catch (retryErr) {
            console.error("Retry failed:", retryErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "", selectedFilter);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load(1, q, selectedFilter);
  };

  const onFilterChange = (filter) => {
    setSelectedFilter(filter);
    load(1, q, filter);
  };

  const onDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers((p) => p.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete customer:", err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Sort locally if needed
    const sorted = [...customers].sort((a, b) => {
      if (key === 'createdAt') {
        const aDate = new Date(a[key]);
        const bDate = new Date(b[key]);
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (key === 'currentDue') {
        return direction === 'asc' ? (a[key] || 0) - (b[key] || 0) : (b[key] || 0) - (a[key] || 0);
      }
      const aValue = a[key]?.toLowerCase?.() || a[key] || '';
      const bValue = b[key]?.toLowerCase?.() || b[key] || '';
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setCustomers(sorted);
  };

  const SortIcon = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Calculate statistics
  const stats = {
    totalCustomers: customers.length,
    totalDue: customers.reduce((sum, c) => sum + (c.currentDue || 0), 0),
    withDue: customers.filter(c => (c.currentDue || 0) > 0).length,
    withoutDue: customers.filter(c => (c.currentDue || 0) === 0).length,
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Customers List</h1>
              <p className="text-gray-600">Manage your customer relationships efficiently</p>
            </div>
            <Link 
              to="/customers/new" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <FiUserPlus className="mr-2" size={18} />
              Add New Customer
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <FiUserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-50 rounded-lg mr-3">
                  <FiDollarSign className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Due</p>
                  <p className="text-xl font-bold text-red-600">৳ {stats.totalDue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">With Due</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.withDue}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Without Due</p>
                  <p className="text-xl font-bold text-green-600">{stats.withoutDue}</p>
                </div>
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
              onClick={() => load(1, "", selectedFilter)}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <FiRefreshCw className="mr-1.5" size={16} />
              Refresh
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Search by customer name or phone number..."
              />
              {q && (
                <button
                  type="button"
                  onClick={() => { setQ(""); load(1, "", selectedFilter); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                Search Customers
              </button>
              <button type="button" onClick={() => { setQ(""); load(1, "", selectedFilter); }} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Clear
              </button>
            </div>
          </form>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedFilter === "all" 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Customers
            </button>
            <button
              onClick={() => onFilterChange("withDue")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedFilter === "withDue" 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              With Due Amount
            </button>
            <button
              onClick={() => onFilterChange("withoutDue")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedFilter === "withoutDue" 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No Due Amount
            </button>
          </div>

          {/* Active Filters */}
          {(q || selectedFilter !== "all") && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                <span className="text-blue-700">
                  Active filters: 
                  {selectedFilter !== "all" ? ` ${selectedFilter === "withDue" ? "With Due" : "Without Due"}` : ''}
                  {q ? ` Search: "${q}"` : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setQ("");
                  setSelectedFilter("all");
                  load(1, "", "all");
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
            <p className="text-gray-600">Loading customers...</p>
          </div>
        )}

        {/* Customers Table - Desktop */}
        {!loading && (
          <>
            <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        Customer Name{SortIcon({ sortKey: 'name' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('phone')}
                      >
                        Phone Number{SortIcon({ sortKey: 'phone' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('currentDue')}
                      >
                        Due Amount{SortIcon({ sortKey: 'currentDue' })}
                      </th>
                      <th 
                        className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created Date{SortIcon({ sortKey: 'createdAt' })}
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center">
                          <div className="text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <h3 className="font-medium text-gray-700 mb-1">No Customers Found</h3>
                            <p className="text-sm">
                              {q || selectedFilter !== "all" 
                                ? "Try adjusting your search or filters" 
                                : "Get started by adding your first customer"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{c.name}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-gray-700">
                              <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                              {c.phone || <span className="text-gray-400 italic">Not provided</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center ${
                              (c.currentDue || 0) > 0 
                                ? 'bg-red-50 text-red-700' 
                                : 'bg-green-50 text-green-700'
                            }`}>
                              <FiDollarSign className="mr-1" size={14} />
                              {(c.currentDue || 0).toLocaleString()} ৳
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-gray-700">
                              <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(c.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Link
                                to={`/customers/${c._id}`}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                <FiEye className="mr-1.5" size={14} />
                                View
                              </Link>
                              <Link
                                to={`/customers/edit/${c._id}`}
                                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors"
                              >
                                <FiEdit2 className="mr-1.5" size={14} />
                                Edit
                              </Link>
                              <button
                                onClick={() => onDelete(c._id, c.name)}
                                className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                              >
                                <FiTrash2 className="mr-1.5" size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              {customers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Customers Found</h3>
                  <p className="text-gray-600">
                    {q || selectedFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Get started by adding your first customer"}
                  </p>
                </div>
              ) : (
                customers.map((c) => (
                  <div key={c._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{c.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <FiPhone className="w-4 h-4 mr-1" />
                          {c.phone || "No phone"}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        (c.currentDue || 0) > 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        ৳ {(c.currentDue || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-3">
                        <Link
                          to={`/customers/${c._id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <FiEye className="mr-1" size={14} />
                          View
                        </Link>
                        <Link
                          to={`/customers/edit/${c._id}`}
                          className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          <FiEdit2 className="mr-1" size={14} />
                          Edit
                        </Link>
                      </div>
                      <button
                        onClick={() => onDelete(c._id, c.name)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        <FiTrash2 className="mr-1" size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {customers.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing page {page} of {pages} • {customers.length} customers
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page <= 1}
                onClick={() => load(page - 1, q, selectedFilter)}
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
                      onClick={() => load(pageNum, q, selectedFilter)}
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
                onClick={() => load(page + 1, q, selectedFilter)}
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