import React from 'react';
import { IconAlertCircle, IconX } from '@tabler/icons-react';

const TripDetailsPanel = ({ trip, onClose }) => {
  if (!trip) return null;

  return (
    <div style={{
      position: 'fixed',
      insetInlineEnd: 0,
      top: '56px',
      width: '400px',
      height: 'calc(100vh - 56px)',
      background: '#ffffff',
      borderInlineStart: '1px solid #e5e7eb',
      boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
      zIndex: 50,
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            تفاصيل الرحلة #{trip.id}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#6b7280'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            <IconX size={20} />
          </button>
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {trip.collectorName} • {trip.tripType}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <IconAlertCircle size={24} style={{ color: '#0369a1', marginBottom: '8px' }} />
          <p style={{
            fontSize: '14px',
            color: '#0369a1',
            margin: 0,
            fontWeight: '500'
          }}>
            تفاصيل الرحلة قيد التطوير
          </p>
          <p style={{
            fontSize: '12px',
            color: '#0369a1',
            margin: '4px 0 0 0',
            opacity: 0.8
          }}>
            سيتم تنفيذ واجهة تفاصيل الرحلة في المرحلة التالية
          </p>
        </div>

        {/* Trip Summary */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '12px'
          }}>
            ملخص الرحلة
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>المندوب:</span>
              <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                {trip.collectorName}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>نوع الرحلة:</span>
              <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                {trip.tripType}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>الكمية المجمعة:</span>
              <span style={{ color: '#059669', fontSize: '14px', fontWeight: '600' }}>
                {trip.quantityKg} كجم
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>الحالة:</span>
              <span style={{ 
                color: trip.status.color, 
                fontSize: '14px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {trip.status.label}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>نوع المخزن:</span>
              <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                {trip.warehouseType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsPanel; 