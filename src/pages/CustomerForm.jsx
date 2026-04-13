// // src/pages/CustomerForm.jsx
// import React, { useEffect, useState } from "react";
// import api from "../api/axios";
// import { useNavigate, useParams } from "react-router-dom";

// export default function CustomerForm() {
//   const { id } = useParams(); // "new" or id
//   const isNew = id === "new" || !id;
//   const navigate = useNavigate();

//   const [data, setData] = useState({ name: "", phone: "", address: "", currentDue: 0 });
//   const [loading, setLoading] = useState(!isNew);

//   useEffect(() => {
//     if (!isNew) load();
//   }, [id]);

//   const load = async () => {
//     try {
//       const res = await api.get(`/customers/${id}`);
//       setData({
//         name: res.data.name || "",
//         phone: res.data.phone || "",
//         address: res.data.address || "",
//         currentDue: res.data.currentDue || 0
//       });
//     } catch (err) {
//       console.error("Load customer:", err);
//       alert("Failed to load");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!data.name) return alert("Name required");
//       if (isNew) {
//         await api.post("/customers", data);
//         alert("Customer created");
//       } else {
//         await api.put(`/customers/${id}`, data);
//         alert("Customer updated");
//       }
//       navigate("/customers");
//     } catch (err) {
//       console.error("Save customer:", err);
//       alert(err.response?.data?.message || "Save failed");
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">{isNew ? "Add Customer" : "Edit Customer"}</h2>
//       <form onSubmit={submit} className="space-y-3 max-w-xl">
//         <input className="w-full p-2 border rounded" placeholder="Name" value={data.name} onChange={e=>setData({...data,name:e.target.value})} required />
//         <input className="w-full p-2 border rounded" placeholder="Phone" value={data.phone} onChange={e=>setData({...data,phone:e.target.value})} />
//         <input className="w-full p-2 border rounded" placeholder="Address" value={data.address} onChange={e=>setData({...data,address:e.target.value})} />
//         <input className="w-full p-2 border rounded" placeholder="Current Due" type="number" value={data.currentDue} onChange={e=>setData({...data,currentDue:Number(e.target.value)})} />
//         <div className="flex gap-2">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded">{isNew? "Create":"Update"}</button>
//           <button type="button" className="px-4 py-2 border rounded" onClick={()=>navigate("/customers")}>Cancel</button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiDollarSign,
  FiSave,
  FiX,
  FiArrowLeft,
  FiInfo
} from "react-icons/fi";
import { MdPersonAddAlt1 } from "react-icons/md";

export default function CustomerForm() {
  const { id } = useParams(); // "new" or id
  const isNew = id === "new" || !id;
  const navigate = useNavigate();

  const [data, setData] = useState({ 
    name: "", 
    phone: "", 
    address: "", 
    currentDue: 0 
  });
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isNew) load();
  }, [id]);

  const load = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setData({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        currentDue: res.data.currentDue || 0
      });
    } catch (err) {
      console.error("Load customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!data.name.trim()) {
      newErrors.name = "Customer name is required";
    } else if (data.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (data.phone && !/^[0-9+ -]{10,15}$/.test(data.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (data.currentDue < 0) {
      newErrors.currentDue = "Due amount cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isNew) {
        await api.post("/customers", data);
      } else {
        await api.put(`/customers/${id}`, data);
      }
      
      navigate("/customers");
    } catch (err) {
      console.error("Save customer:", err);
      const errorMsg = err.response?.data?.message || 
                      (isNew ? "Failed to create customer" : "Failed to update customer");
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (JSON.stringify(data) !== JSON.stringify({ name: "", phone: "", address: "", currentDue: 0 })) {
      if (window.confirm("Are you sure? Any unsaved changes will be lost.")) {
        navigate("/customers");
      }
    } else {
      navigate("/customers");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {isNew ? "Add New Customer" : "Edit Customer"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isNew ? "Fill in the details to add a new customer" : "Update customer information"}
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-blue-700">
                  {isNew 
                    ? "Add customers to track their purchases and manage due payments efficiently."
                    : "Update customer information to keep records accurate and up-to-date."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            <form onSubmit={submit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer full name"
                    value={data.name}
                    onChange={e => setData({...data, name: e.target.value})}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number (optional)"
                    value={data.phone}
                    onChange={e => setData({...data, phone: e.target.value})}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Format: 017XXXXXXXX or +88017XXXXXXXX</p>
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter customer address (optional)"
                    value={data.address}
                    onChange={e => setData({...data, address: e.target.value})}
                  />
                </div>
              </div>

              {/* Current Due Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Due Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.currentDue ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter initial due amount"
                    value={data.currentDue}
                    onChange={e => setData({...data, currentDue: parseFloat(e.target.value) || 0})}
                  />
                </div>
                {errors.currentDue && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentDue}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Set initial due amount if customer already owes money. Leave as 0 if no due.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {isNew ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" size={18} />
                      {isNew ? "Create Customer" : "Update Customer"}
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

          {/* Form Footer */}
          <div className="bg-gray-50 px-6 md:px-8 lg:px-10 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
              <div className="flex items-center mb-2 sm:mb-0">
                <span className="text-red-500 mr-1">*</span>
                <span>Indicates required field</span>
              </div>
              <div className="text-xs">
                {isNew ? (
                  <span>New customer ID will be generated upon creation</span>
                ) : (
                  <span>Customer ID: <span className="font-mono text-gray-700">{id}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium text-gray-800">Required field</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <FiPhone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-800">Optional but recommended</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-50 rounded-lg mr-3">
                <FiDollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Amount</p>
                <p className="font-medium text-gray-800">Set initial balance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
