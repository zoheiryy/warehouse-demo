import React from 'react';
import { IconCheck, IconClock, IconTruck, IconScale } from '@tabler/icons-react';

const WorkflowStatusCard = ({ 
  receivingState, 
  workflowType, 
  onStartCollectorReceiving, 
  onStartTankReceiving,
  trip
}) => {
  // Enable UCO receiving functionality for B2C, B2X, and B2B trips
  const isUCOReceivingEnabled = trip?.tripType === 'B2C' || trip?.tripType === 'B2X' || trip?.tripType === 'B2B';
  const getStatusIcon = (status) => {
    switch (status) {
      case 'لم تبدأ':
        return <IconClock size={16} style={{ color: '#6b7280' }} />;
      case 'بدأت':
        return <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid #0369a1',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />;
      case 'انتهت':
        return <IconCheck size={16} style={{ color: '#059669' }} />;
      default:
        return <IconClock size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'لم تبدأ':
        return '#6b7280';
      case 'بدأت':
        return '#0369a1';
      case 'انتهت':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const handleActionClick = () => {
    if (workflowType === 'B2B_T1') {
      const workflowStep = receivingState.b2bState?.workflowStep || 'first_weighing';
      
      switch (workflowStep) {
        case 'first_weighing':
        case 'second_weighing':
        case 'completed':
          onStartCollectorReceiving();
          break;
        case 'tank_receiving':
          onStartTankReceiving();
          break;
        case 'choose_action':
          // This step is handled within the CollectorReceivingModal
          onStartCollectorReceiving();
          break;
        default:
          onStartCollectorReceiving();
      }
    } else if (receivingState.collectorReceiving.status === 'لم تبدأ') {
      onStartCollectorReceiving();
    } else if (receivingState.collectorReceiving.status === 'انتهت' && receivingState.inventory.outsideTanksKg > 0) {
      onStartTankReceiving();
    }
  };

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
        سير عملية الاستلام
      </h3>

      {/* Show disabled message for non-B2C trips */}
      {!isUCOReceivingEnabled && (
        <div style={{
          padding: '12px 16px',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#92400e',
            margin: 0,
            textAlign: 'center'
          }}>
            وظيفة استلام الزيت المستعمل متاحة فقط لرحلات B2C و B2X و B2B
          </p>
        </div>
      )}

      {/* Module 1: Collector Receiving */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#f9fafb',
        borderRadius: '6px',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <IconTruck size={20} style={{ color: '#374151' }} />
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827',
              margin: 0
            }}>
              {(workflowType === 'B2X_T1' || workflowType === 'B2X_T3' || workflowType === 'B2B_T1') ? 'وزن السيارة واستلام من المندوب' : 'استلام من المندوب'}
            </h4>
            {receivingState.collectorReceiving.status === 'انتهت' && (
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                تم استلام {receivingState.collectorReceiving.auditedQuantityKg} كجم
              </p>
            )}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {getStatusIcon(receivingState.collectorReceiving.status)}
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: getStatusColor(receivingState.collectorReceiving.status)
          }}>
            {receivingState.collectorReceiving.status}
          </span>
          {receivingState.collectorReceiving.status === 'لم تبدأ' && isUCOReceivingEnabled && (
            <button
              onClick={handleActionClick}
              style={{
                padding: '4px 8px',
                background: '#0369a1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginInlineStart: '8px'
              }}
            >
              بدء
            </button>
          )}
        </div>
      </div>

      {/* Module 2: Tank Receiving */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: receivingState.collectorReceiving.status === 'انتهت' ? '#f9fafb' : '#f3f4f6',
        borderRadius: '6px',
        opacity: receivingState.collectorReceiving.status === 'انتهت' ? 1 : 0.6
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <IconScale size={20} style={{ color: '#374151' }} />
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827',
              margin: 0
            }}>
              استلام في الخزان
            </h4>
            {receivingState.tankReceiving.status === 'انتهت' && (
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                تم نقل {receivingState.tankReceiving.netWeight} كجم إلى {receivingState.tankReceiving.selectedTankId}
              </p>
            )}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {getStatusIcon(receivingState.tankReceiving.status)}
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: getStatusColor(receivingState.tankReceiving.status)
          }}>
            {receivingState.tankReceiving.status}
          </span>
          {receivingState.tankReceiving.status === 'لم تبدأ' && 
           receivingState.collectorReceiving.status === 'انتهت' && 
           isUCOReceivingEnabled && (
            <button
              onClick={handleActionClick}
              style={{
                padding: '4px 8px',
                background: '#0369a1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginInlineStart: '8px'
              }}
            >
              بدء
            </button>
          )}
        </div>
      </div>

      {/* Workflow completion status */}
      {receivingState.collectorReceiving.status === 'انتهت' && 
       receivingState.tankReceiving.status === 'انتهت' && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#f0fdf4',
          border: '1px solid #059669',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <IconCheck size={16} style={{ color: '#059669' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#059669'
            }}>
              تم اكتمال عملية الاستلام
            </span>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#374151',
            margin: 0
          }}>
            تم استلام ونقل جميع الكميات بنجاح
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatusCard; 