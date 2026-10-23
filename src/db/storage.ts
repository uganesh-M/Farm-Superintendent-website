import { Crop, Field, Worker, WorkRecord, Payment, FarmSettings, FarmExpense } from '../types';

const STORAGE_KEYS = {
  CROPS: 'farm_superintendent_crops_v1',
  FIELDS: 'farm_superintendent_fields_v1',
  WORKERS: 'farm_superintendent_workers_v1',
  WORK_RECORDS: 'farm_superintendent_work_records_v1',
  PAYMENTS: 'farm_superintendent_payments_v1',
  EXPENSES: 'farm_superintendent_expenses_v1',
  SETTINGS: 'farm_superintendent_settings_v1',
  INITIALIZED: 'farm_superintendent_initialized_v1',
};

export const DEFAULT_SETTINGS: FarmSettings = {
  farmName: 'Greenfield Heritage Farm',
  ownerName: 'Senthil Nathan',
  location: 'Pollachi Valley, Coimbatore District',
  currency: 'INR',
  language: 'en',
  defaultAreaUnit: 'acres',
  standardWorkHours: 8,
};

export const INITIAL_FIELDS: Field[] = [
  {
    id: 'fld-1',
    name: 'North Valley Plot',
    size: 4.5,
    unit: 'acres',
    soilType: 'Loam',
    irrigationType: 'Drip',
    location: 'Adjacent to Solar Pump Shed',
    notes: 'Primary vegetable patch with high-fertility soil and drip fertigation lines.',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'fld-2',
    name: 'East Terrace Orchard',
    size: 3.2,
    unit: 'acres',
    soilType: 'Red',
    irrigationType: 'Sprinkler',
    location: 'Gentle eastern slope towards the stream',
    notes: 'Well-drained red soil suitable for bell peppers and perennial horticulture.',
    createdAt: '2026-08-02T08:00:00Z',
  },
  {
    id: 'fld-3',
    name: 'Riverbank Wetland Plot',
    size: 6.0,
    unit: 'acres',
    soilType: 'Alluvial',
    irrigationType: 'Canal',
    location: 'Southern perimeter along drainage canal',
    notes: 'Rich alluvial soil dedicated to organic Basmati paddy cultivation.',
    createdAt: '2026-08-05T08:00:00Z',
  },
  {
    id: 'fld-4',
    name: 'Hillside Ridge',
    size: 2.8,
    unit: 'acres',
    soilType: 'Clay',
    irrigationType: 'Borewell',
    location: 'Upper western boundary',
    notes: 'Terraced ridges with deep soil and borewell connection.',
    createdAt: '2026-08-10T08:00:00Z',
  },
];

