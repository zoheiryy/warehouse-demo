import React, { useState } from 'react';
import { IconX, IconTruck, IconScale, IconDroplet, IconCheck, IconEdit } from '@tabler/icons-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge, Separator } from '@tagaddod-design/react';

const TripDetailsPanel = ({ trip, onClose }) => {
  if (!trip) return null;

  // Determine workflow type for UCO receiving
  const getWorkflowType = (trip) => {
    if (trip.tripType === 'B2C' && trip.warehouseType === 'T3') {
      return 'B2C_T3'; // Single step: Collector → Warehouse
    } else if (trip.tripType === 'B2C' && trip.warehouseType === 'T1') {
      return 'B2C_T1'; // Two steps: Collector → Outside Tank → Inside Tank
    } else if (trip.tripType === 'B2X' && trip.warehouseType === 'T1') {
      return 'B2X_T1'; // Two steps with vehicle weighing
    } else if (trip.tripType === 'B2B' && trip.warehouseType === 'T1') {
      return 'B2B_T1'; // Two steps with remainder loop
    }
    return 'UNKNOWN';
  };

  const workflowType = getWorkflowType(trip);

  // State management for B2C + T1 receiving workflow
  const [receivingState, setReceivingState] = useState({
    // Module 1: Collector Receiving
    collectorReceiving: {
      status: 'لم تبدأ', // 'لم تبدأ' | 'بدأت' | 'انتهت'
      auditedQuantityKg: null,
      completedAt: null,
      operator: null
    },
    // Module 2: Tank Receiving
    tankReceiving: {
      status: 'لم تبدأ', // 'لم تبدأ' | 'بدأت' | 'انتهت'
      selectedTankId: workflowType === 'B2X_T1' ? 'Receiving_Tank_2' : 'B2C_Receiving_Tank_1',
      startWeight: null,
      endWeight: null,
      netWeight: null,
      completedAt: null
    },
    // Inventory tracking
    inventory: {
      withCollectorKg: trip.quantityKg || trip.expectedQuantity || 0,
      outsideTanksKg: 0,
      insideTanksKg: 0
    },
    // UI state
    showCollectorModal: false,
    showTankModal: false,
    isLoading: false
  });

  // Generate dummy logs based on trip status and receiving state
  const generateTripLogs = (trip) => {
    const logs = [
      {
        id: 1,
        timestamp: new Date(trip.createdAt),
        action: 'إنشاء الرحلة',
        description: `تم إنشاء رحلة جديدة للمندوب ${trip.collectorName}`,
        type: 'info'
      }
    ];

    if (trip.status.id !== 'لم تبدأ') {
      logs.push({
        id: 2,
        timestamp: new Date(trip.createdAt.getTime() + 30 * 60 * 1000), // 30 minutes later
        action: 'بدء الرحلة',
        description: 'تم بدء الرحلة وتوجه المندوب لجمع الزيت المستعمل',
        type: 'success'
      });
    }

    if (trip.status.id === 'مكتملة') {
      logs.push({
        id: 3,
        timestamp: new Date(trip.createdAt.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        action: 'اكتمال الجمع',
        description: `تم جمع ${trip.quantityKg} كجم من الزيت المستعمل`,
        type: 'success'
      });
    }

    // Add receiving logs based on state
    if (receivingState.collectorReceiving.status === 'انتهت') {
      logs.push({
        id: 4,
        timestamp: receivingState.collectorReceiving.completedAt || new Date(),
        action: 'استلام من المندوب',
        description: `تم استلام ${receivingState.collectorReceiving.auditedQuantityKg} كجم من المندوب - في انتظار نقل للخزان`,
        type: 'success'
      });
    }

    if (receivingState.tankReceiving.status === 'انتهت') {
      logs.push({
        id: 5,
        timestamp: receivingState.tankReceiving.completedAt || new Date(),
        action: 'استلام في الخزان',
        description: `تم نقل ${receivingState.tankReceiving.netWeight} كجم إلى الخزان`,
        type: 'success'
      });
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  };

  const tripLogs = generateTripLogs(trip);

  // Generate realistic tank weights for simulation
  const generateTankWeights = (expectedQuantity) => {
    const baseWeight = Math.floor(Math.random() * (15000 - 5000) + 5000); // 5000-15000 kg
    const variance = Math.floor(Math.random() * 100 - 50); // ±50 kg variance
    const actualQuantity = expectedQuantity + variance;
    
    return {
      startWeight: baseWeight,
      endWeight: baseWeight + actualQuantity,
      netWeight: actualQuantity
    };
  };

  // Generate realistic vehicle weights for B2X/B2B simulation
  const generateVehicleWeights = () => {
    const firstWeight = Math.floor(Math.random() * (18000 - 12000) + 12000); // 12000-18000 kg (loaded truck)
    const secondWeight = Math.floor(Math.random() * (12000 - 8000) + 8000);  // 8000-12000 kg (empty truck)
    const netWeight = firstWeight - secondWeight; // 4000-6000 kg range
    
    return {
      firstWeight,
      secondWeight,
      netWeight
    };
  };

  // Handle collector receiving (Module 1)
  const handleCollectorReceiving = () => {
    if (workflowType === 'B2C_T1' || workflowType === 'B2X_T1') {
      setReceivingState(prev => ({
        ...prev,
        showCollectorModal: true
      }));
    }
  };

  // Handle tank receiving (Module 2)
  const handleTankReceiving = () => {
    if ((workflowType === 'B2C_T1' || workflowType === 'B2X_T1') && receivingState.collectorReceiving.status === 'انتهت') {
      setReceivingState(prev => ({
        ...prev,
        showTankModal: true
      }));
    }
  };

  // Complete collector receiving
  const completeCollectorReceiving = (auditedQuantity, vehicleWeights = null) => {
    setReceivingState(prev => ({
      ...prev,
      collectorReceiving: {
        ...prev.collectorReceiving,
        status: 'انتهت',
        auditedQuantityKg: auditedQuantity,
        vehicleWeights: vehicleWeights, // Store vehicle weights for B2X
        completedAt: new Date(),
        operator: 'مشغل المخزن' // Mock operator
      },
      inventory: {
        ...prev.inventory,
        withCollectorKg: 0,
        outsideTanksKg: auditedQuantity
      },
      showCollectorModal: false
    }));
  };

  // Complete tank receiving
  const completeTankReceiving = (weights) => {
    setReceivingState(prev => ({
      ...prev,
      tankReceiving: {
        ...prev.tankReceiving,
        status: 'انتهت',
        startWeight: weights.startWeight,
        endWeight: weights.endWeight,
        netWeight: weights.netWeight,
        completedAt: new Date()
      },
      inventory: {
        ...prev.inventory,
        outsideTanksKg: 0,
        insideTanksKg: weights.netWeight
      },
      showTankModal: false
    }));
  };

  // Collector Receiving Modal (Module 1)
  const CollectorReceivingModal = () => {
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
        completeCollectorReceiving(vehicleWeights.netWeight, vehicleWeights);
      } else {
        completeCollectorReceiving(auditQuantity);
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

    if (!receivingState.showCollectorModal) return null;

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
              onClick={() => setReceivingState(prev => ({ ...prev, showCollectorModal: false }))}
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
              onClick={() => setReceivingState(prev => ({ ...prev, showCollectorModal: false }))}
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

  // Tank Receiving Modal (Module 2)
  const TankReceivingModal = () => {
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
      completeTankReceiving(weights);
      setIsProcessing(false);
    };

    if (!receivingState.showTankModal) return null;

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
              onClick={() => setReceivingState(prev => ({ ...prev, showTankModal: false }))}
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
                  onClick={() => setReceivingState(prev => ({ ...prev, showTankModal: false }))}
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

  // UCO Card Component for receiving workflow
  const UCOReceivingCard = () => {
    const getStepsForWorkflow = (workflowType) => {
      switch (workflowType) {
        case 'B2C_T3':
          return [
            { id: 'warehouse_receiving', label: 'استلام في المخزن', completed: false, current: true }
          ];
        case 'B2C_T1':
          return [
            { 
              id: 'collector_receiving', 
              label: 'استلامة مندوب', 
              completed: receivingState.collectorReceiving.status === 'انتهت', 
              current: receivingState.collectorReceiving.status !== 'انتهت' 
            },
            { 
              id: 'tank_receiving', 
              label: 'استلامة خزان', 
              completed: receivingState.tankReceiving.status === 'انتهت', 
              current: receivingState.collectorReceiving.status === 'انتهت' && receivingState.tankReceiving.status !== 'انتهت' 
            }
          ];
        case 'B2X_T1':
          return [
            { id: 'collector_receiving', label: 'استلامة مندوب', completed: false, current: true },
            { id: 'tank_receiving', label: 'استلامة خزان', completed: false, current: false }
          ];
        case 'B2B_T1':
          return [
            { id: 'collector_receiving', label: 'استلام من المندوب', completed: false, current: true },
            { id: 'tank_receiving', label: 'استلام في الخزان', completed: false, current: false }
          ];
        default:
          return [];
      }
    };

    const steps = getStepsForWorkflow(workflowType);
    
    const getInventoryDisplay = (workflowType) => {
      switch (workflowType) {
        case 'B2C_T3':
          return [
            { label: 'المتوقع', value: `${trip.expectedQuantity} كجم`, color: '#6b7280' },
            { label: 'في المخزن', value: '0 كجم', color: '#059669' }
          ];
        case 'B2C_T1':
          return [
            { label: 'المتوقع', value: `${trip.expectedQuantity} كجم`, color: '#6b7280' },
            { label: 'داخل الخزانات', value: `${receivingState.inventory.insideTanksKg} كجم`, color: '#059669' },
            { label: 'خارج الخزانات', value: `${receivingState.inventory.outsideTanksKg} كجم`, color: '#d97706' }
          ];
        case 'B2X_T1':
        case 'B2B_T1':
          return [
            { label: 'المتوقع', value: `${trip.expectedQuantity} كجم`, color: '#6b7280' },
            { label: 'داخل الخزانات', value: '0 كجم', color: '#059669' },
            { label: 'خارج الخزانات', value: '0 كجم', color: '#d97706' }
          ];
        default:
          return [];
      }
    };

    const inventoryItems = getInventoryDisplay(workflowType);

    const getActionButtonText = (workflowType) => {
      if (workflowType === 'B2C_T1') {
        if (receivingState.collectorReceiving.status === 'لم تبدأ') {
          return 'بدء مراجعة الكمية';
        } else if (receivingState.collectorReceiving.status === 'انتهت' && receivingState.tankReceiving.status === 'لم تبدأ') {
          return 'بدء استلام في الخزان';
        } else if (receivingState.tankReceiving.status === 'انتهت') {
          return 'مكتملة ✓';
        }
      }
      
      if (workflowType === 'B2X_T1') {
        if (receivingState.collectorReceiving.status === 'لم تبدأ') {
          return 'بدء وزن السيارة';
        } else if (receivingState.collectorReceiving.status === 'انتهت' && receivingState.tankReceiving.status === 'لم تبدأ') {
          return 'بدء استلام في الخزان';
        } else if (receivingState.tankReceiving.status === 'انتهت') {
          return 'مكتملة ✓';
        }
      }
      
      switch (workflowType) {
        case 'B2C_T3':
          return 'بدء مراجعة الكمية';
        case 'B2B_T1':
          return 'بدء وزن السيارة';
        default:
          return 'بدء الاستلام';
      }
    };

    const isActionButtonDisabled = () => {
      if (workflowType === 'B2C_T1' || workflowType === 'B2X_T1') {
        return receivingState.tankReceiving.status === 'انتهت';
      }
      return false;
    };

    const handleActionButtonClick = () => {
      if (workflowType === 'B2C_T1' || workflowType === 'B2X_T1') {
        if (receivingState.collectorReceiving.status === 'لم تبدأ') {
          handleCollectorReceiving();
        } else if (receivingState.collectorReceiving.status === 'انتهت' && receivingState.tankReceiving.status === 'لم تبدأ') {
          handleTankReceiving();
        }
      }
    };

    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        background: '#ffffff'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <IconDroplet size={20} style={{ color: '#059669' }} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            زيت هالك
          </h3>
        </div>

        {/* Inventory Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {inventoryItems.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {item.label}:
              </span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: item.color 
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Steps */}
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '12px'
          }}>
            الخطوات:
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {steps.map((step, index) => (
              <div key={step.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: step.completed ? '#059669' : step.current ? '#0369a1' : '#d1d5db'
                }} />
                <span style={{
                  fontSize: '14px',
                  color: step.current ? '#0369a1' : step.completed ? '#059669' : '#6b7280',
                  fontWeight: step.current ? '500' : '400'
                }}>
                  {step.label}
                  {step.current && ' ← [الحالية]'}
                  {step.completed && ' ✓'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleActionButtonClick}
          disabled={isActionButtonDisabled()}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isActionButtonDisabled() ? '#059669' : '#0369a1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isActionButtonDisabled() ? 'default' : 'pointer',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!isActionButtonDisabled()) {
              e.target.style.background = '#0284c7';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActionButtonDisabled()) {
              e.target.style.background = '#0369a1';
            }
          }}
        >
          {isActionButtonDisabled() && <IconCheck size={16} />}
          {getActionButtonText(workflowType)}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* CSS Animation for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Modals */}
      <CollectorReceivingModal />
      <TankReceivingModal />
      
      <div style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif',
        overflow: 'auto'
      }}>
        {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            تفاصيل الرحلة #{trip.id}
          </h2>
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
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            <IconX size={20} />
          </button>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <span>{trip.collectorName}</span>
          <span>•</span>
          <Badge tone="default" size="sm">{trip.tripType}</Badge>
          <span>•</span>
          <Badge tone="info" size="sm">{trip.warehouseType}</Badge>
        </div>
      </div>

      {/* Tabs Content */}
      <div style={{ padding: '20px' }}>
        <Tabs defaultValue="overview" variant="primary">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="logs">السجلات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              paddingTop: '16px'
            }}>
              {/* Trip Summary */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  ملخص الرحلة
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>المندوب:</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                      {trip.collectorName}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>نوع الرحلة:</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                      {trip.tripType}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>الكمية المجمعة:</span>
                    <span style={{ color: '#059669', fontSize: '14px', fontWeight: '600' }}>
                      {trip.quantityKg} كجم
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>الحالة:</span>
                    <Badge 
                      tone={trip.status.id === 'مكتملة' ? 'success' : 
                            trip.status.id === 'بدأت' ? 'info' : 
                            trip.status.id === 'قيد الانتظار' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {trip.status.label}
                    </Badge>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>نوع المخزن:</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                      {trip.warehouseType}
                    </span>
                  </div>
                </div>
              </div>

              {/* UCO Receiving Card */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  استلام الزيت المستعمل
                </h3>
                <UCOReceivingCard />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <div style={{ paddingTop: '16px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                سجل الأنشطة
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {tripLogs.map((log) => (
                  <div key={log.id} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: '#f9fafb'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {log.action}
                      </span>
                      <Badge 
                        tone={log.type === 'success' ? 'success' : 'info'} 
                        size="sm"
                      >
                        {log.type === 'success' ? 'مكتمل' : 'معلومات'}
                      </Badge>
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {log.description}
                    </p>
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      {log.timestamp.toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default TripDetailsPanel; 