// import { useEffect, useState } from "react";
// import axios from "../api/axios.js";

// export default function DSRReturnProducts() {
//   const [products, setProducts] = useState([]);
//   const user = JSON.parse(localStorage.getItem("user"));

// const [returnData, setReturnData] = useState({
//   productId: "",
//   quantity: "",
//   dsrId: user?.id || ""   // Fix here
// });

//   const loadProducts = async () => {
//     try {
//       const res = await axios.get("/products");
//       setProducts(res.data.products);
//     } catch (err) {
//       console.log("Product fetch error:", err);
//     }
//   };

//   const submitReturn = async (e) => {
//     e.preventDefault();
//     console.log("Sending return data:", returnData);

//     try {
//       const res = await axios.post("/dsr-return/return", returnData);
//       alert(res.data.message);

//       setReturnData({
//         productId: "",
//         quantity: "",
//         dsrId: localStorage.getItem("userId")
//       });
//     } catch (err) {
//       console.log("Return error:", err);
//       alert("Error Returning Product");
//     }
//   };

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   return (
//     <div className="p-5">
//       <h1 className="text-2xl font-semibold mb-4">Return Products</h1>

//       <form onSubmit={submitReturn} className="space-y-3 p-4 bg-white shadow rounded">
//         <select
//           className="border p-2 w-full"
//           value={returnData.productId}
//           onChange={(e) => setReturnData({ ...returnData, productId: e.target.value })}
//         >
//           <option value="">Select Product</option>
//           {products.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.name} ({p.sku})
//             </option>
//           ))}
//         </select>

//         <input
//           type="number"
//           className="border p-2 w-full"
//           placeholder="Quantity"
//           value={returnData.quantity}
//           onChange={(e) => setReturnData({ ...returnData, quantity: e.target.value })}
//         />

//         <button className="bg-blue-600 text-white px-4 py-2 rounded">
//           Return Product
//         </button>
//       </form>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FaUndoAlt,
  FaBoxOpen,
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaInfoCircle,
  FaWarehouse,
  FaTag,
  FaBox,
  FaHistory,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUserCircle
} from "react-icons/fa";
import { MdInventory, MdAttachMoney } from "react-icons/md";

