import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function DSRCollections() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/payments/dsr").then((res) => setPayments(res.data));
  }, []);

  return (
    <div className="flex">
      <Sidebar role="dsr" />

      <div className="p-6 w-full">
        <h2 className="text-2xl font-bold mb-4">My Collections</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Invoice</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => (
              <tr key={pay._id} className="border">
                <td className="p-2">{pay.invoiceNo}</td>
                <td className="p-2">{pay.amount}</td>
                <td className="p-2">{new Date(pay.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
