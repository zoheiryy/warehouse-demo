import React, { useState } from 'react';
import { 
  IconArrowNarrowRight, 
  IconArrowNarrowLeft,
  IconBoxAlignTopFilled,
  IconContainer,
  IconSelectAll,
  IconTower,
  IconSettings,
  IconDatabaseImport,
  IconHome
} from '@tabler/icons-react';

const Sidebar = ({ onNavigate, currentPage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

  const navigationItems = [
    {
      id: 'home',
      icon: IconHome,
      label: 'الرئيسية',
      englishLabel: 'Home',
      status: 'active',
      badge: null
    },
    {
      id: 'send-receive',
      icon: IconArrowNarrowRight,
      label: 'إرسال واستقبال',
      englishLabel: 'Send and Receive',
      status: 'active', // PHASE 1 - UCO Receiving Implementation
      badge: 'Phase 1'
    },
    {
      id: 'inventory-control',
      icon: IconDatabaseImport,
      label: 'التحكم في المخزون',
      englishLabel: 'Inventory Control',
      status: 'future',
      badge: 'Future'
    },
    {
      id: 'quality-management',
      icon: IconSelectAll,
      label: 'إدارة الجودة',
      englishLabel: 'Quality Management',
      status: 'future',
      badge: 'Future'
    },
    {
      id: 'containers-operations',
      icon: IconContainer,
      label: 'عمليات الحاويات',
      englishLabel: 'Containers Operations',
      status: 'future',
      badge: 'Future'
    },
    {
      id: 'workers-performance',
      icon: IconTower,
      label: 'أداء العمال',
      englishLabel: 'Workers Performance',
      status: 'future',
      badge: 'Future'
    },
    {
      id: 'settings',
      icon: IconSettings,
      label: 'الإعدادات',
      englishLabel: 'Settings',
      status: 'future',
      badge: 'Future'
    }
  ];

  const handleItemClick = (itemId) => {
    if (itemId === 'send-receive') {
      setActiveItem(itemId);
      onNavigate('send-receive');
    } else if (itemId === 'home') {
      setActiveItem('home');
      onNavigate('home');
    } else {
      // Show coming soon message for future phases
      console.log(`${itemId} - Coming in future phases`);
    }
  };

  return (
    <aside 
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed',
        insetInlineStart: 0, // RTL: left in LTR, right in RTL - this is the start side
        top: '56px', // Below TopMenuBar
        height: 'calc(100vh - 56px)',
        width: isExpanded ? '280px' : '64px',
        background: '#ffffff',
        borderInlineEnd: '1px solid #e5e7eb', // RTL: right border in LTR, left border in RTL
        transition: 'width 0.3s ease-in-out',
        zIndex: 40,
        overflow: 'hidden',
        direction: 'rtl',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)' // Shadow on the end side
      }}
    >
      <nav style={{ padding: '16px 0' }}>
        <ul style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.id;
            const isClickable = item.status === 'active';
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  disabled={!isClickable}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    background: isActive 
                      ? '#f0f9ff' // Light blue background for active
                      : 'transparent',
                    color: isActive 
                      ? '#0369a1' // Blue text for active
                      : isClickable 
                        ? '#374151' // Dark gray for clickable
                        : '#9ca3af', // Light gray for disabled
                    cursor: isClickable ? 'pointer' : 'not-allowed',
                    borderRadius: '8px',
                    marginInline: '8px', // RTL-aware horizontal margin
                    transition: 'all 0.2s ease-in-out',
                    textAlign: 'start', // RTL-aware text alignment
                    justifyContent: 'flex-start',
                    opacity: isClickable ? 1 : 0.6,
                    position: 'relative',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable && !isActive) {
                      e.target.style.background = '#f9fafb'; // Light gray hover
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable && !isActive) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Icon */}
                  <IconComponent 
                    size={20} 
                    style={{ 
                      flexShrink: 0,
                      color: isActive 
                        ? '#0369a1' // Blue for active
                        : isClickable 
                          ? '#374151' // Dark gray for clickable
                          : '#9ca3af' // Light gray for disabled
                    }} 
                  />
                  
                  {/* Text Label */}
                  <span style={{
                    fontFamily: 'Tajawal, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
                    transition: 'all 0.3s ease-in-out',
                    marginInlineStart: isExpanded ? '8px' : '0', // RTL-aware margin
                    flex: 1
                  }}>
                    {item.label}
                  </span>

                  {/* Status Badge */}
                  {item.badge && isExpanded && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '500',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.status === 'active' 
                        ? '#dcfce7' // Light green for active
                        : '#f3f4f6', // Light gray for future
                      color: item.status === 'active'
                        ? '#166534' // Dark green for active
                        : '#6b7280', // Gray for future
                      whiteSpace: 'nowrap',
                      marginInlineStart: '8px' // RTL-aware margin
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Expansion Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        insetInlineEnd: '16px', // RTL-aware positioning - end side
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#6b7280',
        fontSize: '12px',
        opacity: isExpanded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}>
        <IconArrowNarrowLeft size={16} />
        <span style={{ fontFamily: 'Tajawal, sans-serif' }}>
          اختر القسم
        </span>
      </div>
    </aside>
  );
};

export default Sidebar; 