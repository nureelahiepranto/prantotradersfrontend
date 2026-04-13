// // src/pages/PrintInvoice.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import api from '../api/axios';
// import { useParams } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// export default function PrintInvoice(){
//   const { saleId } = useParams();
//   const [sale, setSale] = useState(null);
//   const printRef = useRef();

//   useEffect(()=> {
//     const load = async () => {
//       try {
//         const res = await api.get(`/sales/${saleId}`);
//         setSale(res.data);
//       } catch(err) {
//         console.error(err);
//         alert('Failed to load invoice');
//       }
//     };
//     load();
//   }, [saleId]);

//   const doPrint = () => window.print();

//   const downloadPDF = async () => {
//     if (!printRef.current) return;
//     const element = printRef.current;
//     const canvas = await html2canvas(element, { scale: 2 });
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`invoice_${saleId}.pdf`);
//   };

//   if (!sale) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="p-6 container-max mx-auto">
//       <div className="flex items-center justify-between mb-4 no-print">
//         <h2 className="text-2xl font-bold">Invoice #{sale._id.slice(-8)}</h2>
//         <div className="flex gap-2">
//           <button onClick={doPrint} className="px-3 py-1 bg-blue-600 text-white rounded">Print</button>
//           <button onClick={downloadPDF} className="px-3 py-1 bg-green-600 text-white rounded">Download PDF</button>
//         </div>
//       </div>

//       <div ref={printRef} className="bg-white p-6 rounded shadow print:shadow-none">
//         <div className="flex justify-between mb-4">
//           <div>
//             <div className="font-bold">Dealer Name</div>
//             <div className="text-sm">Dealer address line</div>
//           </div>
//           <div className="text-right">
//             <div>Invoice Date: {new Date(sale.date).toLocaleString()}</div>
//             <div>DSR: {sale.dsr?.name || '—'}</div>
//           </div>
//         </div>

//         <table className="w-full mb-4">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 text-left">Product</th>
//               <th className="p-2 text-center">Qty</th>
//               <th className="p-2 text-right">Price</th>
//               <th className="p-2 text-right">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sale.items.map((it, idx) => (
//               <tr key={idx}>
//                 <td className="p-2">{it.product?.name || '—'}</td>
//                 <td className="p-2 text-center">{it.qty}</td>
//                 <td className="p-2 text-right">{Number(it.price).toFixed(2)}</td>
//                 <td className="p-2 text-right">{(it.qty * it.price).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="text-right">
//           <div className="text-lg font-bold">Total: {Number(sale.totalAmount).toFixed(2)} ৳</div>
//           <div>Paid: {Number(sale.paidAmount).toFixed(2)} ৳</div>
//           <div>Due: {Number(sale.dueAmount).toFixed(2)} ৳</div>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/pages/PrintInvoice.jsx
// src/pages/PrintInvoice.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaPrint, FaDownload, FaFileInvoice, FaCalendarAlt, FaUserTie, FaStore, FaPhone, FaArrowLeft, FaCheckCircle, FaClock } from "react-icons/fa";
import { MdPayment, MdAttachMoney } from "react-icons/md";

