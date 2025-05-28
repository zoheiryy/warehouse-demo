import React, { useState } from 'react';
import { IconX, IconScale, IconCheck } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';
import { generateTankWeights } from '../utils/workflowUtils';

const TankReceivingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  trip, 
  workflowType,
  receivingState,
  onUpdateReceivingState
}) => {
  const [step, setStep] = useState('start'); // 'start' | 'weighing' | 'weighing_in_progress' | 'complete'
  const [weights, setWeights] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [currentTankReading, setCurrentTankReading] = useState(0);
  const [isTankScaleActive, setIsTankScaleActive] = useState(false);
  const [pendingTankWeights, setPendingTankWeights] = useState(null);

  // Auto-select receiving tank based on channel
  const getReceivingTankForChannel = (tripType) => {
    switch (tripType) {
      case 'B2X':
        return 'Receiving_Tank_2';
      case 'B2B':
        return 'B2B_Receiving_Tank_1';
      case 'B2C':
        return 'B2C_Receiving_Tank_1';
      default:
        return 'Default_Receiving_Tank';
    }
  };

  const selectedTank = getReceivingTankForChannel(trip.tripType);
  
  // Available quantity for transfer
  const availableQuantity = receivingState?.inventory?.outsideTanksKg || 0;

  // Check if this is B2B workflow
  const isB2B = workflowType === 'B2B_T1';
  const isB2C = workflowType === 'B2C_T1';
  const isB2X = workflowType === 'B2X_T1' || workflowType === 'B2X_T3';

  // Tank scale reading simulation
  const startTankScaleReading = async (startWeight, endWeight) => {
    setIsTankScaleActive(true);
    setCurrentTankReading(startWeight);
    
    // Simulate tank filling with gradual weight increase
    const duration = 4000; // 4 seconds
    const steps = 80; // 80 steps for smooth animation
    const totalIncrease = endWeight - startWeight;
    const increment = totalIncrease / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, duration / steps));
      const reading = Math.floor(startWeight + (increment * i) + (Math.random() - 0.5) * 20); // Add fluctuation
      setCurrentTankReading(Math.max(startWeight, reading));
    }
    
    // Final stabilized reading
    setCurrentTankReading(endWeight);
    setPendingTankWeights({ startWeight, endWeight, netWeight: endWeight - startWeight });
    setIsTankScaleActive(false);
  };

  // B2B tank receiving handlers
  const handleB2BStartReceiving = async () => {
    setIsProcessing(true);
    setStep('weighing_in_progress');
    
    // Generate weights for tank receiving
    const startWeight = Math.floor(Math.random() * (5000 - 3000) + 3000); // 3000-5000 kg
    const receiveQuantity = Math.min(availableQuantity, Math.floor(Math.random() * (3000 - 1500) + 1500)); // 1500-3000 kg or available
    const endWeight = startWeight + receiveQuantity;
    
    await startTankScaleReading(startWeight, endWeight);
    
    setIsProcessing(false);
    setStep('complete');
  };

  const confirmTankReceiving = () => {
    const { startWeight, endWeight, netWeight } = pendingTankWeights;
    
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        tankReceivingSession: {
          isActive: false,
          startWeight,
          endWeight,
          quantityReceived: netWeight,
          startTime: new Date(Date.now() - 4000), // 4 seconds ago
          endTime: new Date()
        },
        workflowStep: 'second_weighing'
      },
      inventory: {
        ...prev.inventory,
        outsideTanksKg: Math.max(0, prev.inventory.outsideTanksKg - netWeight),
        insideTanksKg: prev.inventory.insideTanksKg + netWeight
      },
      tankReceiving: {
        ...prev.tankReceiving,
        status: 'انتهت',
        startWeight,
        endWeight,
        netWeight,
        selectedTankId: selectedTank,
        completedAt: new Date()
      }
    }));
    
    onConfirm({
      startWeight,
      endWeight,
      netWeight,
      selectedTank,
      remainderAmount: Math.max(0, availableQuantity - netWeight)
    });
  };

  const redoTankReceiving = () => {
    setStep('start');
    setPendingTankWeights(null);
    setCurrentTankReading(0);
  };

  // B2C/B2X handlers
  const handleStartTransfer = () => {
    if (transferAmount > 0) {
      handleStartWeighing();
    }
  };

  const handleStartWeighing = async () => {
    setStep('weighing');
    setIsProcessing(true);
    
    // Simulate weighing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedWeights = generateTankWeights(transferAmount);
    setWeights(generatedWeights);
    setIsProcessing(false);
    setStep('complete');
  };

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For B2B, include tank selection and remainder info
    const transferData = {
      ...weights,
      selectedTank: selectedTank,
      transferAmount: transferAmount,
      remainderAmount: receivingState.inventory.outsideTanksKg - transferAmount
    };
    
    onConfirm(transferData);
    setIsProcessing(false);
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
        maxWidth: '600px',
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
            استلام في الخزان
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

        {step === 'start' && (
          <div>
            {isB2B ? (
              // B2B Tank Receiving Interface
              <div>
                <div style={{
                  background: '#f3e8ff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #9333ea'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#9333ea',
                    marginBottom: '12px'
                  }}>
                    بدء الاستلام في الخزان
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>الخزان المحدد:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#9333ea' }}>
                        {selectedTank}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>الكمية المتاحة:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {availableQuantity.toLocaleString()} كجم
                      </span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    سيتم اختيار الخزان تلقائياً بناءً على نوع الرحلة. انقر على "بدء الاستلام" لبدء عملية النقل إلى الخزان.
                  </p>
                </div>

                {availableQuantity === 0 && (
                  <div style={{
                    background: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b',
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#92400e',
                      margin: 0,
                      textAlign: 'center'
                    }}>
                      لا توجد كمية متاحة للاستلام في الخزان
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Original B2C/B2X Interface
              <div>
                <div style={{
                  background: '#f0f9ff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #0369a1'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <IconScale size={20} style={{ color: '#0369a1' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#0369a1' }}>
                      نقل إلى الخزان
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    اختر الكمية المراد نقلها إلى الخزان المحدد.
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    الكمية المراد نقلها (كجم):
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'start'
                    }}
                    min="0"
                    max={receivingState.inventory.outsideTanksKg || 0}
                    step="0.1"
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>
                    الحد الأقصى: {receivingState.inventory.outsideTanksKg || 0} كجم
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'weighing_in_progress' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#f3e8ff',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '2px solid #9333ea'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#9333ea',
                marginBottom: '16px'
              }}>
                جاري استلام في الخزان
              </h4>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px',
                fontFamily: 'monospace',
                background: '#000',
                color: '#00ff00',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #333'
              }}>
                {currentTankReading.toLocaleString()} كجم
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px'
              }}>
                {isTankScaleActive && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #9333ea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                <span style={{
                  fontSize: '14px',
                  color: isTankScaleActive ? '#9333ea' : '#059669',
                  fontWeight: '500'
                }}>
                  {isTankScaleActive ? 'جاري التفريغ في الخزان...' : 'اكتمل التفريغ'}
                </span>
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              يرجى الانتظار حتى اكتمال عملية التفريغ في الخزان
            </p>
          </div>
        )}

        {step === 'weighing' && (
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
              جاري وزن الخزان...
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              يرجى الانتظار حتى اكتمال عملية الوزن
            </p>
          </div>
        )}

        {step === 'complete' && pendingTankWeights && (
          <div>
            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #059669'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#059669',
                marginBottom: '12px'
              }}>
                مراجعة عملية الاستلام في الخزان
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
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>الخزان:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {selectedTank}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن البداية:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {pendingTankWeights.startWeight.toLocaleString()} كجم
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن النهاية:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {pendingTankWeights.endWeight.toLocaleString()} كجم
                  </span>
                </div>
                <Separator />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>الكمية المستلمة:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                    {pendingTankWeights.netWeight.toLocaleString()} كجم
                  </span>
                </div>
                {(availableQuantity - pendingTankWeights.netWeight) > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>الكمية المتبقية:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>
                      {(availableQuantity - pendingTankWeights.netWeight).toLocaleString()} كجم
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              textAlign: 'center'
            }}>
              هل تريد تأكيد هذه النتائج أم إعادة العملية؟
            </p>
          </div>
        )}

        {step === 'complete' && weights && (
          <div>
            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #059669'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#059669',
                marginBottom: '12px'
              }}>
                نتائج النقل إلى {selectedTank}:
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
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن الخزان (بداية):</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {weights.startWeight.toLocaleString()} كجم
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن الخزان (نهاية):</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {weights.endWeight.toLocaleString()} كجم
                  </span>
                </div>
                <Separator />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>الكمية المنقولة:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                    {weights.netWeight.toLocaleString()} كجم
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '20px'
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
          
          {isB2B ? (
            // B2B Buttons
            <>
              {step === 'start' && availableQuantity > 0 && (
                <button
                  onClick={handleB2BStartReceiving}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 20px',
                    background: isProcessing ? '#9ca3af' : '#9333ea',
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
                      جاري البدء...
                    </>
                  ) : (
                    <>
                      <IconScale size={16} />
                      بدء استلام في الخزان
                    </>
                  )}
                </button>
              )}

              {step === 'complete' && pendingTankWeights && (
                <>
                  <button
                    onClick={redoTankReceiving}
                    disabled={isProcessing}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
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
                    <IconScale size={16} />
                    إعادة العملية
                  </button>
                  <button
                    onClick={confirmTankReceiving}
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
                </>
              )}
            </>
          ) : (
            // Original B2C/B2X Buttons
            <>
              {step === 'start' && (
                <button
                  onClick={handleStartTransfer}
                  disabled={isProcessing || transferAmount <= 0}
                  style={{
                    padding: '10px 20px',
                    background: (isProcessing || transferAmount <= 0) ? '#9ca3af' : '#0369a1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: (isProcessing || transferAmount <= 0) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <IconScale size={16} />
                  بدء النقل
                </button>
              )}
              
              {step === 'complete' && weights && (
                <button
                  onClick={handleConfirmTransfer}
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
                      تأكيد النقل
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TankReceivingModal;
