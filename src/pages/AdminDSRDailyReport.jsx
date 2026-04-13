// src/pages/AdminDSRDailyReport.jsx

import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDSRDailyReport() {
  const [date, setDate] = useState("");
  const [dsrList, setDsrList] = useState([]);
  const [report, setReport] = useState([]);

  const loadDsrs = async () => {
    try {
      const res = await api.get("/auth/dsrs");
      setDsrList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

const loadReport = async () => {
  if (!date) return alert("Select date");

  try {
    const res = await api.get(`/reports/dsr-daily?date=${date}`);
    setReport(res.data || []);
  } catch (err) {
    console.error(err);
    alert("Failed to load report");
  }
};

  useEffect(() => {
    loadDsrs();
  }, []);

  return (
    <div className="p-6 container mx-auto">
      <h2 className="text-2xl font-semibold mb-4">DSR Daily Report</h2>

      {/* Filter */}
      <div className="bg-white p-4 rounded shadow mb-4 flex items-center gap-4">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={loadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Show Report
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100 border">
              <th className="p-2 border">DSR Name</th>
              <th className="p-2 border">Issued Value (৳)</th>
              <th className="p-2 border">Day Sale (৳)</th>
              <th className="p-2 border">Collection (৳)</th>
              <th className="p-2 border">Return Products (৳)</th>
              <th className="p-2 border">Expenses (৳)</th>
              <th className="p-2 border">Profit (৳)</th>
            </tr>
          </thead>

          <tbody>
            {report.map((r, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{r.dsrName}</td>
                <td className="p-2 border text-blue-600">{r.totalIssueValue}</td>
                <td className="p-2 border text-green-600">{r.totalSale}</td>
                <td className="p-2 border">{r.totalCollection}</td>
                <td className="p-2 border">{r.returnAmount}</td>
                <td className="p-2 border text-red-600">{r.expenses}</td>

                <td className="p-2 border font-semibold">
                  {r.totalCollection - r.expenses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
