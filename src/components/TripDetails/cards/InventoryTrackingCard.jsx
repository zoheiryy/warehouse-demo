import React from 'react';
import { IconTruck, IconHome, IconScale } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';

const InventoryTrackingCard = ({ receivingState, workflowType }) => {
  const { inventory } = receivingState;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <IconScale size={20} style={{ color: '#0369a1' }} />
        تتبع المخزون
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* With Collector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: inventory.withCollectorKg > 0 ? '#fef3c7' : '#f9fafb',
          borderRadius: '6px',
          border: inventory.withCollectorKg > 0 ? '1px solid #d97706' : '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <IconTruck size={20} style={{ 
              color: inventory.withCollectorKg > 0 ? '#d97706' : '#6b7280' 
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827'
            }}>
              مع المندوب
            </span>
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: inventory.withCollectorKg > 0 ? '#d97706' : '#6b7280'
          }}>
            {inventory.withCollectorKg.toLocaleString()} كجم
          </span>
        </div>

        {/* Outside Tanks */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: inventory.outsideTanksKg > 0 ? '#fef3c7' : '#f9fafb',
          borderRadius: '6px',
          border: inventory.outsideTanksKg > 0 ? '1px solid #d97706' : '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <IconHome size={20} style={{ 
              color: inventory.outsideTanksKg > 0 ? '#d97706' : '#6b7280' 
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827'
            }}>
              خارج الخزانات
            </span>
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: inventory.outsideTanksKg > 0 ? '#d97706' : '#6b7280'
          }}>
            {inventory.outsideTanksKg.toLocaleString()} كجم
          </span>
        </div>

        {/* Inside Tanks */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: inventory.insideTanksKg > 0 ? '#f0fdf4' : '#f9fafb',
          borderRadius: '6px',
          border: inventory.insideTanksKg > 0 ? '1px solid #059669' : '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <IconScale size={20} style={{ 
              color: inventory.insideTanksKg > 0 ? '#059669' : '#6b7280' 
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827'
            }}>
              داخل الخزانات
            </span>
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: inventory.insideTanksKg > 0 ? '#059669' : '#6b7280'
          }}>
            {inventory.insideTanksKg.toLocaleString()} كجم
          </span>
        </div>

        <Separator />

        {/* Total */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #0369a1'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#0369a1'
          }}>
            إجمالي الكمية
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#0369a1'
          }}>
            {(inventory.withCollectorKg + inventory.outsideTanksKg + inventory.insideTanksKg).toLocaleString()} كجم
          </span>
        </div>
      </div>

      {/* Tank Selection Info */}
      {receivingState.tankReceiving.selectedTankId && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#f0f9ff',
          border: '1px solid #0369a1',
          borderRadius: '6px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <IconScale size={16} style={{ color: '#0369a1' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#0369a1'
            }}>
              الخزان المحدد للاستلام
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#374151',
            margin: 0
          }}>
            {receivingState.tankReceiving.selectedTankId}
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTrackingCard; 