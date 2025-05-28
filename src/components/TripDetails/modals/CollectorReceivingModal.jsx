import React, { useState, useEffect } from 'react';
import { IconX, IconTruck, IconScale, IconCheck } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';
import { generateVehicleWeights } from '../utils/workflowUtils';

// B2B Workflow Steps Definition
const B2B_STEPS = {
  AUDIT: 'audit',
  FIRST_WEIGHING: 'first_weighing',
  FIRST_WEIGHT_CONFIRM: 'first_weight_confirm',
  CHOOSE_ACTION: 'choose_action',
  TANK_RECEIVING: 'tank_receiving',
  TANK_WEIGHING_IN_PROGRESS: 'tank_weighing_in_progress',
  TANK_COMPLETE: 'tank_complete',
  SECOND_WEIGHING: 'second_weighing',
  SECOND_WEIGHING_IN_PROGRESS: 'second_weighing_in_progress',
  SECOND_WEIGHT_CONFIRM: 'second_weight_confirm',
  REMAINDER_PROCESSING: 'remainder_processing',
  COMPLETE: 'complete'
};

// Helper function to get receiving tank based on channel
const getReceivingTankForChannel = (tripType) => {
  const tankMapping = {
    'B2X': 'Receiving_Tank_2',
    'B2B': 'B2B_Receiving_Tank_1',
    'B2C': 'B2C_Receiving_Tank_1'
  };
  return tankMapping[tripType] || 'Default_Receiving_Tank';
};

// Helper function to get initial state for a trip
const getInitialTripState = (workflowType) => {
  const baseState = {
    auditQuantity: 0,
    isProcessing: false,
    // B2X Vehicle weighing states
    vehicleWeighingStep: 'start',
    vehicleWeights: null,
    // B2B states
    b2bStep: B2B_STEPS.AUDIT,
    b2bWeights: null,
    currentScaleReading: 0,
    isScaleActive: false,
    pendingWeight: null,
    showConfirmButton: false,
    canConfirmReading: false,
    showRedoButton: false,
    // Tank receiving states
    currentTankReading: 0,
    isTankScaleActive: false,
    tankWeights: null,
    pendingTankWeights: null,
    // B2B specific states
    firstWeight: null,
    secondWeight: null,
    tankReceivedQuantity: 0,
    receivedFromCollector: 0,
    outsideTankQuantity: 0,
    hasRemainder: false,
    tankCycles: [],
    currentCycle: 0
  };

  return baseState;
};

const CollectorReceivingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  trip, 
  workflowType,
  receivingState,
  onUpdateReceivingState
}) => {
  // Trip-specific state management
  const [tripStates, setTripStates] = useState({});
  
  const tripId = trip?.id;
  
  // Get current trip state
  const getCurrentTripState = () => {
    if (!tripId) return getInitialTripState(workflowType);
    return tripStates[tripId] || getInitialTripState(workflowType);
  };
  
  // Update trip-specific state
  const updateTripState = (updates) => {
    if (!tripId) {
      console.log('❌ updateTripState called but no tripId'); // Debug log
      return;
    }
    
    console.log('🔄 updateTripState called with:', updates); // Debug log
    console.log('Current tripId:', tripId); // Debug log
    
    setTripStates(prev => {
      const currentState = prev[tripId] || getInitialTripState(workflowType);
      const newState = {
        ...prev,
        [tripId]: {
          ...currentState,
          ...updates
        }
      };
      
      console.log('Updated state for trip', tripId, ':', newState[tripId]); // Debug log
      return newState;
    });
  };
  
  // Initialize trip state when modal opens
  useEffect(() => {
    if (isOpen && tripId && !tripStates[tripId]) {
      console.log('🏁 Initializing state for trip:', tripId); // Debug log
      const initialState = getInitialTripState(workflowType);
      initialState.auditQuantity = trip.quantityKg || trip.expectedQuantity || 0;
      console.log('Initial state:', initialState); // Debug log
      setTripStates(prev => ({
        ...prev,
        [tripId]: initialState
      }));
    }
  }, [isOpen, tripId, workflowType, trip.quantityKg, trip.expectedQuantity]);
  
  // Get current state
  const currentState = getCurrentTripState();
  
  // Destructure current state for easier access
  const {
    auditQuantity,
    isProcessing,
    vehicleWeighingStep,
    vehicleWeights,
    b2bStep,
    b2bWeights,
    currentScaleReading,
    isScaleActive,
    pendingWeight,
    showConfirmButton,
    canConfirmReading,
    showRedoButton,
    currentTankReading,
    isTankScaleActive,
    tankWeights,
    pendingTankWeights,
    firstWeight,
    secondWeight,
    tankReceivedQuantity,
    receivedFromCollector,
    outsideTankQuantity,
    hasRemainder
  } = currentState;

  const isB2B = workflowType === 'B2B_T1';
  const isB2X = workflowType === 'B2X_T1' || workflowType === 'B2X_T3';
  const workflowStep = receivingState?.b2bState?.workflowStep || 'first_weighing';

  // B2B Calculation Logic
  const calculateB2BQuantities = (firstWt, secondWt, tankReceived = 0) => {
    const receivedFromCollector = firstWt - secondWt;
    const outsideTankQty = Math.max(0, receivedFromCollector - tankReceived);
    const insideTankQty = tankReceived;
    
    return {
      receivedFromCollector,
      outsideTankQuantity: outsideTankQty,
      insideTankQuantity: insideTankQty,
      hasRemainder: outsideTankQty > 0
    };
  };

  // Logging System
  const createLog = (action, details) => {
    const logEntry = {
      timestamp: new Date(),
      tripId: tripId,
      action,
      details,
      workflow: workflowType
    };
    console.log('Log Entry:', logEntry);
    // Add to actual logging system here
  };

  const handleConfirm = async () => {
    updateTripState({ isProcessing: true });
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (isB2X) {
      onConfirm(vehicleWeights.netWeight, vehicleWeights);
    } else if (isB2B) {
      // B2B completion handled differently based on workflow step
      if (b2bStep === B2B_STEPS.COMPLETE) {
        onConfirm(receivedFromCollector || 0, { 
          receivedFromCollector, 
          firstWeight, 
          secondWeight,
          tankReceivedQuantity
        });
      }
    } else {
      onConfirm(auditQuantity);
    }
    updateTripState({ isProcessing: false });
  };

  // Handle B2X vehicle weighing process (preserve original logic)
  const handleVehicleWeighing = async () => {
    if (vehicleWeighingStep === 'start') {
      updateTripState({ isProcessing: true, vehicleWeighingStep: 'first_weight' });
      
      // Simulate first weighing
      await new Promise(resolve => setTimeout(resolve, 2000));
      const weights = generateVehicleWeights();
      updateTripState({ 
        vehicleWeights: weights, 
        isProcessing: false, 
        vehicleWeighingStep: 'unloading' 
      });
    } else if (vehicleWeighingStep === 'unloading') {
      updateTripState({ isProcessing: true, vehicleWeighingStep: 'second_weight' });
      
      // Simulate unloading and second weighing
      await new Promise(resolve => setTimeout(resolve, 2500));
      updateTripState({ isProcessing: false, vehicleWeighingStep: 'complete' });
    }
  };

  // SIMPLIFIED & FIXED: B2B Car Weighing Process
  const startScaleReading = async (targetWeight) => {
    console.log('Starting scale reading with target:', targetWeight); // Debug log
    
    // Calculate realistic base reading (not zero)
    const baseReading = Math.floor(targetWeight * 0.75); // Start at 75% of target
    const finalReading = targetWeight;
    
    console.log('Base reading:', baseReading, 'Final reading:', finalReading); // Debug log
    
    // Set initial state immediately with a realistic starting weight
    updateTripState({ 
      isScaleActive: true,
      currentScaleReading: baseReading, // Start from base, not zero
      showConfirmButton: true,
      showRedoButton: false,
      pendingWeight: null,
      canConfirmReading: true
    });
    
    // Simple working simulation
    let currentValue = baseReading;
    let step = 0;
    const totalSteps = 15;
    const increment = (finalReading - baseReading) / totalSteps;
    
    console.log('Starting simulation from', currentValue, 'to', finalReading); // Debug log
    
    const interval = setInterval(() => {
      step++;
      
      // Calculate new value with smooth progression
      currentValue = Math.floor(baseReading + (increment * step));
      
      // Add small realistic fluctuation (scales typically fluctuate)
      const fluctuation = Math.floor((Math.random() - 0.5) * 20); // ±10kg fluctuation
      const displayValue = Math.max(baseReading, Math.min(finalReading + 50, currentValue + fluctuation));
      
      console.log('Step', step, 'Display value:', displayValue); // Debug log
      
      // Always update with a valid reading
      updateTripState({ 
        currentScaleReading: displayValue 
      });
      
      // Stop at final reading
      if (step >= totalSteps) {
        console.log('Simulation complete at:', finalReading); // Debug log
        clearInterval(interval);
        updateTripState({ 
          currentScaleReading: finalReading,
          isScaleActive: false
        });
      }
    }, 200); // Update every 200ms for smooth animation
    
    // Safety cleanup after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      console.log('Safety cleanup triggered'); // Debug log
      // Ensure we always have a final reading
      const currentState = getCurrentTripState();
      if (!currentState.currentScaleReading || currentState.currentScaleReading === 0) {
        updateTripState({ 
          currentScaleReading: finalReading,
          isScaleActive: false
        });
      }
    }, 3000);
  };

  // Confirm reading during weighing - IMPROVED
  const confirmCurrentReading = () => {
    const currentReading = getCurrentTripState().currentScaleReading;
    const currentStep = getCurrentTripState().b2bStep;
    
    // Only proceed if we have a valid reading
    if (currentReading && currentReading > 0) {
      updateTripState({ 
        pendingWeight: currentReading,
        isScaleActive: false,
        canConfirmReading: false,
        showRedoButton: true // Show redo after confirmation
      });
      
      // Transition to the appropriate confirmation step
      if (currentStep === B2B_STEPS.FIRST_WEIGHING) {
        updateTripState({ 
          b2bStep: B2B_STEPS.FIRST_WEIGHT_CONFIRM 
        });
      } else if (currentStep === B2B_STEPS.SECOND_WEIGHING_IN_PROGRESS) {
        updateTripState({ 
          b2bStep: B2B_STEPS.SECOND_WEIGHT_CONFIRM 
        });
      }
    }
  };

  // Redo weight reading
  const redoWeightReading = () => {
    updateTripState({
      currentScaleReading: 0,
      pendingWeight: null,
      showConfirmButton: false,
      showRedoButton: false,
      canConfirmReading: false
    });
    
  };

  // ============ B2B WORKFLOW FUNCTIONS ============
  
  // B2B Step 1: Start First Weighing - FIXED: Add debugging
  const handleB2BFirstWeighing = async () => {
    console.log('🚀 handleB2BFirstWeighing called'); // Debug log
    console.log('Current step before:', getCurrentTripState().b2bStep); // Debug log
    
    // Generate realistic weights for a loaded truck
    const targetWeight = Math.floor(Math.random() * (18000 - 12000) + 12000); // 12000-18000 kg
    const initialWeight = Math.floor(targetWeight * 0.75); // Start at 75% of target
    
    // FIXED: Immediate state transition with initial weight
    updateTripState({ 
      b2bStep: B2B_STEPS.FIRST_WEIGHING,
      currentScaleReading: initialWeight, // Set initial weight immediately
      isScaleActive: true,
      showConfirmButton: true,
      canConfirmReading: true
    });
    
    console.log('State updated to FIRST_WEIGHING with initial weight:', initialWeight); // Debug log
    
    createLog('collector_receiving_started', 'بدء استلام من المندوب');
    
    console.log('Starting scale with target weight:', targetWeight); // Debug log
    
    await startScaleReading(targetWeight);
    
    console.log('Scale reading completed, waiting for user confirmation'); // Debug log
    // Don't automatically transition - wait for user to confirm the reading
  };

  // B2B Step 2: Confirm First Weight
  const confirmFirstWeight = () => {
    const firstWt = pendingWeight;
    updateTripState({ 
      firstWeight: firstWt,
      b2bStep: B2B_STEPS.CHOOSE_ACTION,
      pendingWeight: null,
      currentScaleReading: firstWt, // Keep the weight visible instead of resetting to 0
      showConfirmButton: false,
      showRedoButton: false
    });
    
    createLog('vehicle_first_weight_generated', `تم توليد الوزن الأول للسيارة: ${firstWt} كجم`);
    
    // Update receiving state
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        firstVehicleWeight: firstWt,
        workflowStep: 'choose_action'
      }
    }));
  };

  // B2B Step 3: Handle User Choice (Tank First vs Second Weight)
  const handleB2BChoice = (choice) => {
    createLog('user_choice_made', `اختار المستخدم: ${choice === 'tank_first' ? 'استلام في الخزان أولاً' : 'الوزن الثاني أولاً'}`);
    
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        userChoice: choice,
        workflowStep: choice === 'tank_first' ? 'tank_receiving' : 'second_weighing'
      }
    }));
    
    if (choice === 'tank_first') {
      updateTripState({ b2bStep: B2B_STEPS.TANK_RECEIVING });
    } else {
      updateTripState({ b2bStep: B2B_STEPS.SECOND_WEIGHING });
    }
  };

  // UPDATED: Tank Receiving with improved performance
  const startTankReceiving = async () => {
    const receivingTank = getReceivingTankForChannel(trip.tripType);
    createLog('tank_cycle_started', `بدء دورة استلام الخزان: ${receivingTank}`);
    
    // Calculate quantities
    const availableQuantity = receivingState?.inventory?.outsideTanksKg || 
                             (firstWeight ? Math.floor(firstWeight * 0.8) : Math.floor(Math.random() * (3000 - 1500) + 1500));
    
    const startWeight = Math.floor(Math.random() * (5000 - 3000) + 3000); // 3000-5000 kg
    const receiveQuantity = Math.min(availableQuantity, Math.floor(Math.random() * (3000 - 1500) + 1500));
    const endWeight = startWeight + receiveQuantity;
    
    // Start the gradual simulation
    updateTripState({ 
      b2bStep: B2B_STEPS.TANK_WEIGHING_IN_PROGRESS, 
      isTankScaleActive: true,
      currentTankReading: startWeight,
      pendingTankWeights: { startWeight, endWeight, netWeight: endWeight - startWeight }
    });
    
    // 4-second simulation with setInterval for better performance
    let currentReading = startWeight;
    const totalIncrease = endWeight - startWeight;
    const incrementPerStep = totalIncrease / 20; // 20 steps over 4 seconds
    let stepCount = 0;
    
    const tankInterval = setInterval(() => {
      // Check if user ended early
      const currentState = getCurrentTripState();
      if (currentState.b2bStep !== B2B_STEPS.TANK_WEIGHING_IN_PROGRESS) {
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
      
      updateTripState({ currentTankReading: currentReading });
      
      // Stop when we reach target or max steps
      if (stepCount >= 20 || currentReading >= endWeight) {
        clearInterval(tankInterval);
        updateTripState({ 
          currentTankReading: endWeight,
          isTankScaleActive: false
        });
      }
    }, 200); // Update every 200ms
    
    // Cleanup after 4 seconds maximum
    setTimeout(() => {
      clearInterval(tankInterval);
      const currentState = getCurrentTripState();
      if (currentState.isTankScaleActive) {
        updateTripState({ 
          currentTankReading: endWeight,
          isTankScaleActive: false
        });
      }
    }, 4000);
  };

  // NEW: End Tank Receiving (when user clicks end button)
  const endTankReceiving = () => {
    updateTripState({ 
      isTankScaleActive: false,
      b2bStep: 'tank_confirm_end' // New state for confirmation
    });
  };

  // NEW: Confirm End Tank Receiving
  const confirmEndTankReceiving = () => {
    const { startWeight, endWeight, netWeight } = pendingTankWeights;
    
    updateTripState({ 
      b2bStep: B2B_STEPS.TANK_COMPLETE
    });
    
    createLog('tank_weights_generated', `تم توليد أوزان الخزان - بداية: ${startWeight} كجم، نهاية: ${endWeight} كجم`);
  };

  // NEW: Cancel End Tank Receiving (continue simulation)
  const cancelEndTankReceiving = () => {
    updateTripState({ 
      isTankScaleActive: true,
      b2bStep: B2B_STEPS.TANK_WEIGHING_IN_PROGRESS
    });
  };

  // B2B Step 5: Confirm Tank Receiving - UPDATED: Remove redo button
  const confirmTankReceiving = () => {
    const { startWeight, endWeight, netWeight } = pendingTankWeights;
    const receivingTank = getReceivingTankForChannel(trip.tripType);
    
    updateTripState({ 
      tankReceivedQuantity: netWeight,
      tankWeights: pendingTankWeights,
      b2bStep: B2B_STEPS.SECOND_WEIGHING,
      pendingTankWeights: null,
      currentTankReading: 0
    });
    
    createLog('tank_cycle_completed', `تم استلام ${netWeight} كجم في الخزان`);
    
    // Update receiving state with tank receiving data
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
        selectedTankId: receivingTank,
        completedAt: new Date()
      }
    }));
  };

  // B2B Step 6: Handle Second Weighing - FIXED: Remove delay
  const handleB2BSecondWeighing = async () => {
    // Generate realistic weight for empty vehicle (8-12 tons)
    const targetWeight = Math.floor(Math.random() * (12000 - 8000) + 8000); // 8000-12000 kg
    const initialWeight = Math.floor(targetWeight * 0.75); // Start at 75% of target
    
    // FIXED: Immediate state transition with initial weight
    updateTripState({ 
      b2bStep: B2B_STEPS.SECOND_WEIGHING_IN_PROGRESS,
      currentScaleReading: initialWeight, // Set initial weight immediately
      isScaleActive: true,
      showConfirmButton: true,
      canConfirmReading: true,
      showRedoButton: true // Show redo button immediately
    });
    
    await startScaleReading(targetWeight);
    // Don't auto-transition - wait for user to confirm the reading
  };

  // B2B Step 7: Confirm Second Weight and Complete Process
  const confirmSecondWeight = () => {
    const secondWt = pendingWeight;
    const firstWt = firstWeight || receivingState.b2bState.firstVehicleWeight;
    const tankReceived = tankReceivedQuantity || 0;
    
    // Calculate final quantities
    const calculations = calculateB2BQuantities(firstWt, secondWt, tankReceived);
    
    updateTripState({ 
      secondWeight: secondWt,
      receivedFromCollector: calculations.receivedFromCollector,
      outsideTankQuantity: calculations.outsideTankQuantity,
      hasRemainder: calculations.hasRemainder,
      b2bStep: calculations.hasRemainder ? B2B_STEPS.REMAINDER_PROCESSING : B2B_STEPS.COMPLETE,
      pendingWeight: null,
      currentScaleReading: secondWt, // Keep the weight visible instead of resetting to 0
      showConfirmButton: false,
      showRedoButton: false
    });
    
    createLog('vehicle_second_weight_generated', `تم توليد الوزن الثاني للسيارة: ${secondWt} كجم`);
    createLog('vehicle_net_calculated', `إجمالي المستلم من المندوب: ${calculations.receivedFromCollector} كجم`);
    
    if (calculations.outsideTankQuantity > 0) {
      createLog('remainder_calculated', `كمية متبقية: ${calculations.outsideTankQuantity} كجم`);
    }
    
    // Update final receiving state
    onUpdateReceivingState(prev => ({
      ...prev,
      b2bState: {
        ...prev.b2bState,
        secondVehicleWeight: secondWt,
        workflowStep: calculations.hasRemainder ? 'remainder_processing' : 'completed'
      },
      collectorReceiving: {
        ...prev.collectorReceiving,
        status: calculations.hasRemainder ? 'معالجة المتبقي' : 'انتهت',
        auditedQuantityKg: calculations.receivedFromCollector,
        completedAt: calculations.hasRemainder ? null : new Date(),
        operator: 'مشغل المستودع',
        vehicleWeights: { firstWeight: firstWt, secondWeight: secondWt, netWeight: calculations.receivedFromCollector },
        receivedFromCollector: calculations.receivedFromCollector
      },
      inventory: {
        ...prev.inventory,
        withCollectorKg: 0,
        outsideTanksKg: prev.inventory.outsideTanksKg + calculations.outsideTankQuantity,
        insideTanksKg: prev.inventory.insideTanksKg + tankReceived
      }
    }));
  };

  // Redo functions
  const redoFirstWeight = () => {
    updateTripState({ b2bStep: B2B_STEPS.FIRST_WEIGHING });
    handleB2BFirstWeighing();
  };

  const redoSecondWeight = () => {
    updateTripState({ b2bStep: B2B_STEPS.SECOND_WEIGHING });
    handleB2BSecondWeighing();
  };

  const redoTankReceiving = () => {
    updateTripState({ 
      b2bStep: B2B_STEPS.TANK_RECEIVING,
      pendingTankWeights: null,
      currentTankReading: 0
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
            {isB2B ? 'وزن السيارة واستلام من المندوب - B2B' : 
             isB2X ? 'وزن السيارة واستلام من المندوب' : 'استلام من المندوب'}
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
          {isB2X ? (
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
            // ============ NEW B2B INTERFACE ============
            <div>
              {/* Step 1: Audit */}
              {b2bStep === B2B_STEPS.AUDIT && (
                <div>
                  <div style={{
                    background: '#f3e8ff',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #9333ea'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#9333ea',
                      marginBottom: '12px'
                    }}>
                      عملية مراجعة استلام المندوب - B2B
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
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#9333ea' }}>
                          {trip.quantityKg || trip.expectedQuantity} كجم
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    ابدأ عملية المراجعة عن طريق وزن السيارة المحملة. سيتم وزن السيارة قبل وبعد التفريغ لحساب الكمية الفعلية.
                  </p>
                </div>
              )}

              {/* Step 2: First Weighing */}
              {b2bStep === B2B_STEPS.FIRST_WEIGHING && (
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
                      جاري قراءة الميزان - الوزن الأول
                    </h4>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '8px',
                      fontFamily: 'monospace',
                      background: '#000',
                      color: '#00ff00',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #333'
                    }}>
                      {currentScaleReading ? `${currentScaleReading.toLocaleString()} كجم` : '-- كجم'}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      {isScaleActive && (
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
                        color: isScaleActive ? '#9333ea' : '#059669',
                        fontWeight: '500'
                      }}>
                        {isScaleActive ? 'جاري القراءة...' : 'القراءة مكتملة'}
                      </span>
                    </div>
                    
                    {/* FIXED: Show both confirm and redo buttons */}
                    {showConfirmButton && (
                      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          onClick={confirmCurrentReading}
                          style={{
                            padding: '10px 20px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <IconCheck size={16} />
                          تأكيد القراءة
                        </button>
                        <button
                          onClick={redoFirstWeight}
                          style={{
                            padding: '10px 20px',
                            background: '#f59e0b',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          إعادة القياس
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: First Weight Confirmation */}
              {b2bStep === B2B_STEPS.FIRST_WEIGHT_CONFIRM && (
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
                      تأكيد الوزن الأول
                    </h4>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      textAlign: 'center',
                      marginBottom: '12px',
                      fontFamily: 'monospace',
                      background: '#000',
                      color: '#00ff00',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      {pendingWeight !== null && pendingWeight !== undefined ? `${pendingWeight.toLocaleString()} كجم` : '-- كجم'}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      textAlign: 'center'
                    }}>
                      هل تريد تأكيد هذا الوزن أم إعادة القياس؟
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={confirmFirstWeight}
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
                      تأكيد الوزن
                    </button>
                    {showRedoButton && (
                      <button
                        onClick={redoFirstWeight}
                        style={{
                          padding: '12px 24px',
                          background: '#f59e0b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        إعادة القياس
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Choose Action */}
              {b2bStep === B2B_STEPS.CHOOSE_ACTION && (
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

              {/* Step 5: Tank Receiving - FIXED: Added missing start button */}
              {b2bStep === B2B_STEPS.TANK_RECEIVING && (
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
                          {getReceivingTankForChannel(trip.tripType)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الأول للسيارة:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                          {firstWeight?.toLocaleString()} كجم
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* FIXED: Added missing start button */}
                  <button
                    onClick={startTankReceiving}
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

              {/* Step 6: Tank Weighing in Progress - UPDATED */}
              {b2bStep === B2B_STEPS.TANK_WEIGHING_IN_PROGRESS && (
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
                    
                    {/* NEW: End Receiving Button - appears immediately */}
                    <div style={{ marginTop: '16px' }}>
                      <button
                        onClick={endTankReceiving}
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

              {/* NEW: Tank End Confirmation Dialog */}
              {b2bStep === 'tank_confirm_end' && (
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
                        onClick={confirmEndTankReceiving}
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
                        onClick={cancelEndTankReceiving}
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

              {/* Step 7: Tank Complete - UPDATED: Remove redo button */}
              {b2bStep === B2B_STEPS.TANK_COMPLETE && (
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
                    {pendingTankWeights && (
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
                    )}
                  </div>
                  
                  {/* UPDATED: Only confirm button, no redo button */}
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

              {/* Step 8: Second Weighing */}
              {b2bStep === B2B_STEPS.SECOND_WEIGHING && (
                <div>
                  <div style={{
                    background: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #d97706'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#d97706',
                      marginBottom: '12px'
                    }}>
                      الوزن الثاني للسيارة
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#92400e',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      سيتم الآن وزن السيارة بعد التفريغ لحساب صافي الكمية المستلمة من المندوب.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleB2BSecondWeighing}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: '#d97706',
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
                    بدء الوزن الثاني
                  </button>
                </div>
              )}

              {/* Step 9: Second Weighing in Progress */}
              {b2bStep === B2B_STEPS.SECOND_WEIGHING_IN_PROGRESS && (
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
                      جاري قراءة الميزان - الوزن الثاني
                    </h4>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '8px',
                      fontFamily: 'monospace',
                      background: '#000',
                      color: '#00ff00',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #333'
                    }}>
                      {currentScaleReading ? `${currentScaleReading.toLocaleString()} كجم` : '-- كجم'}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      {isScaleActive && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid #e5e7eb',
                          borderTop: '3px solid #d97706',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      )}
                      <span style={{
                        fontSize: '14px',
                        color: isScaleActive ? '#d97706' : '#059669',
                        fontWeight: '500'
                      }}>
                        {isScaleActive ? 'جاري القراءة...' : 'القراءة مكتملة'}
                      </span>
                    </div>
                    
                    {/* FIXED: Show both confirm and redo buttons */}
                    {showConfirmButton && (
                      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          onClick={confirmCurrentReading}
                          style={{
                            padding: '10px 20px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <IconCheck size={16} />
                          تأكيد القراءة
                        </button>
                        <button
                          onClick={redoSecondWeight}
                          style={{
                            padding: '10px 20px',
                            background: '#f59e0b',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          إعادة القياس
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 10: Second Weight Confirmation */}
              {b2bStep === B2B_STEPS.SECOND_WEIGHT_CONFIRM && (
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
                      تأكيد الوزن الثاني
                    </h4>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      textAlign: 'center',
                      marginBottom: '12px',
                      fontFamily: 'monospace',
                      background: '#000',
                      color: '#00ff00',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      {pendingWeight !== null && pendingWeight !== undefined ? `${pendingWeight.toLocaleString()} كجم` : '-- كجم'}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      textAlign: 'center'
                    }}>
                      هل تريد تأكيد هذا الوزن أم إعادة القياس؟
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={confirmSecondWeight}
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
                      تأكيد الوزن
                    </button>
                    {showRedoButton && (
                      <button
                        onClick={redoSecondWeight}
                        style={{
                          padding: '12px 24px',
                          background: '#f59e0b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        إعادة القياس
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 11: Process Complete or Remainder */}
              {(b2bStep === B2B_STEPS.COMPLETE || b2bStep === B2B_STEPS.REMAINDER_PROCESSING) && (
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
                      ملخص الاستلام من المندوب
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
                          {firstWeight?.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>الوزن الثاني:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {secondWeight?.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>المستلم في الخزان:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                          {tankReceivedQuantity?.toLocaleString()} كجم
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px',
                        background: '#dcfce7',
                        borderRadius: '4px'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>إجمالي المستلم:</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                          {receivedFromCollector?.toLocaleString()} كجم
                        </span>
                      </div>
                      {hasRemainder && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px',
                          background: '#fef3c7',
                          borderRadius: '4px'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>كمية متبقية:</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#d97706' }}>
                            {outsideTankQuantity?.toLocaleString()} كجم
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {hasRemainder && b2bStep === B2B_STEPS.REMAINDER_PROCESSING && (
                    <button
                      onClick={() => updateTripState({ b2bStep: B2B_STEPS.TANK_RECEIVING })}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      معالجة الكمية المتبقية
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // B2C Manual Audit Interface
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                كمية المراجعة (كجم):
              </label>
              <input
                type="number"
                value={auditQuantity}
                onChange={(e) => updateTripState({ auditQuantity: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
        </div>

        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          {isB2X ? (
            // B2X Vehicle Weighing Buttons (preserved original logic)
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
                      جاري المعالجة...
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
                      جاري المعالجة...
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
            // ============ NEW B2B BUTTONS - Updated with Trip State Management ============
            <>
              {b2bStep === B2B_STEPS.AUDIT && (
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
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <IconScale size={16} />
                      بدء وزن السيارة
                    </>
                  )}
                </button>
              )}

              {(b2bStep === B2B_STEPS.COMPLETE || b2bStep === B2B_STEPS.REMAINDER_PROCESSING) && (
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
                      {b2bStep === B2B_STEPS.COMPLETE ? 'تأكيد الاستلام النهائي' : 'إنهاء المعالجة'}
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            // ============ B2C BUTTONS - Preserved Original Logic ============
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