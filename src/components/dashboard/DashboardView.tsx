import React from 'react';
import {
  Sprout,
  MapPin,
  Users,
  ClipboardList,
  Wallet,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Droplets,
} from 'lucide-react';
import { Crop, Field, Worker, WorkRecord, Payment, FarmExpense, ActiveTab } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusText } from '../common/StatusText';
import { useLanguage } from '../../i18n/LanguageContext';
import { Receipt } from 'lucide-react';

interface DashboardViewProps {
  crops: Crop[];
  fields: Field[];
  workers: Worker[];
  workRecords: WorkRecord[];
  payments: Payment[];
  expenses: FarmExpense[];
  currency: string;
  onNavigate: (tab: ActiveTab) => void;
  onQuickAction: (action: 'crop' | 'field' | 'worker' | 'work' | 'payment' | 'expense') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  crops,
  fields,
  workers,
  workRecords,
  payments,
  expenses,
  currency,
  onNavigate,
  onQuickAction,
}) => {
  const { t, formatCurrency, formatDate, formatNumber } = useLanguage();

  // Metrics derived from real records
  const activeCrops = crops.filter((c) => c.status !== 'HARVESTED' && c.status !== 'TERMINATED');
  const totalAcreage = fields.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
  const activeWorkers = workers.filter((w) => w.status === 'ACTIVE');

  // Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = workRecords.filter((r) => r.date === todayStr);

  // Financial calculations
  const totalEarnedWages = workRecords.reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
  const totalDisbursedPayments = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingBalance = Math.max(0, totalEarnedWages - totalDisbursedPayments);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Upcoming harvest reminders: crops sorted by expected harvest date
  const upcomingHarvests = crops
    .filter((c) => c.status === 'GROWING' || c.status === 'READY_FOR_HARVEST')
    .sort((a, b) => new Date(a.expectedHarvestDate).getTime() - new Date(b.expectedHarvestDate).getTime())
    .slice(0, 4);

  // Recent activity stream (combining work records, payments, and expenses, sorted newest first)
  const combinedActivity = [
    ...workRecords.map((r) => ({
      type: 'work' as const,
      id: r.id,
      date: r.date,
      title: `${r.taskType} - ${workers.find((w) => w.id === r.workerId)?.name || 'Worker'}`,
      subtitle: `${fields.find((f) => f.id === r.fieldId)?.name || 'Field'} · ${r.hoursWorked} hrs`,
      amount: r.wageAmount,
      status: r.status,
      timestamp: r.createdAt,
    })),
    ...payments.map((p) => ({
      type: 'payment' as const,
      id: p.id,
      date: p.date,
      title: `Payment: ${workers.find((w) => w.id === p.workerId)?.name || 'Worker'}`,
      subtitle: `${p.paymentMethod} · Ref: ${p.referenceNo || 'None'}`,
      amount: p.amount,
      status: p.status,
      timestamp: p.createdAt,
    })),
    ...expenses.map((e) => ({
      type: 'expense' as const,
      id: e.id,
      date: e.date,
      title: `${e.title}`,
      subtitle: `${e.category} · ${e.vendor || e.paymentMethod}`,
      amount: e.amount,
      status: 'PAID',
      timestamp: e.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#DCE4DC] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#1F5D42] uppercase tracking-wider">
                {t('farmOperations')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#202A24] tracking-tight mt-1">
                {t('dashboardOverview')}
              </h2>
              <p className="text-sm text-[#657168] mt-2 max-w-xl leading-relaxed">
                {t('dashboardSubtitle')}
              </p>
            </div>

            {/* Quick Action Ribbon */}
            <div className="mt-6 pt-6 border-t border-[#DCE4DC]">
              <span className="text-xs font-semibold text-[#202A24] block mb-3">
                {t('quickActions')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onQuickAction('work')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('actionLogWork')}</span>
                </button>
                <button
                  onClick={() => onQuickAction('crop')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#202A24] bg-[#F7F6EF] hover:bg-[#DCE4DC]/60 border border-[#DCE4DC] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Sprout className="w-3.5 h-3.5 text-[#1F5D42]" />
                  <span>{t('actionAddCrop')}</span>
                </button>
                <button
                  onClick={() => onQuickAction('expense')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#202A24] bg-[#F7F6EF] hover:bg-[#DCE4DC]/60 border border-[#DCE4DC] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#1F5D42]" />
                  <span>{t('actionAddExpense')}</span>
                </button>
                <button
                  onClick={() => onQuickAction('payment')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#202A24] bg-[#F7F6EF] hover:bg-[#DCE4DC]/60 border border-[#DCE4DC] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#8B6546]" />
                  <span>{t('actionRecordPayment')}</span>
                </button>
                <button
                  onClick={() => onQuickAction('worker')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#202A24] bg-[#F7F6EF] hover:bg-[#DCE4DC]/60 border border-[#DCE4DC] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5 text-[#6FAF78]" />
                  <span>{t('actionAddWorker')}</span>
                </button>
                <button
                  onClick={() => onQuickAction('field')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#202A24] bg-[#F7F6EF] hover:bg-[#DCE4DC]/60 border border-[#DCE4DC] rounded-lg transition-colors whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#2563A6]" />
                  <span>{t('actionAddField')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual Asset */}
          <div className="lg:col-span-5 relative min-h-[180px] lg:min-h-[260px] bg-[#16432F]">
            <img
              src="/src/assets/images/farm_hero_field_1792043206937.jpg"
              alt="Farm fields at sunrise"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <div className="text-white text-xs">
                <p className="font-semibold">{fields.length} Cultivated Fields & Plots</p>
                <p className="text-white/80">{activeCrops.length} Active crop cycles in progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Farm Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label={t('statActiveCrops')}
          value={activeCrops.length}
          subtext={`${crops.length} total crops registered`}
          icon={Sprout}
        />
        <StatCard
          label={t('statTotalAcreage')}
          value={`${formatNumber(totalAcreage, 1)} Ac`}
          subtext={`Across ${fields.length} field plots`}
          icon={MapPin}
        />
        <StatCard
          label={t('statActiveWorkers')}
          value={activeWorkers.length}
          subtext={`${workers.length} staff enrolled`}
          icon={Users}
        />
        <StatCard
          label={t('statTotalExpenses')}
          value={formatCurrency(totalExpenses, currency)}
          subtext="Fertilizers, diesel & supplies"
          icon={Receipt}
        />
        <StatCard
          label={t('statTotalPaid')}
          value={formatCurrency(totalDisbursedPayments, currency)}
          subtext="Disbursed worker wages"
          icon={Wallet}
        />
        <StatCard
          label={t('statPendingPayments')}
          value={formatCurrency(pendingBalance, currency)}
          subtext={pendingBalance > 0 ? 'Pending worker settlement' : 'All accounts settled'}
          icon={Clock}
          highlight={pendingBalance > 0}
        />
      </div>

      {/* Operational Split Grid: Recent Activity & Harvest Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#DCE4DC] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4DC]">
              <div>
                <h3 className="text-base font-bold text-[#202A24] tracking-tight">
                  {t('recentActivity')}
                </h3>
                <p className="text-xs text-[#657168] mt-0.5">
                  Latest recorded labor and disbursements
                </p>
              </div>
              <button
                onClick={() => onNavigate('work-records')}
                className="text-xs font-semibold text-[#1F5D42] hover:text-[#16432F] inline-flex items-center gap-1"
              >
                <span>{t('viewDetails')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {combinedActivity.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#657168]">
                {t('noRecentActivity')}
              </div>
            ) : (
              <div className="divide-y divide-[#DCE4DC]/70">
                {combinedActivity.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#202A24] truncate">
                          {item.title}
                        </span>
                        <StatusText
                          status={item.status}
                          type={item.type === 'work' ? 'work' : 'payment'}
                        />
                      </div>
                      <p className="text-xs text-[#657168] mt-0.5 truncate">
                        {item.subtitle} · <span className="font-tabular">{formatDate(item.date)}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#202A24] font-tabular">
                        {item.type === 'payment' ? '-' : '+'}
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Harvests & Crop Readiness */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#DCE4DC] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4DC]">
              <div>
                <h3 className="text-base font-bold text-[#202A24] tracking-tight">
                  {t('upcomingHarvests')}
                </h3>
                <p className="text-xs text-[#657168] mt-0.5">
                  Harvest projections and plot schedules
                </p>
              </div>
              <button
                onClick={() => onNavigate('crops')}
                className="text-xs font-semibold text-[#1F5D42] hover:text-[#16432F] inline-flex items-center gap-1"
              >
                <span>{t('viewDetails')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingHarvests.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#657168]">
                {t('emptyCropsDesc')}
              </div>
            ) : (
              <div className="space-y-3 pt-3">
                {upcomingHarvests.map((crop) => {
                  const field = fields.find((f) => f.id === crop.fieldId);
                  const isReady = crop.status === 'READY_FOR_HARVEST';
                  return (
                    <div
                      key={crop.id}
                      className="p-3.5 rounded-lg border border-[#DCE4DC] bg-[#F7F6EF]/40 hover:bg-[#F7F6EF] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold text-[#202A24]">
                            {crop.name}
                          </span>
                          <span className="text-xs text-[#657168] ml-2">({crop.variety})</span>
                        </div>
                        <StatusText status={crop.status} type="crop" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#657168]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1F5D42]" />
                          {field?.name || 'Assigned Field'}
                        </span>
                        <span className="font-tabular">
                          {isReady ? (
                            <span className="text-[#B7791F] font-semibold">
                              {t('readyNow')}
                            </span>
                          ) : (
                            `${t('expectedHarvest')}: ${formatDate(crop.expectedHarvestDate)}`
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCE4DC] flex items-center justify-between text-xs text-[#657168]">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-[#2563A6]" />
              {t('irrigationSchedule')}:
            </span>
            <span className="font-semibold text-[#202A24]">All systems normal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
