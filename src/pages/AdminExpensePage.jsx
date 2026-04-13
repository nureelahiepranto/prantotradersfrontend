import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await api.get("/admin-expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (editId) {
      await api.put(`/admin-expenses/${editId}`, { reason, amount });
      setEditId(null);
    } else {
      await api.post("/admin-expenses", { reason, amount });
    }

    setReason("");
    setAmount("");
    loadData();
  };

  const editExpense = (e) => {
    setEditId(e._id);
    setReason(e.reason);
    setAmount(e.amount);
  };

  const deleteExpense = async (id) => {
    if (confirm("Delete this expense?")) {
      await api.delete(`/admin-expenses/${id}`);
      loadData();
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Expense</h2>

      {/* Form */}
      <form onSubmit={submitHandler} className="grid grid-cols-3 gap-3 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white rounded">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e._id}>
              <td className="border p-2">
                {new Date(e.date).toLocaleDateString()}
              </td>
              <td className="border p-2">{e.reason}</td>
              <td className="border p-2 text-red-600 font-bold">
                {e.amount}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => editExpense(e)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(e._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!expenses.length && (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No expenses found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
