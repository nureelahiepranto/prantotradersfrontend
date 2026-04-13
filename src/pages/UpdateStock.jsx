// src/admin/UpdateStock.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateStock() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stock, setStock] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await API.get(`/products/${id}`);
    setStock(res.data.adminStock);
  };

  const update = async (e) => {
    e.preventDefault();
    await API.patch(`/products/${id}/stock`, { adminStock: stock });
    alert("Stock updated");
    navigate("/admin/products");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl mb-3">Update Product Stock</h2>

      <form onSubmit={update} className="space-y-4 bg-white p-5 rounded shadow">
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border" required />

        <button className="bg-yellow-600 text-white w-full py-2 rounded">Save</button>
      </form>
    </div>
  );
}
