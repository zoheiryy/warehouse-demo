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

const TripDetailsPanel = ({ trip, onClose }) => {
  if (!trip) return null;

  // Determine workflow type for UCO receiving
  const workflowType = getWorkflowType(trip);

  // Tab management state
  const [activeTab, setActiveTab] = useState('overview');

  // State management for B2C + T1 receiving workflow
  const [receivingState, setReceivingState] = useState({
    // Module 1: Collector Receiving
    collectorReceiving: {
      status: 'لم تبدأ', // 'لم تبدأ' | 'بدأت' | 'انتهت'
      auditedQuantityKg: null,
      completedAt: null,
      operator: null,
      vehicleWeights: null // For B2X workflow
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
    showTankModal: false
  });

  // Generate trip logs
  const tripLogs = generateTripLogs(trip, receivingState);
  const ucoReceivingLogs = generateUCOReceivingLogs(trip, receivingState);

  // Handle collector receiving completion
  const handleCollectorReceivingComplete = (auditedQuantity, vehicleWeights = null) => {
    setReceivingState(prev => ({
      ...prev,
      collectorReceiving: {
        ...prev.collectorReceiving,
        status: 'انتهت',
        auditedQuantityKg: auditedQuantity,
        completedAt: new Date(),
        operator: 'مشغل المستودع',
        vehicleWeights: vehicleWeights
      },
      inventory: {
        ...prev.inventory,
        withCollectorKg: 0,
        outsideTanksKg: auditedQuantity
      },
      showCollectorModal: false
    }));
  };

  // Handle tank receiving completion
  const handleTankReceivingComplete = (weights) => {
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
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {trip.tripType} - {trip.warehouseType}
                  </p>
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
              onStartCollectorReceiving={() => setReceivingState(prev => ({ ...prev, showCollectorModal: true }))}
              onStartTankReceiving={() => setReceivingState(prev => ({ ...prev, showTankModal: true }))}
            />

            {/* Inventory Tracking Card */}
            <InventoryTrackingCard
              receivingState={receivingState}
              workflowType={workflowType}
            />
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
          </div>
        )}
      </div>

      {/* Modals */}
      <CollectorReceivingModal
        isOpen={receivingState.showCollectorModal}
        onClose={() => setReceivingState(prev => ({ ...prev, showCollectorModal: false }))}
        onConfirm={handleCollectorReceivingComplete}
        trip={trip}
        workflowType={workflowType}
      />

      <TankReceivingModal
        isOpen={receivingState.showTankModal}
        onClose={() => setReceivingState(prev => ({ ...prev, showTankModal: false }))}
        onConfirm={handleTankReceivingComplete}
        receivingState={receivingState}
      />
    </div>
  );
};

export default TripDetailsPanel; 