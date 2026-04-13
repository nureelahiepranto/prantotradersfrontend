// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function PaymentForm() {
//   const { user } = useAuth();
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [customers, setCustomers] = useState([]);
//   const [form, setForm] = useState({
//     customerId: "",
//     amount: "",
//     note: "",
//   });

//   // Fetch Customers
//   useEffect(() => {
//     api
//       .get("/customers")
//       .then((res) => {
//         console.log("CUSTOMER API RESPONSE:", res.data);

//         // Normalize response
//         if (Array.isArray(res.data.customers)) {
//           setCustomers(res.data.customers);
//         } else if (Array.isArray(res.data)) {
//           setCustomers(res.data);
//         } else {
//           setCustomers([]);
//         }
//       })
//       .catch((err) => console.log(err));
//   }, []);

//   // Handle Change
//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Submit Payment
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const dsrIdFixed = user?._id || user?.id;

//     const payload = {
//       dsrId: dsrIdFixed,
//       customerId: form.customerId,
//       amount: Number(form.amount),
//       note: form.note,
//     };

//     console.log("FINAL PAYMENT BODY:", payload);

//     if (!dsrIdFixed) {
//       setMessage("DSR ID missing! Please check login.");
//       return;
//     }

//     try {
//       await api.post("/payments", payload);

//       setMessage({
//     text: "Payment saved successfully!",
//     type: "success",
//   });

//       setForm({
//         customerId: "",
//         amount: "",
//         note: "",
//       });

//       setTimeout(() => {
//     setMessage({ text: "", type: "" });
//   }, 3000);
//     } catch (err) {
//       console.log(err);
//       setMessage({
//     text: "Error saving payment. Please try again.",
//     type: "error",
//   });
//     }
//     setTimeout(() => {
//     setMessage({ text: "", type: "" });
//   }, 3000);
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Add Payment</h2>

//       {message.text && (
//   <p
//     className={`mb-3 text-center font-semibold ${
//       message.type === "success" ? "text-green-600" : "text-red-600"
//     }`}
//   >
//     {message.text}
//   </p>
// )}


//       <form onSubmit={handleSubmit}>
//         {/* Customer Selection */}
//         <label className="block mb-2 font-semibold">Select Customer</label>
//         <select
//           name="customerId"
//           value={form.customerId}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           required
//         >
//           <option value="">Choose Customer</option>
//           {customers.map((c) => (
//             <option key={c._id} value={c._id}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         {/* Amount */}
//         <label className="block mb-2 font-semibold">Amount</label>
//         <input
//           type="number"
//           name="amount"
//           value={form.amount}
//           onChange={handleChange}
//           placeholder="Enter amount"
//           className="w-full p-2 border rounded mb-4"
//           required
//         />

//         {/* Note */}
//         <label className="block mb-2 font-semibold">Note (optional)</label>
//         <textarea
//           name="note"
//           value={form.note}
//           onChange={handleChange}
//           placeholder="Write a note..."
//           className="w-full p-2 border rounded mb-4"
//         />

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//         >
//           Save Payment
//         </button>
//       </form>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  FaCreditCard, 
  FaUserCircle, 
  FaDollarSign, 
  FaStickyNote, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaSpinner,
  FaUsers
} from "react-icons/fa";

