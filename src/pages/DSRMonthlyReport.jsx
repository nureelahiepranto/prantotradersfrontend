import { useEffect, useState } from "react";
import axios from "../api/axios.js";

const DSRMonthlyReport = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/reports/dsr-monthly?year=${year}&month=${month}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const totalSale = data.reduce((a, b) => a + b.totalSale, 0);
  const totalCollection = data.reduce((a, b) => a + b.totalCollection, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 Monthly DSR Report</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Month {i + 1}
            </option>
          ))}
        </select>

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Load
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-100 p-4 rounded">
          <h3>Total Sale</h3>
          <p className="font-bold text-xl">৳ {totalSale}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h3>Total Collection</h3>
          <p className="font-bold text-xl">৳ {totalCollection}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">DSR Name</th>
              <th className="border p-2">Total Sale</th>
              <th className="border p-2">Collection</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.dsrId}>
                <td className="border p-2">{d.dsrName}</td>
                <td className="border p-2">৳ {d.totalSale}</td>
                <td className="border p-2">৳ {d.totalCollection}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DSRMonthlyReport;
