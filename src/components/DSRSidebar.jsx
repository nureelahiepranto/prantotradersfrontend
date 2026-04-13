import { Link, useLocation } from "react-router-dom";

export default function DSRSidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    pathname === path
      ? "bg-blue-600 text-white p-2 rounded"
      : "p-2 text-gray-700 hover:bg-gray-200 rounded";

  return (
    <div className="w-64 bg-white h-screen shadow p-4 space-y-2">
      <h2 className="text-xl font-bold mb-4">DSR Dashboard</h2>

      <Link to="/dsr" className={linkClass("/dsr")}>Dashboard</Link>
      <Link to="/dsr/customers" className={linkClass("/dsr/customers")}>Customers</Link>
      <Link to="/dsr/create-collection" className={linkClass("/dsr/create-collection")}>Create Collection</Link>
      <Link to="/dsr/issue-list" className={linkClass("/dsr/issue-list")}>Issue List</Link>
      <Link to="/dsr/stock-summary" className={linkClass("/dsr/stock-summary")}>Stock Summary</Link>
      <Link to="/dsr/return-products" className={linkClass("/dsr/return-products")}>Return Products</Link>
      <Link to="/dsr/expenses" className={linkClass("/dsr/expenses")}>Expenses / Collection</Link>
      <Link to="/dsr/daily-report" className={linkClass("/dsr/daily-report")}>Daily Report</Link>
    </div>
  );
}
