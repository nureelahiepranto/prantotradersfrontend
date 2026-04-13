import { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { MdDelete, MdSearch, MdFilterList, MdRefresh, MdCalendarToday, MdPerson, MdInventory, MdNumbers, MdMoreVert, MdDownload, MdSort } from "react-icons/md";
import { FiDownload, FiFilter } from "react-icons/fi";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";

export default function AdminReturnPage() {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [selectedDsr, setSelectedDsr] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [activeReturn, setActiveReturn] = useState(null);

  // Load Returns
  const loadReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/dsr-return");

      const flattened = res.data.flatMap(ret =>
        ret.items.map(it => ({
          _id: ret._id,
          createdAt: ret.createdAt,
          dsrId: ret.dsrId,
          productId: it.productId,
          quantity: it.qty,
          reason: it.reason || ""
        }))
      );

      flattened.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReturns(flattened);
    } catch (err) {
      console.log("Return load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // Filter Data
  const uniqueDsrs = [...new Set(returns.map(i => i.dsrId?.name))].filter(Boolean);
  const uniqueProducts = [...new Set(returns.map(i => i.productId?.name))].filter(Boolean);

  const filteredData = returns
    .filter(i => selectedDsr === "ALL" || i.dsrId?.name === selectedDsr)
    .filter(i => selectedProduct === "ALL" || i.productId?.name === selectedProduct)
    .filter(i => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        i.productId?.name?.toLowerCase().includes(s) ||
        i.dsrId?.name?.toLowerCase().includes(s) ||
        i.reason?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === "date") {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else if (sortConfig.key === "quantity") {
        aVal = a.quantity;
        bVal = b.quantity;
      } else {
        aVal = a[sortConfig.key]?.name || "";
        bVal = b[sortConfig.key]?.name || "";
      }
      return sortConfig.direction === "asc" ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
    });

  // Stats
  const stats = {
    totalReturns: filteredData.length,
    totalQuantity: filteredData.reduce((s, i) => s + i.quantity, 0),
    uniqueDsrs: new Set(filteredData.map(i => i.dsrId?.name)).size,
    uniqueProducts: new Set(filteredData.map(i => i.productId?.name)).size,
  };

  const formatDate = d =>
    new Date(d).toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const formatShortDate = d =>
    new Date(d).toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "short"
    });

  // Delete Handler
  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this return entry?")) return;

    try {
      await axios.delete(`/dsr-return/delete/${item._id}`, {
        data: {
          productId: item.productId._id,
          quantity: item.quantity,
          dsrId: item.dsrId._id,
        },
      });
      loadReturns();
      setActiveReturn(null);
    } catch {
      alert("Delete failed");
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const rows = filteredData.map(i =>
      `${i.dsrId?.name},${i.productId?.name},${i.quantity},${i.reason || "N/A"},${formatDate(i.createdAt)}`
    );
    const csv = ["DSR,Product,Quantity,Reason,Date", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dsr-returns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Sort Handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Clear Filters
  const clearFilters = () => {
    setSearch("");
    setSelectedDsr("ALL");
    setSelectedProduct("ALL");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">DSR Return Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all product returns from DSRs</p>
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
              onClick={loadReturns}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              <MdRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard 
            title="Total Returns" 
            value={stats.totalReturns} 
            icon={<MdInventory className="text-2xl" />}
            color="blue"
          />
          <StatCard 
            title="Total Quantity" 
            value={stats.totalQuantity} 
            icon={<MdNumbers className="text-2xl" />}
            color="emerald"
          />
          <StatCard 
            title="Unique DSRs" 
            value={stats.uniqueDsrs} 
            icon={<MdPerson className="text-2xl" />}
            color="purple"
          />
          <StatCard 
            title="Unique Products" 
            value={stats.uniqueProducts} 
            icon={<MdInventory className="text-2xl" />}
            color="amber"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                placeholder="Search by DSR, product, or reason..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-50 text-gray-700 rounded-lg flex items-center gap-2 font-medium hover:bg-gray-100 transition-all duration-200 border border-gray-200"
              >
                <FiFilter />
                Filters
                {(selectedDsr !== "ALL" || selectedProduct !== "ALL") && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(selectedDsr !== "ALL" ? 1 : 0) + (selectedProduct !== "ALL" ? 1 : 0)}
                  </span>
                )}
              </button>
              
              <button 
                onClick={clearFilters}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by DSR</label>
                <select 
                  value={selectedDsr} 
                  onChange={e => setSelectedDsr(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                >
                  <option value="ALL">All DSRs</option>
                  {uniqueDsrs.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Product</label>
                <select 
                  value={selectedProduct} 
                  onChange={e => setSelectedProduct(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                >
                  <option value="ALL">All Products</option>
                  {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSort("date")}
                    className={`px-4 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 ${sortConfig.key === "date" ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`}
                  >
                    <MdCalendarToday />
                    Date
                    {sortConfig.key === "date" && (
                      sortConfig.direction === "asc" ? <TbSortAscending /> : <TbSortDescending />
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleSort("quantity")}
                    className={`px-4 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 ${sortConfig.key === "quantity" ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`}
                  >
                    <MdNumbers />
                    Qty
                    {sortConfig.key === "quantity" && (
                      sortConfig.direction === "asc" ? <TbSortAscending /> : <TbSortDescending />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Active Filters */}
          {(selectedDsr !== "ALL" || selectedProduct !== "ALL") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDsr !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full">
                  DSR: {selectedDsr}
                  <button onClick={() => setSelectedDsr("ALL")} className="text-blue-800 hover:text-blue-900 ml-1">
                    ×
                  </button>
                </span>
              )}
              {selectedProduct !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                  Product: {selectedProduct}
                  <button onClick={() => setSelectedProduct("ALL")} className="text-emerald-800 hover:text-emerald-900 ml-1">
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            Showing <span className="font-semibold">{filteredData.length}</span> return{filteredData.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500">
            Updated just now
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading return data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No returns found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        <MdCalendarToday />
                        Date & Time
                        {sortConfig.key === "date" && (
                          sortConfig.direction === "asc" ? <TbSortAscending /> : <TbSortDescending />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort("dsrId")}
                    >
                      <div className="flex items-center gap-2">
                        <MdPerson />
                        DSR
                        {sortConfig.key === "dsrId" && (
                          sortConfig.direction === "asc" ? <TbSortAscending /> : <TbSortDescending />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort("productId")}
                    >
                      <div className="flex items-center gap-2">
                        <MdInventory />
                        Product
                        {sortConfig.key === "productId" && (
                          sortConfig.direction === "asc" ? <TbSortAscending /> : <TbSortDescending />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort("quantity")}
                    >
                      <div className="flex items-center gap-2">
                        <MdNumbers />
                        Quantity
                        {sortConfig.key === "quantity" && (
                          sortConfig.direction === "asc" ? <TbSortAscending /> : <TbSortDescending />
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Reason
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item, index) => (
                    <tr 
                      key={`${item._id}-${index}`} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{formatShortDate(item.createdAt)}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MdPerson className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-800">{item.dsrId?.name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <MdInventory className="text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-800">{item.productId?.name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 font-semibold rounded-full text-sm">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-lg text-sm ${item.reason ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                          {item.reason || "No reason provided"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete return"
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Data refreshes automatically. Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

      </div>
    </div>
  );
}

// Updated StatCard Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className={`rounded-xl p-5 border ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-white/50`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
// import { useEffect, useState } from "react";
// import axios from "axios";

// const AdminDSRReturnList = () => {
//   const [returns, setReturns] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchReturns = async () => {
//     try {
//       const res = await axios.get("https://dsrprantotradersbackend.onrender.com/api/dsr-return");
//       setReturns(res.data);
//     } catch (err) {
//       console.error("Return load error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReturns();
//   }, []);

//   if (loading) {
//     return <p className="p-4">Loading...</p>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">DSR Return List (Admin)</h1>

//       <div className="overflow-x-auto bg-white shadow rounded">
//         <table className="min-w-full border">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">DSR</th>
//               <th className="border p-2">Email</th>
//               <th className="border p-2">Product</th>
//               <th className="border p-2">SKU</th>
//               <th className="border p-2">Qty</th>
//               <th className="border p-2">Reason</th>
//               <th className="border p-2">Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {returns.map((ret) =>
//               ret.items.length > 0 ? (
//                 ret.items.map((item, idx) => (
//                   <tr key={ret._id + idx}>
//                     <td className="border p-2">
//                       {ret.dsrId?.name}
//                     </td>
//                     <td className="border p-2">
//                       {ret.dsrId?.email}
//                     </td>
//                     <td className="border p-2">
//                       {item.productId?.name}
//                     </td>
//                     <td className="border p-2">
//                       {item.productId?.sku}
//                     </td>
//                     <td className="border p-2 text-center">
//                       {item.qty}
//                     </td>
//                     <td className="border p-2">
//                       {item.reason || "-"}
//                     </td>
//                     <td className="border p-2">
//                       {new Date(ret.createdAt).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : null
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminDSRReturnList;

 
// import { useEffect, useState } from "react";
// import axios from "../api/axios.js";
// import { MdDelete, MdSearch, MdFilterList, MdRefresh } from "react-icons/md";
// import { FiDownload } from "react-icons/fi";

// export default function AdminReturnPage() {
//   const [returns, setReturns] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
//   const [selectedDsr, setSelectedDsr] = useState('ALL');
//   const [selectedProduct, setSelectedProduct] = useState('ALL');

//   // Fetch Return List
//   const loadReturns = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("/dsr-return");
//       // Sort by date descending initially
//       const sortedData = res.data.sort((a, b) => 
//         new Date(b.createdAt) - new Date(a.createdAt)
//       );
//       setReturns(sortedData);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadReturns();
//   }, []);

//   // Get unique DSRs and Products for filters
//   const uniqueDsrs = [...new Set(returns.map(item => item.dsrId?.name))].filter(Boolean).sort();
//   const uniqueProducts = [...new Set(returns.map(item => item.productId?.name))].filter(Boolean).sort();

//   // Filter and sort data
//   const getFilteredAndSortedData = () => {
//     let filtered = [...returns];

//     // Apply DSR filter
//     if (selectedDsr !== 'ALL') {
//       filtered = filtered.filter(item => item.dsrId?.name === selectedDsr);
//     }

//     // Apply Product filter
//     if (selectedProduct !== 'ALL') {
//       filtered = filtered.filter(item => item.productId?.name === selectedProduct);
//     }

//     // Apply search filter
//     if (search) {
//       const searchLower = search.toLowerCase();
//       filtered = filtered.filter(item => {
//         const productName = item.productId?.name?.toLowerCase() || "";
//         const dsrName = item.dsrId?.name?.toLowerCase() || "";
//         return productName.includes(searchLower) || dsrName.includes(searchLower);
//       });
//     }

//     // Apply sorting
//     if (sortConfig.key === 'date') {
//       filtered.sort((a, b) => {
//         let aValue, bValue;
        
//         if (sortConfig.key === 'date') {
//           aValue = new Date(a.createdAt);
//           bValue = new Date(b.createdAt);
//         } else if (sortConfig.key === 'dsrId.name') {
//           aValue = a.dsrId?.name || '';
//           bValue = b.dsrId?.name || '';
//         } else if (sortConfig.key === 'productId.name') {
//           aValue = a.productId?.name || '';
//           bValue = b.productId?.name || '';
//         } else if (sortConfig.key === 'quantity') {
//           aValue = a.quantity || 0;
//           bValue = b.quantity || 0;
//         } else {
//           aValue = a[sortConfig.key];
//           bValue = b[sortConfig.key];
//         }

//         if (sortConfig.direction === 'asc') {
//           return aValue > bValue ? 1 : -1;
//         } else {
//           return aValue < bValue ? 1 : -1;
//         }
//       });
//     }

//     return filtered;
//   };

//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const SortIcon = ({ sortKey }) => {
//     if (sortConfig.key !== sortKey) return null;
//     return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
//   };

//   // Calculate statistics
//   const filteredData = getFilteredAndSortedData();
  
//   const stats = {
//     totalReturns: filteredData.length,
//     totalQuantity: filteredData.reduce((sum, item) => sum + (item.quantity || 0), 0),
//     uniqueDsrs: [...new Set(filteredData.map(item => item.dsrId?.name))].filter(Boolean).length,
//     uniqueProducts: [...new Set(filteredData.map(item => item.productId?.name))].filter(Boolean).length,
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Delete Handler
//   const handleDelete = async (item) => {
//     if (!window.confirm(`Are you sure you want to delete this return entry?\n\nDSR: ${item.dsrId?.name}\nProduct: ${item.productId?.name}\nQuantity: ${item.quantity}`)) return;

//     try {
//       await axios.delete(`/dsr-return/delete/${item._id}`, {
//         data: {
//           productId: item.productId._id,
//           quantity: item.quantity,
//           dsrId: item.dsrId._id
//         }
//       });

//       alert("Return entry deleted successfully");
//       loadReturns();
//     } catch (err) {
//       console.log(err);
//       alert("Delete failed!");
//     }
//   };

//   // Export to CSV
//   const exportToCSV = () => {
//     const headers = ['DSR Name', 'Product Name', 'Quantity', 'Return Date'];
//     const csvData = filteredData.map(item => [
//       item.dsrId?.name || '',
//       item.productId?.name || '',
//       item.quantity,
//       new Date(item.date).toLocaleDateString()
//     ]);

//     const csvContent = [
//       headers.join(','),
//       ...csvData.map(row => row.join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `returns-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Admin Return Product List</h1>
//               <p className="text-gray-600">Manage all returned products from DSRs</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={exportToCSV}
//                 className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
//               >
//                 <FiDownload className="mr-2" size={18} />
//                 Export CSV
//               </button>
//               <button
//                 onClick={loadReturns}
//                 className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
//               >
//                 <MdRefresh className="mr-2" size={18} />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
//             <div className="flex items-center">
//               <div className="p-2 bg-red-50 rounded-lg mr-3">
//                 <MdDelete className="w-5 h-5 text-red-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Total Returns</p>
//                 <p className="text-xl font-bold text-gray-800">{stats.totalReturns}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
//             <div className="flex items-center">
//               <div className="p-2 bg-orange-50 rounded-lg mr-3">
//                 <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Total Quantity</p>
//                 <p className="text-xl font-bold text-orange-600">{stats.totalQuantity}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
//             <div className="flex items-center">
//               <div className="p-2 bg-blue-50 rounded-lg mr-3">
//                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Unique DSRs</p>
//                 <p className="text-xl font-bold text-blue-600">{stats.uniqueDsrs}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-50 rounded-lg mr-3">
//                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Unique Products</p>
//                 <p className="text-xl font-bold text-green-600">{stats.uniqueProducts}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters Section */}
//         <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-medium text-gray-700 flex items-center">
//               <MdFilterList className="mr-2" size={20} />
//               Filters & Search
//             </h3>
//             <span className="text-sm text-gray-500">
//               Showing: <span className="font-semibold">{filteredData.length} of {returns.length}</span>
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {/* Search */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Search
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <MdSearch className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search by product or DSR..."
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* DSR Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Filter by DSR
//               </label>
//               <select
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
//                 value={selectedDsr}
//                 onChange={(e) => setSelectedDsr(e.target.value)}
//               >
//                 <option value="ALL">All DSRs</option>
//                 {uniqueDsrs.map(dsr => (
//                   <option key={dsr} value={dsr}>{dsr}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Product Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Filter by Product
//               </label>
//               <select
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
//                 value={selectedProduct}
//                 onChange={(e) => setSelectedProduct(e.target.value)}
//               >
//                 <option value="ALL">All Products</option>
//                 {uniqueProducts.map(product => (
//                   <option key={product} value={product}>{product}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Sort Info */}
//             <div className="bg-red-50 rounded-lg p-3 flex items-center">
//               <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
//               </svg>
//               <div>
//                 <p className="text-sm text-red-700">
//                   Sorted by: {sortConfig.key === 'date' ? 'Return Date' : 
//                              sortConfig.key === 'dsrId.name' ? 'DSR Name' : 
//                              sortConfig.key === 'productId.name' ? 'Product Name' : 
//                              sortConfig.key}
//                   <span className="ml-1">
//                     {sortConfig.direction === 'desc' ? '(Newest First)' : '(Oldest First)'}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Active Filters */}
//           {(selectedDsr !== 'ALL' || selectedProduct !== 'ALL' || search) && (
//             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
//               <div className="flex items-center">
//                 <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
//                 </svg>
//                 <span className="text-red-700">
//                   Active filters: 
//                   {selectedDsr !== 'ALL' ? ` DSR: ${selectedDsr}` : ''}
//                   {selectedProduct !== 'ALL' ? ` Product: ${selectedProduct}` : ''}
//                   {search ? ` Search: "${search}"` : ''}
//                 </span>
//               </div>
//               <button
//                 onClick={() => {
//                   setSelectedDsr('ALL');
//                   setSelectedProduct('ALL');
//                   setSearch('');
//                 }}
//                 className="text-sm text-red-600 hover:text-red-800 font-medium"
//               >
//                 Clear filters
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading return records...</p>
//           </div>
//         )}

//         {/* Main Table - Desktop */}
//         {!loading && (
//           <>
//             <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th 
//                         className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                         onClick={() => handleSort('date')}
//                       >
//                         Return Date{SortIcon({ sortKey: 'date' })}
//                       </th>
//                       <th 
//                         className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                         onClick={() => handleSort('dsrId.name')}
//                       >
//                         DSR Name{SortIcon({ sortKey: 'dsrId.name' })}
//                       </th>
//                       <th 
//                         className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                         onClick={() => handleSort('productId.name')}
//                       >
//                         Product{SortIcon({ sortKey: 'productId.name' })}
//                       </th>
//                       <th 
//                         className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                         onClick={() => handleSort('quantity')}
//                       >
//                         Quantity{SortIcon({ sortKey: 'quantity' })}
//                       </th>
//                       <th className="p-4 text-left font-semibold text-gray-700">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {filteredData.length === 0 ? (
//                       <tr>
//                         <td colSpan="5" className="p-8 text-center">
//                           <div className="text-gray-500">
//                             <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                             </svg>
//                             <h3 className="font-medium text-gray-700 mb-1">No Return Records Found</h3>
//                             <p className="text-sm">
//                               {search || selectedDsr !== 'ALL' || selectedProduct !== 'ALL' 
//                                 ? "Try adjusting your filters" 
//                                 : "No return records available"}
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredData.map((item) => (
//                         <tr key={item._id} className="hover:bg-gray-50 transition-colors">
//                           <td className="p-4">
//                             <div className="text-gray-800 font-medium">
//                               {formatDate(item.createdAt)}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </div>
//                           </td>
//                           <td className="p-4">
//                             <div className="font-medium text-gray-800">{item.dsrId?.name || "N/A"}</div>
//                           </td>
//                           <td className="p-4">
//                             <div className="font-medium text-gray-800">{item.productId?.name || "N/A"}</div>
//                           </td>
//                           <td className="p-4">
//                             <div className="text-gray-700">
//                               <span className="px-2 py-1 bg-red-50 text-red-700 rounded-lg font-medium">
//                                 {item.quantity || 0}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="p-4">
//                             <button
//                               onClick={() => handleDelete(item)}
//                               className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
//                             >
//                               <MdDelete className="mr-1.5" size={18} />
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Mobile Cards View */}
//             <div className="md:hidden space-y-4">
//               {filteredData.length === 0 ? (
//                 <div className="bg-white rounded-xl shadow-sm p-8 text-center">
//                   <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                   </svg>
//                   <h3 className="text-lg font-medium text-gray-800 mb-2">No Return Records Found</h3>
//                   <p className="text-gray-600">
//                     {search || selectedDsr !== 'ALL' || selectedProduct !== 'ALL' 
//                       ? "Try adjusting your filters" 
//                       : "No return records available"}
//                   </p>
//                 </div>
//               ) : (
//                 filteredData.map((item) => (
//                   <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
//                     <div className="flex items-start justify-between mb-4">
//                       <div>
//                         <div className="text-sm text-gray-500 mb-1">
//                           {formatDate(item.date)}
//                         </div>
//                         <h3 className="font-semibold text-gray-800">{item.dsrId?.name || "N/A"}</h3>
//                       </div>
//                       <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
//                         Qty: {item.quantity || 0}
//                       </span>
//                     </div>

//                     <div className="mb-4">
//                       <p className="text-sm text-gray-600">Product:</p>
//                       <p className="font-medium text-gray-800">{item.productId?.name || "N/A"}</p>
//                     </div>

//                     <button
//                       onClick={() => handleDelete(item)}
//                       className="w-full inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
//                     >
//                       <MdDelete className="mr-1.5" size={18} />
//                       Delete Return Entry
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }