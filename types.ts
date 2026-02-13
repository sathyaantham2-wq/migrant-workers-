
export enum YearStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}

export interface WorkYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: YearStatus;
}

export interface EstablishmentMaster {
  id: string;
  name: string;
  registrationNumber: string;
  type: string;
}

export interface YearlyEstablishment {
  id: string;
  yearId: string;
  masterId: string;
  siteAddress: string;
  ownerName: string;
  ownerMobile: string;
}

export interface WorkerRegistration {
  id: string;
  yearId: string;
  establishmentId: string;
  name: string;
  fatherName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  caste: string;
  mobile: string;
  aadhaarNumber: string;
  nativeState: string;
  natureOfWork: string;
  joiningDate: string;
  expectedEndDate: string;
  hasFamilyAtSite: boolean;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  workerRegId: string;
  name: string;
  relation: string;
  age: number;
  notes?: string;
}

export interface AdvanceRecord {
  id: string;
  workerRegId: string;
  amount: number;
  date: string;
  mode: 'Cash' | 'Bank Transfer' | 'Other';
  remarks: string;
}

export interface AppState {
  years: WorkYear[];
  currentYearId: string;
  establishments: EstablishmentMaster[];
  yearlyEstablishments: YearlyEstablishment[];
  workers: WorkerRegistration[];
  familyMembers: FamilyMember[];
  advances: AdvanceRecord[];
  googleSheetUrl?: string;
  lastSyncedAt?: string;
}
