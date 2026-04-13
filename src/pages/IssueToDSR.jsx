import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function IssueToDSR() {
  const [products, setProducts] = useState([]);
  const [dsrs, setDsrs] = useState([]);
  const [selected, setSelected] = useState({ dsrId: '', items: [] });
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 12 });
  const [loading, setLoading] = useState({ products: true, dsrs: true });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts(1);
    loadDsrs();
  }, []);

  const loadProducts = async (page = 1) => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const res = await api.get(`/products?page=${page}&limit=${meta.limit}`);
      setProducts(res.data.products || []);
      setMeta(res.data);
      
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    }
    setLoading(prev => ({ ...prev, products: false }));
  };

  const loadDsrs = async () => {
    setLoading(prev => ({ ...prev, dsrs: true }));
    try {
      const res = await api.get('/auth/dsrs');
      const cleaned = res.data.map(d => ({
        _id: d._id || d.id,
        name: d.name
      }));
      setDsrs(cleaned);
    } catch (err) {
      console.error('Error loading DSRs:', err);
      setError('Failed to load DSRs');
    }
    setLoading(prev => ({ ...prev, dsrs: false }));
  };

  const addItem = (product) => {
    // Check if product already exists in cart
    const existingIndex = selected.items.findIndex(item => item.productId === product._id);
    
    if (existingIndex >= 0) {
      // Increase quantity if already exists
      const newItems = [...selected.items];
      newItems[existingIndex].qty += 1;
      setSelected({ ...selected, items: newItems });
    } else {
      // Add new item
      setSelected(prev => ({
        ...prev,
        items: [...prev.items, { productId: product._id, qty: 1, productName: product.name }]
      }));
    }
  };

  const changeQty = (index, qty) => {
    if (qty < 1) return;
    const newItems = [...selected.items];
    newItems[index].qty = Number(qty);
    setSelected({ ...selected, items: newItems });
  };

  const removeItem = (idx) => {
    setSelected(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const clearAllItems = () => {
    setSelected(prev => ({ ...prev, items: [] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');

    if (!selected.dsrId) {
      setError('Please select a DSR first!');
      setSubmitting(false);
      return;
    }
    
    if (!selected.items.length) {
      setError('Please add at least one product!');
      setSubmitting(false);
      return;
    }

    // Validate stock availability
    for (const item of selected.items) {
      const product = products.find(p => p._id === item.productId);
      if (product && item.qty > product.adminStock) {
        setError(`Insufficient stock for ${product.name}. Available: ${product.adminStock}`);
        setSubmitting(false);
        return;
      }
    }

    const body = {
      dsrId: selected.dsrId,
      items: selected.items.map(i => ({
        productId: i.productId,
        qty: i.qty
      }))
    };

    try {
      await api.post("/dsrissue/issue", body);
      setSuccess(true);
      setSelected({ dsrId: "", items: [] });
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh products
      loadProducts(meta.page);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to issue products";
      setError(errorMsg);
      console.log("ISSUE ERROR:", err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalItems = () => {
    return selected.items.reduce((total, item) => total + item.qty, 0);
  };

  const calculateTotalValue = () => {
  return selected.items.reduce((total, item) => {
    const product = products.find(p => p._id === item.productId);
    return total + (product?.sellPrice || 0) * item.qty;
  }, 0);
};


  const getProductDetails = (productId) => {
    return products.find(p => p._id === productId) || {};
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Issue Products to DSR</h1>
          <p className="text-gray-600">Assign products to Delivery Sales Representatives</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Products issued successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Products Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Available Products</h2>
                  <p className="text-gray-600 text-sm mt-1">Click Add to include in issue list</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  Page {meta.page} of {meta.pages}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {loading.products ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  <h3 className="font-medium text-gray-700 mb-1">No Products Available</h3>
                  <p className="text-gray-500 text-sm">Add some products first</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                    {products.map(product => (
                      <div key={product._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 ">{product.name}</h4>
                            <p className="text-red-400">{product.sku}</p>
                            <div className="flex items-center mt-2 space-x-4 text-sm">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                                Stock: {product.adminStock}
                              </span>
                              {product.sellPrice && (
                                <span className="text-green-600 font-medium">
                                  ৳{product.sellPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => addItem(product)}
                            disabled={product.adminStock <= 0}
                            className="ml-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add
                          </button>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="mt-6">
                    <Pagination page={meta.page} pages={meta.pages} onChange={loadProducts} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Issue Form Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Issue Form</h2>
              <p className="text-gray-600 text-sm mt-1">Select DSR and set quantities</p>
            </div>

            <div className="p-4 md:p-6">
              <form onSubmit={submit} className="space-y-6">
                {/* DSR Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select DSR <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      value={selected.dsrId}
                      onChange={(e) => setSelected({ ...selected, dsrId: e.target.value })}
                      required
                    >
                      <option value="">Select a DSR</option>
                      {loading.dsrs ? (
                        <option value="" disabled>Loading DSRs...</option>
                      ) : dsrs.map(dsr => (
                        <option key={dsr._id} value={dsr._id}>
                          {dsr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700">Selected Products</h3>
                    {selected.items.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllItems}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Clear All
                      </button>
                    )}
                  </div>

                  {selected.items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <p className="text-gray-500">No products selected</p>
                      <p className="text-gray-400 text-sm mt-1">Add products from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {selected.items.map((item, idx) => {
                        const product = getProductDetails(item.productId);
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">
                                {product.name || item.productName}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Available: {product.adminStock || 0} units
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 ml-4">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => changeQty(idx, item.qty - 1)}
                                  disabled={item.qty <= 1}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.adminStock || 999}
                                  value={item.qty}
                                  onChange={(e) => changeQty(idx, e.target.value)}
                                  className="w-16 h-8 text-center border-y border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => changeQty(idx, item.qty + 1)}
                                  disabled={item.qty >= (product.adminStock || 999)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {selected.items.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">Total Items</p>
                        <p className="text-xl font-bold text-blue-800">{calculateTotalItems()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Total Value</p>
                        <p className="text-xl font-bold text-blue-800">৳{calculateTotalValue().toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !selected.dsrId || selected.items.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      Issue Products Now
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="font-medium text-gray-800">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available DSRs</p>
                <p className="font-medium text-gray-800">{dsrs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Selected Items</p>
                <p className="font-medium text-gray-800">{selected.items.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}