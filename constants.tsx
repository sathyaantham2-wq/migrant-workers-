
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const ESTABLISHMENT_TYPES = [
  'Brick Kiln', 'Construction Site', 'Rice Mill', 'Pharma Unit', 'Logistics Hub', 'Other'
];

export const MOCK_DATA = {
  years: [
    { id: 'y1', label: '2023-24', startDate: '2023-04-01', endDate: '2024-03-31', status: 'CLOSED' },
    { id: 'y2', label: '2024-25', startDate: '2024-04-01', endDate: '2025-03-31', status: 'ACTIVE' }
  ],
  establishments: [
    { id: 'em1', name: 'RR Bricks Co', registrationNumber: 'REG-001', type: 'Brick Kiln' },
    { id: 'em2', name: 'Skyline Construction', registrationNumber: 'REG-002', type: 'Construction Site' }
  ],
  yearlyEstablishments: [
    { id: 'ye1', yearId: 'y2', masterId: 'em1', siteAddress: 'Moinabad Road, RR Dist', ownerName: 'Venkatesh Rao', ownerMobile: '9876543210' },
    { id: 'ye2', yearId: 'y1', masterId: 'em1', siteAddress: 'Chevella Cross, RR Dist', ownerName: 'Venkatesh Rao', ownerMobile: '9876543210' }
  ],
  workers: [
    { 
      id: 'w1', 
      yearId: 'y2', 
      establishmentId: 'ye1', 
      name: 'Rahul Kumar', 
      fatherName: 'Ram Singh',
      age: 32,
      gender: 'Male',
      caste: 'OBC',
      mobile: '9000012345', 
      aadhaarNumber: '123456789012',
      nativeState: 'Bihar', 
      natureOfWork: 'Masonry',
      joiningDate: '2024-05-10', 
      expectedEndDate: '2025-01-10', 
      hasFamilyAtSite: true 
    },
    { 
      id: 'w2', 
      yearId: 'y2', 
      establishmentId: 'ye1', 
      name: 'Sanjay Singh', 
      fatherName: 'Vijay Singh',
      age: 28,
      gender: 'Male',
      caste: 'General',
      mobile: '9000012346', 
      aadhaarNumber: '987654321098',
      nativeState: 'Uttar Pradesh', 
      natureOfWork: 'Helper',
      joiningDate: '2024-06-15', 
      expectedEndDate: '2024-12-15', 
      hasFamilyAtSite: false 
    }
  ],
  familyMembers: [
    { id: 'f1', workerRegId: 'w1', name: 'Anita Devi', relation: 'Spouse', age: 28 },
    { id: 'f2', workerRegId: 'w1', name: 'Bittu', relation: 'Son', age: 4 }
  ],
  advances: [
    { id: 'a1', workerRegId: 'w1', amount: 5000, date: '2024-05-15', mode: 'Cash', remarks: 'Relocation assistance' }
  ]
};
