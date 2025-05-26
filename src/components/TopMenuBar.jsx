import * as React from 'react';
import { Select, Avatar, Popover, Button } from '@tagaddod-design/react';
import { ExitIcon } from '@radix-ui/react-icons';

// Dummy warehouse data
const warehouses = [
  { id: 'T1', name: 'Name1', displayName: 'مخزن الأول' },
  { id: 'T2', name: 'Name2', displayName: 'مخزن الثاني' },
  { id: 'T3', name: 'Warehouse3', displayName: 'مخزن الثالث' },
  { id: 'T4', name: 'Central Hub', displayName: 'المخزن المركزي' },
];

// Transform warehouses to Select options format
const warehouseOptions = warehouses.map(warehouse => ({
  value: warehouse.id,
  label: warehouse.displayName,
}));

const TopMenuBar = ({ onWarehouseChange }) => {
  const [selectedWarehouse, setSelectedWarehouse] = React.useState(warehouses[0].id);

  const handleWarehouseSelect = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    const warehouse = warehouses.find(w => w.id === warehouseId);
    // Call the callback if provided
    if (onWarehouseChange && warehouse) {
      onWarehouseChange(warehouse);
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
  };

  // Profile menu content for Popover
  const profileMenuContent = (
    <div style={{ padding: '8px', minWidth: '240px' }}>
      {/* Profile Info Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '8px',
        borderBottom: '1px solid var(--t-color-border-secondary)',
        marginBottom: '8px'
      }}>
        <Avatar 
          type="icon" 
          size="lg"
        />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          gap: '2px'
        }}>
          <div style={{ 
            fontFamily: 'var(--t-font-family-primary)', 
            fontWeight: '600', 
            fontSize: '14px',
            color: 'var(--t-color-text-primary)'
          }}>
            المستخدم
          </div>
          <div style={{ 
            fontFamily: 'var(--t-font-family-secondary)', 
            fontSize: '12px',
            color: 'var(--t-color-text-secondary)',
            direction: 'ltr',
            textAlign: 'right'
          }}>
            user@example.com
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <Button
        variant="plain"
        tone="critical"
        size="medium"
        fullWidth
        prefixIcon={<ExitIcon />}
        onClick={handleLogout}
        style={{ justifyContent: 'flex-end' }}
      >
        تسجيل الخروج
      </Button>
    </div>
  );

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--t-color-surface-primary)',
      borderBottom: '1px solid var(--t-color-border-secondary)',
      direction: 'rtl'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 24px',
        height: '56px',
        maxWidth: '1440px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        
        {/* Left side: Warehouse Selector + Profile Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Warehouse Selector */}
          <div style={{ minWidth: '200px' }}>
            <Select
              options={warehouseOptions}
              value={selectedWarehouse}
              onChange={handleWarehouseSelect}
              placeholder="اختر المخزن"
            />
          </div>

          {/* Profile Avatar with Popover */}
          <Popover
            content={profileMenuContent}
            placement="bottom-end"
            trigger="click"
          >
            <div style={{ cursor: 'pointer' }}>
              <Avatar 
                type="icon" 
                size="md"
              />
            </div>
          </Popover>
        </div>

        {/* Right side: Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1px'
          }}>
            <svg width="159" height="18" viewBox="0 0 159 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 0.255493H17.3186V17.5084H0V0.255493Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M15.3691 0.00732422H34.815V17.501H15.3691V0.00732422Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M35.9441 0H53.1009V17.4958H35.9441V0Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M55.8257 0.00732422H75.2719V17.501H55.8257V0.00732422Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M78.2332 0.247437H95.559V17.2755H78.2332V0.247437Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M99.115 0.247437H116.441V17.2755H99.115V0.247437Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M118.887 0H138.118V17.4939H118.887V0Z" fill="var(--t-color-text-primary)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M141.674 0.247437H159V17.2755H141.674V0.247437Z" fill="var(--t-color-text-primary)"/>
            </svg>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopMenuBar;