import React, { useState } from 'react';
import { IconX, IconTruck, IconScale, IconCheck } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';
import { generateVehicleWeights } from '../utils/workflowUtils';

const CollectorReceivingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  trip, 
  workflowType,
  receivingState,
  onUpdateReceivingState
}) => {
  const [auditQuantity, setAuditQuantity] = useState(trip.quantityKg || trip.expectedQuantity || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // B2X Vehicle weighing states
  const [vehicleWeighingStep, setVehicleWeighingStep] = useState('start'); // 'start' | 'first_weight' | 'unloading' | 'second_weight' | 'complete'
  const [vehicleWeights, setVehicleWeights] = useState(null);

  // B2B Vehicle weighing states
  const [b2bStep, setB2bStep] = useState('start'); // 'start' | 'first_weighing' | 'choose_action' | 'second_weighing' | 'complete'
  const [b2bWeights, setB2bWeights] = useState(null);

  const isB2B = workflowType === 'B2B_T1';
  const workflowStep = receivingState?.b2bState?.workflowStep || 'first_weighing';

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (workflowType === 'B2X_T1') {
      onConfirm(vehicleWeights.netWeight, vehicleWeights);
    } else if (isB2B) {
      // B2B completion handled differently based on workflow step
      if (workflowStep === 'completed') {
        onConfirm(b2bWeights?.netWeight || 0, b2bWeights);
      }
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

  // Handle B2B first weighing
  const handleB2BFirstWeighing = async () => {
    setIsProcessing(true);
    setB2bStep('first_weighing');
    
    // Simulate first weighing
    await new Promise(resolve => setTimeout(resolve, 2000));
    const firstWeight = Math.floor(Math.random() * (18000 - 12000) + 12000); // 12000-18000 kg
    
    // Update B2B state
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        firstVehicleWeight: firstWeight,
        workflowStep: 'choose_action'
      }
    }));
    
    setB2bWeights({ firstWeight });
    setIsProcessing(false);
    setB2bStep('choose_action');
  };

  // Handle B2B user choice
  const handleB2BChoice = (choice) => {
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        userChoice: choice,
        workflowStep: choice === 'tank_first' ? 'tank_receiving' : 'second_weighing'
      }
    }));
    
    if (choice === 'tank_first') {
      // Close this modal and open tank receiving modal
      onClose();
      // The tank receiving will be handled by the parent component
    } else {
      // Continue with second weighing in this modal
      setB2bStep('second_weighing');
      handleB2BSecondWeighing();
    }
  };

  // Handle B2B second weighing
  const handleB2BSecondWeighing = async () => {
    setIsProcessing(true);
    setB2bStep('second_weighing');
    
    // Simulate second weighing
    await new Promise(resolve => setTimeout(resolve, 2000));
    const secondWeight = Math.floor(Math.random() * (12000 - 8000) + 8000); // 8000-12000 kg
    const firstWeight = receivingState.b2bState.firstVehicleWeight;
    const netWeight = firstWeight - secondWeight;
    
    // Calculate quantities based on user choice
    const tankReceived = receivingState.b2bState.tankReceivingSession?.quantityReceived || 0;
    const outsideQuantity = netWeight - tankReceived;
    
    // Update B2B state and inventory
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        secondVehicleWeight: secondWeight,
        workflowStep: 'completed'
      },
      inventory: {
        ...prev.inventory,
        withCollectorKg: 0,
        outsideTanksKg: Math.max(0, outsideQuantity),
        insideTanksKg: prev.inventory.insideTanksKg + tankReceived
      },
      collectorReceiving: {
        ...prev.collectorReceiving,
        status: 'انتهت',
        auditedQuantityKg: netWeight,
        completedAt: new Date(),
        operator: 'مشغل المستودع',
        vehicleWeights: { firstWeight, secondWeight, netWeight }
      }
    }));
    
    setB2bWeights({ firstWeight, secondWeight, netWeight });
    setIsProcessing(false);
    setB2bStep('complete');
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
                    border: '1px solid #f59e0b'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#92400e',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      يرجى تفريغ السيارة ثم النقر على "بدء الوزن الثاني" لوزن السيارة الفارغة.
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
                    borderTop: '4px solid #d97706',
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
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن السيارة المحملة:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {vehicleWeights.firstWeight.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>وزن السيارة الفارغة:</span>
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
          ) : isB2B ? (
            // B2B Vehicle Weighing Interface
            <div>
              {workflowStep === 'first_weighing' && (
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    سيتم وزن السيارة المحملة أولاً، ثم يمكنك اختيار بين الاستلام في الخزان أو الوزن الثاني مباشرة.
                  </p>
                  
                  <div style={{
                    background: '#f3e8ff',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #9333ea'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <IconTruck size={20} style={{ color: '#9333ea' }} />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#9333ea' }}>
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

              {b2bStep === 'first_weighing' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #9333ea',
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

              {b2bStep === 'choose_action' && (
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
                      fontWeight: '500',
                      color: '#9333ea',
                      marginBottom: '8px'
                    }}>
                      اختر الإجراء التالي:
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#374151',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      يمكنك الآن اختيار بين استلام في الخزان أولاً أو إجراء الوزن الثاني مباشرة.
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => handleB2BChoice('tank_first')}
                      disabled={isProcessing}
                      style={{
                        padding: '16px',
                        background: '#f0fdf4',
                        border: '2px solid #059669',
                        borderRadius: '8px',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <IconScale size={24} style={{ color: '#059669' }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#059669'
                        }}>
                          استلام في الخزان
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          ابدأ بتفريغ جزء من الحمولة في الخزان
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleB2BChoice('weighing_first')}
                      disabled={isProcessing}
                      style={{
                        padding: '16px',
                        background: '#fef3c7',
                        border: '2px solid #d97706',
                        borderRadius: '8px',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <IconTruck size={24} style={{ color: '#d97706' }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#d97706'
                        }}>
                          الوزن الثاني
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          وزن السيارة مباشرة بعد التفريغ
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {workflowStep === 'second_weighing' && (
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
                      جاهز للوزن الثاني:
                    </h4>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الأول:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {receivingState.b2bState.firstVehicleWeight?.toLocaleString()} كجم
                      </span>
                    </div>
                    {receivingState.b2bState.tankReceivingSession?.quantityReceived > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>تم استلامه في الخزان:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                          {receivingState.b2bState.tankReceivingSession.quantityReceived.toLocaleString()} كجم
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    background: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#92400e',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      انقر على "بدء الوزن الثاني" لوزن السيارة بعد التفريغ.
                    </p>
                  </div>
                </div>
              )}

              {b2bStep === 'second_weighing' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #d97706',
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
                    يرجى الانتظار حتى اكتمال وزن السيارة بعد التفريغ
                  </p>
                </div>
              )}

              {b2bStep === 'complete' && b2bWeights && (
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
                      نتائج الوزن النهائية:
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
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الأول:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {b2bWeights.firstWeight.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الثاني:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {b2bWeights.secondWeight.toLocaleString()} كجم
                        </span>
                      </div>
                      <Separator />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>إجمالي الكمية:</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                          {b2bWeights.netWeight.toLocaleString()} كجم
                        </span>
                      </div>
                      {receivingState.b2bState.tankReceivingSession?.quantityReceived > 0 && (
                        <>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>في الخزان:</span>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                              {receivingState.b2bState.tankReceivingSession.quantityReceived.toLocaleString()} كجم
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>خارج الخزانات:</span>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>
                              {Math.max(0, b2bWeights.netWeight - receivingState.b2bState.tankReceivingSession.quantityReceived).toLocaleString()} كجم
                            </span>
                          </div>
                        </>
                      )}
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
          ) : isB2B ? (
            // B2B Vehicle Weighing Buttons
            <>
              {workflowStep === 'first_weighing' && (
                <button
                  onClick={handleB2BFirstWeighing}
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
              
              {workflowStep === 'second_weighing' && (
                <button
                  onClick={handleB2BSecondWeighing}
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
              
              {workflowStep === 'completed' && (
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