import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaHome, FaBox, FaUserPlus, FaUsers, FaPaperPlane, FaClipboardList, FaChartPie, FaUndo, FaFileAlt, FaChartLine, FaMoneyBillWave, FaShoppingCart, FaReceipt, FaCreditCard, FaWarehouse, FaChartBar } from "react-icons/fa";
import { RiDashboardFill, RiProductHuntLine, RiUserAddLine, RiUserSettingsLine, RiSettingsLine } from "react-icons/ri";
import { AiOutlineStock, AiOutlineFileText, AiOutlineMoneyCollect } from "react-icons/ai";
import { TbReportAnalytics } from "react-icons/tb";
import { BiSolidReport } from "react-icons/bi";
import { GiExpense } from "react-icons/gi";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import textlogo from "../assets/soft-webmission-text-logo-text.png";
function SidebarItem({ to, icon: Icon, label, badge, showLabel = true }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg ' 
          : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 hover:shadow-md'
        }
        group relative
      `}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full"></div>
      )}
      
      {/* Icon Container */}
      <div className={`relative flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-500'}`}>
        <Icon size={20} />
        {badge && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {badge}
          </span>
        )}
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className="font-medium text-sm transition-all duration-300 ">
          {label}
        </span>
      )}
      
      {/* Tooltip for collapsed sidebar */}
      {!showLabel && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
          {label}
          {badge && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">{badge}</span>}
        </div>
      )}
    </NavLink>
  );
}

