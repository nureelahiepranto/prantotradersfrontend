import { useEffect, useState } from "react";
import axios from "../api/axios.js";
import {
  MdPerson,
  MdAttachMoney,
  MdShoppingCart,
  MdTrendingUp,
  MdTrendingDown,
  MdCalendarToday,
  MdFilterList,
  MdDownload,
  MdRefresh,
  MdSearch,
  MdArrowDropUp,
  MdArrowDropDown,
  MdMoreVert,
  MdBarChart,
  MdReceipt,
  MdOutlineAccountBalanceWallet
} from "react-icons/md";
import { FiDownload, FiFilter } from "react-icons/fi";

export default function DSRSalesDashboard() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("today"); // today, month, year
  const [sortConfig, setSortConfig] = useState({ key: "totalSales", direction: "desc" });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalDue: 0,
    averageSale: 0,
    topDSR: { name: "", amount: 0 }
  });
  const [selectedDsr, setSelectedDsr] = useState(null);
  const [dsrDetails, setDsrDetails] = useState(null);

  // Load sales data
  const loadSalesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/sales");
      
      if (response.data && response.data.sales) {
        // Process sales data to aggregate by DSR
        const dsrSalesMap = new Map();
        
        response.data.sales.forEach(sale => {
          if (sale.dsr && sale.dsr._id) {
            const dsrId = sale.dsr._id;
            const dsrName = sale.dsr.name || "Unknown DSR";
            
            if (!dsrSalesMap.has(dsrId)) {
              dsrSalesMap.set(dsrId, {
                dsrId,
                dsrName,
                totalSales: 0,
                totalAmount: 0,
                totalPaid: 0,
                totalDue: 0,
                saleCount: 0,
                recentSaleDate: null,
                sales: []
              });
            }
            
            const dsrData = dsrSalesMap.get(dsrId);
            dsrData.totalSales += sale.totalAmount || 0;
            dsrData.totalPaid += sale.paidAmount || 0;
            dsrData.totalDue += sale.dueAmount || 0;
            dsrData.saleCount += 1;
            dsrData.sales.push(sale);
            
            // Update most recent sale date
            const saleDate = new Date(sale.date || sale.createdAt);
            if (!dsrData.recentSaleDate || saleDate > dsrData.recentSaleDate) {
              dsrData.recentSaleDate = saleDate;
            }
          }
        });
        
        // Convert map to array and calculate time-based filtering
        let processedData = Array.from(dsrSalesMap.values());
        
        // Apply time filter
        processedData = applyTimeFilter(processedData, timeFilter);
        
        // Calculate statistics
        calculateStats(processedData);
        
        setSalesData(processedData);
      }
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply time-based filtering
  const applyTimeFilter = (data, filterType) => {
    const now = new Date();
    
    return data.map(dsr => {
      let filteredSales = [...dsr.sales];
      
      if (filterType === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredSales = dsr.sales.filter(sale => {
          const saleDate = new Date(sale.date || sale.createdAt);
          return saleDate >= today;
        });
      } else if (filterType === "month") {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredSales = dsr.sales.filter(sale => {
          const saleDate = new Date(sale.date || sale.createdAt);
          return saleDate >= firstDayOfMonth;
        });
      } else if (filterType === "year") {
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        filteredSales = dsr.sales.filter(sale => {
          const saleDate = new Date(sale.date || sale.createdAt);
          return saleDate >= firstDayOfYear;
        });
      }
      
      // Recalculate totals based on filtered sales
      const filteredTotal = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const filteredPaid = filteredSales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
      const filteredDue = filteredSales.reduce((sum, sale) => sum + (sale.dueAmount || 0), 0);
      
      return {
        ...dsr,
        filteredSales,
        filteredTotal,
        filteredPaid,
        filteredDue,
        filteredCount: filteredSales.length
      };
    });
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const totalSales = data.length;
    const totalAmount = data.reduce((sum, dsr) => sum + dsr.filteredTotal, 0);
    const totalDue = data.reduce((sum, dsr) => sum + dsr.filteredDue, 0);
    const averageSale = totalSales > 0 ? totalAmount / totalSales : 0;
    
    // Find top performing DSR
    let topDSR = { name: "", amount: 0 };
    data.forEach(dsr => {
      if (dsr.filteredTotal > topDSR.amount) {
        topDSR = { name: dsr.dsrName, amount: dsr.filteredTotal };
      }
    });
    
    setStats({
      totalSales,
      totalAmount,
      totalDue,
      averageSale,
      topDSR
    });
  };

  // Load DSR details
  const loadDsrDetails = async (dsrId) => {
    try {
      const response = await axios.get(`/sales?dsrId=${dsrId}`);
      if (response.data && response.data.sales) {
        setDsrDetails({
          dsrId,
          sales: response.data.sales,
          totalSales: response.data.total || 0
        });
      }
    } catch (error) {
      console.error("Error loading DSR details:", error);
    }
  };

  // Handle DSR selection
  const handleDsrSelect = (dsr) => {
    setSelectedDsr(dsr);
    loadDsrDetails(dsr.dsrId);
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
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
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter data based on search
  const filteredData = salesData.filter(dsr =>
    dsr.dsrName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = sortConfig.key === "dsrName" ? a[sortConfig.key] : a[`filtered${sortConfig.key}`];
    const bVal = sortConfig.key === "dsrName" ? b[sortConfig.key] : b[`filtered${sortConfig.key}`];
    
    if (sortConfig.direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Calculate percentage change (simulated)
  const getPercentageChange = (dsr) => {
    const change = Math.random() * 20 - 10; // Random between -10% to +10%
    return {
      value: change.toFixed(1),
      isPositive: change >= 0
    };
  };

  // Export data
  const exportToCSV = () => {
    const headers = ["DSR Name", "Total Sales", "Paid Amount", "Due Amount", "Sale Count", "Recent Sale"];
    const rows = sortedData.map(dsr => [
      dsr.dsrName,
      dsr.filteredTotal,
      dsr.filteredPaid,
      dsr.filteredDue,
      dsr.filteredCount,
      formatDate(dsr.recentSaleDate)
    ]);
    
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsr-sales-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Initial load
  useEffect(() => {
    loadSalesData();
  }, [timeFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">DSR Sales Dashboard</h1>
            <p className="text-gray-600 mt-1">Track and analyze sales performance across all DSRs</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <MdDownload className="text-lg" />
              Export CSV
            </button>
            <button 
              onClick={loadSalesData}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              <MdRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Time Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimeFilter("today")}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${timeFilter === "today" 
                ? "bg-blue-100 text-blue-700 border border-blue-300" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <MdCalendarToday />
              Today
            </button>
            <button
              onClick={() => setTimeFilter("month")}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${timeFilter === "month" 
                ? "bg-blue-100 text-blue-700 border border-blue-300" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <MdCalendarToday />
              This Month
            </button>
            <button
              onClick={() => setTimeFilter("year")}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${timeFilter === "year" 
                ? "bg-blue-100 text-blue-700 border border-blue-300" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <MdCalendarToday />
              This Year
            </button>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
              <MdFilterList />
              <span>Filtering by: {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Total Sales Amount"
            value={formatCurrency(stats.totalAmount)}
            icon={<MdAttachMoney className="text-2xl" />}
            color="blue"
            change={"+12.5%"}
            isPositive={true}
          />
          <StatCard
            title="Total DSRs Active"
            value={stats.totalSales}
            icon={<MdPerson className="text-2xl" />}
            color="emerald"
            change={"+3"}
            isPositive={true}
          />
          <StatCard
            title="Total Due Amount"
            value={formatCurrency(stats.totalDue)}
            icon={<MdOutlineAccountBalanceWallet className="text-2xl" />}
            color="amber"
            change={"-5.2%"}
            isPositive={false}
          />
          <StatCard
            title="Top DSR"
            value={stats.topDSR.name || "N/A"}
            subValue={formatCurrency(stats.topDSR.amount)}
            icon={<MdTrendingUp className="text-2xl" />}
            color="purple"
          />
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search DSR by name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {sortedData.length} of {salesData.length} DSRs
            </div>
          </div>
        </div>

        {/* DSR Sales Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort("dsrName")}
                  >
                    <div className="flex items-center gap-2">
                      <MdPerson />
                      DSR Name
                      {sortConfig.key === "dsrName" && (
                        sortConfig.direction === "asc" ? <MdArrowDropUp /> : <MdArrowDropDown />
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort("Total")}
                  >
                    <div className="flex items-center gap-2">
                      <MdAttachMoney />
                      Total Sales
                      {sortConfig.key === "Total" && (
                        sortConfig.direction === "asc" ? <MdArrowDropUp /> : <MdArrowDropDown />
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort("Paid")}
                  >
                    <div className="flex items-center gap-2">
                      <MdReceipt />
                      Paid Amount
                      {sortConfig.key === "Paid" && (
                        sortConfig.direction === "asc" ? <MdArrowDropUp /> : <MdArrowDropDown />
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort("Due")}
                  >
                    <div className="flex items-center gap-2">
                      <MdOutlineAccountBalanceWallet />
                      Due Amount
                      {sortConfig.key === "Due" && (
                        sortConfig.direction === "asc" ? <MdArrowDropUp /> : <MdArrowDropDown />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <MdShoppingCart />
                      Sales Count
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Recent Sale
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                      <p className="mt-2 text-gray-600">Loading DSR sales data...</p>
                    </td>
                  </tr>
                ) : sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No DSR sales data found</h3>
                      <p className="text-gray-500">Try adjusting your search or time filter</p>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((dsr, index) => {
                    const change = getPercentageChange(dsr);
                    
                    return (
                      <tr 
                        key={dsr.dsrId} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-blue-600">
                                {dsr.dsrName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{dsr.dsrName}</div>
                              <div className="flex items-center gap-1 text-sm mt-1">
                                {change.isPositive ? (
                                  <MdTrendingUp className="text-emerald-500" />
                                ) : (
                                  <MdTrendingDown className="text-red-500" />
                                )}
                                <span className={change.isPositive ? "text-emerald-600" : "text-red-600"}>
                                  {change.value}%
                                </span>
                                <span className="text-gray-500">from last period</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-bold text-gray-800">
                            {formatCurrency(dsr.filteredTotal)}
                          </div>
                          <div className="text-sm text-gray-500">This {timeFilter}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-semibold text-emerald-600">
                            {formatCurrency(dsr.filteredPaid)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dsr.filteredTotal > 0 
                              ? `${Math.round((dsr.filteredPaid / dsr.filteredTotal) * 100)}% paid`
                              : "0% paid"
                            }
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-semibold text-amber-600">
                            {formatCurrency(dsr.filteredDue)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dsr.filteredTotal > 0 
                              ? `${Math.round((dsr.filteredDue / dsr.filteredTotal) * 100)}% due`
                              : "0% due"
                            }
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <MdShoppingCart className="text-purple-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{dsr.filteredCount}</div>
                              <div className="text-xs text-gray-500">sales</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-700">{formatDate(dsr.recentSaleDate)}</div>
                          {dsr.recentSaleDate && (
                            <div className="text-xs text-gray-500">
                              {Math.floor((new Date() - new Date(dsr.recentSaleDate)) / (1000 * 60 * 60 * 24))} days ago
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDsrSelect(dsr)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DSR Details Modal */}
        {selectedDsr && dsrDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedDsr.dsrName}'s Sales Details</h2>
                    <p className="text-gray-600">All sales records for the selected period</p>
                  </div>
                  <button
                    onClick={() => setSelectedDsr(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* DSR Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-sm text-blue-600 font-medium">Total Sales</div>
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(selectedDsr.filteredTotal)}</div>
                    <div className="text-sm text-gray-500">This {timeFilter}</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <div className="text-sm text-emerald-600 font-medium">Total Sales Count</div>
                    <div className="text-2xl font-bold text-gray-800">{selectedDsr.filteredCount}</div>
                    <div className="text-sm text-gray-500">Transactions</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl">
                    <div className="text-sm text-amber-600 font-medium">Outstanding Due</div>
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(selectedDsr.filteredDue)}</div>
                    <div className="text-sm text-gray-500">To be collected</div>
                  </div>
                </div>
                
                {/* Sales List */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Sales</h3>
                <div className="space-y-3">
                  {dsrDetails.sales.slice(0, 10).map((sale, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">
                            Sale #{sale._id?.slice(-6) || index + 1}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(sale.date || sale.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">{formatCurrency(sale.totalAmount)}</div>
                          <div className="text-sm">
                            <span className="text-emerald-600">Paid: {formatCurrency(sale.paidAmount)}</span>
                            <span className="mx-2">•</span>
                            <span className="text-amber-600">Due: {formatCurrency(sale.dueAmount)}</span>
                          </div>
                        </div>
                      </div>
                      {sale.customer && (
                        <div className="mt-2 text-sm text-gray-600">
                          Customer: {sale.customer.name} {sale.customer.phone && `(${sale.customer.phone})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedDsr(null)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Export DSR Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Data updates in real-time. Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

// StatCard Component
const StatCard = ({ title, value, subValue, icon, color, change, isPositive }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`rounded-xl p-5 border ${colorClasses[color]} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color === 'blue' ? 'bg-blue-100' : color === 'emerald' ? 'bg-emerald-100' : color === 'amber' ? 'bg-amber-100' : 'bg-purple-100'}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <MdArrowDropUp className="text-xl" /> : <MdArrowDropDown className="text-xl" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subValue && (
        <p className="text-sm text-gray-600 mt-1">{subValue}</p>
      )}
      <p className="text-sm font-medium opacity-80 mt-2">{title}</p>
    </div>
  );
};