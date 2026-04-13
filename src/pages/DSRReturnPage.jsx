import React, { useState, useEffect } from "react";
import Pagination from "../components/Pagination";

export default function DSRReturnPage() {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch return products (dummy data for now)
  useEffect(() => {
    const dummy = [
      { id: 1, customer: "Rahim", product: "Product A", qty: 2, date: "2025-01-20" },
      { id: 2, customer: "Karim", product: "Product B", qty: 1, date: "2025-01-21" },
      { id: 3, customer: "Hasan", product: "Product C", qty: 5, date: "2025-01-21" },
    ];
    setReturns(dummy);
  }, []);

  // Search filter
  const filtered = returns.filter(
    (r) =>
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculation
  const pages = Math.ceil(filtered.length / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this return entry?")) {
      setReturns(returns.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">DSR Return Products</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by customer/product"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 p-2 border rounded mb-4"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Return Date</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((item) => (
              <tr key={item.id} className="border">
                <td className="p-2 border">{item.customer}</td>
                <td className="p-2 border">{item.product}</td>
                <td className="p-2 border">{item.qty}</td>
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No return products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
