// src/components/StockHistory.js
import React, { useState, useEffect, useMemo } from "react";
import { Bar } from 'react-chartjs-2'; // Bar component can render 'line' type
import GaugeChart from 'react-gauge-chart';
import { format, parseISO } from 'date-fns'; // Correct
// import { ResponsiveTreeMap } from '@nivo/treemap'; // REMOVED TreeMap import
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import { BsFillGrid3X3GapFill, BsBarChartLineFill, BsSpeedometer2 } from "react-icons/bs"; // REMOVED BsGrid1X2Fill for Treemap
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";

ChartJS.register( CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend );

const productsData = [
  { id: 1, name: "Basmati Rice" }, { id: 2, name: "Jasmine Rice" }, { id: 3, name: "Red Rice" },
  { id: 4, name: "Mogra Rice" }, { id: 5, name: "Brown Rice" }, { id: 6, name: "Black Rice" },
  { id: 7, name: "Sona Masuri Rice" }, { id: 8, name: "Ambemohar Rice" }, { id: 9, name: "Kala Jeera Rice" },
  { id: 10, name: "Bamboo Rice" }, { id:11, name: "Premium Idly Rice" },
  { id: 12, name: "Crispy Dosa Rice"},
  { id:13, name: "Seeraga Samba Rice"}
];

const SIMULATED_YEAR = 2025;
const SALES_START_DATE = new Date(SIMULATED_YEAR, 1, 1); // February 1st
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function distributeSales(totalAmount, numSegments) {
  if (numSegments <= 0) return [];
  if (totalAmount <= 0) return Array(numSegments).fill(0);
  if (numSegments === 1) return [totalAmount];
  const segmentSales = Array(numSegments).fill(0);
  const basePerSegment = totalAmount / numSegments;
  for (let i = 0; i < numSegments; i++) segmentSales[i] = basePerSegment;
  for (let i = 0; i < numSegments * 2; i++) {
    const idx1 = Math.floor(Math.random() * numSegments);
    const idx2 = Math.floor(Math.random() * numSegments);
    if (idx1 !== idx2) {
      const shuffleAmount = Math.random() * (basePerSegment / 10);
      if (segmentSales[idx1] >= shuffleAmount) {
        segmentSales[idx1] -= shuffleAmount;
        segmentSales[idx2] += shuffleAmount;
      }
    }
  }
  const currentSum = segmentSales.reduce((acc, val) => acc + val, 0);
  if (currentSum !== totalAmount && numSegments > 0) segmentSales[numSegments - 1] += (totalAmount - currentSum);
  return segmentSales.map(s => Math.max(0, s));
}

