import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function DSRSalesList() {
  const [sales, setSales] = useState([]);

  const loadSales = async () => {
    const res = await api.get("/sales/dsr");
    setSales(res.data);
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <div className="flex">
      <Sidebar role="dsr" />

      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">My Sales</h1>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Product</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((s) => (
              <tr key={s._id} className="border">
                <td className="p-2">{s.product?.name}</td>
                <td className="p-2">{s.qty}</td>
                <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
