// // src/admin/AddProduct.jsx
// import React, { useState } from "react";
// import API from "../api/axios";
// import { useNavigate } from "react-router-dom";

// export default function AddProduct() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     sku: "",
//     sellPrice: "",
//     adminStock: ""
//   });

//   const change = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const submit = async (e) => {
//     e.preventDefault();

//     try {
//       await API.post("/products", form);
//       alert("Product added!");
//       navigate("/admin/products");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add product");
//     }
//   };

//   return (
//     <div className="p-6 container-max mx-auto max-w-lg">
//       <h2 className="text-2xl mb-4">Add Product</h2>

//       <form onSubmit={submit} className="space-y-3 bg-white p-5 rounded shadow">
//         <input name="name" placeholder="Name" className="w-full p-2 border rounded" required onChange={change} />
//         <input name="sku" placeholder="SKU" className="w-full p-2 border rounded" onChange={change} />
//         <input name="sellPrice" placeholder="Price" type="number" className="w-full p-2 border rounded" required onChange={change} />
//         <input name="adminStock" placeholder="Stock" type="number" className="w-full p-2 border rounded" required onChange={change} />

//         <button className="bg-blue-600 text-white w-full py-2 rounded">Save</button>
//       </form>
//     </div>
//   );
// }


import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaBox, FaTag, FaWarehouse, FaBarcode, 
  FaSave, FaArrowLeft, FaPlus, FaInfoCircle,
  FaFileInvoiceDollar, FaPercentage, FaShoppingCart
} from "react-icons/fa";
import { FiPackage, FiDollarSign, FiTrendingUp } from "react-icons/fi";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    sellPrice: "",
    purchasePrice: "",
    adminStock: "",
    category: "",
    unit: "pcs",
    description: "",
    brand: "",
    minStockLevel: "10",
    reorderLevel: "5"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");

  const categories = [
    "Electronics", "Clothing", "Home Appliances", "Sports", 
    "Books", "Beauty", "Food & Beverages", "Office Supplies",
    "Automotive", "Toys", "Health", "Other"
  ];

  const units = ["pcs", "kg", "litre", "meter", "box", "pack", "dozen", "set"];

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.sellPrice || parseFloat(form.sellPrice) <= 0) 
      newErrors.sellPrice = "Valid selling price is required";
    if (!form.adminStock || parseInt(form.adminStock) < 0) 
      newErrors.adminStock = "Valid stock quantity is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateProfit = () => {
    const sell = parseFloat(form.sellPrice) || 0;
    const purchase = parseFloat(form.purchasePrice) || 0;
    
    if (purchase === 0) return 0;
    return ((sell - purchase) / purchase * 100).toFixed(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name: form.name,
        sku: form.sku,
        buyPrice: parseFloat(form.purchasePrice) || 0, // 🔥 IMPORTANT
        sellPrice: parseFloat(form.sellPrice),
        adminStock: parseInt(form.adminStock),

        // ✅ SEND THESE
      category: form.category,
      brand: form.brand,
      description: form.description,
      unit: form.unit,
      };


      await API.post("/products", productData);
      
      // Success notification
      alert("✅ Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link 
                  to="/admin/products" 
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <FaArrowLeft size={16} />
                  <span className="text-sm">Back to Products</span>
                </Link>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Product</h1>
              <p className="text-gray-600 mt-1">Add a new product to your inventory</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <FiPackage size={20} className="text-blue-600" />
                <span className="text-sm text-gray-700">Product ID: AUTO</span>
              </div>
              <button
                onClick={submit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    <span>Save Product</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-1 mb-6">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("basic")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "basic" ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaBox size={16} />
                <span>Basic Info</span>
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "pricing" ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiDollarSign size={16} />
                <span>Pricing</span>
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "inventory" ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaWarehouse size={16} />
                <span>Inventory</span>
              </button>
              <button
                onClick={() => setActiveTab("advanced")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "advanced" ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaInfoCircle size={16} />
                <span>Advanced</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <form onSubmit={submit}>
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaBox className="text-indigo-600" />
                        Basic Product Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Name */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                          </label>
                          <div className="relative">
                            <input
                              name="name"
                              value={form.name}
                              onChange={change}
                              placeholder="Enter product name"
                              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                                errors.name ? 'border-red-500' : 'border-gray-200'
                              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                              required
                            />
                            <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            {errors.name && (
                              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Enter a descriptive name for the product</p>
                        </div>

                        {/* SKU */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU / Product Code
                          </label>
                          <div className="relative">
                            <input
                              name="sku"
                              value={form.sku}
                              onChange={change}
                              placeholder="e.g., PROD-001"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            />
                            <FaBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          </div>
                        </div>

                        {/* Brand */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand
                          </label>
                          <input
                            name="brand"
                            value={form.brand}
                            onChange={change}
                            placeholder="Brand name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={form.category}
                            onChange={change}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 appearance-none"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Unit */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit of Measurement
                          </label>
                          <select
                            name="unit"
                            value={form.unit}
                            onChange={change}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 appearance-none"
                          >
                            {units.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={form.description}
                            onChange={change}
                            placeholder="Describe the product features, specifications, etc."
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiDollarSign className="text-green-600" />
                        Pricing Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Selling Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selling Price (৳) *
                          </label>
                          <div className="relative">
                            <input
                              name="sellPrice"
                              type="number"
                              min="0"
                              step="0.01"
                              value={form.sellPrice}
                              onChange={change}
                              placeholder="0.00"
                              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                                errors.sellPrice ? 'border-red-500' : 'border-gray-200'
                              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                              required
                            />
                            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            {errors.sellPrice && (
                              <p className="text-red-500 text-sm mt-1">{errors.sellPrice}</p>
                            )}
                          </div>
                        </div>

                        {/* Purchase Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Price (৳)
                          </label>
                          <div className="relative">
                            <input
                              name="purchasePrice"
                              type="number"
                              min="0"
                              step="0.01"
                              value={form.purchasePrice}
                              onChange={change}
                              placeholder="0.00"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            />
                            <FaShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          </div>
                        </div>

                        {/* Profit Calculation Card */}
                        <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <h4 className="font-medium text-gray-800 mb-3">Profit Analysis</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Margin</p>
                              <p className="text-2xl font-bold text-green-600">
                                {form.purchasePrice ? calculateProfit() : "0.00"}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Profit per Unit</p>
                              <p className="text-2xl font-bold text-green-600">
                                ৳{form.purchasePrice ? 
                                  (parseFloat(form.sellPrice || 0) - parseFloat(form.purchasePrice)).toFixed(2) : 
                                  "0.00"}
                              </p>
                            </div>
                          </div>
                          {form.purchasePrice && parseFloat(form.purchasePrice) > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Cost to Sell Ratio</span>
                                <span className="font-medium">
                                  {((parseFloat(form.purchasePrice) / parseFloat(form.sellPrice || 1)) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ 
                                    width: `${Math.min((parseFloat(form.purchasePrice) / parseFloat(form.sellPrice || 1)) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaWarehouse className="text-amber-600" />
                        Inventory Management
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Stock */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Stock Quantity *
                          </label>
                          <div className="relative">
                            <input
                              name="adminStock"
                              type="number"
                              min="0"
                              value={form.adminStock}
                              onChange={change}
                              placeholder="0"
                              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                                errors.adminStock ? 'border-red-500' : 'border-gray-200'
                              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                              required
                            />
                            <FaWarehouse className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            {errors.adminStock && (
                              <p className="text-red-500 text-sm mt-1">{errors.adminStock}</p>
                            )}
                          </div>
                        </div>

                        {/* Minimum Stock Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Stock Level
                          </label>
                          <input
                            name="minStockLevel"
                            type="number"
                            min="0"
                            value={form.minStockLevel}
                            onChange={change}
                            placeholder="10"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>

                        {/* Reorder Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reorder Level
                          </label>
                          <input
                            name="reorderLevel"
                            type="number"
                            min="0"
                            value={form.reorderLevel}
                            onChange={change}
                            placeholder="5"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>

                        {/* Stock Status Card */}
                        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <h4 className="font-medium text-gray-800 mb-3">Stock Status Preview</h4>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Current Level</p>
                              <p className={`text-2xl font-bold ${
                                parseInt(form.adminStock) > (parseInt(form.minStockLevel) * 2) ? 'text-green-600' :
                                parseInt(form.adminStock) > parseInt(form.minStockLevel) ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {form.adminStock || 0}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Min Required</p>
                              <p className="text-2xl font-bold text-gray-700">{form.minStockLevel}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Reorder At</p>
                              <p className="text-2xl font-bold text-gray-700">{form.reorderLevel}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Stock Level Indicator</span>
                              <span className="font-medium">
                                {((parseInt(form.adminStock) / (parseInt(form.minStockLevel) * 2 || 1)) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  parseInt(form.adminStock) > (parseInt(form.minStockLevel) * 2) ? 'bg-green-500' :
                                  parseInt(form.adminStock) > parseInt(form.minStockLevel) ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((parseInt(form.adminStock) / (parseInt(form.minStockLevel) * 2 || 1)) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === "advanced" && (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaInfoCircle className="text-purple-600" />
                        Advanced Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <h4 className="font-medium text-gray-800 mb-2">Tax Settings</h4>
                          <p className="text-sm text-gray-600 mb-3">Configure tax rates for this product</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                VAT Rate (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="15.0"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Code
                              </label>
                              <input
                                placeholder="VAT-001"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                          <h4 className="font-medium text-gray-800 mb-2">Additional Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dimensions (L×W×H in cm)
                              </label>
                              <div className="flex gap-2">
                                <input
                                  placeholder="Length"
                                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <input
                                  placeholder="Width"
                                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <input
                                  placeholder="Height"
                                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaInfoCircle size={14} />
                      <span>Fields marked with * are required</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving Product...</span>
                          </>
                        ) : (
                          <>
                            <FaSave size={16} />
                            <span>Save Product</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Preview & Help */}
          <div className="space-y-6">
            {/* Product Preview Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiPackage className="text-indigo-600" />
                Product Preview
              </h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaBox size={24} className="text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 truncate">{form.name || "Product Name"}</h4>
                  <p className="text-sm text-gray-600 mt-1">{form.category || "Category"}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-bold text-gray-800">৳{form.sellPrice || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`font-bold ${
                      parseInt(form.adminStock) > 20 ? 'text-green-600' : 
                      parseInt(form.adminStock) > 0 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {form.adminStock || "0"} {form.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SKU:</span>
                    <span className="font-medium text-gray-700">{form.sku || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Quick Tips
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-600">Use descriptive names for easy search</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-600">Set minimum stock levels to avoid stockouts</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-600">Add purchase price for profit calculation</p>
                </div>
              </div>
            </div>

            {/* Validation Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Validation Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product Name</span>
                  {form.name ? (
                    <span className="text-green-600 text-sm">✓ Valid</span>
                  ) : (
                    <span className="text-red-600 text-sm">✗ Required</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  {form.sellPrice && parseFloat(form.sellPrice) > 0 ? (
                    <span className="text-green-600 text-sm">✓ Valid</span>
                  ) : (
                    <span className="text-red-600 text-sm">✗ Required</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock</span>
                  {form.adminStock && parseInt(form.adminStock) >= 0 ? (
                    <span className="text-green-600 text-sm">✓ Valid</span>
                  ) : (
                    <span className="text-red-600 text-sm">✗ Required</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  {form.category ? (
                    <span className="text-green-600 text-sm">✓ Selected</span>
                  ) : (
                    <span className="text-yellow-600 text-sm">⚠ Recommended</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}