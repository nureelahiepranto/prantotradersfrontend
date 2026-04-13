import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Pagination from '../components/Pagination';
import { Link } from "react-router-dom";
import { 
  FaBox, FaEdit, FaTrash, FaTag, FaWarehouse, 
  FaPlus, FaSearch, FaFilter, FaSortAmountDown,
  FaEye, FaChartLine, FaDownload
} from 'react-icons/fa';
import { FiPackage, FiTrendingUp, FiFilter } from 'react-icons/fi';

const getSellPrice = (p) => Number(p.sellPrice ?? p.price ?? 0);
const getBuyPrice = (p) => Number(p.purchasePrice ?? p.buyPrice ?? 0);

const stockPercent = (stock) => {
  if (!stock || stock <= 0) return 0;
  return Math.min((stock / 100) * 100, 100);
};

function ProductCard({ p }) {
  const sellPrice = getSellPrice(p);
  const buyPrice = getBuyPrice(p);
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{p.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              SKU: {p.sku || 'N/A'}
            </span>
            {p.category && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {p.category}
              </span>
            )}
            {p.brand && <span className="bg-purple-50 text-purple-600 px-2 rounded">{p.brand}</span>}
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
          p.adminStock > 50 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : p.adminStock > 20 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {p.adminStock} in stock
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold text-gray-800">৳{sellPrice.toFixed(2)}</div>
          {p.purchasePrice && (
            <div className="text-sm text-gray-500">Cost: ৳{buyPrice.toFixed(2)}</div>
          )}
        </div>
        
        {/* Stock Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Stock Level</span>
            <span>{Math.min(p.adminStock, 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                p.adminStock > 50 ? 'bg-green-500' : 
                p.adminStock > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
                          style={{ width: `${stockPercent(p.adminStock)}%` }}

            ></div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
        <Link 
          to={`/admin/products/edit/${p._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FaEdit size={10} />
          Edit
        </Link>
        <Link 
          to={`/admin/products/update-price/${p._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <FaTag size={10} />
          Price
        </Link>
        <Link 
          to={`/admin/products/update-stock/${p._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <FaWarehouse size={10} />
          Stock
        </Link>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    load(1);
  }, [filter, sortBy]);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      
      let url = `/products?page=${page}&limit=${meta.limit}&sort=${sortBy}`;
      if (filter === 'low') url += '&stock=low';
      if (filter === 'out') url += '&stock=out';
      if (searchTerm) url += `&search=${searchTerm}`;
      
      const res = await API.get(url);
      setProducts(res.data.products || []);
      setMeta(res.data);
      setSelectedProducts([]);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await API.delete(`/products/${id}`);
      alert("Product deleted successfully!");
      load(meta.page);
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const bulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select products to delete");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) return;
    
    try {
      await Promise.all(selectedProducts.map(id => API.delete(`/products/${id}`)));
      alert(`${selectedProducts.length} product(s) deleted successfully!`);
      load(meta.page);
    } catch (err) {
      console.error(err);
      alert("Failed to delete products");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory and pricing</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/products/add"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaPlus size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700">
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none"
              >
                <option value="all">All Products</option>
                <option value="low">Low Stock (&lt;20)</option>
                <option value="out">Out of Stock</option>
                <option value="active">Active Only</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none"
              >
                <option value="name">Sort by Name</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
              </select>
              <FaSortAmountDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-800">{meta.total || 0}</h3>
              </div>
              <FiPackage size={24} className="text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.adminStock > 20).length}
                </h3>
              </div>
              <FaBox size={24} className="text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.adminStock <= 20 && p.adminStock > 0).length}
                </h3>
              </div>
              <FaWarehouse size={24} className="text-amber-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.adminStock === 0).length}
                </h3>
              </div>
              <FaBox size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FiPackage size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {selectedProducts.length} product(s) selected
                </p>
                <p className="text-sm text-gray-600">Perform bulk actions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={bulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash size={14} />
                Delete Selected
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <FaDownload size={14} />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Card Grid */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {products.map(p => (
              <div key={p._id}>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p._id)}
                    onChange={() => handleSelectProduct(p._id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <ProductCard p={p} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Product</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">SKU</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Brand</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Price</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(p._id)}
                        onChange={() => handleSelectProduct(p._id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                          <FaBox size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {p.description?.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {p.sku || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{p.category || '-'}</span>
                    </td>

                    <td className="p-4">
                      <span className="text-sm text-gray-600">{p.brand || '-'}</span>
                    </td>
                    
                    <td className="p-4">
                        <div>
                          <div className="font-bold text-gray-800">
                            ৳{getSellPrice(p).toFixed(2)}
                          </div>
                          {getBuyPrice(p) > 0 && (
                            <div className="text-xs text-gray-500">
                              Cost: ৳{getBuyPrice(p).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>

                     

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{p.adminStock}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              p.adminStock > 50 ? 'bg-green-500' : 
                              p.adminStock > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(p.adminStock, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.adminStock > 50 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : p.adminStock > 20 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {p.adminStock > 50 ? 'In Stock' : p.adminStock > 20 ? 'Low' : 'Critical'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/admin/products/edit/${p._id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <FaEdit size={12} />
                          Edit
                        </Link>
                        <Link 
                          to={`/admin/products/update-price/${p._id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                        >
                          <FaTag size={12} />
                          Price
                        </Link>
                        <Link 
                          to={`/admin/products/update-stock/${p._id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm"
                        >
                          <FaWarehouse size={12} />
                          Stock
                        </Link>
                        <button 
                          onClick={() => deleteProduct(p._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
            <div className="text-sm text-gray-600">
              Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} products
            </div>
            <Pagination page={meta.page} pages={meta.pages} onChange={load} />
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBox size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
          <Link 
            to="/admin/products/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <FaPlus size={16} />
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}