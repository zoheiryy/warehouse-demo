import React from 'react';
import TripDetailsPanel from './TripDetailsPanel';

// Sample B2C + T1 trip data for testing
const sampleB2CT1Trip = {
  id: 'TRP-001',
  tripType: 'B2C',
  warehouseType: 'T1',
  collectorName: 'أحمد محمد',
  expectedQuantity: 500,
  quantityKg: 485,
  status: {
    id: 'مكتملة',
    label: 'مكتملة'
  },
  createdAt: new Date('2024-01-15T08:00:00Z')
};

// Test component to demonstrate the workflow
const TripDetailsPanelTest = () => {
  const [showPanel, setShowPanel] = React.useState(true);

  if (!showPanel) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif'
      }}>
        <h2>اختبار مكون تفاصيل الرحلة - B2C + T1</h2>
        <button
          onClick={() => setShowPanel(true)}
          style={{
            padding: '12px 24px',
            background: '#0369a1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          عرض تفاصيل الرحلة
        </button>
        
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'start'
        }}>
          <h3>تعليمات الاختبار:</h3>
          <ol>
            <li>انقر على "بدء مراجعة الكمية" لبدء استلام من المندوب</li>
            <li>راجع الكمية وأكد الاستلام</li>
            <li>انقر على "بدء استلام في الخزان" لنقل الزيت إلى الخزان</li>
            <li>شاهد عملية الوزن التلقائية</li>
            <li>أكد النقل لإكمال العملية</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TripDetailsPanel 
        trip={sampleB2CT1Trip}
        onClose={() => setShowPanel(false)}
      />
    </div>
  );
};

export default TripDetailsPanelTest; 