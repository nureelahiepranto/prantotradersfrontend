import React from 'react'

const DSRCreateCollection = () => {
  return (
    <div>DSRCreateCollection</div>
  )
}

export default DSRCreateCollection
// // src/dsr/DSRCreateCollection.jsx
// import React, { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";

// export default function DSRCreateCollection() {
//   const { user } = useContext(AuthContext);

//   const [customers, setCustomers] = useState([]);
//   const [customerId, setCustomerId] = useState("");
//   const [amount, setAmount] = useState("");
//   const [method, setMethod] = useState("cash");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     loadCustomers();
//   }, []);

//   const loadCustomers = async () => {
//     try {
//       const res = await api.get(`/customers?dsrId=${user.id}`);
//       setCustomers(res.data.customers || []);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load customers");
//     }
//   };

//   const submit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       await api.post("/collections", {
//         customerId,
//         amount,
//         method,
//         dsrId: user.id
//       });

//       alert("Collection added!");
//       setCustomerId("");
//       setAmount("");

//     } catch (err) {
//       console.error(err);
//       alert("Failed to add collection");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 container-max mx-auto max-w-lg">
//       <h2 className="text-2xl font-semibold mb-4">Add Collection</h2>

//       <form onSubmit={submit} className="space-y-4 bg-white p-5 rounded shadow">

//         <select
//           value={customerId}
//           onChange={(e) => setCustomerId(e.target.value)}
//           className="w-full p-2 border rounded"
//           required
//         >
//           <option value="">Select Customer</option>
//           {customers.map((c) => (
//             <option key={c._id} value={c._id}>
//               {c.name} ({c.phone})
//             </option>
//           ))}
//         </select>

//         <input
//           type="number"
//           className="w-full p-2 border rounded"
//           placeholder="Amount"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           required
//         />

//         <select
//           value={method}
//           onChange={(e) => setMethod(e.target.value)}
//           className="w-full p-2 border rounded"
//         >
//           <option value="cash">Cash</option>
//           <option value="bkash">bKash</option>
//           <option value="bank">Bank</option>
//         </select>

//         <button
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 rounded"
//         >
//           {loading ? "Saving..." : "Save"}
//         </button>
//       </form>
//     </div>
//   );
// }