export const INITIAL_CROPS: Crop[] = [
  {
    id: 'crp-1',
    name: 'Vine Tomatoes',
    variety: 'Hybrid Roma Red',
    fieldId: 'fld-1',
    plantingDate: '2026-08-15',
    expectedHarvestDate: '2026-10-25',
    areaPlanted: 2.5,
    areaUnit: 'acres',
    expectedYield: '18 Tons',
    status: 'READY_FOR_HARVEST',
    notes: 'First cluster harvest begins this weekend. Quality inspection passed.',
    createdAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'crp-2',
    name: 'Basmati Rice',
    variety: 'PB-1121 Scented',
    fieldId: 'fld-3',
    plantingDate: '2026-07-20',
    expectedHarvestDate: '2026-11-15',
    areaPlanted: 6.0,
    areaUnit: 'acres',
    expectedYield: '14 Tons',
    status: 'GROWING',
    notes: 'Tillering stage completed. Second organic neem cake fertilizing in progress.',
    createdAt: '2026-07-20T08:30:00Z',
  },
  {
    id: 'crp-3',
    name: 'Green Bell Peppers',
    variety: 'California Wonder',
    fieldId: 'fld-2',
    plantingDate: '2026-09-01',
    expectedHarvestDate: '2026-11-05',
    areaPlanted: 2.0,
    areaUnit: 'acres',
    expectedYield: '9 Tons',
    status: 'GROWING',
    notes: 'Flowering stage healthy. Drip irrigation scheduled every alternate morning.',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'crp-4',
    name: 'Winter Wheat',
    variety: 'Sharbati Gold',
    fieldId: 'fld-4',
    plantingDate: '2026-11-01',
    expectedHarvestDate: '2027-03-20',
    areaPlanted: 2.8,
    areaUnit: 'acres',
    expectedYield: '8 Tons',
    status: 'PLANNED',
    notes: 'Land tilling and seedbed preparation planned for next week.',
    createdAt: '2026-09-10T11:00:00Z',
  },
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'wrk-1',
    name: 'Murugan Karuppan',
    phone: '+91 98421 77310',
    role: 'Farm Supervisor',
    dailyWage: 650,
    status: 'ACTIVE',
    joiningDate: '2025-03-01',
    emergencyContact: '+91 94432 11098 (Brother)',
    notes: 'Experienced senior farm supervisor. Manages field team and drip systems.',
    createdAt: '2025-03-01T08:00:00Z',
  },
  {
    id: 'wrk-2',
    name: 'Rajesh Kumar',
    phone: '+91 97890 23411',
    role: 'Equipment Operator',
    dailyWage: 550,
    status: 'ACTIVE',
    joiningDate: '2025-06-15',
    emergencyContact: '+91 97890 23412 (Spouse)',
    notes: 'Licensed power-tiller and tractor operator, equipment maintenance specialist.',
    createdAt: '2025-06-15T08:00:00Z',
  },
  {
    id: 'wrk-3',
    name: 'Lakshmi Devi',
    phone: '+91 96551 88204',
    role: 'Harvest Specialist',
    dailyWage: 450,
    status: 'ACTIVE',
    joiningDate: '2025-08-10',
    emergencyContact: '+91 96551 88200 (Home)',
    notes: 'Expert in manual produce grading, delicate cluster picking, and packing.',
    createdAt: '2025-08-10T08:00:00Z',
  },
  {
    id: 'wrk-4',
    name: 'Selvam Perumal',
    phone: '+91 94862 33190',
    role: 'Field Worker',
    dailyWage: 450,
    status: 'ACTIVE',
    joiningDate: '2025-09-01',
    emergencyContact: '+91 94862 33195',
    notes: 'General weeding, bund maintenance, and channel irrigation duties.',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'wrk-5',
    name: 'Anita Bai',
    phone: '+91 99443 65120',
    role: 'General Labor',
    dailyWage: 420,
    status: 'ACTIVE',
    joiningDate: '2025-11-20',
    emergencyContact: '+91 99443 65129',
    notes: 'Field weeding, tray seedling preparation, and bio-fertilizer mixing.',
    createdAt: '2025-11-20T08:00:00Z',
  },
];

