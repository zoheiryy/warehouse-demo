import React, { useState } from 'react';
import { IconX, IconClock, IconMapPin, IconUser, IconTruck, IconScale } from '@tabler/icons-react';
import { Separator } from '@tagaddod-design/react';

// Import modular components
import CollectorReceivingModal from './modals/CollectorReceivingModal';
import TankReceivingModal from './modals/TankReceivingModal';
import WorkflowStatusCard from './cards/WorkflowStatusCard';
import InventoryTrackingCard from './cards/InventoryTrackingCard';

// Import utilities
import { getWorkflowType } from './utils/workflowUtils';
import { generateTripLogs, generateUCOReceivingLogs } from './utils/logUtils';

const TripDetailsPanel = ({ trip, onClose, receivingState, onUpdateReceivingState }) => {
  if (!trip) return null;

  // Determine workflow type for UCO receiving
  const workflowType = getWorkflowType(trip);

  // Tab management state
  const [activeTab, setActiveTab] = useState('overview');
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [showTankModal, setShowTankModal] = useState(false);

  // Get trip type colors
  const getTripTypeColors = (type) => {
    switch (type) {
      case 'B2C': 
        return {
          background: '#dbeafe', // Light blue
          color: '#1d4ed8'       // Blue
        };
      case 'B2X': 
        return {
          background: '#fed7aa', // Light orange
          color: '#ea580c'       // Orange
        };
      case 'B2B': 
        return {
          background: '#dcfce7', // Light green
          color: '#16a34a'       // Green
        };
      case 'TG': 
        return {
          background: '#f3e8ff', // Light purple
          color: '#9333ea'       // Purple
        };
      default: 
        return {
          background: '#e0f2fe', // Default light blue
          color: '#0369a1'       // Default blue
        };
    }
  };

  // Generate trip logs
  const tripLogs = generateTripLogs(trip, receivingState);
  const ucoReceivingLogs = generateUCOReceivingLogs(trip, receivingState);

  // Handle collector receiving completion
  const handleCollectorReceivingComplete = (quantity, additionalData) => {
    if (workflowType === 'B2B_T1') {
      // B2B workflow completion
      if (additionalData?.netWeight) {
        // Vehicle weighing completed
        const netWeight = additionalData.netWeight;
        const tankReceived = receivingState.b2bState?.tankReceivingSession?.quantityReceived || 0;
        const outsideQuantity = Math.max(0, netWeight - tankReceived);
        
        onUpdateReceivingState(prev => ({
          ...prev,
          collectorReceiving: {
            ...prev.collectorReceiving,
            status: 'انتهت',
            actualQuantity: netWeight,
            completedAt: new Date()
          },
          inventory: {
            ...prev.inventory,
            withCollectorKg: 0,
            outsideTanksKg: outsideQuantity,
            insideTanksKg: prev.inventory.insideTanksKg + tankReceived
          },
          b2bState: {
            ...prev.b2bState,
            firstVehicleWeight: additionalData.firstWeight,
            secondVehicleWeight: additionalData.secondWeight,
            workflowStep: 'completed'
          }
        }));
      }
    } else {
      // Original B2C/B2X workflow
      onUpdateReceivingState(prev => ({
        ...prev,
        collectorReceiving: {
          ...prev.collectorReceiving,
          status: 'انتهت',
          actualQuantity: quantity,
          completedAt: new Date()
        },
        inventory: {
          ...prev.inventory,
          withCollectorKg: 0,
          outsideTanksKg: prev.inventory.outsideTanksKg + quantity
        }
      }));
    }
    
    setShowCollectorModal(false);
    
    // For B2B, check if user chose tank_first and open tank modal
    if (workflowType === 'B2B_T1' && receivingState.b2bState?.userChoice === 'tank_first' && receivingState.b2bState?.workflowStep === 'tank_receiving') {
      setTimeout(() => setShowTankModal(true), 100);
    }
  };

  // Handle tank receiving completion
  const handleTankReceivingComplete = (weights) => {
    const isB2B = trip?.tripType === 'B2B';
    
    onUpdateReceivingState(prev => {
      const newState = {
        ...prev,
        tankReceiving: {
          ...prev.tankReceiving,
          status: 'انتهت',
          startWeight: weights.startWeight,
          endWeight: weights.endWeight,
          netWeight: weights.netWeight,
          completedAt: new Date(),
          selectedTank: weights.selectedTank || prev.tankReceiving.selectedTankId
        },
        showTankModal: false
      };

      if (isB2B) {
        // B2B: Handle remainder logic
        const remainderAmount = weights.remainderAmount || 0;
        newState.inventory = {
          ...prev.inventory,
          outsideTanksKg: remainderAmount,
          insideTanksKg: prev.inventory.insideTanksKg + weights.netWeight
        };
        
        // Update B2B state
        newState.b2bState = {
          ...prev.b2bState,
          cycleCount: prev.b2bState.cycleCount + 1,
          transferHistory: [
            ...prev.b2bState.transferHistory,
            {
              cycle: prev.b2bState.cycleCount + 1,
              tank: weights.selectedTank,
              amount: weights.netWeight,
              timestamp: new Date()
            }
          ]
        };
        
        // If there's remainder, reset tank receiving status for next cycle
        if (remainderAmount > 0) {
          newState.tankReceiving.status = 'لم تبدأ';
        }
      } else {
        // B2C/B2X: Transfer all remaining
        newState.inventory = {
          ...prev.inventory,
          outsideTanksKg: 0,
          insideTanksKg: weights.netWeight
        };
      }

      return newState;
    });
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#f9fafb',
      overflowY: 'auto',
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            تفاصيل الرحلة
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'overview' ? '#0369a1' : '#6b7280',
              borderBottom: activeTab === 'overview' ? '2px solid #0369a1' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'logs' ? '#0369a1' : '#6b7280',
              borderBottom: activeTab === 'logs' ? '2px solid #0369a1' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            سجل الأحداث
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'overview' && (
          <>
            {/* Trip Basic Info */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#0369a1',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconTruck size={20} style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>
                    رحلة رقم {trip.id}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: 0
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: getTripTypeColors(trip.tripType).background,
                      color: getTripTypeColors(trip.tripType).color
                    }}>
                      {trip.tripType}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {trip.warehouseType}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconUser size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    المندوب: {trip.collectorName}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconMapPin size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    المنطقة: {trip.area}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconClock size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    تاريخ الإنشاء: {trip.createdAt.toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconScale size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    الكمية المتوقعة: {trip.expectedQuantity} كجم
                  </span>
                </div>
                {trip.quantityKg && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <IconScale size={16} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                      الكمية المجمعة: {trip.quantityKg} كجم
                    </span>
                  </div>
                )}
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: trip.status.id === 'مكتملة' ? '#f0fdf4' : '#fef3c7',
                borderRadius: '6px',
                border: trip.status.id === 'مكتملة' ? '1px solid #059669' : '1px solid #d97706'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: trip.status.id === 'مكتملة' ? '#059669' : '#d97706'
                }}>
                  الحالة: {trip.status.label}
                </span>
              </div>
            </div>

            {/* Workflow Status Card */}
            <WorkflowStatusCard
              receivingState={receivingState}
              workflowType={workflowType}
              trip={trip}
              onStartCollectorReceiving={() => setShowCollectorModal(true)}
              onStartTankReceiving={() => setShowTankModal(true)}
            />

            {/* Inventory Tracking Card - Only show for B2C, B2X, and B2B trips */}
            {(trip.tripType === 'B2C' || trip.tripType === 'B2X' || trip.tripType === 'B2B') && (
              <InventoryTrackingCard
                receivingState={receivingState}
                workflowType={workflowType}
                trip={trip}
              />
            )}
          </>
        )}

        {activeTab === 'logs' && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              سجل أحداث استلام الزيت المستعمل
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              يعرض هذا السجل فقط الأحداث المتعلقة بعمليات استلام الزيت المستعمل من المندوب ونقله إلى الخزانات
            </p>

            {/* Show disabled message for non-B2C, non-B2X, and non-B2B trips */}
            {trip.tripType !== 'B2C' && trip.tripType !== 'B2X' && trip.tripType !== 'B2B' && (
              <div style={{
                padding: '20px',
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#92400e',
                  margin: 0
                }}>
                  سجل استلام الزيت المستعمل متاح فقط لرحلات B2C و B2X و B2B
                </p>
              </div>
            )}

            {/* Show logs only for B2C, B2X, and B2B trips */}
            {(trip.tripType === 'B2C' || trip.tripType === 'B2X' || trip.tripType === 'B2B') && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {ucoReceivingLogs.map((log, index) => (
                <div key={log.id} style={{
                  display: 'flex',
                  gap: '12px',
                  paddingBottom: index < tripLogs.length - 1 ? '12px' : '0',
                  borderBottom: index < tripLogs.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: log.type === 'success' ? '#059669' : '#0369a1',
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {log.action}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {log.timestamp.toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {log.description}
                    </p>
                  </div>
                </div>
                              ))}
                {ucoReceivingLogs.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6b7280'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      لم تبدأ عمليات الاستلام بعد
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals - Only render for B2C, B2X, and B2B trips */}
      {(trip.tripType === 'B2C' || trip.tripType === 'B2X' || trip.tripType === 'B2B') && (
        <>
          <CollectorReceivingModal
            isOpen={showCollectorModal}
            onClose={() => setShowCollectorModal(false)}
            onConfirm={handleCollectorReceivingComplete}
            trip={trip}
            workflowType={workflowType}
            receivingState={receivingState}
            onUpdateReceivingState={onUpdateReceivingState}
          />

          <TankReceivingModal
            isOpen={showTankModal}
            onClose={() => setShowTankModal(false)}
            onConfirm={handleTankReceivingComplete}
            trip={trip}
            workflowType={workflowType}
            receivingState={receivingState}
            onUpdateReceivingState={onUpdateReceivingState}
          />
        </>
      )}
    </div>
  );
};

export default TripDetailsPanel; 