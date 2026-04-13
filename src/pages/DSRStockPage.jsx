import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";

export default function DSRStockPage() {
  const { user } = useContext(AuthContext);

  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDSRStock = async () => {
  try {
    if (!user || !user._id) return;
    const res = await api.get(`/api/dsr-stock/${user._id}`);
    setStock(res.data);
  } catch (err) {
    console.log("Stock load error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (user?.role === "dsr") {
      fetchDSRStock();
    }
  }, [user]);

  if (loading)
    return (
      <div className="text-center mt-10 text-xl font-semibold animate-pulse">
        Loading DSR Stock...
      </div>
    );

  return (
    <div className="flex">
      <Sidebar role="dsr" />

      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">My Stock</h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-gray-500">Total Issued</h3>
            <p className="text-3xl font-bold">
              {stock.reduce((a, b) => a + b.issuedQty, 0)}
            </p>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-gray-500">Total Returned</h3>
            <p className="text-3xl font-bold text-red-500">
              {stock.reduce((a, b) => a + b.returnedQty, 0)}
            </p>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-gray-500">Total Sold</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stock.reduce((a, b) => a + (b.soldQty || 0), 0)}
            </p>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-gray-500">Available Stock</h3>
            <p className="text-3xl font-bold text-green-600">
              {stock.reduce((a, b) => a + b.availableQty, 0)}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Stock Details</h2>

          {stock.length === 0 ? (
            <p className="text-gray-500">No stock data found.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Issued</th>
                  <th className="p-2 border">Returned</th>
                  <th className="p-2 border">Sold</th>
                  <th className="p-2 border">Available</th>
                </tr>
              </thead>

              <tbody>
                {stock.map((item) => (
                  <tr key={item.productId}>
                    <td className="p-2 border">{item.productName}</td>
                    <td className="p-2 border">{item.issuedQty}</td>
                    <td className="p-2 border text-red-500">
                      {item.returnedQty}
                    </td>
                    <td className="p-2 border text-blue-600 font-medium">
                      {item.soldQty || 0}
                    </td>
                    <td className="p-2 border font-bold text-green-600">
                      {item.availableQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
