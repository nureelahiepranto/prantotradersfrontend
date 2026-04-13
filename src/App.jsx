// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import AuthProvider from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";

// import Login from "./pages/Login";

// /* ADMIN PAGES */
// import AdminDashboard from "./pages/AdminDashboard";
// import Products from "./pages/Products";
// import AddProduct from "./pages/AddProduct";
// import EditProduct from "./pages/EditProduct";
// import UpdatePrice from "./pages/UpdatePrice";
// import UpdateStock from "./pages/UpdateStock";

// import CreateDSR from "./pages/CreateDSR";
// import DSRList from "./pages/DSRList";
// import EditDSR from "./pages/EditDSR";
// import ResetDSRPassword from "./pages/ResetDSRPassword";

// import IssueToDSR from "./pages/IssueToDSR";
// import DsrIssueList from "./pages/DsrIssueList";
// import DsrIssueDetails from "./pages/DsrIssueDetails";

// import DSRStockSummary from "./pages/DSRStockSummary";
// import AdminDSRSummary from "./pages/AdminDSRSummary";
// import AdminDailyCollection from "./pages/AdminDailyCollection";
// import AdminDSRDailyReport from "./pages/AdminDSRDailyReport";

// /* DSR PAGES */
// import DSRDashboard from "./pages/DSRDashboard";
// import DSRCreateCollection from "./pages/DSRCreateCollection";

// import DSRReturnPage from "./pages/DSRReturnPage";   // <-- DSR return page
// import DSRExpensePage from "./pages/DSRExpensePage";
// import DSRStockPage from "./pages/DSRStockPage";
// import DSRDailyReport from "./pages/DSRDailyReport";

// import CreateSale from "./pages/CreateSale";
// import SalesList from "./pages/SalesList";
// import PrintInvoice from "./pages/PrintInvoice";
// import DSRReturnProducts from "./pages/DSRReturnProducts.jsx";
// import AdminDSRReturnList from "./pages/AdminDSRReturnList.jsx";
// import DSRStockSummaryPage from "./pages/DSRStockSummaryPage.jsx";
// import CustomersList from "./pages/CustomersList.jsx";
// import CustomerForm from "./pages/CustomerForm.jsx";
// import CustomerDetails from "./pages/CustomerDetails.jsx";
// import PaymentForm from "./pages/PaymentForm.jsx";
// import PaymentList from "./pages/PaymentList.jsx";

// export default function App() {
//   return (
//     <AuthProvider>
//       <Routes>

//         {/* LOGIN */}
//         <Route path="/login" element={<Login />} />

//         {/* ================= ADMIN ROUTES ================= */}
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute allowedRoles={["admin"]}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/admin/products"
//           element={
//             <ProtectedRoute allowedRoles={["admin"]}>
//               <Products />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/admin/products/add"
//           element={<ProtectedRoute allowedRoles={["admin"]}><AddProduct /></ProtectedRoute>}
//         />
//         <Route
//           path="/admin/products/edit/:id"
//           element={<ProtectedRoute allowedRoles={["admin"]}><EditProduct /></ProtectedRoute>}
//         />
//         <Route
//           path="/admin/products/update-price/:id"
//           element={<ProtectedRoute allowedRoles={["admin"]}><UpdatePrice /></ProtectedRoute>}
//         />
//         <Route
//           path="/admin/products/update-stock/:id"
//           element={<ProtectedRoute allowedRoles={["admin"]}><UpdateStock /></ProtectedRoute>}
//         />

//         {/* DSR MANAGEMENT */}
//         <Route path="/admin/create-dsr" element={<ProtectedRoute allowedRoles={["admin"]}><CreateDSR /></ProtectedRoute>} />
//         <Route path="/admin/dsr-list" element={<ProtectedRoute allowedRoles={["admin"]}><DSRList /></ProtectedRoute>} />
//         <Route path="/admin/edit-dsr/:id" element={<ProtectedRoute allowedRoles={["admin"]}><EditDSR /></ProtectedRoute>} />
//         <Route path="/admin/reset-password/:id" element={<ProtectedRoute allowedRoles={["admin"]}><ResetDSRPassword /></ProtectedRoute>} />

//         {/* ISSUE */}
//         <Route path="/admin/issue" element={<ProtectedRoute allowedRoles={["admin"]}><IssueToDSR /></ProtectedRoute>} />
//         <Route path="/admin/dsr-issue-list" element={<ProtectedRoute allowedRoles={["admin"]}><DsrIssueList /></ProtectedRoute>} />
//         <Route path="/admin/dsr-issue/:id" element={<ProtectedRoute allowedRoles={["admin"]}><DsrIssueDetails /></ProtectedRoute>} />

