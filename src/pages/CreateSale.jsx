import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FiShoppingCart, 
  FiUser, 
  FiPackage, 
  FiPlus, 
  FiMinus, 
  FiTrash2,
  FiDollarSign,
  FiCreditCard,
  FiCheck,
  FiX,
  FiArrowLeft,
  FiSearch,
  FiPercent,
  FiCalendar
} from "react-icons/fi";
import { MdInventory } from "react-icons/md";

export default function CreateSale() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]); // { productId, qty, price }
  const [customerId, setCustomerId] = useState("");
  const [paid, setPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [dsrStock, setDsrStock] = useState({});
  
  // Load products + customers
  useEffect(() => {
  if (!user?.id) return;

  loadProducts();
  loadCustomers();
  loadDsrStock();
}, [user]);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products?page=1&limit=200");
      setProducts(res.data.products || res.data || []);
      console.log(res.data);
      
    } catch (err) {
      console.error("Load products:", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers?page=1&limit=500");
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error("Load customers:", err);
    }
  };

  const loadDsrStock = async () => {
  try {
    const res = await api.get(`/dsr-stock/${user.id}`);
    
    
    /*
      Expected backend response example:
      {
        stockDetails: [
          { productId, availableQty }
        ]
      }
    */

    const stockMap = {};
    res.data.stockDetails.forEach(item => {
      stockMap[item.productId] = item.availableQty;
    });

    setDsrStock(stockMap);

  } catch (err) {
    console.error("DSR stock load error:", err.response?.data);
  }
};

  // Filter products and customers
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p._id?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  // Add item to sale with validation
  const addItem = (product) => {
    // Check if already in cart
    const existingIndex = items.findIndex(item => item.productId === product._id);
    
    if (existingIndex >= 0) {
      // Increase quantity if already exists
      const newItems = [...items];
      newItems[existingIndex].qty += 1;
      setItems(newItems);
    } else {

      // Check stock availability
      const stockQty = dsrStock[product._id] || 0;
      if (stockQty  <= 0) {
        alert(`${product.name} is out of stock!`);
        return;
      }
      
      // Add new item
      setItems([...items, { 
        productId: product._id, 
        qty: 1,
        price: product.sellPrice || 0,
        productName: product.name,
        stock: dsrStock[product._id] || 0
      }]);
    }
  };

  const changeQty = (idx, qty) => {
    if (qty < 1) return;
    const stockQty = dsrStock[items[idx].productId] || 0;
    if (qty > stockQty) {
  alert(`Only ${stockQty} units available in stock`);
  return;
    }
    
    const updated = [...items];
    updated[idx].qty = Number(qty);
    setItems(updated);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Calculate totals
  const calculateItemTotal = (item) => {
    const product = products.find(p => p._id === item.productId);
    return (product?.sellPrice || item.price || 0) * (item.qty || 0);
  };

  const subTotal = items.reduce((total, item) => total + calculateItemTotal(item), 0);
  const discountAmount = (subTotal * discount) / 100;
  const grandTotal = subTotal - discountAmount;
  const dueAmount = Math.max(0, grandTotal - (Number(paid) || 0));

  // Submit sale
  const submit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to create a sale");
      return;
    }
    
    if (!items.length) {
      alert("Please add at least one product to the sale");
      return;
    }
    
    if (!customerId) {
      alert("Please select a customer");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        dsrId: user?._id || user?.id,
        customer: { id: customerId },
        items: items.map(it => ({
          productId: it.productId,
          qty: it.qty,
        })),
        paidAmount: Number(paid || 0),
        discount: discountAmount,
        paymentMethod,
        notes
      };

      console.log("Sale Payload:", payload);

      const res = await api.post("/sales", payload);

      alert("Sale recorded successfully!");
      
      const saleId = res.data.sale?._id;
      setItems([]);
      setCustomerId("");
      setPaid(0);
      setDiscount(0);
      setNotes("");

      if (saleId) {
        navigate(`/invoice/${saleId}`);
      } else {
        navigate("/dsr/sales");
      }

    } catch (err) {
      console.error("Sale Error:", err.response?.data);
      alert(err.response?.data?.message || "Sale failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCustomerName = (id) => {
    const customer = customers.find(c => c._id === id);
    return customer ? `${customer.name} (${customer.phone || 'No phone'})` : 'Select Customer';
  };

  const handleCancel = () => {
    if (items.length > 0 || customerId || paid > 0) {
      if (window.confirm("Are you sure? All unsaved changes will be lost.")) {
        navigate("/dsr/sales");
      }
    } else {
      navigate("/dsr/sales");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={handleCancel}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create New Sale</h1>
              <p className="text-gray-600 mt-1">Add products and complete the transaction</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  <p className="text-xl font-bold text-gray-800">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <FiUser className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customers</p>
                  <p className="text-xl font-bold text-gray-800">{customers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <FiShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items in Cart</p>
                  <p className="text-xl font-bold text-gray-800">{items.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-amber-50 rounded-lg mr-3">
                  <FiDollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sub Total</p>
                  <p className="text-xl font-bold text-gray-800">৳ {subTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Catalog */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FiPackage className="mr-2" size={20} />
                Product Catalog
              </h3>
              <p className="text-gray-600 text-sm mt-1">Click Add to include in sale</p>
            </div>

            {/* Product Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
              </div>
            </div>

            {/* Product List */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
  const availableStock = dsrStock[product._id] || 0;

  return (
    <div
      key={product._id}
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{product.name}</h4>

          <div className="flex items-center mt-2 space-x-3 text-sm">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
              ৳ {product.sellPrice?.toFixed(2) || "0.00"}
            </span>

            <span
              className={`px-2 py-1 rounded-lg font-medium ${
                availableStock > 10
                  ? "bg-green-50 text-green-700"
                  : availableStock > 0
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              Stock: {availableStock}
            </span>
          </div>
        </div>

        <button
          onClick={() => addItem(product)}
          disabled={availableStock <= 0}
          className="ml-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <FiPlus className="mr-1.5" size={14} />
          Add
        </button>
      </div>

      {product.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
      )}
    </div>
  );
})}
                </div>
              )}
            </div>
          </div>

          {/* Sale Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FiShoppingCart className="mr-2" size={20} />
                Sale Details
              </h3>
            </div>

            <form onSubmit={submit} className="p-6">
              {/* Customer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                  />
                </div>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Select a customer --</option>
                  {filteredCustomers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} - {c.phone || 'No phone'} {c.currentDue > 0 ? `(Due: ৳${c.currentDue})` : ''}
                    </option>
                  ))}
                </select>
                {customerId && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Selected: <span className="font-medium">{getCustomerName(customerId)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-700">Cart Items ({items.length})</h4>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setItems([])}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <FiTrash2 className="mr-1" size={14} />
                      Clear All
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No items in cart</p>
                    <p className="text-gray-400 text-sm mt-1">Add products from the catalog</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item, idx) => {
                      const product = products.find(p => p._id === item.productId) || {};
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800">{product.name || item.productName}</h5>
                              <div className="text-sm text-gray-600 mt-1">
                                Unit Price: ৳ {product.sellPrice?.toFixed(2) || item.price?.toFixed(2) || "0.00"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">
                                ৳ {calculateItemTotal(item).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Stock: {product.adminStock || item.stock || 0}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => changeQty(idx, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FiMinus size={14} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => changeQty(idx, e.target.value)}
                                className="w-16 h-8 text-center border-y border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => changeQty(idx, item.qty + 1)}
                                disabled={item.qty >= (dsrStock[item.productId] || item.stock || 0)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPercent className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={discount}
                        onChange={(e) => setDiscount(Math.min(100, Math.max(0, e.target.value)))}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    rows="2"
                    placeholder="Any special instructions or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid Amount (৳)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter paid amount"
                      value={paid}
                      onChange={(e) => setPaid(Math.min(grandTotal, Math.max(0, e.target.value)))}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Max: ৳ {grandTotal.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setPaid(grandTotal)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Pay Full Amount
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Sub Total</p>
                    <p className="text-lg font-semibold text-gray-800">৳ {subTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Discount</p>
                    <p className="text-lg font-semibold text-red-600">-৳ {discountAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="text-xl font-bold text-gray-800">৳ {grandTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Due Amount</p>
                    <p className={`text-xl font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ৳ {dueAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitting || items.length === 0 || !customerId}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing Sale...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" size={18} />
                      Complete Sale
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-8 rounded-xl transition-colors duration-200 flex items-center justify-center"
                >
                  <FiX className="mr-2" size={18} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}