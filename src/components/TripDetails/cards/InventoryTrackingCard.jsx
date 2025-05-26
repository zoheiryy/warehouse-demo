import React from 'react';
import { IconTruck, IconHome, IconScale, IconBarrel, IconCheck } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';

const InventoryTrackingCard = ({ receivingState, workflowType, trip }) => {
  const { inventory, b2bState } = receivingState;
  const isB2B = trip?.tripType === 'B2B';
  const tankSession = b2bState?.tankReceivingSession;

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
        <IconBarrel size={20} style={{ color: '#059669' }} />
        تتبع المخزون
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: isB2B ? '16px' : '0'
      }}>
        <div style={{
          background: '#f0f9ff',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0369a1',
            marginBottom: '4px'
          }}>
            {inventory.withCollectorKg}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            مع المندوب (كجم)
          </div>
        </div>

        <div style={{
          background: '#fef3c7',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#d97706',
            marginBottom: '4px'
          }}>
            {inventory.outsideTanksKg}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            خارج الخزانات (كجم)
          </div>
        </div>

        <div style={{
          background: '#f0fdf4',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#059669',
            marginBottom: '4px'
          }}>
            {inventory.insideTanksKg}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            داخل الخزانات (كجم)
          </div>
        </div>
      </div>

      {isB2B && (
        <div>
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <IconScale size={16} style={{ color: '#9333ea' }} />
              جلسة استلام الخزان
            </h4>

            {tankSession?.isActive ? (
              <div style={{
                background: '#f0fdf4',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #059669'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#059669'
                  }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#059669'
                  }}>
                    جلسة نشطة - خزان الاستقبال 2
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  وزن البداية: {tankSession.startWeight?.toLocaleString()} كجم
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  بدأت في: {tankSession.startTime ? new Date(tankSession.startTime).toLocaleTimeString('ar-SA') : '-'}
                </div>
              </div>
            ) : tankSession?.quantityReceived > 0 ? (
              <div style={{
                background: '#f3e8ff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #9333ea'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  <IconCheck size={16} style={{ color: '#9333ea' }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#9333ea'
                  }}>
                    جلسة مكتملة - خزان الاستقبال 2
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div>وزن البداية: {tankSession.startWeight?.toLocaleString()} كجم</div>
                  <div>وزن النهاية: {tankSession.endWeight?.toLocaleString()} كجم</div>
                  <div>الكمية المستلمة: {tankSession.quantityReceived?.toLocaleString()} كجم</div>
                  <div>المدة: {tankSession.startTime && tankSession.endTime ? 
                    Math.round((new Date(tankSession.endTime) - new Date(tankSession.startTime)) / 60000) + ' دقيقة' : '-'
                  }</div>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                textAlign: 'center'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  لم تبدأ جلسة استلام الخزان بعد
                </span>
              </div>
            )}
          </div>

          {b2bState?.firstVehicleWeight && (
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px',
              marginTop: '16px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IconTruck size={16} style={{ color: '#9333ea' }} />
                أوزان السيارة
              </h4>
              
              <div style={{
                background: '#f3e8ff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #9333ea'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <div>
                    <div style={{ color: '#6b7280' }}>الوزن الأول:</div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>
                      {b2bState.firstVehicleWeight.toLocaleString()} كجم
                    </div>
                  </div>
                  {b2bState.secondVehicleWeight && (
                    <>
                      <div>
                        <div style={{ color: '#6b7280' }}>الوزن الثاني:</div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>
                          {b2bState.secondVehicleWeight.toLocaleString()} كجم
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280' }}>صافي الكمية:</div>
                        <div style={{ fontWeight: '500', color: '#059669' }}>
                          {(b2bState.firstVehicleWeight - b2bState.secondVehicleWeight).toLocaleString()} كجم
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tank Selection Info - For non-B2B trips */}
      {!isB2B && receivingState.tankReceiving.selectedTankId && (
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