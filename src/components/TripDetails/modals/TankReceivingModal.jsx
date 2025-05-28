import React, { useState } from 'react';
import { IconX, IconScale, IconCheck, IconTank } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';
import { generateTankWeights } from '../utils/workflowUtils';

// Tank Receiving Steps Definition
const TANK_STEPS = {
  START: 'start',
  WEIGHING_IN_PROGRESS: 'weighing_in_progress',
  CONFIRM_END: 'confirm_end',
  COMPLETE: 'complete'
};

const TankReceivingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  trip, 
  workflowType,
  receivingState,
  onUpdateReceivingState
}) => {
  // State management
  const [step, setStep] = useState(TANK_STEPS.START);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Check workflow type
  const isB2B = workflowType === 'B2B_T1';
  const isB2C = workflowType === 'B2C_T1';
  const isB2X = workflowType === 'B2X_T1' || workflowType === 'B2X_T3';

  // ENHANCED: Tank scale reading simulation with realistic behavior
  const startTankScaleReading = async (startWeight, endWeight) => {
    setIsTankScaleActive(true);
    setCurrentTankReading(startWeight);
    
    // 4-second simulation with setInterval for better performance
    let currentReading = startWeight;
    const totalIncrease = endWeight - startWeight;
    const incrementPerStep = totalIncrease / 20; // 20 steps over 4 seconds
    let stepCount = 0;
    
    const tankInterval = setInterval(() => {
      // Check if user ended early
      if (step !== TANK_STEPS.WEIGHING_IN_PROGRESS) {
        clearInterval(tankInterval);
        return;
      }
      
      stepCount++;
      
      // Calculate new reading with realistic fluctuation
      const progressReading = startWeight + (incrementPerStep * stepCount);
      const fluctuation = (Math.random() - 0.5) * 15; // Tank fluctuation
      currentReading = Math.floor(progressReading + fluctuation);
      
      // Ensure reading stays within bounds
      currentReading = Math.max(startWeight, Math.min(endWeight, currentReading));
      
      setCurrentTankReading(currentReading);
      
      // Stop when we reach target or max steps
      if (stepCount >= 20 || currentReading >= endWeight) {
        clearInterval(tankInterval);
        setCurrentTankReading(endWeight);
        setIsTankScaleActive(false);
      }
    }, 200); // Update every 200ms
    
    // Cleanup after 4 seconds maximum
    setTimeout(() => {
      clearInterval(tankInterval);
      if (isTankScaleActive) {
        setCurrentTankReading(endWeight);
        setIsTankScaleActive(false);
      }
    }, 4000);
  };

  // Start tank receiving process
  const handleStartReceiving = async () => {
    const startTimestamp = new Date();
    setStep(TANK_STEPS.WEIGHING_IN_PROGRESS);
    
    // Calculate quantities
    const startWeight = Math.floor(Math.random() * (5000 - 3000) + 3000); // 3000-5000 kg
    const receiveQuantity = Math.min(availableQuantity, Math.floor(Math.random() * (3000 - 1500) + 1500));
    const endWeight = startWeight + receiveQuantity;
    
    setPendingTankWeights({ 
      startWeight, 
      endWeight, 
      netWeight: endWeight - startWeight,
      startTimestamp
    });
    
    await startTankScaleReading(startWeight, endWeight);
  };

  // End tank receiving
  const handleEndReceiving = () => {
    setStep(TANK_STEPS.CONFIRM_END);
  };

  // Confirm end tank receiving
  const confirmEndReceiving = () => {
    setStep(TANK_STEPS.COMPLETE);
  };

  // Cancel end tank receiving
  const cancelEndReceiving = () => {
    setStep(TANK_STEPS.WEIGHING_IN_PROGRESS);
    setIsTankScaleActive(true);
  };

  // Confirm tank receiving
  const confirmTankReceiving = () => {
    const { startWeight, endWeight, netWeight, startTimestamp } = pendingTankWeights;
    const endTimestamp = new Date();
    
    // Update receiving state with tank receiving data
    onUpdateReceivingState(prev => ({
      ...prev,
      tankReceiving: {
        ...prev.tankReceiving,
        status: 'انتهت',
        startWeight,
        endWeight,
        netWeight,
        selectedTankId: selectedTank,
        startTimestamp,
        endTimestamp,
        completedAt: endTimestamp
      },
      inventory: {
        ...prev.inventory,
        outsideTanksKg: Math.max(0, prev.inventory.outsideTanksKg - netWeight),
        insideTanksKg: prev.inventory.insideTanksKg + netWeight
      }
    }));
    
    onConfirm({
      startWeight,
      endWeight,
      netWeight,
      selectedTank,
      startTimestamp,
      endTimestamp,
      remainderAmount: Math.max(0, availableQuantity - netWeight)
    });
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

        {/* Tank Receiving Interface */}
        <div>
          {step === TANK_STEPS.START && (
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
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                      {selectedTank}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>الكمية المتاحة:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                      {availableQuantity.toLocaleString()} كجم
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleStartReceiving}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <IconScale size={20} />
                بدء الاستلام في الخزان
              </button>
            </div>
          )}

          {step === TANK_STEPS.WEIGHING_IN_PROGRESS && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#f0fdf4',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '2px solid #059669'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#059669',
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
                  {currentTankReading ? `${currentTankReading.toLocaleString()} كجم` : '-- كجم'}
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
                      borderTop: '3px solid #059669',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                  <span style={{
                    fontSize: '14px',
                    color: isTankScaleActive ? '#059669' : '#065f46',
                    fontWeight: '500'
                  }}>
                    {isTankScaleActive ? 'جاري الاستلام...' : 'اكتمل الاستلام'}
                  </span>
                </div>
                
                {/* End Receiving Button */}
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={handleEndReceiving}
                    style={{
                      padding: '12px 24px',
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <IconX size={16} />
                    إنهاء الاستلام
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === TANK_STEPS.CONFIRM_END && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#fef3c7',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '2px solid #d97706'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#d97706',
                  marginBottom: '16px'
                }}>
                  تأكيد انهاء الاستلام ؟
                </h4>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  fontFamily: 'monospace',
                  background: '#000',
                  color: '#00ff00',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #333'
                }}>
                  {currentTankReading ? `${currentTankReading.toLocaleString()} كجم` : '-- كجم'}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={confirmEndReceiving}
                    style={{
                      padding: '12px 24px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    تأكيد الإنهاء
                  </button>
                  <button
                    onClick={cancelEndReceiving}
                    style={{
                      padding: '12px 24px',
                      background: '#6b7280',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    الغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === TANK_STEPS.COMPLETE && pendingTankWeights && (
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
                  مراجعة الاستلام في الخزان
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
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن بداية الخزان:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {pendingTankWeights.startWeight.toLocaleString()} كجم
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن نهاية الخزان:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {pendingTankWeights.endWeight.toLocaleString()} كجم
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: '#dcfce7',
                    borderRadius: '4px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>الكمية المستلمة:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                      {pendingTankWeights.netWeight.toLocaleString()} كجم
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={confirmTankReceiving}
                  style={{
                    padding: '12px 24px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  تأكيد الاستلام
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
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
        </div>
      </div>
    </div>
  );
};

export default TankReceivingModal;
