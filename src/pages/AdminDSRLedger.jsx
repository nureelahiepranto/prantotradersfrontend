import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDSRLedger({ dsrId }) {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  console.log("DSR ID:", dsrId);
  if (!dsrId) return;

  api.get(`/dsr-expenses/ledger/${dsrId}`)
    .then(res => {
      console.log("Ledger data:", res.data);
      setLedger(res.data);
    });
}, [dsrId]);

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-bold mb-3">📒 DSR Ledger</h2>

      {loading && <p className="text-sm text-gray-500">Loading ledger...</p>}

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Credit</th>
            <th className="border p-2">Debit</th>
            <th className="border p-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((l, i) => (
            <tr key={i}>
              <td className="border p-2">
                {new Date(l.date).toLocaleDateString()}
              </td>

              <td className="border p-2 font-semibold">
                {l.type === "SELL" && (
                  <span className="text-blue-600">SELL</span>
                )}
                {l.type === "EXPENSE" && (
                  <span className="text-red-600">EXPENSE</span>
                )}
                {l.type === "COLLECTION" && (
                  <span className="text-green-600">COLLECTION</span>
                )}
              </td>

              <td className="border p-2 text-red-600">
                {l.credit > 0 ? `৳ ${l.credit}` : "-"}
              </td>

              <td className="border p-2 text-green-600">
                {l.debit > 0 ? `৳ ${l.debit}` : "-"}
              </td>

              <td
                className={`border p-2 font-bold ${
                  l.balance < 0 ? "text-red-600" : "text-black"
                }`}
              >
                ৳ {l.balance}
              </td>
            </tr>
          ))}

          {!loading && ledger.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No ledger data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
