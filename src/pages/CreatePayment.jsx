// src/pages/CreatePayment.jsx
import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function CreatePayment() {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get(`/customers?dsrId=${user._id}`);
      setCustomers(res.data.customers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!customerId || !amount) return alert("Fill all fields");

    setLoading(true);

    try {
      await api.post("/payments", {
        dsrId: user._id,
        customerId,
        amount: Number(amount),
        note
      });

      alert("Payment added successfully!");

      setCustomerId("");
      setAmount("");
      setNote("");

    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 container mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add Payment</h2>

      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-4">

        <select
          className="w-full p-2 border rounded"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} — Due: {c.currentDue}৳
            </option>
          ))}
        </select>

        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          className="w-full bg-green-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Payment"}
        </button>

      </form>
    </div>
  );
}
