import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const DSRStockSummaryPage = () => {
  const { user } = useContext(AuthContext);
  const dsrId = user?.id;

  const today = new Date().toISOString().split("T")[0];

  // 👉 selectedDate empty রাখবো
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dsrId) return;

    const fetchStock = async () => {
      setLoading(true);
      try {
        // 👉 যদি date না থাকে → Today
        const dateParam = selectedDate || today;

        const res = await api.get(
          `/dsr-stock/${dsrId}?date=${dateParam}`
        );
console.log("DSR STOCK RESPONSE 👉", res.data);
        setData(res.data);
      } catch (err) {
        console.error("❌ Stock fetch error", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [dsrId, selectedDate]);

  if (!user) {
    return <div className="p-6">Loading user...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">DSR Stock Summary</h2>
          <p className="text-sm text-gray-500">
            {selectedDate
              ? `Showing data for ${selectedDate}`
              : "Showing today's stock summary"}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          {/* RESET BUTTON */}
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* ---------- LOADING ---------- */}
      {loading && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          Loading stock data...
        </div>
      )}

      {/* ---------- EMPTY ---------- */}
      {!loading && data && (!data.stockDetails || data.stockDetails.length === 0) && (
  <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
    No stock data found
  </div>
)}

      {/* ---------- SUMMARY ---------- */}
      {!loading && data && data.stockDetails.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard title="Issued" value={data.totalIssued} color="blue" />
            <SummaryCard title="Sold" value={data.totalSold} color="green" />
            <SummaryCard title="Returned" value={data.totalReturned} color="red" />
            <SummaryCard title="Available" value={data.availableStock} color="purple" />
            <SummaryCard
              title="Sold Amount"
              value={`৳ ${formatMoney(
                data.stockDetails.reduce(
                  (sum, i) => sum + i.soldQty * i.sellPrice,
                  0
                )
              )}`}
              color="yellow"
            />
          </div>

          {/* ---------- TABLE ---------- */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-center">Issued</th>
                  <th className="p-3 text-center">Sold</th>
                  <th className="p-3 text-center">Returned</th>
                  <th className="p-3 text-center">Available</th>
                  <th className="p-3 text-center">Price</th>
                  <th className="p-3 text-center">Sold Total</th>
                </tr>
              </thead>

              <tbody>
                {data.stockDetails.map((item) => (
                  <tr key={item.productId} className="border-t">
                    <td className="p-3">{item.productName}</td>
                    <td className="p-3 text-center">{item.issuedQty}</td>
                    <td className="p-3 text-center text-green-600">
                      {item.soldQty}
                    </td>
                    <td className="p-3 text-center text-red-500">
                      {item.returnedQty}
                    </td>
                    <td className="p-3 text-center">
                      {item.availableQty}
                    </td>
                    <td className="p-3 text-center">
                      ৳ {formatMoney(item.sellPrice)}
                    </td>
                    <td className="p-3 text-center font-bold">
                      ৳ {formatMoney(item.soldQty * item.sellPrice)}
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
};

export default DSRStockSummaryPage;

/* ---------- HELPERS ---------- */
const formatMoney = (amount = 0) =>
  Number(amount).toLocaleString("en-BD");

const SummaryCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <p className="text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
};