export const INITIAL_WORK_RECORDS: WorkRecord[] = [
  {
    id: 'rec-1',
    date: '2026-10-14',
    workerId: 'wrk-1',
    fieldId: 'fld-1',
    cropId: 'crp-1',
    taskType: 'Irrigation',
    hoursWorked: 8,
    dailyRateApplied: 650,
    wageAmount: 650,
    status: 'VERIFIED',
    notes: 'Supervised tomato plot drip flush and liquid nutrient dosing.',
    createdAt: '2026-10-14T17:30:00Z',
  },
  {
    id: 'rec-2',
    date: '2026-10-14',
    workerId: 'wrk-3',
    fieldId: 'fld-1',
    cropId: 'crp-1',
    taskType: 'Harvesting',
    hoursWorked: 8,
    dailyRateApplied: 450,
    wageAmount: 450,
    status: 'COMPLETED',
    notes: 'Harvested 38 crates of ripe hybrid tomatoes for early market dispatch.',
    createdAt: '2026-10-14T17:40:00Z',
  },
  {
    id: 'rec-3',
    date: '2026-10-14',
    workerId: 'wrk-4',
    fieldId: 'fld-2',
    cropId: 'crp-3',
    taskType: 'Weeding',
    hoursWorked: 8,
    dailyRateApplied: 450,
    wageAmount: 450,
    status: 'COMPLETED',
    notes: 'Manual inter-row weeding in block B of bell pepper terrace.',
    createdAt: '2026-10-14T17:45:00Z',
  },
  {
    id: 'rec-4',
    date: '2026-10-13',
    workerId: 'wrk-2',
    fieldId: 'fld-4',
    cropId: 'crp-4',
    taskType: 'Tilling',
    hoursWorked: 8,
    dailyRateApplied: 550,
    wageAmount: 550,
    status: 'VERIFIED',
    notes: 'Deep disc ploughing of hillside ridge plot in preparation for winter sowing.',
    createdAt: '2026-10-13T17:00:00Z',
  },
  {
    id: 'rec-5',
    date: '2026-10-13',
    workerId: 'wrk-5',
    fieldId: 'fld-2',
    cropId: 'crp-3',
    taskType: 'Fertilizing',
    hoursWorked: 8,
    dailyRateApplied: 420,
    wageAmount: 420,
    status: 'COMPLETED',
    notes: 'Applied organic compost and vermicompost ring around bell pepper plants.',
    createdAt: '2026-10-13T17:15:00Z',
  },
  {
    id: 'rec-6',
    date: '2026-10-12',
    workerId: 'wrk-1',
    fieldId: 'fld-3',
    cropId: 'crp-2',
    taskType: 'General Maintenance',
    hoursWorked: 8,
    dailyRateApplied: 650,
    wageAmount: 650,
    status: 'VERIFIED',
    notes: 'Paddy field water depth inspection and bund strengthening.',
    createdAt: '2026-10-12T17:00:00Z',
  },
  {
    id: 'rec-7',
    date: '2026-10-12',
    workerId: 'wrk-4',
    fieldId: 'fld-3',
    cropId: 'crp-2',
    taskType: 'Spraying',
    hoursWorked: 8,
    dailyRateApplied: 450,
    wageAmount: 450,
    status: 'COMPLETED',
    notes: 'Sprayed organic neem oil extract for stem borer prevention in rice crop.',
    createdAt: '2026-10-12T17:10:00Z',
  },
  {
    id: 'rec-8',
    date: '2026-10-11',
    workerId: 'wrk-3',
    fieldId: 'fld-1',
    cropId: 'crp-1',
    taskType: 'Pruning',
    hoursWorked: 8,
    dailyRateApplied: 450,
    wageAmount: 450,
    status: 'VERIFIED',
    notes: 'Lower leaf de-suckering and trellising support tying for tomato vines.',
    createdAt: '2026-10-11T17:00:00Z',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    workerId: 'wrk-1',
    date: '2026-10-12',
    amount: 1950,
    paymentMethod: 'UPI',
    status: 'PAID',
    referenceNo: 'UPI-98421-20261012',
    notes: 'Wages settled for 3 days of supervision duty.',
    createdAt: '2026-10-12T18:00:00Z',
  },
  {
    id: 'pay-2',
    workerId: 'wrk-2',
    date: '2026-10-13',
    amount: 1100,
    paymentMethod: 'CASH',
    status: 'PAID',
    referenceNo: 'VOUCHER-084',
    notes: 'Cash payment for tractor tilling days.',
    createdAt: '2026-10-13T18:15:00Z',
  },
  {
    id: 'pay-3',
    workerId: 'wrk-3',
    date: '2026-10-10',
    amount: 900,
    paymentMethod: 'UPI',
    status: 'PAID',
    referenceNo: 'UPI-96551-20261010',
    notes: 'Wage settlement for earlier harvest cycle.',
    createdAt: '2026-10-10T17:45:00Z',
  },
  {
    id: 'pay-4',
    workerId: 'wrk-4',
    date: '2026-10-11',
    amount: 500,
    paymentMethod: 'CASH',
    status: 'ADVANCE',
    referenceNo: 'ADV-1011',
    notes: 'Festival cash advance requested by worker.',
    createdAt: '2026-10-11T12:00:00Z',
  },
  {
    id: 'pay-5',
    workerId: 'wrk-5',
    date: '2026-10-13',
    amount: 420,
    paymentMethod: 'CASH',
    status: 'PAID',
    referenceNo: 'VOUCHER-086',
    notes: 'Daily wage payment for bio-fertilizing labor.',
    createdAt: '2026-10-13T18:30:00Z',
  },
];

