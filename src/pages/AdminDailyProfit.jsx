import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminProfitPage() {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProfit = async () => {
    try {
      setLoading(true);

      let query = `/reports/profit-report?type=${type}`;

      if (type === "daily" && date) {
        query += `&date=${date}`;
      }

      if (type === "monthly" && month && year) {
        query += `&month=${month}&year=${year}`;
      }

      if (type === "yearly" && year) {
        query += `&year=${year}`;
      }

      const res = await api.get(query);
      setData(res.data);
    } catch (err) {
      console.error("Profit load error", err);
      alert("Profit load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfit();
  }, [type, date, month, year]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        📊 Admin Profit Report
      </h1>

      {/* 🔘 Type Filter */}
      <div className="flex gap-3 mb-4">
        {["daily", "monthly", "yearly"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded font-semibold ${
              type === t
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 📅 Date / Month / Year Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        {type === "daily" && (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
        )}

        {type === "monthly" && (
          <>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Month</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("en", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-2 rounded w-28"
              placeholder="Year"
            />
          </>
        )}

        {type === "yearly" && (
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded w-28"
            placeholder="Year"
          />
        )}
      </div>

      {loading && <p className="text-gray-500">Loading profit data...</p>}

      {data && (
        <>
          {/* 📊 Summary */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card title="Total Sales" value={data.totalSales} />
            <Card title="Gross Profit" value={data.grossProfit} />
            <Card title="Admin Expense" value={data.totalExpense} negative />
            <Card title="Net Profit" value={data.netProfit} highlight />
          </div>

          {/* ❌ Damaged Loss */}
          <div className="bg-red-50 border p-4 rounded">
            <h3 className="font-semibold text-red-700 mb-3">
              ❌ Damaged Loss: ৳ {data.returnLoss}
            </h3>

            {data.damagedItems?.length ? (
              <table className="w-full text-sm border">
                <thead className="bg-red-100">
                  <tr>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {data.damagedItems.map((d, i) => (
                    <tr key={i}>
                      <td className="border p-2">{d.product}</td>
                      <td className="border p-2 text-center">{d.qty}</td>
                      <td className="border p-2 text-right text-red-600">
                        ৳ {d.loss}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-600">
                No damaged products
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* 🔹 Card */
function Card({ title, value = 0, negative, highlight }) {
  let color = "text-gray-800";
  if (negative) color = "text-red-600";
  if (highlight) color = value >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-2xl font-bold ${color}`}>
        ৳ {value}
      </h2>
    </div>
  );
}
