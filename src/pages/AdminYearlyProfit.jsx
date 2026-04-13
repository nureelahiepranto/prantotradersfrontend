import { useEffect, useState } from "react";
import api from "../api/axios";
import ProfitCards from "../components/ProfitCards";

export default function AdminYearlyProfit() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/profit/yearly?year=${year}`).then((res) => {
      setData(res.data);
    });
  }, [year]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Yearly Profit Report</h2>

      <input
        type="number"
        className="border p-2 rounded mb-4"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      {data && (
        <>
          <ProfitCards data={data} />

          <table className="w-full border bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Month</th>
                <th className="border p-2">Sale</th>
                <th className="border p-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map((m, i) => (
                <tr key={i}>
                  <td className="border p-2">Month {m.month}</td>
                  <td className="border p-2">{m.sale}</td>
                  <td className="border p-2 text-green-600">{m.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
