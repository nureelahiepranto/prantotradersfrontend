// // src/admin/UpdatePrice.jsx
// import React, { useEffect, useState } from "react";
// import API from "../api/axios";
// import { useParams, useNavigate } from "react-router-dom";

// export default function UpdatePrice() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [price, setPrice] = useState("");

//   useEffect(() => {
//     load();
//   }, []);

//   const load = async () => {
//     const res = await API.get(`/products/${id}`);
//     setPrice(res.data.sellPrice);
//   };

//   const update = async (e) => {
//     e.preventDefault();
//     await API.patch(`/products/${id}/price`, { sellPrice: price });
//     alert("Price updated");
//     navigate("/admin/products");
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto">
//       <h2 className="text-xl mb-3">Update Product Price</h2>

//       <form onSubmit={update} className="space-y-4 bg-white p-5 rounded shadow">
//         <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border" required />

//         <button className="bg-green-600 text-white w-full py-2 rounded">Save</button>
//       </form>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdatePrice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sellPrice, setSellPrice] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await API.get(`/products/${id}`);
    setSellPrice(res.data.sellPrice);
    setBuyPrice(res.data.buyPrice);
  };

  const update = async (e) => {
    e.preventDefault();

    if (Number(sellPrice) < Number(buyPrice)) {
      alert("❌ Sell price cannot be lower than buy price");
      return;
    }

    await API.put(`/products/${id}`, {
      sellPrice: Number(sellPrice),
      buyPrice: Number(buyPrice),
    });

    alert("✅ Price updated");
    navigate("/admin/products");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl mb-4 font-semibold">Update Product Price</h2>

      <form onSubmit={update} className="space-y-4 bg-white p-5 rounded shadow">

        <input
          type="number"
          placeholder="Buy Price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Sell Price"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <p className="text-sm text-gray-600">
          Profit per unit: <b>৳ {sellPrice - buyPrice}</b>
        </p>

        <button className="bg-green-600 text-white w-full py-2 rounded">
          Save Price
        </button>

      </form>
    </div>
  );
}
