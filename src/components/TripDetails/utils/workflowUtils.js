/**
 * Utility functions for UCO receiving workflows
 */

/**
 * Determine workflow type for UCO receiving
 * @param {Object} trip - Trip object
 * @returns {string} - Workflow type identifier
 */
export const getWorkflowType = (trip) => {
  if (trip.tripType === 'B2C' && trip.warehouseType === 'T3') {
    return 'B2C_T3'; // Single step: Collector → Warehouse
  } else if (trip.tripType === 'B2C' && trip.warehouseType === 'T1') {
    return 'B2C_T1'; // Two steps: Collector → Outside Tank → Inside Tank
  } else if (trip.tripType === 'B2X' && trip.warehouseType === 'T1') {
    return 'B2X_T1'; // Two steps with vehicle weighing
  } else if (trip.tripType === 'B2X' && trip.warehouseType === 'T3') {
    return 'B2X_T3'; // Two steps with vehicle weighing for T3 warehouse
  } else if (trip.tripType === 'B2B' && trip.warehouseType === 'T1') {
    return 'B2B_T1'; // Two steps with remainder loop
  }
  return 'UNKNOWN';
};

/**
 * Generate realistic tank weights for simulation
 * @param {number} expectedQuantity - Expected quantity in kg
 * @returns {Object} - Weight measurements
 */
export const generateTankWeights = (expectedQuantity) => {
  const baseWeight = Math.floor(Math.random() * (15000 - 5000) + 5000); // 5000-15000 kg
  const variance = Math.floor(Math.random() * 100 - 50); // ±50 kg variance
  const actualQuantity = expectedQuantity + variance;
  
  return {
    startWeight: baseWeight,
    endWeight: baseWeight + actualQuantity,
    netWeight: actualQuantity
  };
};

/**
 * Generate realistic vehicle weights for B2X/B2B simulation
 * @returns {Object} - Vehicle weight measurements
 */
export const generateVehicleWeights = () => {
  const firstWeight = Math.floor(Math.random() * (18000 - 12000) + 12000); // 12000-18000 kg (loaded truck)
  const secondWeight = Math.floor(Math.random() * (12000 - 8000) + 8000);  // 8000-12000 kg (empty truck)
  const netWeight = firstWeight - secondWeight; // 4000-6000 kg range
  
  return {
    firstWeight,
    secondWeight,
    netWeight
  };
};

/**
 * Get steps configuration for different workflow types
 * @param {string} workflowType - Workflow type identifier
 * @param {Object} receivingState - Current receiving state
 * @returns {Array} - Array of step objects
 */
export const getStepsForWorkflow = (workflowType, receivingState) => {
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
    case 'B2X_T3':
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
    case 'B2B_T1':
      const workflowStep = receivingState.b2bState?.workflowStep || 'first_weighing';
      const userChoice = receivingState.b2bState?.userChoice;
      
      switch (workflowStep) {
        case 'first_weighing':
          return [
            { 
              id: 'first_weighing', 
              label: 'الوزن الأول للسيارة', 
              completed: false, 
              current: true 
            }
          ];
        case 'choose_action':
          return [
            { 
              id: 'first_weighing', 
              label: 'الوزن الأول للسيارة', 
              completed: true, 
              current: false 
            },
            { 
              id: 'choose_action', 
              label: 'اختيار الإجراء', 
              completed: false, 
              current: true 
            }
          ];
        case 'tank_receiving':
          return [
            { 
              id: 'first_weighing', 
              label: 'الوزن الأول للسيارة', 
              completed: true, 
              current: false 
            },
            { 
              id: 'tank_receiving', 
              label: 'استلام جزئي في الخزان', 
              completed: false, 
              current: true 
            }
          ];
        case 'second_weighing':
          return [
            { 
              id: 'first_weighing', 
              label: 'الوزن الأول للسيارة', 
              completed: true, 
              current: false 
            },
            ...(userChoice === 'tank_first' ? [{
              id: 'tank_receiving', 
              label: 'استلام جزئي في الخزان', 
              completed: true, 
              current: false 
            }] : []),
            { 
              id: 'second_weighing', 
              label: 'الوزن الثاني للسيارة', 
              completed: false, 
              current: true 
            }
          ];
        case 'completed':
          return [
            { 
              id: 'first_weighing', 
              label: 'الوزن الأول للسيارة', 
              completed: true, 
              current: false 
            },
            ...(userChoice === 'tank_first' ? [{
              id: 'tank_receiving', 
              label: 'استلام جزئي في الخزان', 
              completed: true, 
              current: false 
            }] : []),
            { 
              id: 'second_weighing', 
              label: 'الوزن الثاني للسيارة', 
              completed: true, 
              current: false 
            },
            { 
              id: 'receive_from_collector', 
              label: 'استلام من المندوب', 
              completed: true, 
              current: false 
            }
          ];
        default:
          return [];
      }
    default:
      return [];
  }
};

