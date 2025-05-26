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

  // Add receiving logs based on state
  if (receivingState.collectorReceiving.status === 'انتهت') {
    logs.push({
      id: 1,
      timestamp: receivingState.collectorReceiving.completedAt || new Date(),
      action: 'استلام من المندوب',
      description: `تم استلام ${receivingState.collectorReceiving.auditedQuantityKg} كجم من المندوب - في انتظار نقل للخزان`,
      type: 'success'
    });
  }

  if (receivingState.tankReceiving.status === 'انتهت') {
    logs.push({
      id: 2,
      timestamp: receivingState.tankReceiving.completedAt || new Date(),
      action: 'استلام في الخزان',
      description: `تم نقل ${receivingState.tankReceiving.netWeight} كجم إلى الخزان`,
      type: 'success'
    });
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
}; 