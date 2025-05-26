import React, { useState, useEffect } from 'react';
import { IconTruck } from '@tabler/icons-react';
import TripCard from '../components/TripCard';
import TripDetailsPanel from '../components/TripDetailsPanel';
import { generateDummyTrips } from '../utils/tripData';
import { getWorkflowType } from '../components/TripDetails/utils/workflowUtils';

const SendReceivePage = () => {
  const [trips] = useState(generateDummyTrips());
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // State management for each trip's receiving state (isolated by trip ID)
  const [tripStates, setTripStates] = useState(new Map());

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get or initialize receiving state for a specific trip
  const getTripReceivingState = (trip) => {
    if (!tripStates.has(trip.id)) {
      const workflowType = getWorkflowType(trip);
      const initialState = {
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
        // B2B specific state
        b2bState: {
          totalFromCollector: 0,
          cycleCount: 0,
          transferHistory: [],
          // New vehicle weighing workflow
          firstVehicleWeight: null,
          secondVehicleWeight: null,
          userChoice: null, // 'tank_first' | 'weighing_first'
          tankReceivingSession: {
            isActive: false,
            startWeight: null,
            endWeight: null,
            quantityReceived: 0,
            startTime: null,
            endTime: null
          },
          workflowStep: 'first_weighing' // 'first_weighing' | 'choose_action' | 'tank_receiving' | 'second_weighing' | 'completed'
        },
        // UI state
        showCollectorModal: false,
        showTankModal: false
      };
      
      setTripStates(prev => new Map(prev.set(trip.id, initialState)));
      return initialState;
    }
    return tripStates.get(trip.id);
  };

  // Update receiving state for a specific trip
  const updateTripReceivingState = (tripId, updater) => {
    setTripStates(prev => {
      const currentState = prev.get(tripId);
      if (!currentState) return prev;
      
      const newState = typeof updater === 'function' ? updater(currentState) : updater;
      return new Map(prev.set(tripId, newState));
    });
  };

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
  };

  const handleCloseTripDetails = () => {
    setSelectedTrip(null);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: '#f9fafb',
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 24px',
        paddingInlineStart: '88px' // Add space for sidebar (64px + 24px padding)
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <IconTruck size={24} style={{ color: '#0369a1' }} />
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            إرسال واستقبال
          </h1>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          إدارة رحلات جمع الزيت المستعمل من المندوبين
        </p>
      </div>

      {/* Split View Container */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 56px - 81px)', // Subtract header height
        overflow: 'hidden'
      }}>
        {/* Left Side - Trips Grid */}
        <div style={{
          flex: selectedTrip ? (windowWidth < 768 ? '0 0 0%' : windowWidth < 1024 ? '0 0 20%' : '0 0 30%') : '1',
          padding: '24px',
          paddingInlineStart: '88px', // Add space for sidebar (64px + 24px padding)
          overflow: 'auto',
          transition: 'flex 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: selectedTrip && windowWidth >= 768 ? '300px' : 'auto'
        }}>
          {/* Trips Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedTrip && windowWidth >= 768 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            maxWidth: selectedTrip && windowWidth >= 768 ? 'none' : '1200px',
            transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isSelected={selectedTrip?.id === trip.id}
                onClick={() => handleTripClick(trip)}
              />
            ))}
          </div>

          {/* Empty State when no trips */}
          {trips.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <IconTruck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>لا توجد رحلات</h3>
              <p style={{ fontSize: '14px' }}>لم يتم العثور على أي رحلات في الوقت الحالي</p>
            </div>
          )}
        </div>

        {/* Right Side - Trip Details Panel */}
        {selectedTrip && (
          <div style={{
            flex: windowWidth < 768 ? '1' : windowWidth < 1024 ? '0 0 80%' : '0 0 70%',
            borderInlineStart: '1px solid #e5e7eb',
            background: '#ffffff',
            overflow: 'auto'
          }}>
            <TripDetailsPanel
              trip={selectedTrip}
              onClose={handleCloseTripDetails}
              receivingState={getTripReceivingState(selectedTrip)}
              onUpdateReceivingState={(updater) => updateTripReceivingState(selectedTrip.id, updater)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SendReceivePage; 