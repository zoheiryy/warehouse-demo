/**
 * Utility functions for generating trip logs
 */

/**
 * Generate dummy logs based on trip status and receiving state
 * @param {Object} trip - Trip object
 * @param {Object} receivingState - Current receiving state
 * @returns {Array} - Array of log entries
 */
export const generateTripLogs = (trip, receivingState) => {
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

/**
 * Generate UCO receiving logs only (excludes trip creation/completion logs)
 * @param {Object} trip - Trip object
 * @param {Object} receivingState - Current receiving state
 * @returns {Array} - Array of UCO receiving log entries only
 */
export const generateUCOReceivingLogs = (trip, receivingState) => {
  const logs = [];

  // Collector Receiving Logs (استلامة مندوب)
  if (receivingState.collectorReceiving.status !== 'لم تبدأ') {
    // First vehicle weight
    if (receivingState.b2bState?.firstVehicleWeight) {
      logs.push({
        id: `weight_1_${trip.id}`,
        timestamp: receivingState.b2bState.firstWeightTimestamp || new Date(),
        action: 'الوزن الأول للسيارة',
        description: `وزن السيارة الأولي: ${receivingState.b2bState.firstVehicleWeight} كجم`,
        type: 'info',
        category: 'استلامة مندوب'
      });
    }

    // Second vehicle weight
    if (receivingState.b2bState?.secondVehicleWeight) {
      logs.push({
        id: `weight_2_${trip.id}`,
        timestamp: receivingState.b2bState.secondWeightTimestamp || new Date(),
        action: 'الوزن الثاني للسيارة',
        description: `وزن السيارة النهائي: ${receivingState.b2bState.secondVehicleWeight} كجم`,
        type: 'info',
        category: 'استلامة مندوب'
      });

      // Net weight calculation
      const netWeight = receivingState.collectorReceiving.vehicleWeights?.netWeight;
      if (netWeight) {
        logs.push({
          id: `net_weight_${trip.id}`,
          timestamp: receivingState.b2bState.secondWeightTimestamp || new Date(),
          action: 'حساب الكمية المستلمة',
          description: `الكمية المستلمة من المندوب: ${netWeight} كجم`,
          type: 'success',
          category: 'استلامة مندوب'
        });
      }
    }
  }

  // Tank Receiving Logs (استلامة خزان)
  if (receivingState.tankReceiving.status !== 'لم تبدأ') {
    // Tank receiving start
    if (receivingState.tankReceiving.startWeight) {
      logs.push({
        id: `tank_start_${trip.id}`,
        timestamp: receivingState.tankReceiving.startTimestamp || new Date(),
        action: 'بدء استلام الخزان',
        description: `وزن الخزان الأولي: ${receivingState.tankReceiving.startWeight} كجم`,
        type: 'info',
        category: 'استلامة خزان'
      });
    }

    // Tank receiving completion
    if (receivingState.tankReceiving.endWeight) {
      logs.push({
        id: `tank_end_${trip.id}`,
        timestamp: receivingState.tankReceiving.endTimestamp || new Date(),
        action: 'اكتمال استلام الخزان',
        description: `وزن الخزان النهائي: ${receivingState.tankReceiving.endWeight} كجم`,
        type: 'info',
        category: 'استلامة خزان'
      });

      // Tank net weight calculation
      const tankNetWeight = receivingState.tankReceiving.netWeight;
      if (tankNetWeight) {
        logs.push({
          id: `tank_net_${trip.id}`,
          timestamp: receivingState.tankReceiving.endTimestamp || new Date(),
          action: 'حساب الكمية المستلمة',
          description: `الكمية المستلمة في الخزان: ${tankNetWeight} كجم`,
          type: 'success',
          category: 'استلامة خزان'
        });
      }
    }

    // Remainder quantity if applicable
    if (receivingState.b2bState?.hasRemainder) {
      const remainingQty = receivingState.inventory.outsideTanksKg;
      logs.push({
        id: `remainder_${trip.id}`,
        timestamp: receivingState.b2bState.secondWeightTimestamp || new Date(),
        action: 'تسجيل الكمية المتبقية',
        description: `الكمية المتبقية خارج الخزان: ${remainingQty} كجم`,
        type: 'warning',
        category: 'استلامة خزان'
      });
    }
  }

  return logs;
}; 