export const INITIAL_EXPENSES: FarmExpense[] = [
  {
    id: 'exp-1',
    title: 'Organic Neem Cake & Bio-Fertilizer (10 Bags)',
    category: 'Fertilizers & Nutrients',
    amount: 3200,
    date: '2026-10-10',
    fieldId: 'fld-1',
    cropId: 'crp-1',
    vendor: 'Kovai Bio Agri Inputs',
    paymentMethod: 'UPI',
    receiptNumber: 'INV-8891',
    notes: 'Applied in tomato root zone for slow nutrient release and pest resistance.',
    createdAt: '2026-10-10T11:00:00Z',
  },
  {
    id: 'exp-2',
    title: 'Diesel for Tractor Ploughing & Power Tiller (45L)',
    category: 'Fuel & Diesel',
    amount: 4350,
    date: '2026-10-12',
    fieldId: 'fld-4',
    vendor: 'Indian Oil Petrol Bunk Pollachi',
    paymentMethod: 'CASH',
    receiptNumber: 'DSL-402',
    notes: 'Field tilling and disc harrowing on hillside ridge plot.',
    createdAt: '2026-10-12T09:30:00Z',
  },
  {
    id: 'exp-3',
    title: 'Hybrid Tomato Seedlings & Nursery Trays',
    category: 'Seeds & Seedlings',
    amount: 1800,
    date: '2026-08-12',
    fieldId: 'fld-1',
    cropId: 'crp-1',
    vendor: 'Annamalai Agro Nursery',
    paymentMethod: 'UPI',
    receiptNumber: 'NUR-110',
    notes: 'Certified disease-free seedlings for 2.5 acres plantation.',
    createdAt: '2026-08-12T14:00:00Z',
  },
  {
    id: 'exp-4',
    title: 'Drip Lateral Pipes & Inline Emitters (16mm)',
    category: 'Irrigation & Water',
    amount: 2600,
    date: '2026-09-05',
    fieldId: 'fld-2',
    vendor: 'Jain Irrigation Dealership',
    paymentMethod: 'BANK_TRANSFER',
    receiptNumber: 'JIN-552',
    notes: 'Replacement lines and flush valves for bell pepper patch.',
    createdAt: '2026-09-05T16:15:00Z',
  },
  {
    id: 'exp-5',
    title: 'Organic Neem Oil Extract & Herbal Spray (5L)',
    category: 'Pesticides & Chemicals',
    amount: 1450,
    date: '2026-10-11',
    fieldId: 'fld-3',
    cropId: 'crp-2',
    vendor: 'Green Earth Organics',
    paymentMethod: 'CASH',
    receiptNumber: 'GEO-92',
    notes: 'Preventive stem borer spray for Basmati paddy wetland.',
    createdAt: '2026-10-11T10:20:00Z',
  },
];

