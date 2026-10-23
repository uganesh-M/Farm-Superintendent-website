import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  Users,
  Wallet,
  Receipt,
  Sprout,
  Filter,
} from 'lucide-react';
import { Crop, Field, Worker, WorkRecord, Payment, FarmExpense } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface ReportsViewProps {
  crops: Crop[];
  fields: Field[];
  workers: Worker[];
  workRecords: WorkRecord[];
  payments: Payment[];
  expenses: FarmExpense[];
  currency: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  crops,
  fields,
  workers,
  workRecords,
  payments,
  expenses,
  currency,
}) => {
  const { t, formatCurrency, formatDate, formatNumber } = useLanguage();

  const [dateRange, setDateRange] = useState<'ALL' | 'WEEK' | 'MONTH' | 'SEASON'>('ALL');
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'expenses' | 'labor' | 'crops'>('financial');

  // Filter records by selected date range
  const filteredRecords = useMemo(() => {
    if (dateRange === 'ALL') return workRecords;

    const now = new Date();
    const cutoff = new Date();

    if (dateRange === 'WEEK') {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateRange === 'MONTH') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'SEASON') {
      cutoff.setMonth(now.getMonth() - 3);
    }

    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return workRecords.filter((r) => r.date >= cutoffStr);
  }, [workRecords, dateRange]);

  const filteredPayments = useMemo(() => {
    if (dateRange === 'ALL') return payments;

    const now = new Date();
    const cutoff = new Date();

    if (dateRange === 'WEEK') {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateRange === 'MONTH') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'SEASON') {
      cutoff.setMonth(now.getMonth() - 3);
    }

    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return payments.filter((p) => p.date >= cutoffStr);
  }, [payments, dateRange]);

  const filteredExpenses = useMemo(() => {
    if (dateRange === 'ALL') return expenses;

    const now = new Date();
    const cutoff = new Date();

    if (dateRange === 'WEEK') {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateRange === 'MONTH') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'SEASON') {
      cutoff.setMonth(now.getMonth() - 3);
    }

    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return expenses.filter((e) => e.date >= cutoffStr);
  }, [expenses, dateRange]);

  // Aggregations
  const totalHours = filteredRecords.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);
  const totalWagesAccrued = filteredRecords.reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
  const totalPaid = filteredPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const netDue = Math.max(0, totalWagesAccrued - totalPaid);
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalFarmOutflow = totalPaid + totalExpensesAmount;

  // Worker breakdown
  const workerBreakdown = useMemo(() => {
    return workers.map((worker) => {
      const records = filteredRecords.filter((r) => r.workerId === worker.id);
      const workerPays = filteredPayments.filter((p) => p.workerId === worker.id && p.status === 'PAID');

      const shifts = records.length;
      const hours = records.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);
      const earned = records.reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
      const paid = workerPays.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const due = Math.max(0, earned - paid);

      return {
        worker,
        shifts,
        hours,
        earned,
        paid,
        due,
      };
    });
  }, [workers, filteredRecords, filteredPayments]);

  // Task type breakdown
  const taskBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; hours: number; wages: number }>();
    filteredRecords.forEach((r) => {
      const existing = map.get(r.taskType) || { count: 0, hours: 0, wages: 0 };
      existing.count += 1;
      existing.hours += Number(r.hoursWorked) || 0;
      existing.wages += Number(r.wageAmount) || 0;
      map.set(r.taskType, existing);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].wages - a[1].wages);
  }, [filteredRecords]);

  // Expense Category breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    filteredExpenses.forEach((e) => {
      const existing = map.get(e.category) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += Number(e.amount) || 0;
      map.set(e.category, existing);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);
  }, [filteredExpenses]);

  // Export CSV generator
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReportTab === 'financial') {
      csvContent += 'Worker Name,Role,Daily Rate,Shifts,Hours Worked,Total Earned,Total Paid,Balance Due\n';
      workerBreakdown.forEach((w) => {
        csvContent += `"${w.worker.name}","${w.worker.role}",${w.worker.dailyWage},${w.shifts},${w.hours},${w.earned},${w.paid},${w.due}\n`;
      });
    } else if (activeReportTab === 'expenses') {
      csvContent += 'Date,Title,Category,Amount,Payment Method,Vendor,Receipt No,Notes\n';
      filteredExpenses.forEach((exp) => {
        csvContent += `"${exp.date}","${exp.title}","${exp.category}",${exp.amount},"${exp.paymentMethod}","${exp.vendor || ''}","${exp.receiptNumber || ''}","${exp.notes || ''}"\n`;
      });
    } else if (activeReportTab === 'labor') {
      csvContent += 'Date,Worker,Field,Crop,Task Type,Hours,Daily Rate,Calculated Wage,Status\n';
      filteredRecords.forEach((r) => {
        const worker = workers.find((w) => w.id === r.workerId)?.name || 'Worker';
        const field = fields.find((f) => f.id === r.fieldId)?.name || 'Field';
        const crop = crops.find((c) => c.id === r.cropId)?.name || 'None';
        csvContent += `"${r.date}","${worker}","${field}","${crop}","${r.taskType}",${r.hoursWorked},${r.dailyRateApplied},${r.wageAmount},"${r.status}"\n`;
      });
    } else {
      csvContent += 'Crop Name,Variety,Field,Area,Status,Planting Date,Expected Harvest,Expected Yield\n';
      crops.forEach((c) => {
        const field = fields.find((f) => f.id === c.fieldId)?.name || 'Field';
        csvContent += `"${c.name}","${c.variety}","${field}",${c.areaPlanted} ${c.areaUnit},"${c.status}","${c.plantingDate}","${c.expectedHarvestDate}","${c.expectedYield || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_superintendent_${activeReportTab}_report_${dateRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('reportsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('reportsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1F5D42] bg-white hover:bg-[#F7F6EF] border border-[#DCE4DC] rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCSV')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('printReport')}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Ribbon */}
      <div className="p-4 bg-white rounded-xl border border-[#DCE4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#657168]">
          <Calendar className="w-4 h-4 text-[#1F5D42]" />
          <span className="font-semibold text-[#202A24]">{t('reportRange')}:</span>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 bg-[#F7F6EF] p-1 rounded-lg border border-[#DCE4DC]">
          <button
            onClick={() => setDateRange('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'ALL'
                ? 'bg-white text-[#1F5D42] font-semibold shadow-xs'
                : 'text-[#657168] hover:text-[#202A24]'
            }`}
          >
            {t('rangeAll')}
          </button>
          <button
            onClick={() => setDateRange('WEEK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'WEEK'
                ? 'bg-white text-[#1F5D42] font-semibold shadow-xs'
                : 'text-[#657168] hover:text-[#202A24]'
            }`}
          >
            {t('rangeThisWeek')}
          </button>
          <button
            onClick={() => setDateRange('MONTH')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'MONTH'
                ? 'bg-white text-[#1F5D42] font-semibold shadow-xs'
                : 'text-[#657168] hover:text-[#202A24]'
            }`}
          >
            {t('rangeThisMonth')}
          </button>
          <button
            onClick={() => setDateRange('SEASON')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'SEASON'
                ? 'bg-white text-[#1F5D42] font-semibold shadow-xs'
                : 'text-[#657168] hover:text-[#202A24]'
            }`}
          >
            {t('rangeSeason')}
          </button>
        </div>
      </div>

      {/* Report Module Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE4DC] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('financial')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeReportTab === 'financial'
              ? 'border-[#1F5D42] text-[#1F5D42]'
              : 'border-transparent text-[#657168] hover:text-[#202A24]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('reportFinancialReconciliation')}</span>
        </button>
        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeReportTab === 'expenses'
              ? 'border-[#1F5D42] text-[#1F5D42]'
              : 'border-transparent text-[#657168] hover:text-[#202A24]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{t('expensesTitle')}</span>
        </button>
        <button
          onClick={() => setActiveReportTab('labor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeReportTab === 'labor'
              ? 'border-[#1F5D42] text-[#1F5D42]'
              : 'border-transparent text-[#657168] hover:text-[#202A24]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('reportWorkerAttendance')}</span>
        </button>
        <button
          onClick={() => setActiveReportTab('crops')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeReportTab === 'crops'
              ? 'border-[#1F5D42] text-[#1F5D42]'
              : 'border-transparent text-[#657168] hover:text-[#202A24]'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>{t('reportCropYield')}</span>
        </button>
      </div>

      {/* Tab 1: Financial Reconciliation */}
      {activeReportTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
              <span className="text-xs text-[#657168]">{t('totalWageLiability')}</span>
              <span className="text-xl font-bold text-[#202A24] font-tabular mt-1 block">
                {formatCurrency(totalWagesAccrued, currency)}
              </span>
              <span className="text-[11px] text-[#657168]">
                {filteredRecords.length} recorded farm shifts
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
              <span className="text-xs text-[#657168]">{t('statTotalPaid')}</span>
              <span className="text-xl font-bold text-[#2E7D4F] font-tabular mt-1 block">
                {formatCurrency(totalPaid, currency)}
              </span>
              <span className="text-[11px] text-[#657168]">Wages settled to staff</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
              <span className="text-xs text-[#657168]">{t('totalExpenses')}</span>
              <span className="text-xl font-bold text-[#1F5D42] font-tabular mt-1 block">
                {formatCurrency(totalExpensesAmount, currency)}
              </span>
              <span className="text-[11px] text-[#657168]">Fertilizers, diesel & materials</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E6B84A]">
              <span className="text-xs text-[#657168]">Total Farm Cash Outflow</span>
              <span className="text-xl font-bold text-[#8B6546] font-tabular mt-1 block">
                {formatCurrency(totalFarmOutflow, currency)}
              </span>
              <span className="text-[11px] text-[#657168]">Wages paid + material inputs</span>
            </div>
          </div>

          {/* Worker balance reconciliation table */}
          <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DCE4DC] bg-[#F7F6EF]/50">
              <h3 className="text-sm font-bold text-[#202A24]">
                Worker-by-Worker Ledger Reconciliation
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/30 text-xs font-semibold text-[#657168]">
                    <th className="py-3 px-4">{t('workerName')}</th>
                    <th className="py-3 px-4">{t('role')}</th>
                    <th className="py-3 px-4">Shifts</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">{t('totalEarned')}</th>
                    <th className="py-3 px-4">{t('totalPaidAmount')}</th>
                    <th className="py-3 px-4">{t('balanceDue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4DC]/70">
                  {workerBreakdown.map((item) => (
                    <tr key={item.worker.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#202A24]">
                        {item.worker.name}
                      </td>
                      <td className="py-3 px-4 text-[#657168] text-xs">
                        {item.worker.role}
                      </td>
                      <td className="py-3 px-4 font-tabular text-[#202A24]">
                        {item.shifts}
                      </td>
                      <td className="py-3 px-4 font-tabular text-[#657168]">
                        {item.hours} hrs
                      </td>
                      <td className="py-3 px-4 font-tabular font-semibold text-[#202A24]">
                        {formatCurrency(item.earned, currency)}
                      </td>
                      <td className="py-3 px-4 font-tabular font-medium text-[#2E7D4F]">
                        {formatCurrency(item.paid, currency)}
                      </td>
                      <td className="py-3 px-4 font-tabular font-bold">
                        <span className={item.due > 0 ? 'text-[#C0392B]' : 'text-[#657168]'}>
                          {formatCurrency(item.due, currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Operational Farm Expenses Breakdown */}
      {activeReportTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Spend Distribution */}
            <div className="bg-white rounded-xl border border-[#DCE4DC] p-5">
              <h3 className="text-sm font-bold text-[#202A24] mb-4">
                Operational Expenses by Input Category
              </h3>
              {expenseCategoryBreakdown.length === 0 ? (
                <p className="text-xs text-[#657168] italic py-4">No expenses for this period.</p>
              ) : (
                <div className="space-y-3">
                  {expenseCategoryBreakdown.map(([cat, data]) => {
                    const percentage = totalExpensesAmount > 0 ? Math.round((data.amount / totalExpensesAmount) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#202A24]">{cat}</span>
                          <span className="text-[#657168] font-tabular">
                            {formatCurrency(data.amount, currency)} ({percentage}%) · {data.count} bills
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#F7F6EF] rounded-full overflow-hidden border border-[#DCE4DC]/40">
                          <div
                            className="h-full bg-[#1F5D42] rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Summary Metrics */}
            <div className="bg-white rounded-xl border border-[#DCE4DC] p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202A24] mb-3">
                  Expense Summary Metrics
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#DCE4DC]">
                    <span className="text-[#657168]">{t('totalExpenses')}:</span>
                    <span className="font-bold text-[#202A24] font-tabular">{formatCurrency(totalExpensesAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#DCE4DC]">
                    <span className="text-[#657168]">Total Expense Vouchers Logged:</span>
                    <span className="font-bold text-[#202A24] font-tabular">{filteredExpenses.length} Vouchers</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#DCE4DC]">
                    <span className="text-[#657168]">Average Voucher Amount:</span>
                    <span className="font-bold text-[#202A24] font-tabular">
                      {formatCurrency(
                        filteredExpenses.length > 0 ? totalExpensesAmount / filteredExpenses.length : 0,
                        currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#657168]">Input Spend Ratio vs Wages:</span>
                    <span className="font-bold text-[#1F5D42] font-tabular">
                      {totalPaid > 0 ? `${Math.round((totalExpensesAmount / totalPaid) * 100)}% of payroll` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#F7F6EF] rounded-lg border border-[#DCE4DC] text-xs text-[#657168]">
                💡 Tip: Regularly tracking fertilizer batch purchases and diesel receipts enables precise per-acre input cost optimization.
              </div>
            </div>
          </div>

          {/* Detailed Expenses Table */}
          <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DCE4DC] bg-[#F7F6EF]/50">
              <h3 className="text-sm font-bold text-[#202A24]">
                Recorded Operational Expense Vouchers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/30 text-xs font-semibold text-[#657168]">
                    <th className="py-3 px-4">{t('date')}</th>
                    <th className="py-3 px-4">{t('expenseTitle')}</th>
                    <th className="py-3 px-4">{t('expenseCategory')}</th>
                    <th className="py-3 px-4">{t('vendor')}</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4DC]/70">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3 px-4 font-tabular text-xs text-[#202A24]">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4 font-semibold text-[#202A24]">
                        {exp.title}
                        {exp.receiptNumber && (
                          <span className="block text-[11px] text-[#657168] font-normal">#{exp.receiptNumber}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-[#1F5D42]">{exp.category}</td>
                      <td className="py-3 px-4 text-xs text-[#657168]">{exp.vendor || '—'}</td>
                      <td className="py-3 px-4 text-xs text-[#657168]">{exp.paymentMethod}</td>
                      <td className="py-3 px-4 font-tabular font-bold text-[#202A24]">{formatCurrency(exp.amount, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Labor & Task Breakdown */}
      {activeReportTab === 'labor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Type Hours Distribution */}
            <div className="bg-white rounded-xl border border-[#DCE4DC] p-5">
              <h3 className="text-sm font-bold text-[#202A24] mb-4">
                Labor Hours by Farming Activity
              </h3>
              <div className="space-y-3">
                {taskBreakdown.map(([task, data]) => {
                  const percentage = totalHours > 0 ? Math.round((data.hours / totalHours) * 100) : 0;
                  return (
                    <div key={task} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#202A24]">{task}</span>
                        <span className="text-[#657168] font-tabular">
                          {data.hours} hrs ({percentage}%) · {formatCurrency(data.wages, currency)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#F7F6EF] rounded-full overflow-hidden border border-[#DCE4DC]/40">
                        <div
                          className="h-full bg-[#1F5D42] rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shift Activity Summary */}
            <div className="bg-white rounded-xl border border-[#DCE4DC] p-5">
              <h3 className="text-sm font-bold text-[#202A24] mb-3">
                Labor Summary Metrics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#DCE4DC]">
                  <span className="text-[#657168]">{t('totalHoursLogged')}:</span>
                  <span className="font-bold text-[#202A24] font-tabular">{totalHours} Hours</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#DCE4DC]">
                  <span className="text-[#657168]">Total Daily Shifts Recorded:</span>
                  <span className="font-bold text-[#202A24] font-tabular">{filteredRecords.length} Shifts</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#DCE4DC]">
                  <span className="text-[#657168]">Average Wage Per Shift:</span>
                  <span className="font-bold text-[#202A24] font-tabular">
                    {formatCurrency(
                      filteredRecords.length > 0 ? totalWagesAccrued / filteredRecords.length : 0,
                      currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#657168]">Average Shift Duration:</span>
                  <span className="font-bold text-[#202A24] font-tabular">
                    {filteredRecords.length > 0 ? formatNumber(totalHours / filteredRecords.length, 1) : 0} hrs/day
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Crop & Land Allocation */}
      {activeReportTab === 'crops' && (
        <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE4DC] bg-[#F7F6EF]/50">
            <h3 className="text-sm font-bold text-[#202A24]">
              Cultivated Crop Allocation & Projected Harvests
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/30 text-xs font-semibold text-[#657168]">
                  <th className="py-3 px-4">{t('cropName')}</th>
                  <th className="py-3 px-4">{t('variety')}</th>
                  <th className="py-3 px-4">{t('assignedField')}</th>
                  <th className="py-3 px-4">{t('plantedArea')}</th>
                  <th className="py-3 px-4">{t('plantingDate')}</th>
                  <th className="py-3 px-4">{t('expectedHarvest')}</th>
                  <th className="py-3 px-4">{t('expectedYield')}</th>
                  <th className="py-3 px-4">{t('cropStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DC]/70">
                {crops.map((c) => {
                  const field = fields.find((f) => f.id === c.fieldId);
                  return (
                    <tr key={c.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#202A24]">{c.name}</td>
                      <td className="py-3 px-4 text-[#657168]">{c.variety}</td>
                      <td className="py-3 px-4 text-[#202A24]">{field?.name || '—'}</td>
                      <td className="py-3 px-4 font-tabular">
                        {formatNumber(c.areaPlanted, 1)} {c.areaUnit}
                      </td>
                      <td className="py-3 px-4 font-tabular text-[#657168]">{formatDate(c.plantingDate)}</td>
                      <td className="py-3 px-4 font-tabular text-[#657168]">{formatDate(c.expectedHarvestDate)}</td>
                      <td className="py-3 px-4 text-[#1F5D42] font-semibold">{c.expectedYield || '—'}</td>
                      <td className="py-3 px-4 text-xs font-medium text-[#202A24]">{c.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