//         {/* STOCK */}
//         <Route path="/admin/dsr-stock-summary" element={<ProtectedRoute allowedRoles={["admin"]}><DSRStockSummary /></ProtectedRoute>} />

//         {/* REPORTS */}
//         <Route path="/admin/dsr-daily-report" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDSRDailyReport /></ProtectedRoute>} />
//         <Route path="/admin/dsr-summary" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDSRSummary /></ProtectedRoute>} />
//         <Route path="/admin/daily-collection" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDailyCollection /></ProtectedRoute>} />

// <Route
//   path="/admin/dsr-return-list"
//   element={<AdminDSRReturnList />}
// />

// <Route
//   path="/dsr/payments/new"
//   element={<ProtectedRoute allowedRoles={["dsr"]}><PaymentForm /></ProtectedRoute>}
// />

// <Route
//   path="/dsr/payments"
//   element={<ProtectedRoute allowedRoles={["dsr"]}><PaymentList /></ProtectedRoute>}
// />

//         {/* ❌ Removed: Admin Return Products (not Admin feature) */}

//         {/* ================= DSR ROUTES ================= */}
//         <Route
//           path="/dsr/dashboard"
//           element={<ProtectedRoute allowedRoles={["dsr"]}><DSRDashboard /></ProtectedRoute>}
//         />

//         <Route path="/dsr/create-sale" element={<ProtectedRoute allowedRoles={["dsr"]}><CreateSale /></ProtectedRoute>} />
//         <Route path="/dsr/sales" element={<ProtectedRoute allowedRoles={["dsr"]}><SalesList /></ProtectedRoute>} />
       
//         <Route path="/dsr/create-collection" element={<ProtectedRoute allowedRoles={["dsr"]}><DSRCreateCollection /></ProtectedRoute>} />

//         {/* DSR RETURN */}
//         <Route path="/dsr/return-products" element={<ProtectedRoute allowedRoles={["dsr"]}><DSRReturnProducts  /></ProtectedRoute>} />

//         {/* DSR EXPENSE */}
//         <Route path="/dsr/expenses" element={<ProtectedRoute allowedRoles={["dsr"]}><DSRExpensePage /></ProtectedRoute>} />

//         {/* DSR STOCK PAGE */}
//         <Route path="/dsr/stock-summaryPage" element={<ProtectedRoute allowedRoles={["dsr"]}><DSRStockSummaryPage /></ProtectedRoute>} />

//         {/* DSR DAILY REPORT */}
//         <Route path="/dsr/daily-report" element={<ProtectedRoute allowedRoles={["dsr"]}><DSRDailyReport /></ProtectedRoute>} />

//         <Route path="/customers" element={<ProtectedRoute allowedRoles={["dsr","admin"]}><CustomersList /></ProtectedRoute>} />
//         <Route path="/customers/new" element={<ProtectedRoute allowedRoles={["dsr","admin"]}><CustomerForm /></ProtectedRoute>} />
//         <Route path="/customers/edit/:id" element={<ProtectedRoute allowedRoles={["dsr","admin"]}><CustomerForm /></ProtectedRoute>} />
//         <Route path="/customers/:id" element={<ProtectedRoute allowedRoles={["dsr","admin"]}><CustomerDetails /></ProtectedRoute>} />


//         {/* INVOICE */}
//         <Route path="/invoice/:saleId" element={<PrintInvoice />} />

//         {/* DEFAULT */}
//         <Route path="/" element={<Navigate to="/login" />} />
//       </Routes>
//     </AuthProvider>
//   );
// }


// App.jsx (Updated)
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout"; // নতুন Layout import করুন

import Login from "./pages/Login";

/* ADMIN PAGES */
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import UpdatePrice from "./pages/UpdatePrice";
import UpdateStock from "./pages/UpdateStock";

import CreateDSR from "./pages/CreateDSR";
import DSRList from "./pages/DSRList";
import EditDSR from "./pages/EditDSR";
import ResetDSRPassword from "./pages/ResetDSRPassword";

import IssueToDSR from "./pages/IssueToDSR";
import DsrIssueList from "./pages/DsrIssueList";
import DsrIssueDetails from "./pages/DsrIssueDetails";

import DSRStockSummary from "./pages/DSRStockSummary";
import AdminDSRSummary from "./pages/AdminDSRSummary";
import AdminDailyCollection from "./pages/AdminDailyCollection";
import AdminDSRDailyReport from "./pages/AdminDSRDailyReport";

