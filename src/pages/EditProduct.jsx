// // src/admin/EditProduct.jsx
// import React, { useEffect, useState } from "react";
// import API from "../api/axios";
// import { useNavigate, useParams } from "react-router-dom";

// export default function EditProduct() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     sku: "",
//   });

//   useEffect(() => {
//     load();
//   }, []);

//   const load = async () => {
//     const res = await API.get(`/products/${id}`);
//     setForm(res.data);
//   };

//   const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const save = async (e) => {
//     e.preventDefault();
//     await API.put(`/products/${id}`, form);
//     alert("Product updated");
//     navigate("/admin/products");
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto">
//       <h2 className="text-2xl mb-4">Edit Product</h2>

//       <form onSubmit={save} className="space-y-4 bg-white p-5 rounded shadow">
//         <input name="name" value={form.name} onChange={change} className="w-full p-2 border" required />
//         <input name="sku" value={form.sku} onChange={change} className="w-full p-2 border" />

//         <button className="bg-blue-600 text-white w-full py-2 rounded">Update</button>
//       </form>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    buyPrice: "",
    sellPrice: "",
    adminStock: "",
    category: "",
    unit: "pcs",
    brand: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setForm({
        name: res.data.name || "",
        sku: res.data.sku || "",
        buyPrice: res.data.buyPrice || "",
        sellPrice: res.data.sellPrice || "",
        adminStock: res.data.adminStock || "",
        category: res.data.category || "",
        unit: res.data.unit || "pcs",
        brand: res.data.brand || "",
        description: res.data.description || "",
      });
    } catch (err) {
      alert("Failed to load product");
    }
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await API.put(`/products/${id}`, {
        ...form,
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        adminStock: Number(form.adminStock),
      });

      alert("✅ Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>

      <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">

        <input name="name" value={form.name} onChange={change} placeholder="Product Name"
          className="w-full p-2 border rounded" required />

        <input name="sku" value={form.sku} onChange={change} placeholder="SKU"
          className="w-full p-2 border rounded" />

        <div className="grid grid-cols-2 gap-4">
          <input type="number" name="buyPrice" value={form.buyPrice} onChange={change}
            placeholder="Buy Price" className="p-2 border rounded" />

          <input type="number" name="sellPrice" value={form.sellPrice} onChange={change}
            placeholder="Sell Price" className="p-2 border rounded" required />
        </div>

        <input type="number" name="adminStock" value={form.adminStock} onChange={change}
          placeholder="Stock Quantity" className="w-full p-2 border rounded" />

        <div className="grid grid-cols-2 gap-4">
          <input name="category" value={form.category} onChange={change}
            placeholder="Category" className="p-2 border rounded" />

          <input name="brand" value={form.brand} onChange={change}
            placeholder="Brand" className="p-2 border rounded" />
        </div>

        <select name="unit" value={form.unit} onChange={change}
          className="w-full p-2 border rounded">
          <option value="pcs">pcs</option>
          <option value="kg">kg</option>
          <option value="litre">litre</option>
          <option value="box">box</option>
        </select>

        <textarea name="description" value={form.description} onChange={change}
          placeholder="Description"
          className="w-full p-2 border rounded" rows="4" />

        <button disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded">
          {loading ? "Updating..." : "Update Product"}
        </button>

      </form>
    </div>
  );
}
