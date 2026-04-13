// import React, { useEffect, useState } from "react";
// import api from "../api/axios";
// import { Link } from "react-router-dom";

// export default function DsrIssueList() {
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadIssues();
//   }, []);

//   const loadIssues = async () => {
//     try {
//       const res = await api.get("/dsrissue");
//       setIssues(res.data || []);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load issues");
//     }
//     setLoading(false);
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="p-6 container-max mx-auto">
//       <h2 className="text-2xl font-semibold mb-4">DSR Issued Product List</h2>

//       <div className="bg-white p-4 rounded shadow overflow-x-auto">
//         <table className="w-full border">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border">#</th>
//               <th className="p-2 border">DSR Name</th>
//               <th className="p-2 border">Total Items</th>
//               <th className="p-2 border">Total Amount</th>
//               <th className="p-2 border">Date</th>
//               <th className="p-2 border">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {issues.map((issue, idx) => (
//               <tr key={issue._id} className="text-center border">
//                 <td className="p-2 border">{idx + 1}</td>
//                 <td className="p-2 border">{issue.dsrId?.name}</td>
//                 <td className="p-2 border">{issue.items?.length}</td>
//                 <td className="p-2 border font-semibold">
//                   ৳ {issue.totalAmount}
//                 </td>
//                 <td className="p-2 border">
//                   {new Date(issue.createdAt).toLocaleDateString()}
//                 </td>
//                 <td className="p-2 border">
//                   <Link
//                     to={`/dsrissue/${issue._id}`}
//                     className="px-3 py-1 bg-blue-600 text-white rounded"
//                   >
//                     View
//                   </Link>
//                 </td>
//               </tr>
//             ))}