/**
 * Get inventory display configuration for different workflow types
 * @param {string} workflowType - Workflow type identifier
 * @param {Object} trip - Trip object
 * @param {Object} receivingState - Current receiving state
 * @returns {Array} - Array of inventory display items
 */
export const getInventoryDisplay = (workflowType, trip, receivingState) => {
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
      return [
        { label: 'المتوقع', value: `${trip.expectedQuantity} كجم`, color: '#6b7280' },
        { label: 'داخل الخزانات', value: `${receivingState.inventory.insideTanksKg} كجم`, color: '#059669' },
        { label: 'خارج الخزانات', value: `${receivingState.inventory.outsideTanksKg} كجم`, color: '#d97706' }
      ];
    case 'B2X_T3':
      return [
        { label: 'المتوقع', value: `${trip.expectedQuantity} كجم`, color: '#6b7280' },
        { label: 'داخل الخزانات', value: `${receivingState.inventory.insideTanksKg} كجم`, color: '#059669' },
        { label: 'خارج الخزانات', value: `${receivingState.inventory.outsideTanksKg} كجم`, color: '#d97706' }
      ];
    case 'B2B_T1':
      return [
        { label: 'المتوقع', value: `${trip.expectedQuantity} كجم`, color: '#6b7280' },
        { label: 'داخل الخزانات', value: `${receivingState.inventory.insideTanksKg} كجم`, color: '#059669' },
        { label: 'خارج الخزانات', value: `${receivingState.inventory.outsideTanksKg} كجم`, color: '#d97706' }
      ];
    default:
      return [];
  }
};

/**
 * Get action button text based on workflow type and current state
 * @param {string} workflowType - Workflow type identifier
 * @param {Object} receivingState - Current receiving state
 * @returns {string} - Button text
 */
export const getActionButtonText = (workflowType, receivingState) => {
  if (workflowType === 'B2C_T1') {
    if (receivingState.collectorReceiving.status === 'لم تبدأ') {
      return 'بدء مراجعة الكمية';
    } else if (receivingState.collectorReceiving.status === 'انتهت' && receivingState.tankReceiving.status === 'لم تبدأ') {
      return 'بدء استلام في الخزان';
    } else if (receivingState.tankReceiving.status === 'انتهت') {
      return 'مكتملة ✓';
    }
  }
  
  if (workflowType === 'B2X_T1' || workflowType === 'B2X_T3') {
    if (receivingState.collectorReceiving.status === 'لم تبدأ') {
      return 'بدء وزن السيارة';
    } else if (receivingState.collectorReceiving.status === 'انتهت' && receivingState.tankReceiving.status === 'لم تبدأ') {
      return 'بدء استلام في الخزان';
    } else if (receivingState.tankReceiving.status === 'انتهت') {
      return 'مكتملة ✓';
    }
  }
  
  if (workflowType === 'B2B_T1') {
    const workflowStep = receivingState.b2bState?.workflowStep || 'first_weighing';
    
    switch (workflowStep) {
      case 'first_weighing':
        return 'بدء الوزن الأول';
      case 'choose_action':
        return 'اختيار الإجراء';
      case 'tank_receiving':
        if (receivingState.b2bState?.tankReceivingSession?.isActive) {
          return 'إيقاف الاستلام';
        }
        return 'بدء استلام في الخزان';
      case 'second_weighing':
        return 'بدء الوزن الثاني';
      case 'completed':
        return 'مكتملة ✓';
      default:
        return 'بدء العملية';
    }
  }
  
  switch (workflowType) {
    case 'B2C_T3':
      return 'بدء مراجعة الكمية';
    default:
      return 'بدء الاستلام';
  }
};

/**
 * Check if action button should be disabled
 * @param {string} workflowType - Workflow type identifier
 * @param {Object} receivingState - Current receiving state
 * @returns {boolean} - Whether button should be disabled
 */
export const isActionButtonDisabled = (workflowType, receivingState) => {
  if (workflowType === 'B2C_T1' || workflowType === 'B2X_T1' || workflowType === 'B2X_T3') {
    return receivingState.tankReceiving.status === 'انتهت';
  }
  if (workflowType === 'B2B_T1') {
    const workflowStep = receivingState.b2bState?.workflowStep || 'first_weighing';
    return workflowStep === 'completed';
  }
  return false;
}; 