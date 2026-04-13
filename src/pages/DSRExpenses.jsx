import { useState } from "react";
import axios from "../api/axios.js";

export default function DSRExpenses() {
  const [data, setData] = useState({
    reason: "",
    amount: "",
    type: "expense",
    dsrId: localStorage.getItem("userId")
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    await axios.post("/dsr-expense/add", data);
    alert("Saved");
    setData({ ...data, reason: "", amount: "" });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">DSR Expense / Collection</h2>

      <form onSubmit={submitHandler} className="bg-white shadow p-4 mt-4 space-y-3">
        <select
          className="border p-2 w-full"
          value={data.type}
          onChange={(e) => setData({ ...data, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="collection">Cash Collection</option>
        </select>

        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Reason"
          value={data.reason}
          onChange={(e) => setData({ ...data, reason: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Amount"
          value={data.amount}
          onChange={(e) => setData({ ...data, amount: e.target.value })}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
