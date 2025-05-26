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

  // Create specific examples for each trip type to ensure we have all types
  const specificTrips = [
    // B2C Examples (UCO receiving enabled)
    {
      id: '45681',
      collectorName: 'مصطفى طارق',
      tripType: 'B2C',
      quantityKg: 425,
      status: statuses[3], // مكتملة
      warehouseType: 'T1',
      expectedQuantity: 450,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      area: 'الرياض - حي النخيل'
    },
    {
      id: '45682',
      collectorName: 'سارة أحمد',
      tripType: 'B2C',
      quantityKg: 608,
      status: statuses[3], // مكتملة
      warehouseType: 'T3',
      expectedQuantity: 600,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      area: 'جدة - حي الصفا'
    },
    // Additional B2C example for testing
    {
      id: '45688',
      collectorName: 'نور الدين',
      tripType: 'B2C',
      quantityKg: 350,
      status: statuses[0], // لم تبدأ
      warehouseType: 'T1',
      expectedQuantity: 380,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      area: 'الرياض - العليا'
    },
    // B2B Examples (functionality disabled for now)
    {
      id: '45683',
      collectorName: 'أحمد محمود',
      tripType: 'B2B',
      quantityKg: 850,
      status: statuses[3], // مكتملة
      warehouseType: 'T1',
      expectedQuantity: 900,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      area: 'الدمام - الكورنيش'
    },
    {
      id: '45684',
      collectorName: 'محمد علي',
      tripType: 'B2B',
      quantityKg: 720,
      status: statuses[2], // قيد الانتظار
      warehouseType: 'T1',
      expectedQuantity: 750,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      area: 'مكة - العزيزية'
    },
    // B2X Examples (functionality disabled for now)
    {
      id: '45685',
      collectorName: 'عمر خالد',
      tripType: 'B2X',
      quantityKg: 380,
      status: statuses[1], // بدأت
      warehouseType: 'T1',
      expectedQuantity: 400,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      area: 'الطائف - الحوية'
    },
    {
      id: '45686',
      collectorName: 'فاطمة محمد',
      tripType: 'B2X',
      quantityKg: 520,
      status: statuses[0], // لم تبدأ
      warehouseType: 'T1', // Changed from T3 to T1 to support B2X workflow
      expectedQuantity: 550,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      area: 'المدينة - قباء'
    },
    // Additional B2X example for testing
    {
      id: '45687',
      collectorName: 'خديجة عبدالله',
      tripType: 'B2X',
      quantityKg: 680,
      status: statuses[3], // مكتملة
      warehouseType: 'T1',
      expectedQuantity: 700,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      area: 'الخبر - الكورنيش'
    },
    // B2B Example for testing UCO receiving with remainder loop
    {
      id: '45689',
      collectorName: 'يوسف إبراهيم',
      tripType: 'B2B',
      quantityKg: 1200,
      status: statuses[0], // لم تبدأ
      warehouseType: 'T1',
      expectedQuantity: 1250,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      area: 'الرياض - الملز'
    }
  ];

  // Add some random trips to fill the rest
  const randomTrips = Array.from({ length: 6 }, (_, index) => ({
    id: `4568${index + 7}`,
    collectorName: collectors[index + 6],
    tripType: tripTypes[Math.floor(Math.random() * tripTypes.length)],
    quantityKg: Math.floor(Math.random() * 500) + 200,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    warehouseType: Math.random() > 0.5 ? 'T1' : 'T3',
    expectedQuantity: Math.floor(Math.random() * 600) + 300,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    area: 'منطقة عشوائية'
  }));

  return [...specificTrips, ...randomTrips];
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