/* DSR PAGES */
import DSRDashboard from "./pages/DSRDashboard";
import DSRCreateCollection from "./pages/DSRCreateCollection";

import DSRReturnPage from "./pages/DSRReturnPage";
import DSRExpensePage from "./pages/DSRExpensePage";
import DSRStockPage from "./pages/DSRStockPage";
import DSRDailyReport from "./pages/DSRDailyReport";

import CreateSale from "./pages/CreateSale";
import SalesList from "./pages/SalesList";
import PrintInvoice from "./pages/PrintInvoice";
import DSRReturnProducts from "./pages/DSRReturnProducts.jsx";
import AdminDSRReturnList from "./pages/AdminDSRReturnList.jsx";
import DSRStockSummaryPage from "./pages/DSRStockSummaryPage.jsx";
import CustomersList from "./pages/CustomersList.jsx";
import CustomerForm from "./pages/CustomerForm.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import PaymentForm from "./pages/PaymentForm.jsx";
import PaymentList from "./pages/PaymentList.jsx";
import DSRSalesDashboard from "./pages/DSRSalesDashboard.jsx";
import DSRMonthlyReport from "./pages/DSRMonthlyReport.jsx";
import DSRYearlyReport from "./pages/DSRYearlyReport.jsx";
import AdminDSRExpensePage from "./pages/AdminDSRExpensePage.jsx";
import AdminExpensePage from "./pages/AdminExpensePage.jsx";
import AdminProfitPage from "./pages/AdminDailyProfit.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/invoice/:saleId" element={<PrintInvoice />} />

        {/* PROTECTED ROUTES WITH LAYOUT */}
        <Route element={
          <ProtectedRoute allowedRoles={["admin", "dsr"]}>
            <Layout />
          </ProtectedRoute>
        }>
          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Products /> {/* Now uses Layout internally */}
            </ProtectedRoute>
          }
        />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/products/update-price/:id" element={<UpdatePrice />} />
          <Route path="/admin/products/update-stock/:id" element={<UpdateStock />} />
          
          <Route path="/admin/create-dsr" element={<CreateDSR />} />
          <Route path="/admin/dsr-list" element={<DSRList />} />
          <Route path="/admin/edit-dsr/:id" element={<EditDSR />} />
          <Route path="/admin/reset-password/:id" element={<ResetDSRPassword />} />
          
          <Route path="/admin/issue" element={<IssueToDSR />} />
          <Route path="/admin/dsr-issue-list" element={<DsrIssueList />} />
          <Route path="/admin/dsr-issue/:id" element={<DsrIssueDetails />} />
          
          <Route path="/admin/dsr-stock-summary" element={<DSRStockSummary />} />
          <Route path="/admin/dsr-daily-report" element={<AdminDSRDailyReport />} />
          <Route path="/admin/dsr-monthly-report" element={<DSRMonthlyReport />} />
          <Route path="/admin/dsr-yearly-report" element={<DSRYearlyReport />} />
          <Route path="/admin/expenseAdmin" element={<AdminExpensePage />} />
          <Route path="/admin/dailyProfit" element={<AdminProfitPage />} />
          <Route path="/admin/expense" element={<AdminDSRExpensePage />} />
          <Route path="/admin/dsr-sales-report" element={<DSRSalesDashboard />} />
          <Route path="/admin/dsr-summary" element={<AdminDSRSummary />} />
          <Route path="/admin/daily-collection" element={<AdminDailyCollection />} />
          <Route path="/admin/dsr-return-list" element={<AdminDSRReturnList />} />

          {/* DSR ROUTES */}
          <Route path="/dsr/dashboard" element={<DSRDashboard />} />
          <Route path="/dsr/create-sale" element={<CreateSale />} />
          <Route path="/dsr/sales" element={<SalesList />} />
          <Route path="/dsr/create-collection" element={<DSRCreateCollection />} />
          <Route path="/dsr/return-products" element={<DSRReturnProducts />} />
          <Route path="/dsr/expenses" element={<DSRExpensePage />} />
          <Route path="/dsr/stock-summaryPage" element={<DSRStockSummaryPage />} />
          <Route path="/dsr/daily-report" element={<DSRDailyReport />} />
          <Route path="/dsr/payments/new" element={<PaymentForm />} />
          <Route path="/dsr/payments" element={<PaymentList />} />

          {/* SHARED ROUTES */}
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
        </Route>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}