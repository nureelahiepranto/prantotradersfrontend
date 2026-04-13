import React, { useEffect, useState } from "react";
import axios from "axios";

const DSRReturnHistory = () => {
  const [returns, setReturns] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // DSR info

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `https://dsrprantotradersbackend.onrender.com/api/dsr-return/dsr/${user.id}`
      );
      setReturns(res.data);
    } catch (error) {
      console.log("Error fetching return history:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        My Return History
      </h2>

      {returns.length === 0 ? (
        <p className="text-gray-500">No return history found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {returns.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    {item.productId?.name || "N/A"}
                  </td>

                  <td className="py-2 px-4">{item.quantity}</td>

                  <td className="py-2 px-4">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DSRReturnHistory;
