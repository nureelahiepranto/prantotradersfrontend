import React, { useState } from "react";
import axios from "axios";

const StockSummaryPage = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [summary, setSummary] = useState([]);

  const loadSummary = async () => {
    const res = await axios.get(
      `/api/dsr-stock/summary-range?startDate=${start}&endDate=${end}`
    );
    setSummary(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Stock Summary Report</h1>

      <div className="flex gap-4">
        <input type="date" value={start} className="border p-2 rounded"
          onChange={(e) => setStart(e.target.value)} />

        <input type="date" value={end} className="border p-2 rounded"
          onChange={(e) => setEnd(e.target.value)} />

        <button onClick={loadSummary}
          className="bg-blue-700 text-white px-4 py-2 rounded">
          Filter
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {summary.map((item, i) => (
          <div key={i} className="p-4 border rounded bg-gray-100">
            <h3 className="font-semibold">{item?.dsrId?.name}</h3>
            <p>Date: {item.date.substring(0, 10)}</p>
            <p>Total Sale: {item.totalSaleAmount} Tk</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockSummaryPage;
