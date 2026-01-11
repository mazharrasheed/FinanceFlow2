
import React, { useMemo } from 'react';
import { TransactionType } from '../types';
import { ICONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/UserContext';

const formatCurrency = (amount: number) => {
  return `Rs. ${(amount || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

// Custom component to render a 3D Bar shaped like a Hotel Building with a Corrected Perspective Helipad
const ThreeDBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  if (!width || !height || height < 5) return null;

  const depth = 12; // Slightly deeper for better helipad visibility
  const windowSize = 3;
  const windowGap = 4;
  const litWindowColor = "#fef9c3"; // Warm light yellow
  
  // Front face windows calculation
  const cols = Math.floor((width - 4) / (windowSize + windowGap));
  const rows = Math.floor((height - 10) / (windowSize + windowGap));
  
  const frontWindows = [];
  if (cols > 0 && rows > 0) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        frontWindows.push(
          <rect
            key={`f-${r}-${c}`}
            x={x + 4 + c * (windowSize + windowGap)}
            y={y + 6 + r * (windowSize + windowGap)}
            width={windowSize}
            height={windowSize}
            fill={litWindowColor}
            fillOpacity={0.8}
          />
        );
      }
    }
  }

  // Side face windows calculation
  const sideCols = Math.floor((depth - 2) / (windowSize + 2));
  const sideWindows = [];
  if (sideCols > 0 && rows > 0) {
    for (let r = 0; r < rows; r++) {
      for (let sc = 0; sc < sideCols; sc++) {
        const dOffset = 3 + sc * (windowSize + 2);
        sideWindows.push(
          <path
            key={`s-${r}-${sc}`}
            d={`M ${x + width + dOffset},${y + 6 + r * (windowSize + windowGap) - dOffset} 
               L ${x + width + dOffset + windowSize},${y + 6 + r * (windowSize + windowGap) - dOffset - windowSize/2} 
               L ${x + width + dOffset + windowSize},${y + 6 + r * (windowSize + windowGap) - dOffset + windowSize - windowSize/2} 
               L ${x + width + dOffset},${y + 6 + r * (windowSize + windowGap) - dOffset + windowSize} Z`}
            fill={litWindowColor}
            fillOpacity={0.5}
          />
        );
      }
    }
  }

  // Helipad calculations (centered on the roof parallelogram)
  const centerX = x + width / 2 + depth / 2;
  const centerY = y - depth / 2;
  
  // We want the helipad to fill most of the width but stay inside the depth
  const padWidth = width * 0.4; 
  const padDepth = depth * 0.4;

  return (
    <g>
      {/* Side Face (Darker) */}
      <path
        d={`M ${x + width},${y} L ${x + width + depth},${y - depth} L ${x + width + depth},${y + height - depth} L ${x + width},${y + height} Z`}
        fill={fill}
        filter="brightness(0.6)"
      />
      {/* Top Face (Lighter) */}
      <path
        d={`M ${x},${y} L ${x + depth},${y - depth} L ${x + width + depth},${y - depth} L ${x + width},${y} Z`}
        fill={fill}
        filter="brightness(1.3)"
      />
      
      {/* Helipad with Fixed Perspective logic */}
      {width > 12 && (
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* 
              First, we apply the 3D projection skew. 
              Everything inside this group is effectively 'on the roof'.
          */}
          <g transform="skewX(-45) scale(1, 0.8)">
            {/* Helipad Base - using ellipse to allow independent axis sizing */}
            <ellipse rx={padWidth} ry={padDepth * 1.2} fill="#1e293b" stroke="white" strokeWidth="1" />
            <ellipse rx={padWidth * 0.8} ry={padDepth * 0.9} fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,1" opacity="0.4" />
            
            {/* 
                Rotate the 'H' by 90 degrees IN the roof plane.
                This prevents the 'short side becomes long' distortion.
            */}
            <g transform="rotate(90)">
              <path 
                d={`M -${padDepth/2},-${padWidth/3} L -${padDepth/2},${padWidth/3}
                   M ${padDepth/2},-${padWidth/3} L ${padDepth/2},${padWidth/3}
                   M -${padDepth/2},0 L ${padDepth/2},0`}
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>
        </g>
      )}

      {/* Front Face (Building Body) */}
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      
      {/* Windows */}
      {frontWindows}
      {sideWindows}
      
      {/* Entrance Detail */}
      {width > 15 && height > 20 && (
        <rect 
          x={x + width/2 - 4} 
          y={y + height - 6} 
          width={8} 
          height={6} 
          fill="black" 
          fillOpacity={0.3} 
        />
      )}
    </g>
  );
};

const Dashboard: React.FC = () => {
  const { projects, transactions, backupToCSV } = useData();
  const { perms, theme } = useAuth();
  
  const canViewTransactions = perms.viewTransactions;

  const summary = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = Number(t?.amount) || 0;
      if (t?.type === TransactionType.INCOME) acc.income += amount;
      else acc.expense += amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const projectStats = useMemo(() => {
    return projects.map(p => {
      const pTrans = transactions.filter(t => t?.projectId === p?.id);
      const pSummary = pTrans.reduce((acc, t) => {
        const amount = Number(t?.amount) || 0;
        if (t?.type === TransactionType.INCOME) acc.income += amount;
        else acc.expense += amount;
        return acc;
      }, { income: 0, expense: 0 });
      return {
        name: p?.name || 'Unnamed',
        balance: pSummary.income - pSummary.expense,
        income: pSummary.income,
        expense: pSummary.expense
      };
    });
  }, [projects, transactions]);

  const categoryStats = useMemo(() => {
    return transactions.reduce((acc: any, t) => {
      const categoryName = t?.category || 'Uncategorized';
      const amount = Number(t?.amount) || 0;
      const existing = acc.find((item: any) => item.name === categoryName);
      if (existing) existing.value += amount;
      else acc.push({ name: categoryName, value: amount });
      return acc;
    }, []);
  }, [transactions]);

  const getThemeColors = () => {
    switch (theme) {
      case 'royal': return ['#2563eb', '#3b82f6'];
      case 'gold': return ['#d97706', '#f59e0b'];
      case 'midnight': return ['#e11d48', '#f43f5e'];
      default: return ['#10b981', '#34d399'];
    }
  };

  const [primaryColor, secondaryColor] = getThemeColors();
  const piePalette = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
  const themePrimaryTextClass = theme === 'royal' ? 'text-blue-600' :
                       theme === 'gold' ? 'text-amber-600' :
                       theme === 'midnight' ? 'text-rose-600' : 'text-emerald-600';

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Executive Summary</h2>
          <p className="text-slate-500 font-medium">Consolidated financial overview of your hospitality assets.</p>
        </div>
        {canViewTransactions && (
          <button onClick={backupToCSV} className="flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 no-print w-full md:w-auto">
            <ICONS.Download /> Export Portfolio
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-6 group hover:shadow-xl transition-all duration-300">
          <div className="bg-emerald-50 p-4 md:p-5 rounded-2xl md:rounded-[2rem] group-hover:scale-110 transition-transform shrink-0"><ICONS.Income /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Yield</p>
            <p className="text-xl md:text-3xl font-black text-slate-900 truncate">{formatCurrency(summary.income)}</p>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-6 group hover:shadow-xl transition-all duration-300">
          <div className="bg-rose-50 p-4 md:p-5 rounded-2xl md:rounded-[2rem] group-hover:scale-110 transition-transform shrink-0"><ICONS.Expense /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Cost</p>
            <p className="text-xl md:text-3xl font-black text-slate-900 truncate">{formatCurrency(summary.expense)}</p>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-6 group hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className={`bg-slate-50 p-4 md:p-5 rounded-2xl md:rounded-[2rem] group-hover:scale-110 transition-transform shrink-0 ${themePrimaryTextClass}`}>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Position</p>
            <p className={`text-xl md:text-3xl font-black truncate ${summary.income - summary.expense >= 0 ? themePrimaryTextClass : 'text-rose-600'}`}>
              {formatCurrency(summary.income - summary.expense)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-12">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-slate-100 min-h-[400px] md:min-h-[500px] flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Performance Analytics
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ dy: 10 }} />
                <YAxis fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number) => [formatCurrency(value), '']} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} 
                />
                <Bar 
                  dataKey="income" 
                  shape={<ThreeDBar />}
                  fill={primaryColor} 
                  barSize={window?.innerWidth < 640 ? 16 : 32} 
                />
                <Bar 
                  dataKey="expense" 
                  shape={<ThreeDBar />}
                  fill={theme === 'emerald' ? '#f43f5e' : secondaryColor} 
                  barSize={window?.innerWidth < 640 ? 16 : 32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-slate-100 min-h-[400px] md:min-h-[500px] flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Resource Allocation
          </h3>
          <div className="flex-1 min-h-[250px] md:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryStats} 
                  cx="50%" 
                  cy="53%" 
                  innerRadius={window?.innerWidth < 640 ? 50 : 80} 
                  outerRadius={window?.innerWidth < 640 ? 80 : 120} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                  isAnimationActive={false}
                >
                  {categoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-depth-${index}`} fill={piePalette[index % piePalette.length]} filter="brightness(0.6)" />
                  ))}
                </Pie>
                <Pie 
                  data={categoryStats} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={window?.innerWidth < 640 ? 50 : 80} 
                  outerRadius={window?.innerWidth < 640 ? 80 : 120} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                >
                  {categoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 overflow-y-auto max-h-[120px] no-scrollbar">
             {categoryStats.map((item: any, index: number) => (
               <div key={item.name} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                 <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: piePalette[index % piePalette.length] }}></div>
                 <span className="truncate">{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
