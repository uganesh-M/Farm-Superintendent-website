/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Crop, Field, Worker, WorkRecord, Payment, FarmExpense, FarmSettings } from './types';
import { StorageService, DEFAULT_SETTINGS } from './db/storage';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { NotificationToast, ToastMessage } from './components/common/NotificationToast';

import { DashboardView } from './components/dashboard/DashboardView';
import { CropsView } from './components/crops/CropsView';
import { FieldsView } from './components/fields/FieldsView';
import { WorkersView } from './components/workers/WorkersView';
import { WorkRecordsView } from './components/workRecords/WorkRecordsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

function FarmSuperintendentApp() {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [settings, setSettings] = useState<FarmSettings>(DEFAULT_SETTINGS);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<FarmExpense[]>([]);

  // Modal triggers from quick actions
  const [quickCropModal, setQuickCropModal] = useState(false);
  const [quickFieldModal, setQuickFieldModal] = useState(false);
  const [quickWorkerModal, setQuickWorkerModal] = useState(false);
  const [quickWorkModal, setQuickWorkModal] = useState(false);
  const [quickPaymentModal, setQuickPaymentModal] = useState(false);
  const [quickExpenseModal, setQuickExpenseModal] = useState(false);
  const [preselectedWorkerForPayment, setPreselectedWorkerForPayment] = useState<string | null>(null);

  // Notification toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    StorageService.initializeIfNeeded();
    reloadAllData();
  }, []);

  const reloadAllData = () => {
    setSettings(StorageService.getSettings());
    setFields(StorageService.getFields());
    setCrops(StorageService.getCrops());
    setWorkers(StorageService.getWorkers());
    setWorkRecords(StorageService.getWorkRecords());
    setPayments(StorageService.getPayments());
    setExpenses(StorageService.getExpenses());
  };

  // Handlers for CROPS
  const handleSaveCrop = (crop: Crop) => {
    StorageService.saveCrop(crop);
    setCrops(StorageService.getCrops());
    showToast(t('successSaved'));
    setQuickCropModal(false);
  };

  const handleDeleteCrop = (id: string) => {
    const result = StorageService.deleteCrop(id);
    if (result.success) {
      setCrops(StorageService.getCrops());
      showToast(t('successDeleted'));
    }
    return result;
  };

  // Handlers for FIELDS
  const handleSaveField = (field: Field) => {
    StorageService.saveField(field);
    setFields(StorageService.getFields());
    showToast(t('successSaved'));
    setQuickFieldModal(false);
  };

  const handleDeleteField = (id: string) => {
    const result = StorageService.deleteField(id);
    if (result.success) {
      setFields(StorageService.getFields());
      showToast(t('successDeleted'));
    }
    return result;
  };

  // Handlers for WORKERS
  const handleSaveWorker = (worker: Worker) => {
    StorageService.saveWorker(worker);
    setWorkers(StorageService.getWorkers());
    showToast(t('successSaved'));
    setQuickWorkerModal(false);
  };

  const handleDeleteWorker = (id: string) => {
    const result = StorageService.deleteWorker(id);
    if (result.success) {
      setWorkers(StorageService.getWorkers());
      showToast(t('successDeleted'));
    }
    return result;
  };

  // Handlers for WORK RECORDS
  const handleSaveWorkRecord = (record: WorkRecord) => {
    StorageService.saveWorkRecord(record);
    setWorkRecords(StorageService.getWorkRecords());
    showToast(t('successSaved'));
    setQuickWorkModal(false);
  };

  const handleDeleteWorkRecord = (id: string) => {
    const result = StorageService.deleteWorkRecord(id);
    if (result.success) {
      setWorkRecords(StorageService.getWorkRecords());
      showToast(t('successDeleted'));
    }
    return result;
  };

  // Handlers for PAYMENTS
  const handleSavePayment = (payment: Payment) => {
    StorageService.savePayment(payment);
    setPayments(StorageService.getPayments());
    showToast(t('successSaved'));
    setQuickPaymentModal(false);
    setPreselectedWorkerForPayment(null);
  };

  const handleDeletePayment = (id: string) => {
    const result = StorageService.deletePayment(id);
    if (result.success) {
      setPayments(StorageService.getPayments());
      showToast(t('successDeleted'));
    }
    return result;
  };

  // Handlers for EXPENSES
  const handleSaveExpense = (expense: FarmExpense) => {
    StorageService.saveExpense(expense);
    setExpenses(StorageService.getExpenses());
    showToast(t('successSaved'));
    setQuickExpenseModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    const result = StorageService.deleteExpense(id);
    if (result.success) {
      setExpenses(StorageService.getExpenses());
      showToast(t('successDeleted'));
    }
    return result;
  };

  // Handlers for SETTINGS & DATA
  const handleSaveSettings = (newSettings: FarmSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast(t('successUpdated'));
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farm_superintendent_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database exported successfully.');
  };

  const handleImportData = (jsonStr: string) => {
    const res = StorageService.importBackupJSON(jsonStr);
    if (res.success) {
      reloadAllData();
      showToast(t('dataRestored'));
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const handleResetToDemo = () => {
    StorageService.resetToDemoData();
    reloadAllData();
    showToast(t('demoDataLoaded'));
  };

  const handleClearAll = () => {
    StorageService.clearAllData();
    reloadAllData();
    showToast(t('dataCleared'));
  };

  // Quick Action Dispatcher
  const handleQuickAction = (action: 'crop' | 'field' | 'worker' | 'work' | 'payment' | 'expense') => {
    switch (action) {
      case 'crop':
        setActiveTab('crops');
        setQuickCropModal(true);
        break;
      case 'field':
        setActiveTab('fields');
        setQuickFieldModal(true);
        break;
      case 'worker':
        setActiveTab('workers');
        setQuickWorkerModal(true);
        break;
      case 'work':
        setActiveTab('work-records');
        setQuickWorkModal(true);
        break;
      case 'payment':
        setActiveTab('payments');
        setQuickPaymentModal(true);
        break;
      case 'expense':
        setActiveTab('expenses');
        setQuickExpenseModal(true);
        break;
    }
  };

  const handlePayWorkerDirect = (workerId: string) => {
    setPreselectedWorkerForPayment(workerId);
    setActiveTab('payments');
  };

  return (
    <div className="flex min-h-screen bg-[#F7F6EF] text-[#202A24] antialiased">
      {/* Sidebar for Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        farmName={settings.farmName}
      />

      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        farmName={settings.farmName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickAction={() => handleQuickAction('work')}
          currency={settings.currency}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              crops={crops}
              fields={fields}
              workers={workers}
              workRecords={workRecords}
              payments={payments}
              expenses={expenses}
              currency={settings.currency}
              onNavigate={setActiveTab}
              onQuickAction={handleQuickAction}
            />
          )}

          {activeTab === 'crops' && (
            <CropsView
              crops={crops}
              fields={fields}
              onSaveCrop={handleSaveCrop}
              onDeleteCrop={handleDeleteCrop}
              initialModalOpen={quickCropModal}
            />
          )}

          {activeTab === 'fields' && (
            <FieldsView
              fields={fields}
              crops={crops}
              onSaveField={handleSaveField}
              onDeleteField={handleDeleteField}
              initialModalOpen={quickFieldModal}
            />
          )}

          {activeTab === 'workers' && (
            <WorkersView
              workers={workers}
              workRecords={workRecords}
              payments={payments}
              currency={settings.currency}
              onSaveWorker={handleSaveWorker}
              onDeleteWorker={handleDeleteWorker}
              onRecordPaymentForWorker={handlePayWorkerDirect}
              initialModalOpen={quickWorkerModal}
            />
          )}

          {activeTab === 'work-records' && (
            <WorkRecordsView
              workRecords={workRecords}
              workers={workers}
              fields={fields}
              crops={crops}
              currency={settings.currency}
              onSaveWorkRecord={handleSaveWorkRecord}
              onDeleteWorkRecord={handleDeleteWorkRecord}
              initialModalOpen={quickWorkModal}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              workers={workers}
              workRecords={workRecords}
              currency={settings.currency}
              onSavePayment={handleSavePayment}
              onDeletePayment={handleDeletePayment}
              initialModalOpen={quickPaymentModal}
              preselectedWorkerId={preselectedWorkerForPayment}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              fields={fields}
              crops={crops}
              currency={settings.currency}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              initialModalOpen={quickExpenseModal}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              crops={crops}
              fields={fields}
              workers={workers}
              workRecords={workRecords}
              payments={payments}
              expenses={expenses}
              currency={settings.currency}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetToDemo={handleResetToDemo}
              onClearAll={handleClearAll}
            />
          )}
        </main>
      </div>

      {/* Floating Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <FarmSuperintendentApp />
    </LanguageProvider>
  );
}
