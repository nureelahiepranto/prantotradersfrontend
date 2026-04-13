import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function DSRStockSummary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' }); // ডিফল্ট: রিসেন্ট আগে
  const [selectedDsr, setSelectedDsr] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('ALL');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
  try {
    setLoading(true);

    // ✅ CORRECT API
    const res = await api.get("/dsr-stock/summary");

    const processedData = (res.data || []).map(item => ({
      dsrName: item.dsrName || "N/A",
      productName: item.productName || "N/A",
      issued: Number(item.issued) || 0,
      returned: Number(item.returned) || 0,
      sold: Number(item.sold) || 0,
      remaining: Number(item.remaining) || 0,
      issueDate: item.issueDate || new Date().toISOString(),
    }));

    // ✅ newest first
    processedData.sort(
      (a, b) => new Date(b.issueDate) - new Date(a.issueDate)
    );

    setData(processedData);
  } catch (err) {
    console.error("DSR SUMMARY LOAD ERROR", err);
  } finally {
    setLoading(false);
  }
};

  // Get unique DSRs and Products for filters
  const uniqueDsrs = [...new Set(data.map(item => item.dsrName))].filter(Boolean).sort();
  const uniqueProducts = [...new Set(data.map(item => item.productName))].filter(Boolean).sort();

  // Filter and sort data
  const getFilteredAndSortedData = () => {
    let filtered = [...data];

    // Apply DSR filter
    if (selectedDsr !== 'ALL') {
      filtered = filtered.filter(item => item.dsrName === selectedDsr);
    }

    // Apply Product filter
    if (selectedProduct !== 'ALL') {
      filtered = filtered.filter(item => item.productName === selectedProduct);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.dsrName?.toLowerCase().includes(searchLower) ||
        item.productName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // তারিখ সর্ট করার জন্য
        if (sortConfig.key === 'issueDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Calculate totals
  const filteredData = getFilteredAndSortedData();
  
  const totals = {
    issued: filteredData.reduce((sum, item) => sum + (item.issued || 0), 0),
    returned: filteredData.reduce((sum, item) => sum + (item.returned || 0), 0),
    sold: filteredData.reduce((sum, item) => sum + (item.sold || 0), 0),
    remaining: filteredData.reduce((sum, item) => sum + (item.remaining || 0), 0),
  };

  // Get stock status color
  const getStockStatusColor = (remaining) => {
    if (remaining <= 0) return 'bg-red-100 text-red-800';
    if (remaining <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stock summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">DSR Stock Summary</h1>
          <p className="text-gray-600">Track issued, returned, sold, and remaining stock for each DSR</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-xl font-bold text-gray-800">{filteredData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Issued</p>
                <p className="text-xl font-bold text-blue-600">{totals.issued}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Returned</p>
                <p className="text-xl font-bold text-yellow-600">{totals.returned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sold</p>
                <p className="text-xl font-bold text-purple-600">{totals.sold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Remaining</p>
                <p className="text-xl font-bold text-green-600">{totals.remaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by DSR or product..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* DSR Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by DSR
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={selectedDsr}
                onChange={(e) => setSelectedDsr(e.target.value)}
              >
                <option value="ALL">All DSRs</option>
                {uniqueDsrs.map(dsr => (
                  <option key={dsr} value={dsr}>{dsr}</option>
                ))}
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Product
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="ALL">All Products</option>
                {uniqueProducts.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>

            {/* Sort Info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Sorted by:</span> 
                {sortConfig.key === 'issueDate' ? ' Issue Date' : 
                 sortConfig.key === 'dsrName' ? ' DSR Name' : 
                 sortConfig.key === 'productName' ? ' Product Name' : 
                 ` ${sortConfig.key}`}
                <span className="ml-1">
                  {sortConfig.direction === 'desc' ? '(Newest First)' : '(Oldest First)'}
                </span>
              </p>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedDsr !== 'ALL' || selectedProduct !== 'ALL' || searchTerm) && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                <span className="text-green-700">
                  Active filters: 
                  {selectedDsr !== 'ALL' ? ` DSR: ${selectedDsr}` : ''}
                  {selectedProduct !== 'ALL' ? ` Product: ${selectedProduct}` : ''}
                  {searchTerm ? ` Search: "${searchTerm}"` : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedDsr('ALL');
                  setSelectedProduct('ALL');
                  setSearchTerm('');
                }}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Summary Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>

                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('dsrName')}
                  >
                    DSR{SortIcon({ sortKey: 'dsrName' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('productName')}
                  >
                    Product{SortIcon({ sortKey: 'productName' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('issued')}
                  >
                    Issued{SortIcon({ sortKey: 'issued' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('returned')}
                  >
                    Returned{SortIcon({ sortKey: 'returned' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('sold')}
                  >
                    Sold{SortIcon({ sortKey: 'sold' })}
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('remaining')}
                  >
                    Remaining{SortIcon({ sortKey: 'remaining' })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="font-medium text-gray-700 mb-1">No Stock Records Found</h3>
                        <p className="text-sm">
                          {searchTerm || selectedDsr !== 'ALL' || selectedProduct !== 'ALL' 
                            ? "Try adjusting your filters" 
                            : "No stock summary data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">

                      <td className="p-4">
                        <div className="font-medium text-gray-800">{row.dsrName || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{row.productName || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                            {row.issued || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700">
                          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg font-medium">
                            {row.returned || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700">
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                            {row.sold || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`px-3 py-1.5 rounded-lg font-bold ${getStockStatusColor(row.remaining || 0)}`}>
                          {row.remaining || 0}
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
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Stock Records Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedDsr !== 'ALL' || selectedProduct !== 'ALL' 
                  ? "Try adjusting your filters" 
                  : "No stock summary data available"}
              </p>
            </div>
          ) : (
            filteredData.map((row, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {/* Header with Date and DSR */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(row.issueDate)}
                    </div>
                    <h3 className="font-semibold text-gray-800">{row.dsrName || "N/A"}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-lg font-bold ${getStockStatusColor(row.remaining || 0)}`}>
                    {row.remaining || 0} left
                  </div>
                </div>

                {/* Product Name */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600">Product:</p>
                  <p className="font-medium text-gray-800">{row.productName || "N/A"}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500">Issued</p>
                    <p className="font-bold text-blue-600">{row.issued || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-500">Returned</p>
                    <p className="font-bold text-yellow-600">{row.returned || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500">Sold</p>
                    <p className="font-bold text-purple-600">{row.sold || 0}</p>
                  </div>
                </div>

                {/* Stock Status Indicator */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Stock Status:</span>
                    <span className={row.remaining <= 0 ? "text-red-600 font-medium" : 
                                     row.remaining <= 5 ? "text-yellow-600 font-medium" : 
                                     "text-green-600 font-medium"}>
                      {row.remaining <= 0 ? "Out of Stock" : 
                       row.remaining <= 5 ? "Low Stock" : 
                       "In Stock"}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        row.remaining <= 0 ? "bg-red-500" : 
                        row.remaining <= 5 ? "bg-yellow-500" : 
                        "bg-green-500"
                      }`}
                      style={{ 
                        width: `${Math.min(100, ((row.remaining || 0) / (row.issued || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals Footer */}
        {filteredData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Summary Totals</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-xl font-bold text-gray-800">{filteredData.length}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Issued</p>
                <p className="text-xl font-bold text-blue-600">{totals.issued}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Returned</p>
                <p className="text-xl font-bold text-yellow-600">{totals.returned}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Sold</p>
                <p className="text-xl font-bold text-purple-600">{totals.sold}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Remaining</p>
                <p className="text-xl font-bold text-green-600">{totals.remaining}</p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h4 className="font-medium text-gray-700 mb-3">Stock Status Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">In Stock (Good)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Low Stock (≤ 5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Out of Stock</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">Note:</span> Data is sorted by Issue Date (newest first)
          </div>
        </div>
      </div>
    </div>
  );
}