const StockHistory = () => {
  const [stockItems, setStockItems] = useState([]);
  const [stockBarChartData, setStockBarChartData] = useState({ labels: [], datasets: [] });
  const [loadingStock, setLoadingStock] = useState(true);
  const [stockError, setStockError] = useState(null);
  const [stockViewMode, setStockViewMode] = useState('grid'); // Default view
  const [salesData, setSalesData] = useState(null);
  const [salesViewMode, setSalesViewMode] = useState('daily');
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchStockData = async () => {
      console.log("[StockHistory] Fetching stock data...");
      if (authLoading) { if (isMounted) setLoadingStock(true); console.log("[StockHistory] Auth loading, defer stock fetch."); return; }
      if (isMounted) { setLoadingStock(true); setStockError(null); }
      try {
        const response = await fetch('https://rice-mart.onrender.com/api/stocks');
        if (!response.ok) { const e = await response.json().catch(() => ({ message: `HTTP ${response.status}` })); throw new Error(e.message); }
        if (!isMounted) return;
        const fetchedStocks = await response.json();
        const processedStocks = productsData.map(product => {
          const dbStock = fetchedStocks.find(s => s.name === product.name);
          const bought = dbStock?.bought || 0;
          const available = Math.max(0, dbStock?.available || 0);
          const percentage = bought > 0 ? Math.max(0, Math.round((available / bought) * 100)) : 0;
          const sold = Math.max(0, bought - available);
          return { ...product, bought, available, percentage, sold };
        }).sort((a, b) => b.sold - a.sold);
        if (isMounted) {
          console.log("[StockHistory] Stock data fetched and processed:", processedStocks);
          setStockItems(processedStocks);
          setStockBarChartData({
            labels: processedStocks.map(item => item.name),
            datasets: [
              { label: 'Initial (kg)', data: processedStocks.map(i => i.bought), backgroundColor: 'rgba(201,203,207,0.6)', borderColor: 'rgba(150,153,157,1)', borderWidth: 1, borderRadius: 3, barThickness: 18, order: 1 },
              { label: 'Available (kg)', data: processedStocks.map(i => i.available), backgroundColor: 'rgba(75, 192, 192, 0.8)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1, borderRadius: 3, barThickness: 18, order: 2 },
            ]
          });
        }
      } catch (err) {
        if (isMounted) { console.error('[StockHistory] Err fetch stock:', err); setStockError(err.message || 'Failed to load stock data.'); setStockItems([]); setStockBarChartData({ labels: [], datasets: [] }); }
      } finally {
        if (isMounted) setLoadingStock(false);
        console.log("[StockHistory] Stock fetch finished. LoadingStock:", false);
      }
    };
    fetchStockData();
    return () => { isMounted = false; console.log("[StockHistory] Stock fetch effect unmounted"); };
  }, [authLoading, user]);

  useEffect(() => {
    let isMounted = true;
    console.log("[SalesDataEffect] Triggered. AuthLoading:", authLoading, "User:", !!user, "LoadingStock:", loadingStock, "StockItemsCount:", stockItems.length, "SalesViewMode:", salesViewMode);

    const generateSalesData = async () => {
      if (authLoading || !user || loadingStock || stockItems.length === 0) {
        if (isMounted) setSalesLoading(authLoading || loadingStock);
        console.log("[SalesDataEffect] Conditions not met, returning early. Set salesLoading to:", authLoading || loadingStock);
        if(stockItems.length === 0 && !loadingStock){
            console.warn("[SalesDataEffect] StockItems is empty but stock is not loading. Sales graph will not show.");
             if (isMounted) setSalesData({ period: salesViewMode, labels: [], values: [] });
        }
        return;
      }
      if (isMounted) { setSalesLoading(true); setSalesError(null); }
      console.log("[SalesDataEffect] Generating sales data now...");

      try {
        const simulatedCurrentJsDate = new Date(SIMULATED_YEAR, 5, 15);
        console.log("[SalesDataEffect] SALES_START_DATE:", SALES_START_DATE.toDateString(), "simulatedCurrentJsDate:", simulatedCurrentJsDate.toDateString());

        if (simulatedCurrentJsDate < SALES_START_DATE) {
          console.log("[SalesDataEffect] Simulated current date is before sales start date. Setting empty sales data.");
          if (isMounted) setSalesData({ period: salesViewMode, labels: [], values: [] });
          return;
        }

        const totalEverSold = stockItems.reduce((acc, item) => acc + (item.sold > 0 ? item.sold : 0), 0);
        const allDailySalesSegments = [];
        const dayLabelsFull = [];
        let currentDatePointer = new Date(SALES_START_DATE);
        while (currentDatePointer <= simulatedCurrentJsDate) {
          dayLabelsFull.push(new Date(currentDatePointer));
          currentDatePointer.setDate(currentDatePointer.getDate() + 1);
        }
        const numTotalDays = dayLabelsFull.length;
        console.log('[SalesDataEffect] Total ever sold:', totalEverSold, 'Num total days for sales calc:', numTotalDays);

        let distributedDailySales = [];
        if (numTotalDays > 0 && totalEverSold > 0) {
          distributedDailySales = distributeSales(totalEverSold, numTotalDays);
        } else if (numTotalDays > 0) {
          distributedDailySales = Array(numTotalDays).fill(0);
        }
        for (let i = 0; i < numTotalDays; i++) allDailySalesSegments.push({ date: dayLabelsFull[i], sales: distributedDailySales[i] || 0 });
        console.log('[SalesDataEffect] allDailySalesSegments count:', allDailySalesSegments.length);
        if (allDailySalesSegments.length > 0) console.log('[SalesDataEffect] First daily segment example:', allDailySalesSegments[0]);


        let displayLabels = [];
        let displayCumulativeValues = [];
        let iterMonth; // Declare iterMonth here

        if (salesViewMode === 'monthly') {
          console.log('[SalesDataEffect] Processing MONTHLY sales view.');
          const monthlyAggregated = {};
          allDailySalesSegments.forEach(ds => {
            const monthYearKey = `${MONTH_NAMES_SHORT[ds.date.getMonth()]} ${ds.date.getFullYear()}`;
            monthlyAggregated[monthYearKey] = (monthlyAggregated[monthYearKey] || 0) + ds.sales;
          });
          let cumulativeSales = 0;
          iterMonth = new Date(SALES_START_DATE); // Initialize iterMonth
          while(iterMonth <= simulatedCurrentJsDate) {
            const monthLabel = MONTH_NAMES_SHORT[iterMonth.getMonth()];
            const monthYearKey = `${monthLabel} ${iterMonth.getFullYear()}`;
            const salesThisMonth = monthlyAggregated[monthYearKey] || 0;
            cumulativeSales += salesThisMonth;
            displayLabels.push(monthLabel);
            displayCumulativeValues.push(cumulativeSales);
            iterMonth.setMonth(iterMonth.getMonth() + 1);
            iterMonth.setDate(1); 
            if (iterMonth.getFullYear() > simulatedCurrentJsDate.getFullYear() || 
                (iterMonth.getFullYear() === simulatedCurrentJsDate.getFullYear() && iterMonth.getMonth() > simulatedCurrentJsDate.getMonth())) {
                break;
            }
          }
          console.log('[SalesDataEffect Monthly] displayLabels:', JSON.stringify(displayLabels));
        } else if (salesViewMode === 'weekly') {
          console.log('[SalesDataEffect] Processing WEEKLY sales view.');
          const WEEKS_TO_SHOW = 5;
          const weeklyAggregated = [];
          if (allDailySalesSegments.length > 0) {
            let currentWeekSales = 0;
            for (let i = 0; i < allDailySalesSegments.length; i++) {
              const daily = allDailySalesSegments[i];
              currentWeekSales += daily.sales;
              if (daily.date.getDay() === 0 || i === allDailySalesSegments.length - 1) {
                weeklyAggregated.push({ weekEnding: new Date(daily.date), sales: currentWeekSales });
                currentWeekSales = 0;
              }
            }
          }
          const relevantWeeklySegments = weeklyAggregated.slice(-WEEKS_TO_SHOW);
          let cumulativeSales = weeklyAggregated.slice(0, -relevantWeeklySegments.length).reduce((sum, w) => sum + w.sales, 0);
          relevantWeeklySegments.forEach(week => {
            displayLabels.push(`Wk End ${week.weekEnding.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
            cumulativeSales += week.sales;
            displayCumulativeValues.push(cumulativeSales);
          });
          console.log('[SalesDataEffect Weekly] displayLabels:', JSON.stringify(displayLabels));
        } else if (salesViewMode === 'daily') {
          console.log('[SalesDataEffect] Processing DAILY sales view.');
          const DAYS_TO_SHOW = 7;
          const relevantDailySegments = allDailySalesSegments.slice(-DAYS_TO_SHOW);
          console.log('[SalesDataEffect Daily] relevantDailySegments count:', relevantDailySegments.length);
          let cumulativeSales = allDailySalesSegments.slice(0, -relevantDailySegments.length).reduce((sum, d) => sum + d.sales, 0);
          relevantDailySegments.forEach(day => {
            displayLabels.push(DAY_NAMES_SHORT[day.date.getDay()]);
            cumulativeSales += day.sales;
            displayCumulativeValues.push(cumulativeSales);
          });
          console.log('[SalesDataEffect Daily] Populated displayLabels:', JSON.stringify(displayLabels));
        }

        if (isMounted) {
          console.log('[SalesDataEffect] Setting salesData. Labels count:', displayLabels.length, 'Values count:', displayCumulativeValues.length);
          setSalesData({ period: salesViewMode, labels: displayLabels, values: displayCumulativeValues });
        }
      } catch (error) {
        if (isMounted) { console.error(`[SalesDataEffect] Error processing ${salesViewMode} sales:`, error); setSalesError(error.message || `Failed to generate ${salesViewMode} sales data`); setSalesData(null); }
      } finally {
        if (isMounted) { setSalesLoading(false); console.log("[SalesDataEffect] Sales data generation finished. SalesLoading:", false); }
      }
    };

    generateSalesData();
    return () => { isMounted = false; console.log("[SalesDataEffect] Sales effect unmounted");};
  }, [authLoading, user, salesViewMode, loadingStock, stockItems]);

  const stockChartOptions = useMemo(() => ({ 
     responsive: true, maintainAspectRatio: false, indexAxis: 'y', interaction: { mode: 'index', intersect: false, axis: 'y' },
     scales: { x: { stacked: false, beginAtZero: true, title: { display: true, text: 'Quantity (kg)', font: { size: 14 }, color: '#4a5568' }, ticks: { color: '#4a5568' }, grid: { color: 'rgba(200, 200, 200, 0.3)' } }, y: { stacked: false, ticks: { color: '#4a5568', font: { size: 11 } }, grid: { display: true, color: 'rgba(226, 232, 240, 0.9)', drawBorder: false } } },
     plugins: {
         legend: { position: 'top', align: 'center', labels: { font: { size: 13 }, color: '#333', usePointStyle: true, boxWidth: 10, padding: 20 } },
         title: { display: true, text: 'Current Rice Stock Levels (Sorted by Sales)', font: { size: 18, weight: 'bold' }, color: '#2c3e50', padding: { top: 10, bottom: 25 } },
         tooltip: {
             enabled: true, mode: 'index', intersect: false, backgroundColor: 'rgba(40, 40, 40, 0.9)', titleFont: { size: 13, weight: 'bold' }, titleColor: '#eee', bodyFont: { size: 12 }, bodyColor: '#eee', bodySpacing: 4, boxPadding: 6, padding: 10,
             callbacks: {
                 title: (tooltipItems) => tooltipItems[0]?.label || '',
                 label: () => '',
                 afterBody: (tooltipItems) => {
                     if (!tooltipItems || tooltipItems.length === 0) return [];
                     const currentLabel = tooltipItems[0].label;
                     const item = stockItems.find(s => s.name === currentLabel);
                     if (item) {
                         return [ `Initial:    ${item.bought} kg`, `Sold:       ${item.sold} kg`, `Available:  ${item.available} kg` ];
                     }
                     return [];
                 },
                 labelColor: () => false 
             }
         }
     },
     animation: { duration: 800, easing: 'easeOutQuad' },
     elements: { bar: { borderSkipped: 'start' } }
  }), [stockItems]);

  const salesChartOptions = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 13 }, color: '#333' } },
          title: { display: false } 
      },
      scales: {
          y: {
              beginAtZero: true,
              title: { display: true, text: 'Cumulative Quantity Sold (kg)', font: { size: 14 }, color: '#4a5568' },
              ticks: { color: '#4a5568' }
          },
          x: {
              title: { display: true, text: salesData?.period ? `${salesData.period.charAt(0).toUpperCase() + salesData.period.slice(1)} View` : 'Period', font: {size: 14}, color: '#4a5568' },
              ticks: { color: '#4a5568', font: { size: 11 }}
          }
      },
      interaction: { mode: 'index', intersect: false },
      tooltip: {
          backgroundColor: 'rgba(40, 40, 40, 0.9)', titleFont: { size: 13, weight: 'bold' }, titleColor: '#eee', bodyFont: { size: 12 }, bodyColor: '#eee',
          callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.y !== null) { label += parseFloat(context.parsed.y.toFixed(2)) + ' kg'; } 
                return label;
            }
          }
      }
  }), [salesData]); 

  // REMOVED treemapData useMemo hook

  const salesChartDisplayData = useMemo(() => ({
      labels: salesData?.labels || [],
      datasets: [{
          type: 'line',
          label: 'Cumulative Sales',
          data: salesData?.values || [],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)'
      }]
  }), [salesData]);

  const getProgressBarColor = (p) => { if (p<=20) return"bg-red-500"; if (p<=50) return"bg-yellow-500"; return"bg-green-500";};
  const gridContainerStagger = { hidden:{opacity:1}, visible:{opacity:1, transition:{staggerChildren:0.06, delayChildren:0.1}}};
  const gridItemVariant = { hidden:{y:25, opacity:0}, visible:{y:0, opacity:1, transition:{type:'spring', stiffness:90, mass:0.8}}};
  const viewBlockVariant = { initial:{opacity:0, y:10}, animate:{opacity:1, y:0}, exit:{opacity:0, y:-10}, transition:{duration:0.35, ease:"easeInOut"}};
  const pageBackground = "bg-gradient-to-br from-sky-100 to-cyan-100";

  if (authLoading || (loadingStock && stockItems.length === 0 && !stockError) ) {
      console.log("[StockHistory Render] Showing main loader. AuthLoading:", authLoading, "LoadingStock:", loadingStock, "StockItems empty:", stockItems.length === 0);
      return <div className={`flex min-h-screen items-center justify-center ${pageBackground} p-4`}><p className="text-xl text-slate-600 animate-pulse">Loading Data...</p></div>;
  }
  if (stockError) {
      console.log("[StockHistory Render] Showing stock error:", stockError);
      return <div className={`flex min-h-screen items-center justify-center ${pageBackground} p-4`}><div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md"><h3 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Stock</h3><p className="text-gray-700">{stockError}</p><button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150">Try Again</button></div></div>;
  }
  console.log("[StockHistory Render] Rendering main content. SalesData labels count:", salesData?.labels?.length);


  return (
    <div className={`flex flex-col min-h-screen ${pageBackground} p-4 sm:p-6 overflow-x-hidden`}>
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-8 mt-16 sm:mt-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-slate-800"> Stock & Sales Overview </h1>
        
        <section className="mb-12 sm:mb-16 bg-white rounded-xl shadow-xl p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-5 text-center text-slate-700"> Current Stock Levels </h2>
          <div className="flex flex-wrap justify-center mb-6 sm:mb-8 gap-2 sm:gap-3">
              <motion.button aria-label="Stock Grid View" onClick={() => setStockViewMode('grid')} className={`px-3 py-2 text-xs sm:text-sm rounded-lg shadow font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${ stockViewMode === 'grid' ? 'bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} whileHover={{scale:stockViewMode!=='grid'?1.05:1.0}} whileTap={{scale:0.95}}> <BsFillGrid3X3GapFill/> Grid </motion.button>
              <motion.button aria-label="Stock Chart View" onClick={() => setStockViewMode('chart')} className={`px-3 py-2 text-xs sm:text-sm rounded-lg shadow font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${ stockViewMode === 'chart' ? 'bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} whileHover={{scale:stockViewMode!=='chart'?1.05:1.0}} whileTap={{scale:0.95}}> <BsBarChartLineFill/> Chart </motion.button>
              <motion.button aria-label="Stock Gauge View" onClick={() => setStockViewMode('gauge')} className={`px-3 py-2 text-xs sm:text-sm rounded-lg shadow font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${ stockViewMode === 'gauge' ? 'bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} whileHover={{scale:stockViewMode!=='gauge'?1.05:1.0}} whileTap={{scale:0.95}}> <BsSpeedometer2/> Gauge </motion.button>
              {/* REMOVED Treemap Button */}
          </div>
          <div className="min-h-[400px] sm:min-h-[450px] w-full relative">
              <AnimatePresence mode='wait'>
                  {stockViewMode === 'grid' && ( <motion.div key="stock-grid-view" variants={viewBlockVariant} initial="initial" animate="animate" exit="exit" > <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" variants={gridContainerStagger} initial="hidden" animate="visible" > {stockItems.map((item) => ( <motion.div key={item.id} className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300" variants={gridItemVariant} whileHover={{ y: -4, transition:{ duration: 0.2 } }} > <div> <h4 className="text-base font-semibold text-slate-800 mb-2.5 truncate" title={item.name}>{item.name}</h4> <div className="w-full bg-slate-200 rounded-full h-3.5 mb-1.5 overflow-hidden shadow-inner"> <motion.div className={`h-full rounded-full ${getProgressBarColor(item.percentage)} flex items-center justify-end`} initial={{ width: '0%' }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 0.7, ease: "easeOut" }} title={`${item.percentage}% Available`}> {item.percentage > 15 && (<span className="text-white text-[9px] font-bold px-1.5 leading-none">{item.percentage}%</span>)} </motion.div> </div> <div className="flex justify-between text-xs text-slate-600 mb-0.5"><span>Avail: {item.available} kg</span><span>Sold: {item.sold} kg</span></div> <p className="text-xs text-slate-400 text-right">Initial: {item.bought} kg</p> </div> <div className={`w-2.5 h-2.5 ${getProgressBarColor(item.percentage)} rounded-full self-end mt-1.5`}></div> </motion.div> ))} </motion.div> </motion.div> )}
                  {stockViewMode === 'chart' && ( <motion.div key="stock-chart-view" variants={viewBlockVariant} initial="initial" animate="animate" exit="exit" className="bg-white p-4 sm:p-6 rounded-xl shadow-inner border border-slate-200" > <div style={{ height: stockItems.length > 5 ? `${stockItems.length * 60}px` : '450px', minHeight: '400px' }}> {stockItems.length > 0 ? (<Bar options={stockChartOptions} data={stockBarChartData} />) : (<p className="text-center text-gray-500 pt-10">No stock data available.</p>)} </div> </motion.div> )}
                  {stockViewMode === 'gauge' && ( <motion.div key="stock-gauge-view" variants={viewBlockVariant} initial="initial" animate="animate" exit="exit" > <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5" variants={gridContainerStagger} initial="hidden" animate="visible"> {stockItems.map((item) => ( <motion.div key={`${item.id}-gauge`} className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden p-3 sm:p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow" variants={gridItemVariant} whileHover={{ y: -4 }} > <h4 className="text-sm font-semibold text-slate-700 mb-1 truncate w-full" title={item.name}>{item.name}</h4> <GaugeChart id={`gauge-${item.id}`} style={{width: '85%', marginBottom:'-10px'}} nrOfLevels={20} arcsLength={[0.2, 0.3, 0.5]} colors={['#ef4444', '#f59e0b', '#22c55e']} percent={item.percentage / 100} arcPadding={0.02} cornerRadius={3} textColor="#444" fontSize="16px" needleColor="#ccc" needleBaseColor="#aaa"/> <p className="text-xs text-slate-500 mt-1.5">Av: {item.available}/{item.bought}kg (Sold: {item.sold}kg)</p> </motion.div> ))} </motion.div> </motion.div> )}
                  {/* REMOVED Treemap View Content */}
              </AnimatePresence>
            </div>
        </section>

        <section className="mb-12 sm:mb-16 bg-white rounded-xl shadow-xl p-4 sm:p-6">
             <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-slate-700"> Sales Analysis </h2>
             <div className="flex flex-wrap justify-center mb-6 sm:mb-8 gap-2 sm:gap-3">
                 <motion.button onClick={() => {console.log("Switching sales view to daily"); setSalesViewMode('daily')}} className={`px-3 py-2 text-xs sm:text-sm rounded-lg shadow font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${ salesViewMode === 'daily' ? 'bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} whileHover={{scale: salesViewMode !== 'daily' ? 1.05 : 1.0}} disabled={salesLoading}><FaCalendarDay className="hidden sm:inline"/> Daily</motion.button>
                 <motion.button onClick={() => {console.log("Switching sales view to weekly"); setSalesViewMode('weekly')}} className={`px-3 py-2 text-xs sm:text-sm rounded-lg shadow font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${ salesViewMode === 'weekly' ? 'bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} whileHover={{scale: salesViewMode !== 'weekly' ? 1.05 : 1.0}} disabled={salesLoading}><FaCalendarWeek className="hidden sm:inline"/> Weekly</motion.button>
                 <motion.button onClick={() => {console.log("Switching sales view to monthly"); setSalesViewMode('monthly')}} className={`px-3 py-2 text-xs sm:text-sm rounded-lg shadow font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${ salesViewMode === 'monthly' ? 'bg-slate-700 text-white ring-2 ring-offset-1 ring-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} whileHover={{scale: salesViewMode !== 'monthly' ? 1.05 : 1.0}} disabled={salesLoading}><FaCalendarAlt className="hidden sm:inline"/> Monthly</motion.button>
             </div>
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 min-h-[350px] flex items-center justify-center">
                  {salesLoading && <p className="text-lg text-slate-500 animate-pulse">Loading sales...</p>}
                  {salesError && <p className="text-lg text-red-500">Error: {salesError}</p>}
                  {!salesLoading && !salesError && salesData && salesData.labels && salesData.labels.length > 0 && (
                    <div className="w-full h-[350px]">
                      <Bar data={salesChartDisplayData} options={salesChartOptions} /> 
                    </div>
                  )}
                  {!salesLoading && !salesError && (!salesData || !salesData.labels || salesData.labels.length === 0) && (
                     <p className="text-gray-500 italic">No sales data to display for this period. Sales tracking begins Feb 2025.</p>
                  )}
              </div>
         </section>

        <section>
            <h3 className="text-2xl font-semibold mb-6 text-center text-slate-700"> Detailed Stock Report (Sorted by Sales) </h3>
            {stockItems.length === 0 ? ( <p className="text-center text-gray-500 italic">No detailed stock data found.</p> )
             : ( <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                   <table className="min-w-full divide-y divide-gray-300 table-fixed">
                       <thead className="bg-slate-700"> <tr> <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 w-16">Rank</th> <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Rice Type</th> <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">Initial (kg)</th> <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">Sold (kg)</th> <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">Available (kg)</th> <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white sm:pr-6">Available (%)</th> </tr> </thead>
                       <tbody className="bg-white divide-y divide-gray-200"> {stockItems.map((item, index) => ( <tr key={`${item.id}-table`} className="hover:bg-slate-50 transition-colors duration-200"> <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{index + 1}</td> <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{item.name}</td> <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 text-center">{item.bought}</td> <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 text-center">{item.sold}</td> <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-center font-semibold">{item.available}</td> <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold text-center sm:pr-6 ${item.percentage <= 20 ? 'text-red-600': item.percentage <= 50 ? 'text-yellow-600': 'text-green-600'}`}>{item.percentage}%</td> </tr> ))} </tbody>
                   </table>
                 </div>
              )}
         </section>
      </main>

      <footer className="bg-slate-800 text-slate-200 text-center py-6 mt-auto w-full">
          <p>© {new Date().getFullYear()} Sivagami Traders. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default StockHistory;