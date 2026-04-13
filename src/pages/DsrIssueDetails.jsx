import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, Link } from "react-router-dom";

export default function DsrIssueDetails() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const res = await api.get(`/dsrissue/${id}`);
      setIssue(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load issue details");
    }
    setLoading(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!issue) return <div className="p-6">Not Found</div>;

  return (
    <div className="p-6 container-max mx-auto">
      <Link
        to="/dsrissue-list"
        className="inline-block mb-4 px-3 py-1 bg-gray-700 text-white rounded"
      >
        Back
      </Link>

      <h2 className="text-2xl font-semibold mb-4">
        DSR Issue Details — {issue.dsrId?.name}
      </h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        <p><strong>DSR Name:</strong> {issue.dsrId?.name}</p>
        <p><strong>Email:</strong> {issue.dsrId?.email}</p>
        <p><strong>Total Amount:</strong> ৳ {issue.totalAmount}</p>
        <p><strong>Date:</strong> {new Date(issue.createdAt).toLocaleString()}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Issued Items</h3>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>

          <tbody>
            {issue.items.map((item, idx) => (
              <tr key={idx} className="text-center">
                <td className="p-2 border">{item.productId?.name}</td>
                <td className="p-2 border">{item.qty}</td>
                <td className="p-2 border">৳ {item.price}</td>
                <td className="p-2 border font-semibold">৳ {item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
