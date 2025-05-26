import React, { useState } from 'react';
import { IconX, IconScale, IconCheck } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';
import { generateTankWeights } from '../utils/workflowUtils';

const TankReceivingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  receivingState 
}) => {
  const [step, setStep] = useState('start'); // 'start' | 'weighing' | 'complete'
  const [weights, setWeights] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartWeighing = async () => {
    setStep('weighing');
    setIsProcessing(true);
    
    // Simulate weighing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedWeights = generateTankWeights(receivingState.inventory.outsideTanksKg);
    setWeights(generatedWeights);
    setIsProcessing(false);
    setStep('complete');
  };

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConfirm(weights);
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
              onClick={handleStartWeighing}
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
              بدء وزن الخزان
            </button>
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