function SidebarSection({ title, children, icon: Icon, showLabel = true }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!showLabel) {
    return <div className="space-y-2">{children}</div>;
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-400" />}
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900 group-hover:text-gray-600 text-red">
            {title}
          </span>
        </div>
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'mt-2 max-h-96' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

export default function Sidebar({ role, isOpen, onClose, collapsed = false }) {
  // Admin menu items
  const adminSections = [
    {
      title: "Dashboard",
      icon: RiDashboardFill,
      items: [
        { to: "/admin", icon: FaHome, label: "Overview", badge: null },
      ]
    },
    {
      title: "Product Management",
      icon: RiProductHuntLine,
      items: [
        { to: "/admin/products", icon: FaBox, label: "All Products", badge: "12" },
        { to: "/admin/products/add", icon: RiProductHuntLine, label: "Add Product", badge: "New" },
      ]
    },
    {
      title: "DSR Management",
      icon: RiUserSettingsLine,
      items: [
        { to: "/admin/create-dsr", icon: RiUserAddLine, label: "Add DSR" },
        { to: "/admin/dsr-list", icon: FaUsers, label: "DSR List", badge: "5" },
      ]
    },
    {
      title: "Stock & Issue",
      icon: AiOutlineStock,
      items: [
        { to: "/admin/issue", icon: FaPaperPlane, label: "Issue to DSR", badge: "3" },
        { to: "/admin/dsr-issue-list", icon: FaClipboardList, label: "Issue List" },
        { to: "/admin/dsr-stock-summary", icon: FaChartPie, label: "Stock Summary" },
        { to: "/admin/dsr-return-list", icon: FaUndo, label: "Returns", badge: "2" },
        { to: "/admin/expenseAdmin", icon: FaCircleDollarToSlot  , label: "Expense" },
      ]
    },
    {
      title: "Reports & Analytics",
      icon: FaChartBar,
      items: [
        { to: "/admin/dsr-sales-report", icon: FaMoneyBillWave, label: "Sales Report" },
        { to: "/admin/dsr-daily-report", icon: FaFileAlt, label: "Daily Report" },
        { to: "/admin/dsr-monthly-report", icon: TbReportAnalytics, label: "Monthly Report" },
        { to: "/admin/dsr-Yearly-report", icon: BiSolidReport , label: "Yearly Report" },
        { to: "/admin/dsr-summary", icon: FaChartLine, label: "DSR Summary" },
        { to: "/admin/expense", icon: GiExpense , label: "Expense Report" },
        { to: "/admin/daily-collection", icon: FaMoneyBillWave, label: "Collections", badge: "৳" },
      ]
    },
    {
      title: "Profit",
      icon: FaChartBar,
      items: [
        { to: "/admin/dailyProfit", icon: FaMoneyBillWave, label: "Daily Profit" },
      ]
    },
    {
      title: "System",
      icon: RiSettingsLine,
      items: [
        { to: "/customers", icon: FaUsers, label: "Customers", badge: "24" },
        { to: "/customers/new", icon: RiUserAddLine, label: "Add Customer" },
      ]
    }
  ];

  // DSR menu items
  const dsrSections = [
    {
      title: "Dashboard",
      icon: RiDashboardFill,
      items: [
        { to: "/dsr/dashboard", icon: FaHome, label: "Overview" },
      ]
    },
    {
      title: "Sales",
      icon: FaShoppingCart,
      items: [
        { to: "/dsr/create-sale", icon: FaShoppingCart, label: "Create Sale", badge: "New" },
        { to: "/dsr/sales", icon: FaReceipt, label: "My Sales", badge: "15" },
      ]
    },
    {
      title: "Customers & Payments",
      icon: FaUsers,
      items: [
        { to: "/customers", icon: FaUsers, label: "Customers", badge: "24" },
        { to: "/dsr/payments/new", icon: FaCreditCard, label: "Add Payment" },
        { to: "/dsr/payments", icon: FaClipboardList, label: "Payment List", badge: "8" },
      ]
    },
    {
      title: "Stock & Finance",
      icon: AiOutlineMoneyCollect,
      items: [
        { to: "/dsr/create-collection", icon: FaMoneyBillWave, label: "Create Collection" },
        { to: "/dsr/return-products", icon: FaUndo, label: "Return Products" },
        { to: "/dsr/expenses", icon: AiOutlineFileText, label: "Expenses" },
        { to: "/dsr/stock-summaryPage", icon: FaWarehouse, label: "Stock Summary" },
      ]
    },
    {
      title: "Reports",
      icon: FaChartBar,
      items: [
        { to: "/dsr/daily-report", icon: FaFileAlt, label: "Daily Report" },
      ]
    }
  ];

  const sections = role === "admin" ? adminSections : dsrSections;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          bg-gradient-to-b from-white to-gray-50
          border-r border-gray-100 shadow-xl lg:shadow-lg
          transition-all duration-300 ease-in-out
          overflow-y-auto no-scrollbar
          ${collapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="px-6 border-b border-gray-100 pt-5">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <RiDashboardFill size={22} className="text-white" />
                </div>
                <div>
                  {/* <h1 className="text-lg font-bold text-gray-800">
                    Soft<span className="text-indigo-600"> WebMission</span>
                  </h1> */}
                  <p className="text-xs font-bold text-red-400 mt-0.5 text-center">
                    {role === "admin" ? "Admin Panel" : "DSR Panel"}
                  </p>
                </div>
              </div>
            )}
            
            {collapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mx-auto ">
                <RiDashboardFill size={22} className="text-white" />
              </div>
            )}
            
            {/* Close button for mobile */}
            {isOpen && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-red-300 transition-colors bg-red-400 text-white "
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <img src={textlogo} className="" alt="" srcset="" />
        </div>

        {/* Sidebar Content */}
        <div className="p-4">
          {sections.map((section, index) => (
            <SidebarSection
              key={index}
              title={section.title}
              icon={section.icon}
              showLabel={!collapsed}
            >
              {section.items.map((item, idx) => (
                <SidebarItem
                  key={idx}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  showLabel={!collapsed}
                />
              ))}
            </SidebarSection>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className={`bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">System Online</span>
                </div>
                <span className="text-xs text-gray-500">v2.2.0</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                  <FaUsers size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {role === "admin" ? "Administrator" : "DSR Executive"}
                  </p>
                  <p className="text-xs text-gray-500">Active Session</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                  <FaUsers size={14} className="text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </aside>
    </>
  );
}