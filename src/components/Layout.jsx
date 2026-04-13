// // Layout.jsx
// import React, { useContext } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";

// export default function Layout() {
//   const { user } = useContext(AuthContext);
//   const location = useLocation();
  
//   // যেসব পেজে Navbar ও Sidebar দেখাবে না
//   const hideLayout = 
//     location.pathname === '/admin' || 
//     location.pathname === '/dsr/dashboard' ||
//     location.pathname === '/login';

//   if (hideLayout) {
//     return <Outlet />; // শুধু content দেখাবে
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="flex">
//         <Sidebar role={user?.role} />
//         <main className="flex-1 p-4 md:p-6 lg:p-8">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }
// Layout.jsx
import React, { useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (location.pathname === "/login") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          role={user?.role}
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main
          className={`
            flex-1 transition-all duration-300
            p-4 md:p-6 lg:p-8
            ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-0"}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