export default function DSRReturnProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [returnHistory, setReturnHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dsrStock, setDsrStock] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  const [returnData, setReturnData] = useState({
    productId: "",
    quantity: "",
    reason: "",
    note: "",
    dsrId: user?.id || "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/products");
      const productsData = res.data.products || res.data || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      console.error("Product fetch error:", err);
      setMessage({
        text: "Failed to load products. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReturnHistory = async () => {
    try {
      const res = await axios.get(`/dsr-return/history?dsrId=${user?.id}`);
      setReturnHistory(res.data.returns || []);
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

const loadDSRStock = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await axios.get(
      `/dsr-stock/${user.id}?date=${today}`
    );

    const map = {};
    (res.data.stockDetails || []).forEach(item => {
      map[item.productId] = item.availableQty;
    });

    setDsrStock(map);
  } catch (err) {
    console.error("DSR stock error:", err);
  }
};

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  // Sort products
  useEffect(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? (a.name || "").localeCompare(b.name || "")
          : (b.name || "").localeCompare(a.name || "");
      }
      if (sortConfig.key === 'stock') {
        return sortConfig.direction === 'asc'
          ? (a.stock || 0) - (b.stock || 0)
          : (b.stock || 0) - (a.stock || 0);
      }
      return 0;
    });
    setFilteredProducts(sorted);
  }, [sortConfig]);

  // Update selected product when productId changes
  useEffect(() => {
    if (returnData.productId) {
      const product = products.find(p => p._id === returnData.productId);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [returnData.productId, products]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const submitReturn = async (e) => {
    e.preventDefault();
    
    if (!returnData.productId || !returnData.quantity) {
      setMessage({
        text: "Please select a product and enter quantity",
        type: "error"
      });
      return;
    }

    if (parseInt(returnData.quantity) <= 0) {
      setMessage({
        text: "Please enter a valid quantity",
        type: "error"
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post("/dsr-return/return", returnData);
      
      setMessage({
        text: res.data.message || "Product returned successfully!",
        type: "success"
      });

      // Reset form
      setReturnData({
        productId: "",
        quantity: "",
        reason: "",
        note: "",
        dsrId: user?.id || "",
      });
      setSelectedProduct(null);

      // Reload products and history
      loadProducts();
      loadReturnHistory();

    } catch (err) {
      console.error("Return error:", err);
      const errorMsg = err.response?.data?.error || "Error returning product. Please try again.";
      setMessage({
        text: errorMsg,
        type: "error"
      });
    } finally {
      setSubmitting(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReturnData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Return reasons options
  const returnReasons = [
    { value: "damaged", label: "Damaged Product" },
    { value: "defective", label: "Defective Product" },
    { value: "wrong_item", label: "Wrong Item Received" },
    { value: "excess_stock", label: "Excess Stock" },
    { value: "customer_return", label: "Customer Return" },
    { value: "expired", label: "Expired Product" },
    { value: "other", label: "Other Reason" }
  ];

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    totalStockValue: products.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0),
    lowStockProducts: products.filter(p => (p.stock || 0) < 10).length,
    outOfStockProducts: products.filter(p => (p.stock || 0) === 0).length,
    totalReturns: returnHistory.length,
    todayReturns: returnHistory.filter(r => {
      const returnDate = new Date(r.date);
      const today = new Date();
      return returnDate.toDateString() === today.toDateString();
    }).length
  };

  useEffect(() => {
  loadProducts();
  loadReturnHistory();
  loadDSRStock(); // 🔥 MUST
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaUndoAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Product Returns
                </h1>
                <p className="text-gray-600">Manage product returns efficiently</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <FaArrowLeft />
                Go Back
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaHistory />
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <div className="flex items-center">
                <FaBox className="text-blue-500 text-lg mr-2" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Products</p>
                  <p className="text-lg font-bold text-gray-800">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="flex items-center">
                <MdAttachMoney className="text-green-500 text-lg mr-2" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Stock Value</p>
                  <p className="text-lg font-bold text-gray-800">
                    ৳{stats.totalStockValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <div className="flex items-center">
                <FaExclamationCircle className="text-yellow-500 text-lg mr-2" />
                <div>
                  <p className="text-xs text-yellow-600 font-medium">Low Stock</p>
                  <p className="text-lg font-bold text-gray-800">{stats.lowStockProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100 shadow-sm">
              <div className="flex items-center">
                <FaBoxOpen className="text-red-500 text-lg mr-2" />
                <div>
                  <p className="text-xs text-red-600 font-medium">Out of Stock</p>
                  <p className="text-lg font-bold text-gray-800">{stats.outOfStockProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex items-center">
                <FaUndoAlt className="text-purple-500 text-lg mr-2" />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Total Returns</p>
                  <p className="text-lg font-bold text-gray-800">{stats.totalReturns}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-white p-4 rounded-xl border border-teal-100 shadow-sm">
              <div className="flex items-center">
                <FaCalendarAlt className="text-teal-500 text-lg mr-2" />
                <div>
                  <p className="text-xs text-teal-600 font-medium">Today</p>
                  <p className="text-lg font-bold text-gray-800">{stats.todayReturns}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Return Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaUndoAlt />
                  New Return Request
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Submit a new product return to inventory
                </p>
              </div>

              <div className="p-6">
                {/* Message Alert */}
                {message.text && (
                  <div className={`mb-6 rounded-lg p-4 flex items-center ${
                    message.type === "success" 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-red-50 border border-red-200"
                  }`}>
                    {message.type === "success" ? (
                      <FaCheckCircle className="text-green-500 text-xl mr-3" />
                    ) : (
                      <FaExclamationCircle className="text-red-500 text-xl mr-3" />
                    )}
                    <span className={`font-medium ${
                      message.type === "success" ? "text-green-700" : "text-red-700"
                    }`}>
                      {message.text}
                    </span>
                  </div>
                )}

                <form onSubmit={submitReturn} className="space-y-5">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Product
                    </label>
                    <div className="relative">
                      <FaBoxOpen className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                      <select
                        name="productId"
                        value={returnData.productId}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                        disabled={loading}
                      >
                        <option value="">Choose a product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} • SKU: {p.sku || 'N/A'} • Stock: {dsrStock[p._id] || 0}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Product Info */}
                  {selectedProduct && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Product</p>
                          <p className="font-semibold">{selectedProduct.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Stock</p>
                          <p className="font-bold text-green-600">{dsrStock[selectedProduct?._id] || 0} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">SKU</p>
                          <p className="font-medium">{selectedProduct.sku || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="font-medium">৳{selectedProduct.price?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity and Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={returnData.quantity}
                        onChange={handleInputChange}
                        placeholder="Enter quantity"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                        min="1"
                        max={dsrStock[selectedProduct?._id] || 0}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Available stock: {dsrStock[selectedProduct?._id] || 0} units
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Reason
                      </label>
                      <select
                        name="reason"
                        value={returnData.reason}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                       
                      >
                        <option value="">Select reason...</option>
                        {returnReasons.map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="note"
                      value={returnData.note}
                      onChange={handleInputChange}
                      placeholder="Enter any additional information..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !returnData.productId || !returnData.quantity }
                    className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${
                      submitting || !returnData.productId || !returnData.quantity || !returnData.reason
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-3" />
                        Processing Return...
                      </>
                    ) : (
                      <>
                        <FaUndoAlt className="mr-3" />
                        Submit Return Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Guidelines Card */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaInfoCircle className="mr-2" />
                Return Guidelines
              </h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Verify product details before submission</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Ensure accurate quantity count</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Select appropriate return reason</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Include batch numbers if available</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Products List & History */}
          <div className="space-y-6">
            {/* Products List Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-5 text-white">
                <h3 className="font-bold flex items-center">
                  <FaWarehouse className="mr-2" />
                  Available Products
                </h3>
              </div>

              <div className="p-4">
                {/* Search Box */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                {/* Sort Options */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleSort('name')}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-xs ${
                      sortConfig.key === 'name'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </button>
                  <button
                    onClick={() => handleSort('stock')}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-xs ${
                      sortConfig.key === 'stock'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </button>
                </div>

                {/* Products List */}
                <div className="overflow-y-auto max-h-[300px] pr-2">
                  {loading ? (
                    <div className="text-center py-6">
                      <FaSpinner className="animate-spin text-blue-500 text-xl mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-6">
                      <FaBoxOpen className="text-gray-400 text-2xl mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">
                        {searchTerm ? "No matching products" : "No products available"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.slice(0, 50).map((product) => (
                        <div
                          key={product._id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            returnData.productId === product._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setReturnData(prev => ({ ...prev, productId: product._id }))}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-gray-800 text-sm truncate">
                              {product.name}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              (dsrStock[product._id] || 0) < 10 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {dsrStock[product._id] || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span className="flex items-center">
                              <FaTag className="mr-1" size={10} />
                              {product.sku || 'N/A'}
                            </span>
                            <span className="font-medium">
                              ৳{product.price?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>
                      Showing {Math.min(filteredProducts.length, 8)} of {products.length} products
                    </span>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSortConfig({ key: 'name', direction: 'asc' });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FaUserCircle className="text-white text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">DSR Information</h4>
                  <p className="text-sm text-gray-600">Return Session</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">DSR ID:</span>
                  <span className="font-medium">{user?.id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{user?.name || user?.email || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Returns (Collapsible) */}
            {showHistory && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
                  <h3 className="font-bold flex items-center">
                    <FaHistory className="mr-2" />
                    Recent Returns
                  </h3>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  {returnHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <FaExchangeAlt className="text-gray-400 text-xl mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No return history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {returnHistory.slice(0, 5).map((item) => (
                        <div key={item._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-800 text-sm">
                              {item.product?.name || 'Unknown'}
                            </span>
                            <span className="text-green-600 font-bold text-sm">
                              {item.quantity}x
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            <span className="text-blue-600">{item.reason || 'No reason'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}