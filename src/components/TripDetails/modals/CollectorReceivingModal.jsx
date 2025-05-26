import React, { useState } from 'react';
import { IconX, IconTruck, IconScale, IconCheck } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';
import { generateVehicleWeights } from '../utils/workflowUtils';

const CollectorReceivingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  trip, 
  workflowType 
}) => {
  const [auditQuantity, setAuditQuantity] = useState(trip.quantityKg || trip.expectedQuantity || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // B2X Vehicle weighing states
  const [vehicleWeighingStep, setVehicleWeighingStep] = useState('start'); // 'start' | 'first_weight' | 'unloading' | 'second_weight' | 'complete'
  const [vehicleWeights, setVehicleWeights] = useState(null);

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (workflowType === 'B2X_T1') {
      onConfirm(vehicleWeights.netWeight, vehicleWeights);
    } else {
      onConfirm(auditQuantity);
    }
    setIsProcessing(false);
  };

  // Handle B2X vehicle weighing process
  const handleVehicleWeighing = async () => {
    if (vehicleWeighingStep === 'start') {
      setIsProcessing(true);
      setVehicleWeighingStep('first_weight');
      
      // Simulate first weighing
      await new Promise(resolve => setTimeout(resolve, 2000));
      const weights = generateVehicleWeights();
      setVehicleWeights(weights);
      setIsProcessing(false);
      setVehicleWeighingStep('unloading');
    } else if (vehicleWeighingStep === 'unloading') {
      setIsProcessing(true);
      setVehicleWeighingStep('second_weight');
      
      // Simulate unloading and second weighing
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIsProcessing(false);
      setVehicleWeighingStep('complete');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      insetInlineStart: 0,
      top: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            {workflowType === 'B2X_T1' ? 'وزن السيارة واستلام من المندوب' : 'استلام من المندوب'}
          </h3>
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
          >
            <IconX size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {workflowType === 'B2X_T1' ? (
            // B2X Vehicle Weighing Interface
            <div>
              {vehicleWeighingStep === 'start' && (
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    سيتم وزن السيارة قبل وبعد التفريغ لحساب الكمية الفعلية المستلمة.
                  </p>
                  
                  <div style={{
                    background: '#f0f9ff',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #0369a1'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <IconTruck size={20} style={{ color: '#0369a1' }} />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#0369a1' }}>
                        الكمية المتوقعة: {trip.expectedQuantity} كجم
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#374151',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      انقر على "بدء الوزن الأول" لوزن السيارة المحملة.
                    </p>
                  </div>
                </div>
              )}

              {vehicleWeighingStep === 'first_weight' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #0369a1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }} />
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    جاري الوزن الأول...
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    يرجى الانتظار حتى اكتمال وزن السيارة المحملة
                  </p>
                </div>
              )}

              {vehicleWeighingStep === 'unloading' && vehicleWeights && (
                <div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #059669'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#059669',
                      marginBottom: '8px'
                    }}>
                      الوزن الأول مكتمل:
                    </h4>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن السيارة المحملة:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {vehicleWeights.firstWeight.toLocaleString()} كجم
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #d97706'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#92400e',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      يرجى تفريغ الزيت المستعمل من السيارة، ثم انقر على "بدء الوزن الثاني" لوزن السيارة الفارغة.
                    </p>
                  </div>
                </div>
              )}

              {vehicleWeighingStep === 'second_weight' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #0369a1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }} />
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    جاري الوزن الثاني...
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    يرجى الانتظار حتى اكتمال وزن السيارة الفارغة
                  </p>
                </div>
              )}

              {vehicleWeighingStep === 'complete' && vehicleWeights && (
                <div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #059669'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#059669',
                      marginBottom: '12px'
                    }}>
                      نتائج الوزن:
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الأول (محملة):</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {vehicleWeights.firstWeight.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الثاني (فارغة):</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {vehicleWeights.secondWeight.toLocaleString()} كجم
                        </span>
                      </div>
                      <Separator />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>صافي الكمية المستلمة:</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                          {vehicleWeights.netWeight.toLocaleString()} كجم
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // B2C Manual Audit Interface
            <div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                يرجى مراجعة الكمية المجمعة من المندوب وتأكيد الكمية الفعلية المستلمة.
              </p>

              <div style={{
                background: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>الكمية المتوقعة:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {trip.expectedQuantity} كجم
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>الكمية المجمعة:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                    {trip.quantityKg} كجم
                  </span>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  الكمية الفعلية المستلمة (كجم):
                </label>
                <input
                  type="number"
                  value={auditQuantity}
                  onChange={(e) => setAuditQuantity(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'start'
                  }}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            disabled={isProcessing}
          >
            إلغاء
          </button>
          
          {workflowType === 'B2X_T1' ? (
            // B2X Vehicle Weighing Buttons
            <>
              {vehicleWeighingStep === 'start' && (
                <button
                  onClick={handleVehicleWeighing}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 20px',
                    background: isProcessing ? '#9ca3af' : '#0369a1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      جاري الوزن...
                    </>
                  ) : (
                    <>
                      <IconScale size={16} />
                      بدء الوزن الأول
                    </>
                  )}
                </button>
              )}
              
              {vehicleWeighingStep === 'unloading' && (
                <button
                  onClick={handleVehicleWeighing}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 20px',
                    background: isProcessing ? '#9ca3af' : '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      جاري الوزن...
                    </>
                  ) : (
                    <>
                      <IconScale size={16} />
                      بدء الوزن الثاني
                    </>
                  )}
                </button>
              )}
              
              {vehicleWeighingStep === 'complete' && (
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 20px',
                    background: isProcessing ? '#9ca3af' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      جاري التأكيد...
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} />
                      تأكيد الاستلام
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            // B2C Manual Audit Button
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              style={{
                padding: '10px 20px',
                background: isProcessing ? '#9ca3af' : '#0369a1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  تأكيد الاستلام
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorReceivingModal; 