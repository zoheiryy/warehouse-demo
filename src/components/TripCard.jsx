import React from 'react';
import { 
  IconUser, 
  IconTruck, 
  IconBuilding, 
  IconDroplet,
  IconClock,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';

const TripCard = ({ trip, isSelected, onClick }) => {
  const getStatusIcon = (status) => {
    switch (status.id) {
      case 'لم تبدأ': return <IconClock size={16} />;
      case 'بدأت': return <IconAlertCircle size={16} />;
      case 'قيد الانتظار': return <IconAlertCircle size={16} />;
      case 'مكتملة': return <IconCheck size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  const getTripTypeIcon = (type) => {
    switch (type) {
      case 'B2C': return <IconUser size={16} />;
      case 'B2X': return <IconTruck size={16} />;
      case 'B2B': return <IconBuilding size={16} />;
      case 'TG': return <IconDroplet size={16} />;
      default: return <IconUser size={16} />;
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#f0f9ff' : '#ffffff',
        border: isSelected ? '2px solid #0369a1' : '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif',
        boxShadow: isSelected ? '0 4px 12px rgba(3, 105, 161, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
          e.target.style.transform = 'translateY(-0.5px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Trip ID Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        insetInlineStart: '12px',
        background: '#f3f4f6',
        color: '#6b7280',
        fontSize: '10px',
        fontWeight: '500',
        padding: '2px 6px',
        borderRadius: '4px'
      }}>
        رحلة #{trip.id}
      </div>

      {/* Trip Type Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        insetInlineEnd: '12px',
        background: '#e0f2fe',
        color: '#0369a1',
        fontSize: '10px',
        fontWeight: '500',
        padding: '4px 8px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {getTripTypeIcon(trip.tripType)}
        {trip.tripType}
      </div>

      {/* Collector Name */}
      <div style={{
        marginTop: '32px',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <IconUser size={18} style={{ color: '#374151' }} />
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {trip.collectorName}
          </span>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginInlineStart: '26px'
        }}>
          مندوب طارق
        </div>
      </div>

      {/* Quantity */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <IconDroplet size={16} style={{ color: '#059669' }} />
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          {trip.quantityKg} كجم
        </span>
        <span style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          زيت هالك
        </span>
      </div>

      {/* Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: trip.status.color,
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {getStatusIcon(trip.status)}
          {trip.status.label}
        </div>
        
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          background: '#f9fafb',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {trip.warehouseType}
        </div>
      </div>
    </div>
  );
};

export default TripCard; 