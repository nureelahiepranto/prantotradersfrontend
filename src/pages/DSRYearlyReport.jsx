import { useEffect, useState } from "react";
import axios from "../api/axios.js";

const DSRYearlyReport = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`/reports/dsr-yearly?year=${year}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📆 Yearly DSR Report</h1>

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

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Load
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">DSR Name</th>
            <th className="border p-2">Total Sale</th>
            <th className="border p-2">Total Collection</th>
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
    </div>
  );
};

export default DSRYearlyReport;
