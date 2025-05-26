// Dummy data for trips based on the PRD specifications
export const generateDummyTrips = () => {
  const collectors = [
    'مصطفى طارق', 'أحمد محمود', 'محمد علي', 'عمر خالد', 
    'سارة أحمد', 'فاطمة محمد', 'خديجة عبدالله', 'نور الدين',
    'يوسف إبراهيم', 'عبدالرحمن سعد', 'ليلى حسن', 'مريم عثمان'
  ];
  
  const tripTypes = ['B2C', 'B2X', 'B2B', 'TG'];
  const statuses = [
    { id: 'لم تبدأ', label: 'لم تبدأ', color: '#6b7280' },
    { id: 'بدأت', label: 'بدأت', color: '#0369a1' },
    { id: 'قيد الانتظار', label: 'قيد الانتظار', color: '#d97706' },
    { id: 'مكتملة', label: 'مكتملة', color: '#059669' }
  ];

  return Array.from({ length: 12 }, (_, index) => ({
    id: `4568${index + 1}`,
    collectorName: collectors[index],
    tripType: tripTypes[Math.floor(Math.random() * tripTypes.length)],
    quantityKg: Math.floor(Math.random() * 500) + 200, // 200-700 kg
    status: statuses[Math.floor(Math.random() * statuses.length)],
    warehouseType: Math.random() > 0.5 ? 'T1' : 'T3',
    expectedQuantity: Math.floor(Math.random() * 600) + 300,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
  }));
};

// Trip status constants for consistency
export const TRIP_STATUSES = {
  NOT_STARTED: { id: 'لم تبدأ', label: 'لم تبدأ', color: '#6b7280' },
  STARTED: { id: 'بدأت', label: 'بدأت', color: '#0369a1' },
  WAITING: { id: 'قيد الانتظار', label: 'قيد الانتظار', color: '#d97706' },
  COMPLETED: { id: 'مكتملة', label: 'مكتملة', color: '#059669' }
};

// Trip type constants
export const TRIP_TYPES = {
  B2C: 'B2C',
  B2X: 'B2X', 
  B2B: 'B2B',
  TG: 'TG'
};

// Warehouse type constants
export const WAREHOUSE_TYPES = {
  T1: 'T1',
  T3: 'T3'
}; 