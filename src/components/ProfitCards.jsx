export default function ProfitCards({ data }) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      <Card title="Total Sale" value={data.totalSale} color="text-blue-600" />
      <Card title="Total Cost" value={data.totalCost} color="text-orange-600" />
      <Card title="Admin Expense" value={data.adminExpense} color="text-red-600" />
      <Card title="Net Profit" value={data.profit} color="text-green-600" />
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-xl font-bold ${color}`}>{value} ৳</h3>
    </div>
  );
}
