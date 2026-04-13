import { useEffect, useState } from "react";
import axios from "../api/axios.js";

export default function DSRSummary() {
  const [list, setList] = useState([]);

  const loadData = async () => {
    const res = await axios.get("/admin/dsr-summary");
    setList(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">DSR Summary Report</h1>

      <table className="w-full mt-4 border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">DSR</th>
            <th className="p-2 border">Issued</th>
            <th className="p-2 border">Returned</th>
            <th className="p-2 border">Expenses</th>
            <th className="p-2 border">Collections</th>
            <th className="p-2 border">Balance</th>
          </tr>
        </thead>

        <tbody>
          {list.map((i, idx) => (
            <tr key={idx}>
              <td className="border p-2">{i.name}</td>
              <td className="border p-2">{i.issued} Tk</td>
              <td className="border p-2">{i.returned}</td>
              <td className="border p-2 text-red-600">{i.expenses} Tk</td>
              <td className="border p-2 text-green-600">{i.collections} Tk</td>
              <td className="border p-2 font-bold">{i.balance} Tk</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