// Helper to safely read from localStorage
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed reading ${key} from storage:`, err);
    return defaultValue;
  }
}

// Helper to safely write to localStorage
function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Ensure default demo data is populated on very first load
  initializeIfNeeded(): void {
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        this.resetToDemoData();
      }
    } catch {
      // storage unavailable or restricted
    }
  },

  resetToDemoData(): void {
    writeStorage(STORAGE_KEYS.FIELDS, INITIAL_FIELDS);
    writeStorage(STORAGE_KEYS.CROPS, INITIAL_CROPS);
    writeStorage(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
    writeStorage(STORAGE_KEYS.WORK_RECORDS, INITIAL_WORK_RECORDS);
    writeStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    writeStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // ignore
    }
  },

  clearAllData(): void {
    writeStorage(STORAGE_KEYS.FIELDS, []);
    writeStorage(STORAGE_KEYS.CROPS, []);
    writeStorage(STORAGE_KEYS.WORKERS, []);
    writeStorage(STORAGE_KEYS.WORK_RECORDS, []);
    writeStorage(STORAGE_KEYS.PAYMENTS, []);
    writeStorage(STORAGE_KEYS.EXPENSES, []);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // ignore
    }
  },

  // CROPS
  getCrops(): Crop[] {
    return readStorage<Crop[]>(STORAGE_KEYS.CROPS, []);
  },
  saveCrop(crop: Crop): Crop {
    const crops = this.getCrops();
    const index = crops.findIndex((c) => c.id === crop.id);
    if (index >= 0) {
      crops[index] = crop;
    } else {
      crops.unshift(crop);
    }
    writeStorage(STORAGE_KEYS.CROPS, crops);
    return crop;
  },
  deleteCrop(id: string): { success: boolean; error?: string } {
    const records = this.getWorkRecords();
    const hasWorkRecords = records.some((r) => r.cropId === id);
    if (hasWorkRecords) {
      return {
        success: false,
        error: 'Cannot delete crop because daily work records are associated with it. Please reassign or remove associated work records first.',
      };
    }
    const crops = this.getCrops().filter((c) => c.id !== id);
    writeStorage(STORAGE_KEYS.CROPS, crops);
    return { success: true };
  },

  // FIELDS
  getFields(): Field[] {
    return readStorage<Field[]>(STORAGE_KEYS.FIELDS, []);
  },
  saveField(field: Field): Field {
    const fields = this.getFields();
    const index = fields.findIndex((f) => f.id === field.id);
    if (index >= 0) {
      fields[index] = field;
    } else {
      fields.unshift(field);
    }
    writeStorage(STORAGE_KEYS.FIELDS, fields);
    return field;
  },
  deleteField(id: string): { success: boolean; error?: string } {
    const crops = this.getCrops();
    const activeCrop = crops.find((c) => c.fieldId === id && c.status !== 'HARVESTED' && c.status !== 'TERMINATED');
    if (activeCrop) {
      return {
        success: false,
        error: `Cannot delete field because active crop "${activeCrop.name}" is planted in it. Reassign or conclude the crop first.`,
      };
    }
    const fields = this.getFields().filter((f) => f.id !== id);
    writeStorage(STORAGE_KEYS.FIELDS, fields);
    return { success: true };
  },

  // WORKERS
  getWorkers(): Worker[] {
    return readStorage<Worker[]>(STORAGE_KEYS.WORKERS, []);
  },
  saveWorker(worker: Worker): Worker {
    const workers = this.getWorkers();
    const index = workers.findIndex((w) => w.id === worker.id);
    if (index >= 0) {
      workers[index] = worker;
    } else {
      workers.unshift(worker);
    }
    writeStorage(STORAGE_KEYS.WORKERS, workers);
    return worker;
  },
  deleteWorker(id: string): { success: boolean; error?: string } {
    const records = this.getWorkRecords();
    const payments = this.getPayments();
    const hasHistory = records.some((r) => r.workerId === id) || payments.some((p) => p.workerId === id);
    if (hasHistory) {
      return {
        success: false,
        error: 'Cannot delete worker with existing work records or payment history. Consider marking worker status as Inactive instead.',
      };
    }
    const workers = this.getWorkers().filter((w) => w.id !== id);
    writeStorage(STORAGE_KEYS.WORKERS, workers);
    return { success: true };
  },

  // WORK RECORDS
  getWorkRecords(): WorkRecord[] {
    return readStorage<WorkRecord[]>(STORAGE_KEYS.WORK_RECORDS, []);
  },
  saveWorkRecord(record: WorkRecord): WorkRecord {
    const records = this.getWorkRecords();
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    writeStorage(STORAGE_KEYS.WORK_RECORDS, records);
    return record;
  },
  deleteWorkRecord(id: string): { success: boolean } {
    const records = this.getWorkRecords().filter((r) => r.id !== id);
    writeStorage(STORAGE_KEYS.WORK_RECORDS, records);
    return { success: true };
  },

  // PAYMENTS
  getPayments(): Payment[] {
    return readStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  },
  savePayment(payment: Payment): Payment {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === payment.id);
    if (index >= 0) {
      payments[index] = payment;
    } else {
      payments.unshift(payment);
    }
    writeStorage(STORAGE_KEYS.PAYMENTS, payments);
    return payment;
  },
  deletePayment(id: string): { success: boolean } {
    const payments = this.getPayments().filter((p) => p.id !== id);
    writeStorage(STORAGE_KEYS.PAYMENTS, payments);
    return { success: true };
  },

  // EXPENSES
  getExpenses(): FarmExpense[] {
    return readStorage<FarmExpense[]>(STORAGE_KEYS.EXPENSES, []);
  },
  saveExpense(expense: FarmExpense): FarmExpense {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    writeStorage(STORAGE_KEYS.EXPENSES, expenses);
    return expense;
  },
  deleteExpense(id: string): { success: boolean } {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    writeStorage(STORAGE_KEYS.EXPENSES, expenses);
    return { success: true };
  },

  // SETTINGS
  getSettings(): FarmSettings {
    return readStorage<FarmSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: FarmSettings): FarmSettings {
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // FULL BACKUP EXPORT & IMPORT
  exportBackupJSON(): string {
    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      fields: this.getFields(),
      crops: this.getCrops(),
      workers: this.getWorkers(),
      workRecords: this.getWorkRecords(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
    };
    return JSON.stringify(bundle, null, 2);
  },

  importBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid backup file format.' };
      }
      if (Array.isArray(data.fields)) writeStorage(STORAGE_KEYS.FIELDS, data.fields);
      if (Array.isArray(data.crops)) writeStorage(STORAGE_KEYS.CROPS, data.crops);
      if (Array.isArray(data.workers)) writeStorage(STORAGE_KEYS.WORKERS, data.workers);
      if (Array.isArray(data.workRecords)) writeStorage(STORAGE_KEYS.WORK_RECORDS, data.workRecords);
      if (Array.isArray(data.payments)) writeStorage(STORAGE_KEYS.PAYMENTS, data.payments);
      if (Array.isArray(data.expenses)) writeStorage(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.settings && typeof data.settings === 'object') writeStorage(STORAGE_KEYS.SETTINGS, data.settings);

      return { success: true, message: 'Farm data restored successfully!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown parsing error';
      return { success: false, message: `Backup restore failed: ${msg}` };
    }
  },
};
