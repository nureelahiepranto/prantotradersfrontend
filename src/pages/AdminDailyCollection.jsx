// // src/pages/AdminDailyCollection.jsx

// import React, { useEffect, useState } from "react";
// import api from "../api/axios";

// export default function AdminDailyCollection() {
//   const [date, setDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [collections, setCollections] = useState([]);
//   const [total, setTotal] = useState(0);

//   const loadData = async () => {
//     if (!date) return alert("Please select a date");

//     setLoading(true);
//     try {
//       const res = await api.get(`/dsr/daily-collection?date=${date}`);

//       setCollections(res.data.results || []);
//       setTotal(res.data.total || 0);
//     } catch (err) {
//       console.log(err);
//       alert("Failed to load data");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="p-6 container mx-auto">
//       <h2 className="text-2xl font-semibold mb-4">Daily Collection Report</h2>

//       {/* Filter */}
//       <div className="bg-white p-4 rounded shadow mb-4 flex items-center gap-4">
//         <input
//           type="date"
//           className="border p-2 rounded"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//         />

//         <button
//           onClick={loadData}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Show Report
//         </button>
//       </div>

//       {/* Table */}
//       <div className="bg-white p-4 rounded shadow overflow-x-auto">
//         <table className="min-w-full text-left">
//           <thead>
//             <tr className="bg-gray-100 border">
//               <th className="p-2 border">DSR Name</th>
//               <th className="p-2 border">Customer</th>
//               <th className="p-2 border">Collection Amount (৳)</th>
//               <th className="p-2 border">Time</th>
//             </tr>
//           </thead>

//           <tbody>
//             {collections.map((item, idx) => (
//               <tr key={idx}>
//                 <td className="p-2 border">{item.dsrName}</td>
//                 <td className="p-2 border">{item.customerName}</td>
//                 <td className="p-2 border text-green-600">{item.amount}</td>
//                 <td className="p-2 border text-gray-500">
//                   {new Date(item.time).toLocaleTimeString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Total */}
//         <div className="mt-4 text-lg font-semibold">
//           Total Collection: <span className="text-blue-700">{total} ৳</span>
//         </div>
//       </div>

//       {loading && <p className="text-center mt-4">Loading...</p>}
//     </div>
//   );
// }

// import React, { useState } from "react";
// import axios from "axios";

// const AdminDailyCollectionPage = () => {
//   const [date, setDate] = useState("");
//   const [report, setReport] = useState(null);

//   const fetchCollection = async () => {
//     const res = await axios.get(`/api/dsr-stock/daily-collection?date=${date}`);
//     setReport(res.data);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold">Daily Collection</h1>

//       <div className="mt-4 flex gap-3">
//         <input
//           type="date"
//           className="border p-2 rounded"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//         />

//         <button className="px-4 py-2 bg-blue-600 text-white rounded"
//           onClick={fetchCollection}>
//           Show
//         </button>
//       </div>

//       {report && (
//         <div className="mt-6 p-4 border bg-gray-100 rounded">
//           <h2 className="font-semibold">Date: {report.date}</h2>
//           <p>Total DSR: {report.totalDSR}</p>
//           <p>Total Collection: {report.totalCollection} Tk</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDailyCollectionPage;


import React, { useState } from "react";
import api from "../api/axios";

export default function AdminDailyCollection() {
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCollection = async () => {
    if (!date) return alert("Please select a date!");

    try {
      setLoading(true);
      const res = await api.get(`/dsr-stock/daily-collection?date=${date}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load daily collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 container mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Admin Daily Collection</h2>

      {/* Date Filter */}
      <div className="mb-6 flex items-center gap-4">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={loadCollection}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Stat Summary */}
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 shadow rounded">
              <h4 className="text-lg font-semibold">Date</h4>
              <p className="text-gray-700">{data.date}</p>
            </div>

            <div className="bg-green-100 p-4 shadow rounded">
              <h4 className="text-lg font-semibold">Total Collection</h4>
              <p className="text-2xl font-bold text-green-800">
                {data.totalCollection}৳
              </p>
            </div>

            <div className="bg-yellow-100 p-4 shadow rounded">
              <h4 className="text-lg font-semibold">Total DSR</h4>
              <p className="text-2xl font-bold text-yellow-700">
                {data.totalDSR}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white p-4 shadow rounded">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">DSR Name</th>
                  <th className="p-2 border">Total Sale Amount</th>
                  <th className="p-2 border">Issued</th>
                  <th className="p-2 border">Returned</th>
                  <th className="p-2 border">Sold</th>
                </tr>
              </thead>

              <tbody>
                {data.details.map((row) => (
                  <tr key={row._id} className="border">
                    <td className="p-2 border">
                      {row.dsrId?.name || "N/A"}
                    </td>

                    <td className="p-2 border font-semibold text-green-600">
                      {row.totalSaleAmount}৳
                    </td>

                    <td className="p-2 border">
                      {row.issuedProducts?.reduce((s, p) => s + p.qty, 0)}
                    </td>

                    <td className="p-2 border">
                      {row.returnedProducts?.reduce((s, p) => s + p.qty, 0)}
                    </td>

                    <td className="p-2 border">
                      {row.soldProducts?.reduce((s, p) => s + p.qty, 0)}
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
}
