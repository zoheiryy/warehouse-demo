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
  COMPLETE: 'complete'
};

// ... rest of the file ...

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
    b2bStep: B2B_STEPS.COMPLETE, // Always go to COMPLETE
    pendingWeight: null,
    currentScaleReading: secondWt,
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
      workflowStep: 'completed',
      hasPartialReceiving: calculations.hasRemainder,
      totalReceivedQuantity: calculations.receivedFromCollector,
      receivedInTankQuantity: tankReceived,
      remainingQuantity: calculations.outsideTankQuantity,
      remainingStatus: calculations.hasRemainder ? 'pending' : 'completed'
    },
    collectorReceiving: {
      ...prev.collectorReceiving,
      status: calculations.hasRemainder ? 'مكتمل جزئياً' : 'انتهت',
      auditedQuantityKg: calculations.receivedFromCollector,
      completedAt: new Date(),
      operator: 'مشغل المستودع',
      vehicleWeights: { firstWeight: firstWt, secondWeight: secondWt, netWeight: calculations.receivedFromCollector },
      receivedFromCollector: calculations.receivedFromCollector,
      isPartialReceiving: calculations.hasRemainder,
      remainingQuantityKg: calculations.outsideTankQuantity
    },
    inventory: {
      ...prev.inventory,
      withCollectorKg: 0,
      outsideTanksKg: prev.inventory.outsideTanksKg + calculations.outsideTankQuantity,
      insideTanksKg: prev.inventory.insideTanksKg + tankReceived
    }
  }));
};

// ... rest of the file ...

// Complete state UI
{/* Step 11: Process Complete */}
{b2bStep === B2B_STEPS.COMPLETE && (
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
          <>
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
            <p style={{
              fontSize: '14px',
              color: '#92400e',
              margin: '8px 0 0 0',
              padding: '8px',
              background: '#fffbeb',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              يمكن استلام الكمية المتبقية لاحقاً في الخزان
            </p>
          </>
        )}
      </div>
    </div>
    
    <button
      onClick={handleConfirm}
      style={{
        width: '100%',
        padding: '16px',
        background: '#059669',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <IconCheck size={20} />
      تأكيد الاستلام النهائي
    </button>
  </div>
)}