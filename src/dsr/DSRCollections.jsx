// src/dsr/DSRCollections.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import { AuthContext } from "../context/AuthContext";

export default function DSRCollections() {
  const { user } = useContext(AuthContext);

  const [collections, setCollections] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load(1);
  }, []);

  const load = async (page = 1) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/collections?page=${page}&limit=${meta.limit}&dsrId=${user.id}`
      );

      setCollections(res.data.collections ?? []);

      setMeta({
        page: res.data.page ?? 1,
        pages: res.data.pages ?? 1,
        total: res.data.total ?? 0,
        limit: res.data.limit ?? 10,
      });
    } catch (err) {
      console.error("COLLECTION ERROR:", err);
      alert("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 container-max mx-auto">
      <h2 className="text-2xl mb-4">DSR Collections</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Customer</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2">Payment Method</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>

              <tbody>
                {collections.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="p-2">{c.customer?.name ?? "—"}</td>

                    <td className="p-2 text-right">
                      {Number(c.amount || 0).toFixed(2)} ৳
                    </td>

                    <td className="p-2">{c.method ?? "—"}</td>

                    <td className="p-2">
                      {c.date ? new Date(c.date).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Total: {meta.total}</div>
            <Pagination page={meta.page} pages={meta.pages} onChange={load} />
          </div>
        </>
      )}
    </div>
  );
}
