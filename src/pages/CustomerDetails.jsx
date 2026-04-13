// src/pages/CustomerDetails.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, Link } from "react-router-dom";

export default function CustomerDetails() {
  const { id } = useParams();
  const [c, setC] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/customers/${id}`);
        setC(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load");
      }
    }
    load();
  }, [id]);

  if (!c) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{c.name}</h2>
        <div>
          <Link to={`/customers/edit/${c._id}`} className="text-green-600 mr-3">Edit</Link>
          <Link to="/customers" className="text-gray-600">Back</Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div><strong>Phone:</strong> {c.phone || "-"}</div>
        <div><strong>Address:</strong> {c.address || "-"}</div>
        <div><strong>Current Due:</strong> {c.currentDue || 0} ৳</div>
        <div><strong>Created:</strong> {new Date(c.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
