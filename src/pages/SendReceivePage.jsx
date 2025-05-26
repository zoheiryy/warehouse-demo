import React, { useState } from 'react';
import { IconTruck } from '@tabler/icons-react';
import TripCard from '../components/TripCard';
import TripDetailsPanel from '../components/TripDetailsPanel';
import { generateDummyTrips } from '../utils/tripData';

const SendReceivePage = () => {
  const [trips] = useState(generateDummyTrips());
  const [selectedTrip, setSelectedTrip] = useState(null);

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
      fontFamily: 'Tajawal, sans-serif',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 24px'
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

      {/* Main Content */}
      <div style={{
        padding: '24px',
        marginInlineEnd: selectedTrip ? '400px' : '0',
        transition: 'margin-inline-end 0.3s ease-in-out'
      }}>
        {/* Trips Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          maxWidth: '1200px'
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

      {/* Trip Details Panel */}
      {selectedTrip && (
        <TripDetailsPanel
          trip={selectedTrip}
          onClose={handleCloseTripDetails}
        />
      )}
    </div>
  );
};

export default SendReceivePage; 