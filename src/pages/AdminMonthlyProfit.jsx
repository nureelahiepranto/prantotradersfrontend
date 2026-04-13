import { useEffect, useState } from "react";
import api from "../api/axios";
import ProfitCards from "../components/ProfitCards";

export default function AdminMonthlyProfit() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!month) return;
    api
      .get(`/profit/monthly?year=${year}&month=${month}`)
      .then((res) => setData(res.data));
  }, [month, year]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Monthly Profit Report</h2>

      <div className="flex gap-3 mb-4">
        <select
          className="border p-2 rounded"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              Month {i + 1}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 rounded"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      {data && (
        <>
          <ProfitCards data={data} />

          <table className="w-full border bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Sale</th>
                <th className="border p-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map((d, i) => (
                <tr key={i}>
                  <td className="border p-2">{d.date}</td>
                  <td className="border p-2">{d.sale}</td>
                  <td className="border p-2 text-green-600">{d.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
