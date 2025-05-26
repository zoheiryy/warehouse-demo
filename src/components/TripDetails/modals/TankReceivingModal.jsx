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
  const [step, setStep] = useState('start'); // 'start' | 'tank-selection' | 'weighing' | 'complete'
  const [weights, setWeights] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTank, setSelectedTank] = useState('خزان 2'); // Default tank for B2B
  const [transferAmount, setTransferAmount] = useState(0);

  // Available tanks for B2B
  const availableTanks = ['خزان 1', 'خزان 2', 'خزان 3'];
  
  // Check if this is B2B workflow
  const isB2B = workflowType === 'B2B_T1';
  const isB2C = workflowType === 'B2C_T1';
  const isB2X = workflowType === 'B2X_T1' || workflowType === 'B2X_T3';

  // B2B tank receiving session
  const tankSession = receivingState?.b2bState?.tankReceivingSession;
  const isSessionActive = tankSession?.isActive || false;

  // B2B tank receiving handlers
  const handleB2BStartReceiving = async () => {
    setIsProcessing(true);
    
    // Simulate starting tank receiving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const startWeight = Math.floor(Math.random() * (5000 - 3000) + 3000); // 3000-5000 kg
    
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        tankReceivingSession: {
          isActive: true,
          startWeight,
          endWeight: null,
          quantityReceived: 0,
          startTime: new Date(),
          endTime: null
        }
      }
    }));
    
    setIsProcessing(false);
  };

  const handleB2BStopReceiving = async () => {
    setIsProcessing(true);
    
    // Simulate stopping tank receiving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const endWeight = Math.floor(Math.random() * (8000 - 6000) + 6000); // 6000-8000 kg
    const quantityReceived = endWeight - tankSession.startWeight;
    
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        tankReceivingSession: {
          ...prev.b2bState.tankReceivingSession,
          isActive: false,
          endWeight,
          quantityReceived,
          endTime: new Date()
        },
        workflowStep: 'second_weighing'
      },
      inventory: {
        ...prev.inventory,
        insideTanksKg: prev.inventory.insideTanksKg + quantityReceived
      }
    }));
    
    setIsProcessing(false);
    onClose(); // Close modal after stopping
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

  const handleTankSelection = () => {
    if (isB2B) {
      setStep('tank-selection');
    } else {
      handleStartWeighing();
    }
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
              // B2B Tank Receiving Session Interface
              <div>
                <div style={{
                  background: '#f3e8ff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #9333ea'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <IconScale size={20} style={{ color: '#9333ea' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#9333ea' }}>
                      استلام في خزان الاستقبال 2
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {isSessionActive 
                      ? 'جلسة الاستلام نشطة. يمكنك إيقاف الاستلام عند الانتهاء.'
                      : 'ابدأ جلسة استلام في الخزان لتسجيل الكمية المستلمة.'
                    }
                  </p>
                </div>

                {isSessionActive && tankSession && (
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
                      جلسة الاستلام النشطة:
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
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن البداية:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {tankSession.startWeight?.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>وقت البداية:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {tankSession.startTime ? new Date(tankSession.startTime).toLocaleTimeString('ar-SA') : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={isSessionActive ? handleB2BStopReceiving : handleB2BStartReceiving}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: isProcessing ? '#9ca3af' : (isSessionActive ? '#dc2626' : '#059669'),
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                      {isSessionActive ? 'جاري الإيقاف...' : 'جاري البدء...'}
                    </>
                  ) : (
                    <>
                      <IconScale size={16} />
                      {isSessionActive ? 'إيقاف الاستلام' : 'بدء الاستلام'}
                    </>
                  )}
                </button>
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
                      الخزان المحدد: {receivingState.tankReceiving.selectedTankId}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    سيتم نقل {receivingState.inventory.outsideTanksKg} كجم من منطقة خارج الخزانات إلى الخزان.
                  </p>
                </div>

                <button
                  onClick={handleTankSelection}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0369a1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <IconScale size={16} />
                  {isB2B ? 'اختيار الخزان' : 'بدء وزن الخزان'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'tank-selection' && isB2B && (
          <div>
            <div style={{
              background: '#f0f9ff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #0369a1'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0369a1',
                marginBottom: '12px'
              }}>
                اختيار الخزان وكمية النقل:
              </h4>
              
              {/* Tank Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  الخزان المستهدف:
                </label>
                <select
                  value={selectedTank}
                  onChange={(e) => setSelectedTank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: '#ffffff'
                  }}
                >
                  {availableTanks.map(tank => (
                    <option key={tank} value={tank}>{tank}</option>
                  ))}
                </select>
              </div>

              {/* Transfer Amount */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  كمية النقل (كجم):
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Math.min(Number(e.target.value), receivingState.inventory.outsideTanksKg))}
                  max={receivingState.inventory.outsideTanksKg}
                  min={0}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  المتاح للنقل: {receivingState.inventory.outsideTanksKg} كجم
                </p>
              </div>

              {/* Remainder Info */}
              {(receivingState.inventory.outsideTanksKg - transferAmount) > 0 && (
                <div style={{
                  background: '#fef3c7',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#92400e',
                    margin: 0
                  }}>
                    سيتبقى {receivingState.inventory.outsideTanksKg - transferAmount} كجم خارج الخزانات لمعالجة لاحقة
                  </p>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setStep('start')}
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
              >
                رجوع
              </button>
              <button
                onClick={handleStartWeighing}
                disabled={transferAmount <= 0}
                style={{
                  padding: '10px 20px',
                  background: transferAmount <= 0 ? '#9ca3af' : '#0369a1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: transferAmount <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <IconScale size={16} />
                بدء وزن الخزان
              </button>
            </div>
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
                {isB2B ? `نتائج النقل إلى ${selectedTank}:` : 'نتائج الوزن:'}
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
                {isB2B && (receivingState.inventory.outsideTanksKg - transferAmount) > 0 && (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '14px', color: '#d97706' }}>الكمية المتبقية:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>
                        {(receivingState.inventory.outsideTanksKg - transferAmount).toLocaleString()} كجم
                      </span>
                    </div>
                  </>
                )}
              </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TankReceivingModal; 