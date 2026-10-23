import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  Sprout,
  X,
  Download,
  CreditCard,
  Building,
  Tag,
} from 'lucide-react';
import { FarmExpense, ExpenseCategory, Field, Crop, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { useLanguage } from '../../i18n/LanguageContext';

interface ExpensesViewProps {
  expenses: FarmExpense[];
  fields: Field[];
  crops: Crop[];
  currency: string;
  onSaveExpense: (expense: FarmExpense) => void;
  onDeleteExpense: (id: string) => { success: boolean };
  initialModalOpen?: boolean;
}

const CATEGORIES: ExpenseCategory[] = [
  'Fertilizers & Nutrients',
  'Seeds & Seedlings',
  'Pesticides & Chemicals',
  'Fuel & Diesel',
  'Machinery & Repairs',
  'Irrigation & Water',
  'Packaging & Transport',
  'Tools & Supplies',
  'Land & Lease',
  'Other Operations',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  fields,
  crops,
  currency,
  onSaveExpense,
  onDeleteExpense,
  initialModalOpen = false,
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();

  const getCategoryLabel = (category: ExpenseCategory): string => {
    switch (category) {
      case 'Fertilizers & Nutrients':
        return t('catFertilizers') || category;
      case 'Seeds & Seedlings':
        return t('catSeeds') || category;
      case 'Pesticides & Chemicals':
        return t('catPesticides') || category;
      case 'Fuel & Diesel':
        return t('catFuel') || category;
      case 'Machinery & Repairs':
        return t('catMachinery') || category;
      case 'Irrigation & Water':
        return t('catIrrigation') || category;
      case 'Packaging & Transport':
        return t('catPackaging') || category;
      case 'Tools & Supplies':
        return t('catTools') || category;
      case 'Land & Lease':
        return t('catLand') || category;
      case 'Other Operations':
      default:
        return t('catOther') || category;
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [fieldFilter, setFieldFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [editingExpense, setEditingExpense] = useState<FarmExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<FarmExpense | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    fieldId: string;
    cropId: string;
    vendor: string;
    paymentMethod: PaymentMethod;
    receiptNumber: string;
    notes: string;
  }>({
    title: '',
    category: 'Fertilizers & Nutrients',
    amount: 1000,
    date: new Date().toISOString().slice(0, 10),
    fieldId: '',
    cropId: '',
    vendor: '',
    paymentMethod: 'CASH',
    receiptNumber: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Summary stats
  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const fertilizerAmount = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'Fertilizers & Nutrients')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const fuelAmount = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'Fuel & Diesel')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const seedAndPesticideAmount = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'Seeds & Seedlings' || e.category === 'Pesticides & Chemicals')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const field = fields.find((f) => f.id === exp.fieldId);
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.receiptNumber && exp.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (field && field.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'ALL' || exp.category === categoryFilter;
      const matchesField = fieldFilter === 'ALL' || exp.fieldId === fieldFilter;
      const matchesMethod = methodFilter === 'ALL' || exp.paymentMethod === methodFilter;

      return matchesSearch && matchesCategory && matchesField && matchesMethod;
    });
  }, [expenses, fields, searchTerm, categoryFilter, fieldFilter, methodFilter]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Fertilizers & Nutrients',
      amount: 1000,
      date: new Date().toISOString().slice(0, 10),
      fieldId: '',
      cropId: '',
      vendor: '',
      paymentMethod: 'CASH',
      receiptNumber: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: FarmExpense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      fieldId: expense.fieldId || '',
      cropId: expense.cropId || '',
      vendor: expense.vendor || '',
      paymentMethod: expense.paymentMethod,
      receiptNumber: expense.receiptNumber || '',
      notes: expense.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Expense title is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.date) errors.date = 'Date is required';
    if (formData.amount <= 0) errors.amount = 'Amount must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const expenseToSave: FarmExpense = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      fieldId: formData.fieldId ? formData.fieldId : undefined,
      cropId: formData.cropId ? formData.cropId : undefined,
      vendor: formData.vendor.trim() || undefined,
      paymentMethod: formData.paymentMethod,
      receiptNumber: formData.receiptNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString(),
    };

    onSaveExpense(expenseToSave);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!expenseToDelete) return;
    onDeleteExpense(expenseToDelete.id);
    setExpenseToDelete(null);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Title,Category,Amount,Payment Method,Vendor,Receipt No,Field,Crop,Notes\n';
    filteredExpenses.forEach((exp) => {
      const field = fields.find((f) => f.id === exp.fieldId)?.name || '';
      const crop = crops.find((c) => c.id === exp.cropId)?.name || '';
      csvContent += `"${exp.date}","${exp.title}","${exp.category}",${exp.amount},"${exp.paymentMethod}","${exp.vendor || ''}","${exp.receiptNumber || ''}","${field}","${crop}","${exp.notes || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_superintendent_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('expensesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('expensesSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1F5D42] bg-white hover:bg-[#F7F6EF] border border-[#DCE4DC] rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('exportCSV')}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actionAddExpense')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">{t('totalExpenses')}</span>
          <span className="text-xl font-bold text-[#202A24] font-tabular mt-1 block">
            {formatCurrency(totalExpenseAmount, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">{expenses.length} expense vouchers</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">Fertilizers & Nutrients</span>
          <span className="text-xl font-bold text-[#1F5D42] font-tabular mt-1 block">
            {formatCurrency(fertilizerAmount, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">Compost, urea, bio-nutrients</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">Fuel & Machinery</span>
          <span className="text-xl font-bold text-[#8B6546] font-tabular mt-1 block">
            {formatCurrency(fuelAmount, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">Diesel & power equipment</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">Seeds & Crop Protection</span>
          <span className="text-xl font-bold text-[#2563A6] font-tabular mt-1 block">
            {formatCurrency(seedAndPesticideAmount, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">Seedlings, trays, organic sprays</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#DCE4DC] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#657168] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses by title, supplier, invoice #, or plot..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] placeholder-[#657168] focus:outline-hidden focus:border-[#1F5D42] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} {t('expenseCategory')}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>

          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} {t('fieldsTitle')}</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} Payment Methods</option>
            <option value="CASH">{t('methodCash')}</option>
            <option value="UPI">{t('methodUPI')}</option>
            <option value="BANK_TRANSFER">{t('methodBank')}</option>
            <option value="CHEQUE">{t('methodCheque')}</option>
          </select>

          {(searchTerm || categoryFilter !== 'ALL' || fieldFilter !== 'ALL' || methodFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setFieldFilter('ALL');
                setMethodFilter('ALL');
              }}
              className="p-2 text-[#657168] hover:text-[#202A24] hover:bg-[#F7F6EF] rounded-lg"
              title={t('clearFilters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length === 0 ? t('emptyExpensesTitle') : t('noRecordsFound')}
          description={
            expenses.length === 0
              ? t('emptyExpensesDesc')
              : 'Try clearing your search or category filters.'
          }
          actionLabel={expenses.length === 0 ? t('actionAddExpense') : undefined}
          onAction={expenses.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/60 text-xs font-semibold text-[#657168]">
                  <th className="py-3 px-4">{t('date')}</th>
                  <th className="py-3 px-4">{t('expenseTitle')}</th>
                  <th className="py-3 px-4">{t('expenseCategory')}</th>
                  <th className="py-3 px-4">{t('assignedField')} & {t('navCrops')}</th>
                  <th className="py-3 px-4">{t('vendor')}</th>
                  <th className="py-3 px-4">{t('amount')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DC]/70 text-xs sm:text-sm">
                {filteredExpenses.map((exp) => {
                  const field = fields.find((f) => f.id === exp.fieldId);
                  const crop = crops.find((c) => c.id === exp.cropId);
                  return (
                    <tr key={exp.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#202A24]">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#202A24]">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(exp)}
                          className="font-semibold text-sm text-left hover:text-[#1F5D42] hover:underline focus:outline-hidden"
                          title="Click to edit expense"
                        >
                          {exp.title}
                        </button>
                        {exp.receiptNumber && (
                          <div className="text-[11px] text-[#657168] mt-0.5">
                            Bill #{exp.receiptNumber}
                          </div>
                        )}
                        {exp.notes && (
                          <div className="text-[11px] text-[#657168] truncate max-w-xs mt-0.5">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#1F5D42]">
                        <span className="inline-flex items-center gap-1 bg-[#F7F6EF] px-2 py-0.5 rounded-sm border border-[#DCE4DC]">
                          <Tag className="w-3 h-3 text-[#6FAF78]" />
                          <span>{getCategoryLabel(exp.category)}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#657168]">
                        {field ? (
                          <div className="flex items-center gap-1 text-[#202A24]">
                            <MapPin className="w-3 h-3 text-[#1F5D42]" />
                            <span>{field.name}</span>
                          </div>
                        ) : (
                          <span className="text-[#657168] italic">General Farm</span>
                        )}
                        {crop && (
                          <div className="flex items-center gap-1 text-[11px] text-[#6FAF78] mt-0.5">
                            <Sprout className="w-3 h-3" />
                            <span>{crop.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#657168]">
                        {exp.vendor || '—'}
                        <span className="block text-[10px] text-[#657168] mt-0.5">
                          via {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-sm font-bold text-[#202A24]">
                        {formatCurrency(exp.amount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(exp)}
                            aria-label={`Edit ${exp.title}`}
                            title={t('edit')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1F5D42] bg-[#F7F6EF] hover:bg-[#DCE4DC] border border-[#DCE4DC] rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{t('edit')}</span>
                          </button>
                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            aria-label={`Delete ${exp.title}`}
                            title={t('delete')}
                            className="p-1 text-[#657168] hover:text-[#C0392B] hover:bg-[#C0392B]/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal (Supports editing existing records) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? `${t('edit')} ${t('navExpenses')}` : t('actionAddExpense')}
        subtitle="Record or update farm operational purchases, fertilizers, diesel, and maintenance bills"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('expenseTitle')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 5 Bags Organic Neem Cake Fertilizer, 50L Tractor Diesel"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
            {formErrors.title && (
              <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.title}</p>
            )}

            {/* Quick suggestions for farm operations & fertilizers */}
            <div className="mt-2">
              <span className="text-[11px] font-medium text-[#657168] block mb-1">
                Quick Presets / Operations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { title: 'Organic Neem Cake Fertilizer (5 Bags)', cat: 'Fertilizers & Nutrients' as ExpenseCategory, amount: 1600 },
                  { title: 'Urea 46% Fertilizer (50kg Bag)', cat: 'Fertilizers & Nutrients' as ExpenseCategory, amount: 280 },
                  { title: 'DAP / Complex Bio-Fertilizer', cat: 'Fertilizers & Nutrients' as ExpenseCategory, amount: 1350 },
                  { title: 'Tractor Diesel Fuel (50 Liters)', cat: 'Fuel & Diesel' as ExpenseCategory, amount: 4800 },
                  { title: 'Organic Neem Oil Bio-Spray (5L)', cat: 'Pesticides & Chemicals' as ExpenseCategory, amount: 1450 },
                  { title: 'Hybrid Seeds & Nursery Saplings', cat: 'Seeds & Seedlings' as ExpenseCategory, amount: 1200 },
                  { title: 'Drip Lateral Pipes & Emitter Spares', cat: 'Irrigation & Water' as ExpenseCategory, amount: 2200 },
                  { title: 'Tractor & Machinery Maintenance', cat: 'Machinery & Repairs' as ExpenseCategory, amount: 3500 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        title: preset.title,
                        category: preset.cat,
                        amount: prev.amount > 0 ? prev.amount : preset.amount,
                      }));
                    }}
                    className="text-[11px] px-2 py-1 bg-[#F7F6EF] hover:bg-[#DCE4DC] text-[#1F5D42] border border-[#DCE4DC] rounded-md transition-colors"
                  >
                    + {preset.title.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('expenseCategory')} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('amount')} ({currency}) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] font-bold focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.amount && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.amount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('date')} *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.date && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="CASH">{t('methodCash')}</option>
                <option value="UPI">{t('methodUPI')}</option>
                <option value="BANK_TRANSFER">{t('methodBank')}</option>
                <option value="CHEQUE">{t('methodCheque')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('assignedField')} (Optional)
              </label>
              <select
                value={formData.fieldId}
                onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="">None / General Farm Operational Cost</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('selectCropOptional')}
              </label>
              <select
                value={formData.cropId}
                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="">None / Not Crop Specific</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.variety})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('vendor')}
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Agro Agency, Petrol Pump, Hardware Store"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('receiptNumber')}
              </label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                placeholder="e.g. INV-1049, Receipt 042"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Dosage, application purpose, warranty or batch notes..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE4DC]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#202A24] bg-white border border-[#DCE4DC] rounded-lg hover:bg-[#F7F6EF] transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs"
            >
              {editingExpense ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={
          expenseToDelete
            ? `${t('confirmDeleteMessage')} "${expenseToDelete.title}" (${formatCurrency(expenseToDelete.amount, currency)})`
            : t('confirmDeleteMessage')
        }
      />
    </div>
  );
};
