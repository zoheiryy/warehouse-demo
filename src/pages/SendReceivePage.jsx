import React, { useState, useEffect } from 'react';
import { IconTruck } from '@tabler/icons-react';
import TripCard from '../components/TripCard';
import TripDetailsPanel from '../components/TripDetailsPanel';
import { generateDummyTrips } from '../utils/tripData';

const SendReceivePage = () => {
  const [trips] = useState(generateDummyTrips());
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SendReceivePage; 