//             {issues.length === 0 && (
//               <tr>
//                 <td
//                   className="p-4 text-center text-gray-500"
//                   colSpan="6"
//                 >
//                   No issue records found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function DsrIssueList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' }); // ডিফল্ট: রিসেন্ট আগে
  const [alphabetFilter, setAlphabetFilter] = useState('ALL'); // A to Z ফিল্টার
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // প্রতি পেজে ১০টি আইটেম

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const res = await api.get("/dsrissue");
      // রিসেন্ট ডাটা আগে দেখাতে সর্ট করে নিচ্ছি
      const sortedData = res.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setIssues(sortedData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // A to Z ফিল্টার ফাংশন
  const getFilteredIssues = () => {
    let filtered = [...issues];

    // প্রথমে A-Z ফিল্টার প্রয়োগ করো
    if (alphabetFilter !== 'ALL') {
      filtered = filtered.filter(issue => {
        const dsrName = issue.dsrId?.name || '';
        if (alphabetFilter === 'OTHER') {
          // অন্য সবকিছু (সংখ্যা, বিশেষ চরিত্র, ইত্যাদি)
          return !/^[A-Za-z]/.test(dsrName.charAt(0));
        }
        return dsrName.charAt(0).toUpperCase() === alphabetFilter;
      });
    }

    // তারপর সার্চ ফিল্টার প্রয়োগ করো
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(issue => {
        return (
          issue.dsrId?.name?.toLowerCase().includes(searchLower) ||
          issue._id?.toLowerCase().includes(searchLower) ||
          issue.items?.some(item => 
            item.productId?.name?.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    return filtered;
  };

  // সর্ট করা ফাংশন
  const getSortedIssues = (issuesToSort) => {
    if (!sortConfig.key) return issuesToSort;
    
    return [...issuesToSort].sort((a, b) => {
      let aValue, bValue;
      
      // Nested property access
      if (sortConfig.key === 'dsrId.name') {
        aValue = a.dsrId?.name || '';
        bValue = b.dsrId?.name || '';
      } else if (sortConfig.key === 'totalAmount') {
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
      } else if (sortConfig.key === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortConfig.key === 'itemCount') {
        aValue = a.items?.length || 0;
        bValue = b.items?.length || 0;
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      // তৃতীয় ক্লিকে ডিফল্টে ফিরে আসবে
      setSortConfig({ key: 'createdAt', direction: 'desc' });
      return;
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // A to Z বাটন জেনারেট করার ফাংশন
  const alphabetButtons = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setAlphabetFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
            alphabetFilter === 'ALL' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ALL
        </button>
        
        {letters.map(letter => (
          <button
            key={letter}
            onClick={() => setAlphabetFilter(letter)}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
              alphabetFilter === letter 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {letter}
          </button>
        ))}
        
        <button
          onClick={() => setAlphabetFilter('OTHER')}
          className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
            alphabetFilter === 'OTHER' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          #123
        </button>
      </div>
    );
  };

  // Calculate statistics
  const filteredIssues = getFilteredIssues();
  const sortedIssues = getSortedIssues(filteredIssues);
  
  // পেজিনেশন ক্যালকুলেশন
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIssues = sortedIssues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);

  const stats = {
    totalIssues: issues.length,
    totalFilteredIssues: filteredIssues.length,
    totalItems: filteredIssues.reduce((sum, issue) => sum + (issue.items?.length || 0), 0),
    totalAmount: filteredIssues.reduce((sum, issue) => sum + (issue.totalAmount || 0), 0),
  };

  // পেজ পরিবর্তন ফাংশন
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // পেজ নেভিগেশন বাটন
  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedIssues.length)} of {sortedIssues.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1.5 rounded-lg ${
                currentPage === number
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">DSR Issued Product List</h1>
          <p className="text-gray-600">Track all product issues to DSRs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Issues</p>
                <p className="text-xl font-bold text-gray-800">{stats.totalIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Showing</p>
                <p className="text-xl font-bold text-gray-800">{stats.totalFilteredIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-xl font-bold text-gray-800">{stats.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-xl font-bold text-gray-800">৳ {stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by DSR name, product, or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

       
        {/* Main Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    Date{SortIcon({ sortKey: 'createdAt' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('dsrId.name')}
                  >
                    DSR Name{SortIcon({ sortKey: 'dsrId.name' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('itemCount')}
                  >
                    Items{SortIcon({ sortKey: 'itemCount' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('totalAmount')}
                  >
                    Total Amount{SortIcon({ sortKey: 'totalAmount' })}
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentIssues.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="font-medium text-gray-700 mb-1">No Issue Records Found</h3>
                        <p className="text-sm">
                          {searchTerm || alphabetFilter !== 'ALL' 
                            ? "Try adjusting your filters" 
                            : "No issues have been recorded yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentIssues.map((issue, idx) => (
                    <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="text-gray-800 font-medium">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(issue.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{issue.dsrId?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{issue.dsrId?.email || ""}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                            {issue.items?.length || 0} items
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-green-600 text-lg">
                          ৳ {issue.totalAmount?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* পেজিনেশন */}
          {currentIssues.length > 0 && renderPagination()}
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {currentIssues.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Issue Records Found</h3>
              <p className="text-gray-600">
                {searchTerm || alphabetFilter !== 'ALL' 
                  ? "Try adjusting your filters" 
                  : "No issues have been recorded yet"}
              </p>
            </div>
          ) : (
            <>
              {currentIssues.map((issue) => (
                <div key={issue._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{issue.dsrId?.name || "N/A"}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(issue.createdAt).toLocaleDateString()} • {new Date(issue.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                      {issue.items?.length || 0} items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-bold text-green-600">৳ {issue.totalAmount?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Items Count</p>
                      <p className="font-medium text-gray-800">{issue.items?.length || 0} products</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="w-full mt-2 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Details
                  </button>
                </div>
              ))}
              
              {/* মোবাইল পেজিনেশন */}
              {currentIssues.length > 0 && (
                <div className="mt-6">
                  {renderPagination()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Issue Details</h3>
                  <p className="text-gray-600 text-sm mt-1">Issue ID: {selectedIssue._id}</p>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* DSR Info */}
              <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  DSR Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">{selectedIssue.dsrId?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{selectedIssue.dsrId?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-medium text-gray-800">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-green-600 text-lg">৳ {selectedIssue.totalAmount?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  Issued Products ({selectedIssue.items?.length || 0})
                </h4>
                
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-700">#</th>
                          <th className="p-3 text-left font-medium text-gray-700">Product</th>
                          <th className="p-3 text-left font-medium text-gray-700">Quantity</th>
                          <th className="p-3 text-left font-medium text-gray-700">Unit Price</th>
                          <th className="p-3 text-left font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedIssue.items.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-3">{i + 1}</td>
                            <td className="p-3 font-medium text-gray-800">
                              {item.productId?.name || "Product Name"}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                                {item.qty || 0}
                              </span>
                            </td>
                            <td className="p-3 text-gray-700">৳ {item.price?.toFixed(2) || "0.00"}</td>
                            <td className="p-3 font-semibold text-green-600">
                              ৳ {((item.qty || 0) * (item.price || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3 p-3">
                    {selectedIssue.items.map((item, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-800">{item.productId?.name || "Product Name"}</div>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium">
                            {item.qty || 0} pcs
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Unit Price:</span>
                            <span className="ml-2 text-gray-700">৳ {item.price?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              ৳ {((item.qty || 0) * (item.price || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Grand Total</p>
                    <p className="text-2xl font-bold text-green-600">৳ {selectedIssue.totalAmount?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Items Count</p>
                    <p className="text-lg font-bold text-blue-600">{selectedIssue.items?.length || 0} items</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}