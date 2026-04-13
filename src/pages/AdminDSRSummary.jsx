import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdInventory,
  MdReceipt,
  MdRefresh,
  MdCalendarToday,
  MdShoppingCart,
  MdArrowBack,
  MdArrowForward,
  MdDownload,
  MdFilterList,
  MdPerson,
  MdBarChart,
  MdShowChart,
  MdPieChart,
  MdInfo,
  MdCompareArrows,
  MdAssessment
} from "react-icons/md";
import { FiDownload, FiFilter } from "react-icons/fi";

export default function AdminDSRSummary() {
  const [dsrList, setDsrList] = useState([]);
  const [selectedDsr, setSelectedDsr] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [type, setType] = useState("daily"); // daily / monthly / yearly
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(true);
  const [chartType, setChartType] = useState("pie"); // pie, bar, line

  // Load all DSR users
  const loadDSRList = async () => {
    try {
      const res = await axios.get("/auth/dsrs");
      setDsrList(res.data || []);
      if (res.data?.length > 0) setSelectedDsr(res.data[0]._id);
    } catch (err) {
      console.error("Failed to load DSR list", err);
      setError("Failed to load DSR list");
    }
  };

  // Load report
  const loadReport = async () => {
    if (!selectedDsr) {
      setError("Please select a DSR");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const params = { dsrId: selectedDsr, type };
      if (type === "daily") params.date = date;
      if (type === "monthly") {
        params.month = month;
        params.year = year;
      }
      if (type === "yearly") params.year = year;

      const res = await axios.get("/dsr-report", { params });
      setReport(res.data);
    } catch (err) {
      console.error("Failed to load report", err);
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDSRList();
  }, []);

  useEffect(() => {
    if (selectedDsr) loadReport();
  }, [selectedDsr, type, date, month, year]);

  // Calculate totals
  const calculateTotals = () => {
    if (!report) return { issued: 0, expense: 0, collection: 0, profit: 0 };
    
    const totalIssued = report.issued.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    const totalExpense = report.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCollection = report.collections.reduce((sum, c) => sum + c.amount, 0);
    const profit = totalIssued - totalExpense;
    
    return { totalIssued, totalExpense, totalCollection, profit };
  };

  const { totalIssued, totalExpense, totalCollection, profit } = calculateTotals();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get month name
  const getMonthName = (monthNumber) => {
    return new Date(2000, monthNumber - 1).toLocaleString('en-US', { month: 'long' });
  };

  // Get selected DSR name
  const getSelectedDsrName = () => {
    const dsr = dsrList.find(d => d._id === selectedDsr);
    return dsr?.name || "Unknown DSR";
  };

  // Handle date navigation
  const navigateDate = (direction) => {
    if (type === "daily") {
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() + direction);
      setDate(currentDate.toISOString().slice(0, 10));
    } else if (type === "monthly") {
      const newMonth = month + direction;
      if (newMonth >= 1 && newMonth <= 12) {
        setMonth(newMonth);
      } else if (newMonth === 0) {
        setMonth(12);
        setYear(year - 1);
      } else if (newMonth === 13) {
        setMonth(1);
        setYear(year + 1);
      }
    } else if (type === "yearly") {
      setYear(year + direction);
    }
  };

  // Export report
  const exportReport = () => {
    const data = {
      dsrName: getSelectedDsrName(),
      reportType: type,
      period: type === "daily" ? date : type === "monthly" ? `${getMonthName(month)} ${year}` : year,
      totals: { totalIssued, totalExpense, totalCollection, profit },
      details: report
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsr-report-${getSelectedDsrName().replace(/\s+/g, '-')}-${type}-${date || month || year}.json`;
    a.click();
  };

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading DSR reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <MdAssessment className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">DSR Performance Dashboard</h1>
                <p className="text-gray-600">Monitor and analyze DSR performance metrics</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportReport}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={!report}
            >
              <MdDownload className="text-lg" />
              Export Report
            </button>
            <button 
              onClick={loadReport}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              <MdRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <MdInfo className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Error Loading Data</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* DSR Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MdPerson className="text-gray-400" />
                      Select DSR
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDsr}
                      onChange={(e) => setSelectedDsr(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
                      disabled={loading || dsrList.length === 0}
                    >
                      {dsrList.length === 0 ? (
                        <option value="">No DSRs available</option>
                      ) : (
                        dsrList.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))
                      )}
                    </select>
                    <MdPerson className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MdBarChart className="text-gray-400" />
                      Report Type
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="daily">Daily Report</option>
                      <option value="monthly">Monthly Report</option>
                      <option value="yearly">Yearly Report</option>
                    </select>
                    <MdFilterList className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Date Selector */}
                {type === "daily" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateDate(-1)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <MdArrowBack />
                      </button>
                      <div className="relative flex-1">
                        <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                      <button
                        onClick={() => navigateDate(1)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <MdArrowForward />
                      </button>
                    </div>
                  </div>
                )}

                {/* Monthly Selector */}
                {type === "monthly" && (
                  <div className="col-span-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigateDate(-1)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <MdArrowBack />
                          </button>
                          <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i} value={i + 1}>
                                {new Date(0, i).toLocaleString("en", { month: "long" })}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => navigateDate(1)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <MdArrowForward />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input
                          type="number"
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Yearly Selector */}
                {type === "yearly" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateDate(-1)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <MdArrowBack />
                      </button>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                      <button
                        onClick={() => navigateDate(1)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <MdArrowForward />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Period Display */}
            <div className="lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 rounded-xl">
                <MdCalendarToday />
                <span className="font-medium">
                  {type === "daily" && new Date(date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  {type === "monthly" && `${getMonthName(month)} ${year}`}
                  {type === "yearly" && `Year ${year}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected DSR Info */}
        {selectedDsr && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {getSelectedDsrName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{getSelectedDsrName()}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>ID: {selectedDsr.slice(-6)}</span>
                    <span>•</span>
                    <span>Active DSR</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Report Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${report ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-sm font-medium ${report ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {report ? 'Data Loaded' : 'No Data'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {report ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <SummaryCard 
                title="Issued Value" 
                value={formatCurrency(totalIssued)}
                icon={<MdInventory className="text-2xl" />}
                color="blue"
                trend="+12%"
                isPositive={true}
              />
              <SummaryCard 
                title="Total Expense" 
                value={formatCurrency(totalExpense)}
                icon={<MdTrendingDown className="text-2xl" />}
                color="red"
                trend="-5%"
                isPositive={false}
              />
              <SummaryCard 
                title="Total Collection" 
                value={formatCurrency(totalCollection)}
                icon={<MdTrendingUp className="text-2xl" />}
                color="emerald"
                trend="+18%"
                isPositive={true}
              />
              <SummaryCard 
                title="Net Profit" 
                value={formatCurrency(profit)}
                icon={<MdAttachMoney className="text-2xl" />}
                color={profit >= 0 ? "purple" : "amber"}
                trend={profit >= 0 ? "+24%" : "-8%"}
                isPositive={profit >= 0}
              />
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <MdCompareArrows className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Performance Metrics</h2>
                  <p className="text-gray-600">Key performance indicators for <span className="text-red-400 font-bold">{getSelectedDsrName()}</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="text-sm font-medium text-blue-800">Collection Efficiency</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {totalIssued > 0 ? Math.round((totalCollection / totalIssued) * 100) : 0}%
                  </div>
                  <div className="text-xs text-blue-700 mt-1">Collection vs Issued Ratio</div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl">
                  <div className="text-sm font-medium text-emerald-800">Profit Margin</div>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">
                    {totalCollection > 0 ? Math.round((profit / totalCollection) * 100) : 0}%
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">Net Profit Percentage</div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl">
                  <div className="text-sm font-medium text-amber-800">Return Rate</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">
                    {report?.returned.length || 0} items
                  </div>
                  <div className="text-xs text-amber-700 mt-1">Total Product Returns</div>
                </div>
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setChartType("pie")}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    chartType === "pie" 
                      ? "bg-blue-100 text-blue-700 border border-blue-300" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <MdPieChart />
                  Pie Chart
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    chartType === "bar" 
                      ? "bg-blue-100 text-blue-700 border border-blue-300" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <MdBarChart />
                  Bar Chart
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    chartType === "line" 
                      ? "bg-blue-100 text-blue-700 border border-blue-300" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <MdShowChart />
                  Line Chart
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Issued Products */}
              <DetailCard 
                title="📦 Issued Products" 
                count={report?.issued.length || 0}
                icon={<MdInventory />}
                color="blue"
              >
                {report?.issued.length === 0 ? (
                  <EmptyMessage />
                ) : (
                  report?.issued.map((item, idx) => (
                    <DetailRow
                      key={idx}
                      title={`${item.productId?.name || 'Product'}`}
                      subtitle={`${item.quantity} pic @ ${formatCurrency(item.price)}`}
                      value={formatCurrency(item.quantity * item.price)}
                      badge={`${item.quantity} units`}
                    />
                  ))
                )}
              </DetailCard>

              {/* Returned Products */}
              <DetailCard 
                title="↩️ Returned Products" 
                count={report?.returned.length || 0}
                icon={<MdTrendingDown />}
                color="amber"
              >
                {report?.returned.length === 0 ? (
                  <EmptyMessage />
                ) : (
                  report?.returned.map((item, idx) => (
                    <DetailRow
                      key={idx}
                      title={`${item.productId?.name || 'Product'}`}
                      subtitle={`${item.quantity} units returned`}
                      value={item.reason || "No reason provided"}
                      badge="Returned"
                      isReturn={true}
                    />
                  ))
                )}
              </DetailCard>

              {/* Expenses */}
              <DetailCard 
                title="💸 Expenses" 
                count={report?.expenses.length || 0}
                icon={<MdReceipt />}
                color="red"
              >
                {report?.expenses.length === 0 ? (
                  <EmptyMessage />
                ) : (
                  report?.expenses.map((expense, idx) => (
                    <DetailRow
                      key={idx}
                      title={expense.reason}
                      subtitle={new Date(expense.date).toLocaleDateString()}
                      value={formatCurrency(expense.amount)}
                      badge="Expense"
                    />
                  ))
                )}
              </DetailCard>

              {/* Collections */}
              <DetailCard 
                title="💰 Collections" 
                count={report?.collections.length || 0}
                icon={<MdAttachMoney />}
                color="emerald"
              >
                {report?.collections.length === 0 ? (
                  <EmptyMessage />
                ) : (
                  report?.collections.map((collection, idx) => (
                    <DetailRow
                      key={idx}
                      title={collection.reason}
                      subtitle={new Date(collection.date).toLocaleDateString()}
                      value={formatCurrency(collection.amount)}
                      badge="Collection"
                    />
                  ))
                )}
              </DetailCard>
            </div>
          </>
        ) : (
          // Empty State
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Report Data Available</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Select a DSR and date range to view detailed performance reports and analytics
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={loadReport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
              >
                <MdRefresh />
                Load Report
              </button>
              {dsrList.length === 0 && (
                <button
                  onClick={loadDSRList}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
                >
                  <MdPerson />
                  Load DSR List
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Admin Dashboard • Report generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */
function SummaryCard({ title, value, icon, color, trend, isPositive }) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
    red: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
    emerald: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200',
    amber: 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200',
  };

  return (
    <div className={`rounded-2xl p-5 border ${colorClasses[color]} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color === 'blue' ? 'bg-blue-100' : color === 'red' ? 'bg-red-100' : color === 'emerald' ? 'bg-emerald-100' : color === 'purple' ? 'bg-purple-100' : 'bg-amber-100'}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <MdTrendingUp /> : <MdTrendingDown />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}

function DetailCard({ title, count, icon, color, children }) {
  const colorClasses = {
    blue: 'border-blue-200',
    red: 'border-red-200',
    emerald: 'border-emerald-200',
    amber: 'border-amber-200',
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border ${colorClasses[color]}`}>
      <div className={`p-4 border-b ${color === 'blue' ? 'bg-blue-50' : color === 'red' ? 'bg-red-50' : color === 'emerald' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'red' ? 'bg-red-100 text-red-600' : color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {icon}
            </div>
            <h3 className="font-bold text-gray-800">{title}</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color === 'blue' ? 'bg-blue-100 text-blue-800' : color === 'red' ? 'bg-red-100 text-red-800' : color === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {count} items
          </span>
        </div>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function DetailRow({ title, subtitle, value, badge, isReturn }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            isReturn 
              ? 'bg-amber-100 text-amber-800'
              : badge === 'Collection'
              ? 'bg-emerald-100 text-emerald-800'
              : badge === 'Expense'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {badge}
          </span>
        )}
        <span className={`font-medium whitespace-nowrap ${
          isReturn 
            ? 'text-amber-600'
            : value.includes('৳') && !value.startsWith('-')
            ? 'text-emerald-600'
            : value.includes('৳') && value.startsWith('-')
            ? 'text-red-600'
            : 'text-gray-700'
        }`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function EmptyMessage() {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-gray-500">No data available for this category</p>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import axios from "../api/axios";

// export default function AdminDSRSummary() {
//   const [dsrList, setDsrList] = useState([]);
//   const [selectedDsr, setSelectedDsr] = useState("");
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [type, setType] = useState("daily"); // daily / monthly / yearly
//   const [date, setDate] = useState("");
//   const [month, setMonth] = useState("");
//   const [year, setYear] = useState(new Date().getFullYear());

//   // Load all DSR users
//   const loadDSRList = async () => {
//     try {
//       const res = await axios.get("/auth/dsrs"); // backend: fetch all DSR users
//       setDsrList(res.data);
//       if (res.data.length > 0) setSelectedDsr(res.data[0]._id);
//     } catch (err) {
//       console.error("Failed to load DSR list", err);
//     }
//   };

//   // Load report
//   const loadReport = async () => {
//     if (!selectedDsr) return;
//     try {
//       setLoading(true);
//       const params = { dsrId: selectedDsr, type };
//       if (type === "daily") params.date = date || new Date().toISOString().slice(0, 10);
//       if (type === "monthly") {
//         params.month = month || new Date().getMonth() + 1;
//         params.year = year;
//       }
//       if (type === "yearly") params.year = year;

//       const res = await axios.get("/dsr-report", { params });
//       setReport(res.data);
//     } catch (err) {
//       console.error("Failed to load report", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDSRList();
//   }, []);

//   useEffect(() => {
//     if (selectedDsr) loadReport();
//   }, [selectedDsr, type, date, month, year]);

//   if (loading) return <p className="p-6">Loading report...</p>;
//   if (!report) return <p className="p-6">No report found</p>;

//   const totalIssued = report.issued.reduce((sum, i) => sum + i.quantity * i.price, 0);
//   const totalExpense = report.expenses.reduce((sum, e) => sum + e.amount, 0);
//   const totalCollection = report.collections.reduce((sum, c) => sum + c.amount, 0);
//   const profit = totalCollection - totalExpense;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">📊 Admin DSR Report</h1>

//       {/* ================= SELECTORS ================= */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
//         {/* DSR Dropdown */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Select DSR</label>
//           <select
//             value={selectedDsr}
//             onChange={(e) => setSelectedDsr(e.target.value)}
//             className="border rounded p-2 w-full md:w-48"
//           >
//             {dsrList.map((d) => (
//               <option key={d._id} value={d._id}>
//                 {d.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Report Type */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Report Type</label>
//           <select
//             value={type}
//             onChange={(e) => setType(e.target.value)}
//             className="border rounded p-2 w-full md:w-48"
//           >
//             <option value="daily">Daily</option>
//             <option value="monthly">Monthly</option>
//             <option value="yearly">Yearly</option>
//           </select>
//         </div>

//         {/* Dynamic Inputs */}
//         {type === "daily" && (
//           <div>
//             <label className="block text-sm font-medium mb-1">Select Date</label>
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="border rounded p-2 w-full md:w-48"
//             />
//           </div>
//         )}

//         {type === "monthly" && (
//           <>
//             <div>
//               <label className="block text-sm font-medium mb-1">Month</label>
//               <select
//                 value={month}
//                 onChange={(e) => setMonth(e.target.value)}
//                 className="border rounded p-2 w-full md:w-48"
//               >
//                 {Array.from({ length: 12 }, (_, i) => (
//                   <option key={i} value={i + 1}>
//                     {new Date(0, i).toLocaleString("en", { month: "long" })}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Year</label>
//               <input
//                 type="number"
//                 value={year}
//                 onChange={(e) => setYear(e.target.value)}
//                 className="border rounded p-2 w-full md:w-48"
//               />
//             </div>
//           </>
//         )}

//         {type === "yearly" && (
//           <div>
//             <label className="block text-sm font-medium mb-1">Year</label>
//             <input
//               type="number"
//               value={year}
//               onChange={(e) => setYear(e.target.value)}
//               className="border rounded p-2 w-full md:w-48"
//             />
//           </div>
//         )}

//         <button
//           onClick={loadReport}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Load Report
//         </button>
//       </div>

//       {/* ================= SUMMARY ================= */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <SummaryCard title="Issued Value" value={totalIssued} />
//         <SummaryCard title="Expense" value={totalExpense} />
//         <SummaryCard title="Collection" value={totalCollection} />
//         <SummaryCard title="Profit" value={profit} highlight={profit >= 0} />
//       </div>

//       {/* ================= DETAILS ================= */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card title="📦 Issued Products">
//           {report.issued.length === 0 ? <Empty /> :
//             report.issued.map((i, idx) => (
//               <Row
//                 key={idx}
//                 left={`${i.productId?.name} (${i.quantity} ${i.productId?.unit || ""})`}
//                 right={`${i.quantity * i.price} tk`}
//               />
//             ))
//           }
//         </Card>

//         <Card title="↩️ Returned Products">
//           {report.returned.length === 0 ? <Empty /> :
//             report.returned.map((r, idx) => (
//               <Row
//                 key={idx}
//                 left={`${r.productId?.name} (${r.quantity})`}
//                 right={r.reason || "-"}
//               />
//             ))
//           }
//         </Card>

//         <Card title="💸 Expenses">
//           {report.expenses.length === 0 ? <Empty /> :
//             report.expenses.map((e, idx) => (
//               <Row key={idx} left={e.reason} right={`${e.amount} tk`} />
//             ))
//           }
//         </Card>

//         <Card title="💰 Collections">
//           {report.collections.length === 0 ? <Empty /> :
//             report.collections.map((c, idx) => (
//               <Row key={idx} left={c.reason} right={`${c.amount} tk`} />
//             ))
//           }
//         </Card>
//       </div>
//     </div>
//   );
// }

// /* ================= REUSABLE COMPONENTS ================= */
// function SummaryCard({ title, value, highlight }) {
//   return (
//     <div className={`p-4 rounded shadow text-center ${
//       highlight === false ? "bg-red-100 text-red-700" :
//       highlight === true ? "bg-green-100 text-green-700" :
//       "bg-white"
//     }`}>
//       <p className="text-sm">{title}</p>
//       <p className="text-xl font-bold">{value} tk</p>
//     </div>
//   );
// }

// function Card({ title, children }) {
//   return (
//     <div className="bg-white rounded shadow p-4">
//       <h2 className="font-semibold mb-3">{title}</h2>
//       {children}
//     </div>
//   );
// }

// function Row({ left, right }) {
//   return (
//     <div className="flex justify-between border-b py-1 text-sm">
//       <span>{left}</span>
//       <span className="font-medium">{right}</span>
//     </div>
//   );
// }

// function Empty() {
//   return <p className="text-sm text-gray-400">No data found</p>;
// }
