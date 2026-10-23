/**
 * Core Domain Models for Farm Superintendent
 */

export type CropStatus = 'PLANNED' | 'GROWING' | 'READY_FOR_HARVEST' | 'HARVESTED' | 'TERMINATED';

export interface Crop {
  id: string;
  name: string;
  variety: string;
  fieldId: string;
  plantingDate: string; // YYYY-MM-DD
  expectedHarvestDate: string; // YYYY-MM-DD
  actualHarvestDate?: string;
  areaPlanted: number;
  areaUnit: 'acres' | 'hectares' | 'cents' | 'sq_ft';
  expectedYield?: string; // e.g. "4.5 tons"
  status: CropStatus;
  notes?: string;
  createdAt: string;
}

export type SoilType = 'Clay' | 'Loam' | 'Sandy' | 'Silt' | 'Black' | 'Red' | 'Alluvial' | 'Other';
export type IrrigationType = 'Drip' | 'Sprinkler' | 'Canal' | 'Rainfed' | 'Borewell' | 'Flood' | 'None';

export interface Field {
  id: string;
  name: string;
  size: number;
  unit: 'acres' | 'hectares' | 'cents' | 'sq_ft';
  soilType: SoilType;
  irrigationType: IrrigationType;
  location?: string;
  notes?: string;
  createdAt: string;
}

export type WorkerRole = 
  | 'Farm Supervisor' 
  | 'Field Worker' 
  | 'Equipment Operator' 
  | 'Harvest Specialist' 
  | 'Irrigation Technician' 
  | 'General Labor';

export type WorkerStatus = 'ACTIVE' | 'INACTIVE';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: WorkerRole;
  dailyWage: number;
  status: WorkerStatus;
  joiningDate: string; // YYYY-MM-DD
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
}

export type TaskType = 
  | 'Sowing' 
  | 'Weeding' 
  | 'Spraying' 
  | 'Pruning' 
  | 'Irrigation' 
  | 'Fertilizing' 
  | 'Harvesting' 
  | 'Tilling' 
  | 'Packing' 
  | 'General Maintenance' 
  | 'Other';

export type WorkStatus = 'COMPLETED' | 'IN_PROGRESS' | 'VERIFIED';

export interface WorkRecord {
  id: string;
  date: string; // YYYY-MM-DD
  workerId: string;
  fieldId: string;
  cropId?: string;
  taskType: TaskType;
  hoursWorked: number;
  dailyRateApplied: number;
  wageAmount: number; // calculated as dailyRateApplied * (hoursWorked / 8) or flat daily
  status: WorkStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'ADVANCE';

export interface Payment {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Fertilizers & Nutrients'
  | 'Seeds & Seedlings'
  | 'Pesticides & Chemicals'
  | 'Fuel & Diesel'
  | 'Machinery & Repairs'
  | 'Irrigation & Water'
  | 'Packaging & Transport'
  | 'Tools & Supplies'
  | 'Land & Lease'
  | 'Other Operations';

export interface FarmExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  fieldId?: string;
  cropId?: string;
  vendor?: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface FarmSettings {
  farmName: string;
  ownerName: string;
  location: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  language: SupportedLanguage;
  defaultAreaUnit: 'acres' | 'hectares' | 'cents' | 'sq_ft';
  standardWorkHours: number;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'crops' 
  | 'fields' 
  | 'workers' 
  | 'work-records' 
  | 'payments' 
  | 'expenses'
  | 'reports' 
  | 'settings';
