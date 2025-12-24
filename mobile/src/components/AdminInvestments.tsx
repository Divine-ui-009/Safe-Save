const investments = [
  {
    id: 1,
    title: 'Community Shop Expansion',
    invested: 15000,
    profitSoFar: 2300,
  },
  {
    id: 2,
    title: 'Irrigation Project',
    invested: 10000,
    profitSoFar: 1800,
  },
  {
    id: 3,
    title: 'Motorbike Taxi Fleet',
    invested: 8000,
    profitSoFar: 1500,
  },
];

export function AdminInvestments() {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + inv.profitSoFar, 0);
  const avgROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="px-6 pt-6 pb-8">
      <h3 className="text-slate-800 mb-4">Group Investments</h3>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Total Invested</p>
          <h2 className="text-slate-900 text-2xl">₳{totalInvested.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs mt-2">
            Total amount your group has put into current projects.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Profit So Far</p>
          <h2 className="text-slate-900 text-2xl">₳{totalProfit.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs mt-2">
            Combined profit from all active investments.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-slate-500 text-xs mb-1">Average ROI</p>
          <h2 className="text-slate-900 text-2xl">{avgROI.toFixed(1)}%</h2>
          <p className="text-slate-500 text-xs mt-2">
            Average return on investment across your projects.
          </p>
        </div>
      </div>
    </div>
  );
}
