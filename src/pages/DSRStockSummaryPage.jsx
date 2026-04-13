import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const DSRStockSummaryPage = () => {
  const { user } = useContext(AuthContext);
  const dsrId = user?.id;

  const today = new Date().toISOString().split("T")[0];

  // 👉 selectedDate empty রাখবো
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dsrId) return;

    const fetchStock = async () => {
      setLoading(true);
      try {
        // 👉 যদি date না থাকে → Today
        const dateParam = selectedDate || today;

        const res = await api.get(
          `/dsr-stock/${dsrId}?date=${dateParam}`
        );
console.log("DSR STOCK RESPONSE 👉", res.data);
        setData(res.data);
      } catch (err) {
        console.error("❌ Stock fetch error", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [dsrId, selectedDate]);

  if (!user) {
    return <div className="p-6">Loading user...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">DSR Stock Summary</h2>
          <p className="text-sm text-gray-500">
            {selectedDate
              ? `Showing data for ${selectedDate}`
              : "Showing today's stock summary"}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          {/* RESET BUTTON */}
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* ---------- LOADING ---------- */}
      {loading && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          Loading stock data...
        </div>
      )}

      {/* ---------- EMPTY ---------- */}
      {!loading && data && (!data.stockDetails || data.stockDetails.length === 0) && (
  <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
    No stock data found
  </div>
)}

      {/* ---------- SUMMARY ---------- */}
      {!loading && data && data.stockDetails.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard title="Issued" value={data.totalIssued} color="blue" />
            <SummaryCard title="Sold" value={data.totalSold} color="green" />
            <SummaryCard title="Returned" value={data.totalReturned} color="red" />
            <SummaryCard title="Available" value={data.availableStock} color="purple" />
            <SummaryCard
              title="Sold Amount"
              value={`৳ ${formatMoney(
                data.stockDetails.reduce(
                  (sum, i) => sum + i.soldQty * i.sellPrice,
                  0
                )
              )}`}
              color="yellow"
            />
          </div>

          {/* ---------- TABLE ---------- */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-center">Issued</th>
                  <th className="p-3 text-center">Sold</th>
                  <th className="p-3 text-center">Returned</th>
                  <th className="p-3 text-center">Available</th>
                  <th className="p-3 text-center">Price</th>
                  <th className="p-3 text-center">Sold Total</th>
                </tr>
              </thead>

              <tbody>
                {data.stockDetails.map((item) => (
                  <tr key={item.productId} className="border-t">
                    <td className="p-3">{item.productName}</td>
                    <td className="p-3 text-center">{item.issuedQty}</td>
                    <td className="p-3 text-center text-green-600">
                      {item.soldQty}
                    </td>
                    <td className="p-3 text-center text-red-500">
                      {item.returnedQty}
                    </td>
                    <td className="p-3 text-center">
                      {item.availableQty}
                    </td>
                    <td className="p-3 text-center">
                      ৳ {formatMoney(item.sellPrice)}
                    </td>
                    <td className="p-3 text-center font-bold">
                      ৳ {formatMoney(item.soldQty * item.sellPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DSRStockSummaryPage;

/* ---------- HELPERS ---------- */
const formatMoney = (amount = 0) =>
  Number(amount).toLocaleString("en-BD");

const SummaryCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <p className="text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
};



// import { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { AuthContext } from "../context/AuthContext";
// import {
//   FaBoxOpen,
//   FaArrowUp,
//   FaArrowDown,
//   FaDollarSign,
//   FaWarehouse,
//   FaExchangeAlt,
//   FaChartBar,
//   FaFilter,
//   FaSearch,
//   FaSortAmountDown,
//   FaSortAmountUp,
//   FaDownload,
//   FaPrint,
//   FaSync,
//   FaInfoCircle,
//   FaExclamationTriangle,
//   FaCheckCircle,
//   FaCalendarAlt
// } from "react-icons/fa";
// import { MdInventory, MdTrendingUp, MdTrendingDown } from "react-icons/md";
// import API from "../api/axios.js";

// const DSRStockSummaryPage = () => {
//   const { user } = useContext(AuthContext);
//   const dsrId = user?.id;
  
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: 'productName', direction: 'asc' });
//   const [selectedFilter, setSelectedFilter] = useState("all"); // all, lowStock, outOfStock
//   const [activeTab, setActiveTab] = useState("overview"); // overview, details

//   useEffect(() => {
//     if (!dsrId) {
//       console.error("❌ DSR ID not found");
//       return;
//     }

//     const fetchStock = async () => {
//       try {
//         setLoading(true);
//         const res = await API.get(`/dsr-stock/${dsrId}`);
//         // const res = await axios.get(
//         //   `https://dsrprantotradersbackend.onrender.com/api/dsr-stock/${dsrId}`
//         // );
//         setData(res.data);
//         setFilteredData(res.data.stockDetails || []);
//       } catch (err) {
//         console.error("❌ Stock fetch error", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStock();
//   }, [dsrId]);

//   // Filter and sort data
//   useEffect(() => {
//     if (!data) return;

//     let result = [...data.stockDetails];

//     // Apply search filter
//     if (searchTerm) {
//       result = result.filter(item =>
//         item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Apply stock filter
//     if (selectedFilter === "lowStock") {
//       result = result.filter(item => item.availableQty > 0 && item.availableQty <= 10);
//     } else if (selectedFilter === "outOfStock") {
//       result = result.filter(item => item.availableQty === 0);
//     }

//     // Apply sorting
//     result.sort((a, b) => {
//       if (sortConfig.key === 'productName') {
//         return sortConfig.direction === 'asc'
//           ? a.productName.localeCompare(b.productName)
//           : b.productName.localeCompare(a.productName);
//       }
//       if (sortConfig.key === 'availableQty') {
//         return sortConfig.direction === 'asc'
//           ? a.availableQty - b.availableQty
//           : b.availableQty - a.availableQty;
//       }
//       if (sortConfig.key === 'totalValue') {
//         return sortConfig.direction === 'asc'
//           ? a.totalValue - b.totalValue
//           : b.totalValue - a.totalValue;
//       }
//       if (sortConfig.key === 'soldQty') {
//         return sortConfig.direction === 'asc'
//           ? a.soldQty - b.soldQty
//           : b.soldQty - a.soldQty;
//       }
//       return 0;
//     });

//     setFilteredData(result);
//   }, [data, searchTerm, sortConfig, selectedFilter]);

//   const handleSort = (key) => {
//     setSortConfig(prev => ({
//       key,
//       direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
//     }));
//   };

//   const refreshData = () => {
//     if (!dsrId) return;
//     // Refetch logic
//     window.location.reload();
//   };

//   const calculateStats = () => {
//     if (!data) return {};
    
//     const totalStockValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0);
//     const lowStockItems = filteredData.filter(item => item.availableQty > 0 && item.availableQty <= 10).length;
//     const outOfStockItems = filteredData.filter(item => item.availableQty === 0).length;
//     const inStockItems = filteredData.filter(item => item.availableQty > 10).length;
    
//     return {
//       totalStockValue,
//       lowStockItems,
//       outOfStockItems,
//       inStockItems
//     };
//   };

//   const stats = calculateStats();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute"></div>
//           <p className="mt-4 text-gray-600 font-medium">Loading stock data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
//           <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <FaBoxOpen className="text-3xl text-red-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-800 mb-2">No Stock Data</h3>
//           <p className="text-gray-600 mb-6">Unable to load stock information. Please try again.</p>
//           <button
//             onClick={refreshData}
//             className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
//           >
//             <FaSync />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const sellThroughRate = data.totalIssued > 0 
//     ? ((data.totalSold / data.totalIssued) * 100).toFixed(1)
//     : 0;

//   const returnRate = data.totalIssued > 0 
//     ? ((data.totalReturned / data.totalIssued) * 100).toFixed(1)
//     : 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <MdInventory className="text-2xl text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                   Stock Summary
//                 </h1>
//                 <p className="text-gray-600">
//                   {user?.name || 'DSR'} • Inventory Overview
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={refreshData}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
//               >
//                 <FaSync />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => window.print()}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
//               >
//                 <FaPrint />
//                 Print Report
//               </button>
//             </div>
//           </div>

//           {/* Tab Navigation */}
//           <div className="flex border-b border-gray-200 mb-6">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`px-4 py-3 font-medium text-sm md:text-base transition-colors ${
//                 activeTab === "overview"
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               <FaChartBar className="inline mr-2" />
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab("details")}
//               className={`px-4 py-3 font-medium text-sm md:text-base transition-colors ${
//                 activeTab === "details"
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               <FaWarehouse className="inline mr-2" />
//               Stock Details
//             </button>
//           </div>
//         </div>

//         {/* Main Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <p className="text-sm text-blue-600 font-medium">Total Issued</p>
//                 <p className="text-2xl font-bold text-gray-800">{data.totalIssued}</p>
//               </div>
//               <FaArrowUp className="text-2xl text-blue-500" />
//             </div>
//             <div className="text-xs text-gray-500">
//               Products issued from warehouse
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 shadow-sm">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <p className="text-sm text-green-600 font-medium">Total Sold</p>
//                 <p className="text-2xl font-bold text-gray-800">{data.totalSold}</p>
//               </div>
//               <FaDollarSign className="text-2xl text-green-500" />
//             </div>
//             <div className="text-xs text-gray-500">
//               Sell-through rate: {sellThroughRate}%
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-100 shadow-sm">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <p className="text-sm text-red-600 font-medium">Total Returned</p>
//                 <p className="text-2xl font-bold text-gray-800">{data.totalReturned}</p>
//               </div>
//               <FaArrowDown className="text-2xl text-red-500" />
//             </div>
//             <div className="text-xs text-gray-500">
//               Return rate: {returnRate}%
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100 shadow-sm">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <p className="text-sm text-purple-600 font-medium">Available Stock</p>
//                 <p className="text-2xl font-bold text-gray-800">{data.availableStock}</p>
//               </div>
//               <FaWarehouse className="text-2xl text-purple-500" />
//             </div>
//             <div className="text-xs text-gray-500">
//               Current inventory balance
//             </div>
//           </div>
//         </div>

//         {/* Additional Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border border-yellow-100 shadow-sm">
//             <div className="flex items-center">
//               <FaExclamationTriangle className="text-yellow-500 text-lg mr-3" />
//               <div>
//                 <p className="text-sm text-yellow-600">Low Stock Items</p>
//                 <p className="text-xl font-bold text-gray-800">{stats.lowStockItems}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100 shadow-sm">
//             <div className="flex items-center">
//               <FaBoxOpen className="text-red-500 text-lg mr-3" />
//               <div>
//                 <p className="text-sm text-red-600">Out of Stock</p>
//                 <p className="text-xl font-bold text-gray-800">{stats.outOfStockItems}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm">
//             <div className="flex items-center">
//               <FaCheckCircle className="text-green-500 text-lg mr-3" />
//               <div>
//                 <p className="text-sm text-green-600">In Stock</p>
//                 <p className="text-xl font-bold text-gray-800">{stats.inStockItems}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-teal-50 to-white p-4 rounded-xl border border-teal-100 shadow-sm">
//             <div className="flex items-center">
//               <FaDollarSign className="text-teal-500 text-lg mr-3" />
//               <div>
//                 <p className="text-sm text-teal-600">Stock Value</p>
//                 <p className="text-xl font-bold text-gray-800">৳{stats.totalStockValue.toLocaleString()}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filter Section */}
//         <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaSearch className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search products..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                 />
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => setSelectedFilter("all")}
//                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
//                   selectedFilter === "all"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 All Items
//               </button>
//               <button
//                 onClick={() => setSelectedFilter("lowStock")}
//                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
//                   selectedFilter === "lowStock"
//                     ? "bg-yellow-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 Low Stock
//               </button>
//               <button
//                 onClick={() => setSelectedFilter("outOfStock")}
//                 className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
//                   selectedFilter === "outOfStock"
//                     ? "bg-red-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 Out of Stock
//               </button>
//             </div>
//           </div>

//           {/* Active Filters Info */}
//           {(searchTerm || selectedFilter !== "all") && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
//               <div className="flex items-center">
//                 <FaFilter className="text-blue-600 mr-2" />
//                 <span className="text-blue-700">
//                   Showing {filteredData.length} of {data.stockDetails.length} products
//                   {searchTerm && ` matching "${searchTerm}"`}
//                   {selectedFilter !== "all" && ` • ${selectedFilter === "lowStock" ? "Low Stock" : "Out of Stock"}`}
//                 </span>
//               </div>
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setSelectedFilter("all");
//                 }}
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Clear filters
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Stock Details Table */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
//             <h2 className="text-xl font-bold flex items-center gap-3">
//               <FaWarehouse />
//               Product Stock Details
//             </h2>
//             <p className="text-gray-300 text-sm mt-1">
//               Detailed inventory breakdown with financial metrics
//             </p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th 
//                     className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                     onClick={() => handleSort('productName')}
//                   >
//                     <div className="flex items-center gap-1">
//                       Product
//                       {sortConfig.key === 'productName' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
//                     </div>
//                   </th>
//                   <th 
//                     className="p-4 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                     onClick={() => handleSort('availableQty')}
//                   >
//                     <div className="flex items-center justify-center gap-1">
//                       Available
//                       {sortConfig.key === 'availableQty' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
//                     </div>
//                   </th>
//                   <th className="p-4 text-center font-semibold text-gray-700">
//                     Issued
//                   </th>
//                   <th className="p-4 text-center font-semibold text-gray-700">
//                     Sold
//                   </th>
//                   <th className="p-4 text-center font-semibold text-gray-700">
//                     Returned
//                   </th>
//                   <th className="p-4 text-center font-semibold text-gray-700">
//                     Buy Price
//                   </th>
//                   <th className="p-4 text-center font-semibold text-gray-700">
//                     Sell Price
//                   </th>
//                   <th 
//                     className="p-4 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                     onClick={() => handleSort('totalValue')}
//                   >
//                     <div className="flex items-center justify-center gap-1">
//                       Total Value
//                       {sortConfig.key === 'totalValue' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
//                     </div>
//                   </th>
//                   <th className="p-4 text-center font-semibold text-gray-700">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredData.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="p-8 text-center">
//                       <div className="text-gray-500">
//                         <FaBoxOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//                         <h3 className="font-medium text-gray-700 mb-1">No Products Found</h3>
//                         <p className="text-sm">
//                           {searchTerm || selectedFilter !== "all" 
//                             ? "Try adjusting your search or filters" 
//                             : "No stock data available"}
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredData.map((item) => {
//                     const stockStatus = item.availableQty === 0 
//                       ? 'out-of-stock'
//                       : item.availableQty <= 10 
//                         ? 'low-stock'
//                         : 'in-stock';
                    
//                     return (
//                       <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
//                         <td className="p-4">
//                           <div className="font-medium text-gray-800">{item.productName}</div>
//                           <div className="text-sm text-gray-500">ID: {item.productId.slice(-8)}</div>
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg font-bold ${
//                             stockStatus === 'out-of-stock'
//                               ? 'bg-red-100 text-red-700'
//                               : stockStatus === 'low-stock'
//                                 ? 'bg-yellow-100 text-yellow-700'
//                                 : 'bg-green-100 text-green-700'
//                           }`}>
//                             {item.availableQty}
//                           </div>
//                         </td>
//                         <td className="p-4 text-center font-medium text-gray-700">
//                           {item.issuedQty}
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="text-green-600 font-bold">{item.soldQty}</div>
//                           {item.issuedQty > 0 && (
//                             <div className="text-xs text-gray-500">
//                               {((item.soldQty / item.issuedQty) * 100).toFixed(0)}%
//                             </div>
//                           )}
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="text-red-600 font-medium">{item.returnedQty}</div>
//                           {item.issuedQty > 0 && (
//                             <div className="text-xs text-gray-500">
//                               {((item.returnedQty / item.issuedQty) * 100).toFixed(0)}%
//                             </div>
//                           )}
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="text-gray-700">
//                             ৳{item.buyPrice?.toLocaleString() || '0'}
//                           </div>
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="font-bold text-gray-900">
//                             ৳{item.sellPrice?.toLocaleString() || '0'}
//                           </div>
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="font-bold text-blue-700">
//                             ৳{item.totalValue?.toLocaleString() || '0'}
//                           </div>
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
//                             stockStatus === 'out-of-stock'
//                               ? 'bg-red-100 text-red-800'
//                               : stockStatus === 'low-stock'
//                                 ? 'bg-yellow-100 text-yellow-800'
//                                 : 'bg-green-100 text-green-800'
//                           }`}>
//                             {stockStatus === 'out-of-stock' && <FaExclamationTriangle size={10} />}
//                             {stockStatus === 'low-stock' && <FaExclamationTriangle size={10} />}
//                             {stockStatus === 'in-stock' && <FaCheckCircle size={10} />}
//                             {stockStatus === 'out-of-stock' ? 'Out of Stock' :
//                              stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Summary Footer */}
//         <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="text-center">
//               <div className="text-3xl font-bold text-blue-600">{filteredData.length}</div>
//               <div className="text-gray-600">Products Listed</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-green-600">
//                 ৳{stats.totalStockValue.toLocaleString()}
//               </div>
//               <div className="text-gray-600">Total Stock Value</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-purple-600">
//                 {data.availableStock}
//               </div>
//               <div className="text-gray-600">Total Available Units</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DSRStockSummaryPage;