export default function PaymentForm() {
  const { user } = useAuth();
  const [message, setMessage] = useState({ text: "", type: "" });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({
    customerId: "",
    amount: "",
    note: "",
  });

  // Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/customers");
        console.log("CUSTOMER API RESPONSE:", res.data);

        // Normalize response
        if (Array.isArray(res.data.customers)) {
          setCustomers(res.data.customers);
        } else if (Array.isArray(res.data)) {
          setCustomers(res.data);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setMessage({
          text: "Failed to load customers. Please try again.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Update selected customer when customerId changes
  useEffect(() => {
    if (form.customerId) {
      const customer = customers.find(c => c._id === form.customerId);
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
  }, [form.customerId, customers]);

  // Handle Change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dsrIdFixed = user?._id || user?.id;

    if (!dsrIdFixed) {
      setMessage({
        text: "User session error. Please log in again.",
        type: "error"
      });
      return;
    }

    if (!form.customerId) {
      setMessage({
        text: "Please select a customer",
        type: "error"
      });
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setMessage({
        text: "Please enter a valid amount",
        type: "error"
      });
      return;
    }

    const payload = {
      dsrId: dsrIdFixed,
      customerId: form.customerId,
      amount: Number(form.amount),
      note: form.note.trim(),
    };

    console.log("FINAL PAYMENT BODY:", payload);

    setSubmitting(true);
    try {
      await api.post("/payments", payload);

      setMessage({
        text: "Payment saved successfully!",
        type: "success",
      });

      // Reset form
      setForm({
        customerId: "",
        amount: "",
        note: "",
      });
      setSelectedCustomer(null);

    } catch (err) {
      console.error("Payment submission error:", err);
      const errorMsg = err.response?.data?.error || "Error saving payment. Please try again.";
      setMessage({
        text: errorMsg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg mb-4">
            <FaCreditCard className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Record Payment
          </h1>
          <p className="text-gray-600">
            Record customer payments quickly and efficiently
          </p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Section */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Customer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaUsers className="mr-2 text-blue-500" />
                  Select Customer
                </label>
                <div className="relative">
                  {loading ? (
                    <div className="flex items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-xl">
                      <FaSpinner className="animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-600">Loading customers...</span>
                    </div>
                  ) : (
                    <>
                      <select
                        name="customerId"
                        value={form.customerId}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer bg-white"
                        required
                        disabled={customers.length === 0}
                      >
                        <option value="" className="text-gray-400">
                          {customers.length === 0 ? "No customers available" : "Choose a customer..."}
                        </option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id} className="py-2">
                            {c.name} {c.phone ? `(${c.phone})` : ''}
                          </option>
                        ))}
                      </select>
                      <FaUserCircle className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none" />
                      <div className="absolute right-3 top-3.5 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Customer Info Card */}
                {selectedCustomer && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FaUserCircle className="text-blue-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{selectedCustomer.name}</h4>
                        {selectedCustomer.phone && (
                          <p className="text-gray-600 text-sm mt-1">
                            📞 {selectedCustomer.phone}
                          </p>
                        )}
                        {selectedCustomer.currentDue !== undefined && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">Current Due: </span>
                            <span className={`font-bold ${
                              selectedCustomer.currentDue > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatCurrency(selectedCustomer.currentDue || 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaDollarSign className="mr-2 text-green-500" />
                  Payment Amount
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-500 font-medium">
                    ৳
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    min="0"
                    step="0.01"
                    disabled={!form.customerId}
                  />
                </div>
                {form.amount && (
                  <p className="text-sm text-gray-600 mt-2">
                    Amount in words: {Number(form.amount).toLocaleString()} Taka only
                  </p>
                )}
              </div>

              {/* Note Input */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaStickyNote className="mr-2 text-yellow-500" />
                  Payment Note (Optional)
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Enter payment details, reference number, or any notes..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                  disabled={!form.customerId}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Add any reference numbers or important details about this payment
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !form.customerId || !form.amount || customers.length === 0}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${
                  submitting || !form.customerId || !form.amount || customers.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-3" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="mr-3" />
                    Record Payment
                  </>
                )}
              </button>

              {/* Form Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Select a customer first to enable amount input</li>
                  <li>• Include reference numbers in notes for easy tracking</li>
                  <li>• Payment will be deducted from customer's due amount</li>
                  <li>• Review amount carefully before submission</li>
                </ul>
              </div>
            </form>
          </div>

          {/* Stats Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {customers.length}
                </div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {customers.filter(c => (c.currentDue || 0) > 0).length}
                </div>
                <div className="text-sm text-gray-600">With Due Amount</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FaUserCircle className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <FaDollarSign className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FaCreditCard className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-semibold text-gray-800">Ready to Record</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}