export default function PrintInvoice() {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sales/${saleId}`);
        setSale(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [saleId]);

  const doPrint = () => window.print();

  const downloadPDF = async () => {
    if (!printRef.current || downloading) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${saleId}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFileInvoice className="text-3xl text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h3>
          <p className="text-gray-600 mb-6">The requested invoice could not be loaded. Please check the ID and try again.</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPaid = sale.dueAmount === 0;
  const paidPercentage = (sale.paidAmount / sale.totalAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header with Actions */}
      <div className="max-w-6xl mx-auto mb-8 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <FaFileInvoice className="text-xl text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-500' : 'bg-amber-500'} shadow-sm`}>
                  {isPaid ? <FaCheckCircle className="text-xs text-white" /> : <FaClock className="text-xs text-white" />}
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Invoice <span className="text-blue-600">#{sale._id.slice(-8)}</span>
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <FaCalendarAlt /> {new Date(sale.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={doPrint}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <FaPrint className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Print Invoice</span>
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaDownload className="group-hover:scale-110 transition-transform" />
              )}
              <span className="font-semibold">
                {downloading ? 'Generating...' : 'Download PDF'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">৳{Number(sale.totalAmount).toFixed(2)}</p>
              </div>
              <MdAttachMoney className="text-2xl text-blue-500" />
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-600 font-medium">Paid Amount</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">৳{Number(sale.paidAmount).toFixed(2)}</p>
              </div>
              <MdPayment className="text-2xl text-green-500" />
            </div>
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm ${isPaid ? 'bg-gradient-to-br from-green-50 to-white border-green-100' : 'bg-gradient-to-br from-amber-50 to-white border-amber-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-sm ${isPaid ? 'text-green-600' : 'text-amber-600'} font-medium`}>
                  {isPaid ? 'Payment Status' : 'Due Amount'}
                </p>
                <p className={`text-2xl font-bold mt-1 ${isPaid ? 'text-green-700' : 'text-amber-700'}`}>
                  {isPaid ? 'Paid' : `৳${Number(sale.dueAmount).toFixed(2)}`}
                </p>
              </div>
              {isPaid ? (
                <FaCheckCircle className="text-2xl text-green-500" />
              ) : (
                <FaClock className="text-2xl text-amber-500" />
              )}
            </div>
            <div className={`h-2 ${isPaid ? 'bg-green-100' : 'bg-amber-100'} rounded-full overflow-hidden`}>
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}
                style={{ width: `${isPaid ? 100 : (100 - paidPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto">
        <div
          ref={printRef}
          className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaFileInvoice className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">INVOICE</h2>
                    <p className="text-blue-100">#{sale._id.slice(-8)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaStore className="opacity-80" />
                    <span className="font-semibold">Dealer Information</span>
                  </div>
                  <p className="text-lg font-semibold">Dealer Name</p>
                  <p className="text-blue-100">Dealer Address Line 1</p>
                  <p className="text-blue-100">Dealer Address Line 2</p>
                  <p className="text-blue-100">City, State, ZIP Code</p>
                  <div className="flex items-center gap-2 mt-2">
                    <FaPhone className="opacity-80" />
                    <span className="text-blue-100">Phone: 01XXXXXXXXX</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 min-w-[280px]">
                <h3 className="text-lg font-bold mb-4">Invoice Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Invoice Date:</span>
                    <span className="font-semibold">{new Date(sale.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Invoice Time:</span>
                    <span className="font-semibold">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">DSR:</span>
                    <span className="font-semibold">{sale.dsr?.name || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/20">
                    <span className="text-blue-100">Status:</span>
                    <span className={`font-bold ${isPaid ? 'text-green-300' : 'text-amber-300'}`}>
                      {isPaid ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6 md:p-8">
            <div className="mb-2 flex items-center gap-2">
              <div className="w-2 h-5 bg-blue-600 rounded"></div>
              <h3 className="text-lg font-bold text-gray-800">Items Summary</h3>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="p-4 text-left font-semibold text-gray-700">Product</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Quantity</th>
                    <th className="p-4 text-right font-semibold text-gray-700">Unit Price</th>
                    <th className="p-4 text-right font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sale.items.map((it, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{it.product?.name || "—"}</div>
                        <div className="text-sm text-gray-500 mt-1">SKU: {it.product?.sku || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                          {it.qty}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-gray-700">
                        ৳{Number(it.price).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900">
                        ৳{(it.qty * it.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Amount Summary */}
            <div className="mt-8 flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Payment Terms</h4>
                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Payment due within 30 days of invoice date
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Please include invoice number with payment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Late payments subject to 2% monthly interest
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:w-96">
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Amount Summary</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">৳{Number(sale.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-gray-800">৳0.00</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                      <span className="text-lg font-bold text-gray-800">Total Amount</span>
                      <span className="text-xl font-bold text-gray-900">৳{Number(sale.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-medium text-green-600">৳{Number(sale.paidAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                      <span className={`text-lg font-bold ${isPaid ? 'text-green-700' : 'text-amber-700'}`}>
                        Balance Due
                      </span>
                      <span className={`text-xl font-bold ${isPaid ? 'text-green-700' : 'text-amber-700'}`}>
                        ৳{Number(sale.dueAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Authorized Signature</p>
                  <div className="mt-8 border-b border-gray-400 w-48"></div>
                </div>
                <div className="text-gray-500">
                  <p className="font-medium text-gray-700">Thank you for your business!</p>
                  <p className="text-sm mt-1">For any questions, contact: support@dealercompany.com | +880 1XXX XXXXXX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .no-print {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}