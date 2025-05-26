# Warehouse Management System - Product Requirements Document (PRD)
## Send and Receive Operations - UCO Receiving Implementation

## System Overview

The Warehouse Management System (WMS) is designed to track the complete custody lifecycle of materials (primarily Used Cooking Oil - UCO) across different warehouse tiers. This PRD focuses on Phase 1 implementation: UCO Receiving workflows within the Send and Receive Operations, structured around **two core receiving modules** with workflow-specific inventory flows.

## Complete System Jobs Structure

### 1. Send and Receive Operations (إرسال واستقبال)
**Status: PHASE 1 - UCO Receiving Implementation**

#### Navigation Structure:
```
Main Navigation:
├── Send and Receive (إرسال واستقبال)
    ├── الرحلات والطلبات (Trips and Requests) ← Tab 1
    │   ├── Trips (رحلات) ← Section: Selection/List View  
    │   └── Trip Details (تفاصيل الرحلة) ← Section: Individual Trip Management
    │
    └── الفواتير (Invoices) ← Tab 2 [FUTURE PHASE]
```

#### Tab 1: الرحلات والطلبات (Trips and Requests) - **[IMPLEMENTING NOW]**
- **Trips Section:** Trip selection and overview interface
- **Trip Details Section:** Individual trip management and UCO receiving

#### Tab 2: الفواتير (Invoices) - **[FUTURE PHASE]**

#### Current Implementation Scope: UCO Receiving Flow within Trip Details Section

### 2. Inventory Control (التحكم في المخزون) - **[FUTURE PHASE]**
### 3. Quality Management (إدارة الجودة) - **[FUTURE PHASE]**
### 4. Containers Operations (عمليات الحاويات) - **[FUTURE PHASE]**
### 5. Workers Performance (أداء العمال) - **[FUTURE PHASE]**
### 6. Settings (الإعدادات) - **[FUTURE PHASE]**

---

## Dummy Data Specifications

### **Weight Generation Rules**

#### **Vehicle Weighing (B2X/B2B):**
```typescript
// Realistic truck weight ranges
const generateVehicleWeight = () => ({
  firstWeight: randomBetween(12000, 18000), // kg (loaded truck)
  secondWeight: randomBetween(8000, 12000),  // kg (empty truck)
  netUCO: firstWeight - secondWeight        // 4000-6000 kg range
});
```

#### **Tank Weighing (All T1):**
```typescript
// Tank capacity and realistic increments
const generateTankWeight = (expectedQuantity) => ({
  startWeight: randomBetween(5000, 15000),     // kg (tank baseline)
  endWeight: startWeight + expectedQuantity,   // kg (after transfer)
  variance: randomBetween(-50, +50)           // kg (realistic variance)
});
```

### **Simulation Controls**

#### **Developer Testing Interface:**
- **Weight Override:** Manual input for specific test scenarios
- **Scenario Presets:** Common testing situations (normal, edge cases)
- **Variance Control:** Adjust randomness for consistent testing
- **Failure Simulation:** Test error handling without hardware

#### **Realistic Scenarios:**
```typescript
const testScenarios = {
  normal: { variance: ±2%, errorRate: 0% },
  high_variance: { variance: ±5%, errorRate: 10% },
  edge_case: { variance: ±10%, errorRate: 25% }
};
```

---

## PHASE 1: UCO Receiving Implementation

### Core Receiving Modules Structure

#### Two-Module Architecture
**Module 1: استلامة مندوب (Receiving from Collector)**
- **Purpose:** Transfer custody from collector to warehouse
- **Methods:** Manual audit (B2C) or Vehicle weighing (B2X/B2B)

**Module 2: استلامة خزان (Receiving in Tank)**
- **Purpose:** Transfer UCO into storage tanks
- **Methods:** Tank weighing with simulated weight readings
- **Availability:** T1 warehouses only

### Workflow-Specific Inventory States

#### **Simple Workflow (No Tanks):**
```
B2C + T3: Collector → Warehouse
```

#### **Staged Workflows (All T1 Warehouses):**
```
B2C + T1: Collector → Outside Tank → Inside Tank  
B2X + T1: Collector → Outside Tank → Inside Tank
B2B + T1: Collector → Outside Tank → Inside Tank (with remainder loop)
```

---

## Workflow Implementation by Channel

### **B2C Workflows**

#### **B2C + T1 Warehouse** (Two-Step Process)

**Module 1: استلامة مندوب**
1. **Display:** Show collected quantity from dispatch
2. **Audit Process:** Manual quantity verification
   - Allow warehouse to confirm audit or edit quantity
   - Text input: "Actual audited quantity: ___ kg"
3. **Confirm:** "تأكيد استلام من المندوب"
4. **Inventory Update:** `collectorUCO` → `outsideTankUCO`
5. **Log Entry:** "تم استلام من المندوب - في انتظار نقل للخزان"
6. **Status:** Module 1 complete, progress 50%

**Module 2: استلامة خزان**
1. **Tank Selection:** Auto-select "B2C Receiving Tank 1"
2. **Tank Transfer Process:**
   - Start tank weighing: Generate وزنة أولى (dummy data)
   - Transfer UCO from outside tank area to tank
   - End tank weighing: Generate وزنة ثانية (dummy data)
   - Calculate net: (وزنة ثانية - وزنة أولى)
3. **Confirm:** "تأكيد استلام في الخزان"
4. **Inventory Update:** `outsideTankUCO` → `insideTankUCO`
5. **Log Entry:** "تم استلام في الخزان"
6. **Status:** Process complete, progress 100%

#### **B2C + T3 Warehouse** (Single Module Only)

**Module 1: استلامة مندوب**
1. **Display:** Show collected quantity from dispatch
2. **Audit Process:** Manual quantity verification
   - Allow warehouse to confirm audit or edit quantity
3. **Confirm:** "تأكيد استلام من المندوب"
4. **Inventory Update:** `collectorUCO` → `warehouseUCO`
5. **Log Entry:** "تم استلام من المندوب في المخزن"
6. **Status:** Process complete, progress 100%

**Module 2: استلامة خزان**
- **N/A:** No tanks available in T3 warehouses
- UCO remains in warehouse inventory

---

### **B2X Workflows**

#### **B2X + T1 Warehouse** (Two-Step Process)

**Module 1: استلامة مندوب**
1. **Display:** Show collected quantity from dispatch
2. **Audit Process:** Vehicle weighing
   - **First Weight:** Simulate truck on scale → generate وزن أول (dummy data)
   - **Allow:** Confirm or retry first weight
   - **Unload:** Remove UCO from vehicle (simulated)
   - **Second Weight:** Simulate truck on scale → generate وزن ثاني (dummy data)
   - **Allow:** Confirm or retry second weight
   - **Calculate:** Net quantity = (وزن أول - وزن ثاني)
3. **Confirm:** "تأكيد استلام من المندوب"
4. **Inventory Update:** `collectorUCO` → `outsideTankUCO`
5. **Log Entry:** "تم استلام من المندوب - في انتظار نقل للخزان"
6. **Status:** Module 1 complete, progress 50%

**Module 2: استلامة خزان**
1. **Tank Selection:** Auto-select "Receiving Tank 2"
2. **Tank Transfer Process:**
   - Start tank weighing: Generate وزنة أولى (dummy data)
   - Transfer UCO from outside tank area to tank
   - End tank weighing: Generate وزنة ثانية (dummy data)
   - Calculate net: (وزنة ثانية - وزنة أولى)
3. **Confirm:** "تأكيد استلام في الخزان"
4. **Inventory Update:** `outsideTankUCO` → `insideTankUCO`
5. **Log Entry:** "تم استلام في الخزان"
6. **Status:** Process complete, progress 100%

---

### **B2B Workflows**

#### **B2B + T1 Warehouse** (Staged Transfer with Remainder Processing)

**Module 1: استلامة مندوب**
1. **Display:** Show collected quantity from dispatch
2. **Vehicle Weighing Process:**
   - **First Weight:** Simulate truck on scale → generate وزن أول (dummy data)
   - **Confirm/Retry:** Allow user to confirm or retry first weight
   - **Second Weight:** Simulate truck on scale → generate وزن ثاني (dummy data)
   - **Confirm/Retry:** Allow user to confirm or retry second weight
   - **Calculate Total:** `total_from_collector = (وزن أول - وزن ثاني)`
3. **Confirm:** "تأكيد استلام من المندوب"
4. **Inventory Update:** `collectorUCO` → `outsideTankUCO`
5. **Log Entry:** "تم استلام من المندوب - في انتظار نقل للخزان"
6. **Status:** Module 1 complete, ready for tank processing

**Module 2: استلامة خزان (Remainder Loop)**
1. **Tank Selection:** Auto-select "Receiving Tank 2"
2. **Tank Transfer Cycle:**
   - Start tank weighing: Generate وزنة أولى للخزان (dummy data)
   - Transfer available UCO from outside tank area to tank
   - End tank weighing: Generate وزنة ثانية للخزان (dummy data)
   - Calculate cycle received: `cycle_received = (وزنة ثانية - وزنة أولى)`
3. **Inventory Update:** `outsideTankUCO` → `insideTankUCO`
4. **Remainder Check:**
   ```
   remaining_outside = outsideTankUCO (current value)
   if remaining_outside > 0:
       → Show "معالجة الكمية المتبقية" button
       → Loop back to step 2
   else:
       → Process complete
   ```
5. **Final Confirm:** "تأكيد اكتمال استلام الخزان"
6. **Log Entry:** "تم استلام جميع الكميات في الخزان"
7. **Status:** Process complete, progress 100%

---

## Trip Status Management

### **Stage Status Tracking**
Each trip maintains status for both modules:
- **لم تبدأ** (Not Started)
- **بدأت** (Started)  
- **انتهت** (Completed)

### **Receiving Status Tracking**
Overall trip receiving status:
- **لم يتم استلامها** (Not received)
- **في انتظار استلامة الخزان** (Waiting for tank receiving) - B2B only
- **استلامة خزان جزئية** (Partial tank receiving) - B2B only
- **تم استلام الخزان** (Tank receiving completed)

### **Progress Bar Logic**

| Channel | Warehouse | Module 1 Complete | Module 2 Complete | B2B Remainder | Final |
|---------|-----------|-------------------|-------------------|---------------|-------|
| **B2C + T3** | 100% | N/A | N/A | 100% |
| **B2C + T1** | 50% | 100% | N/A | 100% |
| **B2X + T1** | 50% | 100% | N/A | 100% |
| **B2B + T1** | 50% | 75% per cycle | Until remainder = 0 | 100% |

---

## Summary Widget Display

### **Trip Summary by Workflow Type**

#### **B2C + T3:**
```
Trip Summary
├── Expected: XXX kg
├── في المخزن: XXX kg (received from collector)
└── مع المندوب: 0 kg (when complete)
```

#### **B2C + T1:**
```
Trip Summary
├── Expected: XXX kg
├── داخل الخزانات: XXX kg (after tank transfer)
├── خارج الخزانات: 0 kg (when complete)
└── مع المندوب: 0 kg (when complete)
```

#### **B2X + T1:**
```
Trip Summary
├── Expected: XXX kg
├── داخل الخزانات: XXX kg (after tank transfer)
├── خارج الخزانات: 0 kg (when complete)
└── مع المندوب: 0 kg (when complete)
```

#### **B2B + T1:**
```
Trip Summary
├── Expected: XXX kg
├── داخل الخزانات: XXX kg (completed tank transfers)
├── خارج الخزانات: XX kg (remainder if any)
└── مع المندوب: 0 kg (after vehicle weighing)
```

---

## Data Models & Storage

### **Enhanced Trip Entity**
```typescript
interface UCOTrip {
  // Basic trip info
  id: string;
  channel: 'B2C' | 'B2X' | 'B2B';
  warehouseType: 'T1' | 'T3';
  expectedQuantityKg: number;
  
  // Overall trip status
  tripStatus: 'لم تبدأ' | 'بدأت' | 'انتهت';
  receivingStatus: 'لم يتم استلامها' | 'في انتظار استلامة الخزان' | 'استلامة خزان جزئية' | 'تم استلام الخزان';
  
  // Module status tracking
  moduleStatus: {
    collectorReceiving: 'لم تبدأ' | 'بدأت' | 'انتهت';
    tankReceiving: 'لم تبدأ' | 'بدأت' | 'انتهت' | 'غير مطلوب';
  };
  
  // Module 1 data (استلامة مندوب)
  collectorReceiving: {
    auditMethod: 'manual' | 'vehicle_weighing';
    auditedQuantityKg?: number;
    vehicleWeights?: {
      firstWeightId: string;
      secondWeightId: string;
      netWeightKg: number;
    };
    completedAt?: Date;
    operator?: string;
  };
  
  // Module 2 data (استلامة خزان)
  tankReceiving: {
    transferType: 'staged' | 'not_applicable'; // T1 = staged, T3 = not_applicable
    selectedTankId?: string;
    receivingRecords: TankReceivingRecord[];
    totalReceivedKg: number;
    completedAt?: Date;
  };
  
  // Workflow-specific inventory tracking
  inventoryState: {
    withCollectorKg: number;
    // T3 warehouse (B2C only)
    warehouseKg?: number;
    // T1 warehouses (all channels)
    outsideTanksKg?: number;   // After collector receiving
    insideTanksKg?: number;    // After tank transfer
  };
  
  // B2B remainder tracking
  remainderKg: number;
  
  // Comprehensive logging
  logs: TripLogEntry[];
  
  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

### **Workflow-Specific Inventory Buckets**
```typescript
// Basic inventory for all workflows
interface CollectorInventory {
  collectorId: string;
  ucoKg: number;
  lastUpdated: Date;
}

interface WarehouseInventory {
  warehouseId: string;
  ucoKg: number; // B2C T3 only - no tanks available
  lastUpdated: Date;
}

// T1 warehouse inventory (all channels)
interface OutsideTankInventory {
  warehouseId: string;
  ucoKg: number; // After collector receiving, before tank transfer
  lastUpdated: Date;
}

interface TankInventory {
  tankId: string;
  ucoKg: number; // After tank transfer complete
  capacity: number;
  lastUpdated: Date;
}
```

### **Enhanced Custody Transfer Record**
```typescript
interface CustodyTransfer {
  id: string;
  tripId: string;
  transferType: 'direct' | 'staged'; // T3 = direct, T1 = staged
  from: 'collector' | 'outside_tank' | 'warehouse';
  to: 'warehouse' | 'outside_tank' | 'inside_tank';
  tankId?: string; // If applicable
  qtyKg: number;
  timestamp: Date;
  operator: string;
}
```

---

## Comprehensive Logging System

### **Workflow-Specific Log Entries**

#### **B2C + T3 Logs:**
- `collector_receiving_started`: "بدء استلام من المندوب"
- `manual_audit_entered`: "تم إدخال الكمية المراجعة: X كجم"
- `warehouse_receiving_confirmed`: "تم تأكيد استلام في المخزن"
- `inventory_collector_to_warehouse`: "نقل المخزون: من المندوب إلى المخزن"

#### **B2C + T1 / B2X + T1 Logs (Staged Transfer):**
- `collector_receiving_started`: "بدء استلام من المندوب"
- `manual_audit_entered` / `vehicle_weighing_completed`: "تم استلام الكمية من المندوب"
- `vehicle_weights_generated`: "تم توليد أوزان السيارة - أول: X كجم، ثاني: Y كجم" (B2X only)
- `collector_to_outside_confirmed`: "تم تأكيد استلام من المندوب - في انتظار نقل الخزان"
- `inventory_collector_to_outside`: "نقل المخزون: من المندوب إلى خارج الخزانات"
- `tank_transfer_started`: "بدء نقل إلى الخزان"
- `tank_weights_generated`: "تم توليد أوزان الخزان - بداية: X كجم، نهاية: Y كجم"
- `tank_transfer_confirmed`: "تم تأكيد النقل إلى الخزان"
- `inventory_outside_to_inside`: "نقل المخزون: من خارج الخزانات إلى داخل الخزانات"

#### **B2B + T1 Logs (Staged Transfer):**
- `collector_receiving_started`: "بدء استلام من المندوب"
- `vehicle_first_weight_generated`: "تم توليد الوزن الأول للسيارة: X كجم"
- `vehicle_second_weight_generated`: "تم توليد الوزن الثاني للسيارة: X كجم"
- `vehicle_net_calculated`: "إجمالي المستلم من المندوب: X كجم"
- `collector_to_outside_confirmed`: "تم تأكيد استلام من المندوب - في انتظار نقل الخزان"
- `inventory_collector_to_outside`: "نقل المخزون: من المندوب إلى خارج الخزانات"
- `tank_cycle_started`: "بدء دورة استلام الخزان رقم: X"
- `tank_weights_generated`: "تم توليد أوزان الخزان - بداية: X كجم، نهاية: Y كجم"
- `tank_cycle_completed`: "تم استلام X كجم في الخزان - الدورة X"
- `inventory_outside_to_inside`: "نقل المخزون: من خارج الخزانات إلى داخل الخزانات"
- `remainder_calculated`: "كمية متبقية: X كجم"
- `all_cycles_completed`: "تم استلام جميع الكميات في الخزان"

---

## User Interface Requirements

### **Single UCO Card: "زيت هالك"**

#### **Workflow-Specific Card Displays**

#### **B2C + T3 (Single Step):**
```
┌─────────────────────────────────────┐
│ زيت هالك                            │
├─────────────────────────────────────┤
│ Expected: XXX kg                    │
│ في المخزن: 0 kg                    │
│                                     │
│ Steps:                              │
│ ● استلام في المخزن ← [Current]      │
│                                     │
│ [بدء مراجعة الكمية]                 │
└─────────────────────────────────────┘
```

#### **B2C/B2X + T1 (Two-Step Process):**
```
┌─────────────────────────────────────┐
│ زيت هالك                            │
├─────────────────────────────────────┤
│ Expected: XXX kg                    │
│ داخل الخزانات: 0 kg                │
│ خارج الخزانات: 0 kg                │
│                                     │
│ Steps:                              │
│ ● استلامة مندوب ← [Current]         │
│ ○ استلامة خزان                     │
│                                     │
│ [بدء مراجعة الكمية / بدء وزن السيارة] │
└─────────────────────────────────────┘
```

#### **B2B + T1 (Staged Process):**
```
┌─────────────────────────────────────┐
│ زيت هالك                            │
├─────────────────────────────────────┤
│ Expected: 1000 kg                   │
│ داخل الخزانات: 600 kg               │
│ خارج الخزانات: 400 kg               │
│                                     │
│ Steps:                              │
│ ✓ استلام من المندوب                 │
│ ● معالجة المتبقي ← [Current]        │
│                                     │
│ [معالجة الكمية المتبقية]            │
└─────────────────────────────────────┘
```

#### **Process Complete Examples:**

**B2C + T3 Complete:**
```
┌─────────────────────────────────────┐
│ زيت هالك                            │
├─────────────────────────────────────┤
│ Expected: 500 kg                    │
│ في المخزن: 480 kg                  │
│                                     │
│ Steps:                              │
│ ✓ استلام في المخزن                 │
│                                     │
│ مكتملة ✓                            │
└─────────────────────────────────────┘
```

**B2C/B2X + T1 Complete:**
```
┌─────────────────────────────────────┐
│ زيت هالك                            │
├─────────────────────────────────────┤
│ Expected: 500 kg                    │
│ داخل الخزانات: 480 kg               │
│ خارج الخزانات: 0 kg                │
│                                     │
│ Steps:                              │
│ ✓ استلامة مندوب                     │
│ ✓ استلامة خزان                     │
│                                     │
│ مكتملة ✓                            │
└─────────────────────────────────────┘
```

**B2B + T1 Complete:**
```
┌─────────────────────────────────────┐
│ زيت هالك                            │
├─────────────────────────────────────┤
│ Expected: 1000 kg                   │
│ داخل الخزانات: 1000 kg              │
│ خارج الخزانات: 0 kg                │
│                                     │
│ Steps:                              │
│ ✓ استلام من المندوب                 │
│ ✓ استلام في الخزان                 │
│                                     │
│ مكتملة ✓                            │
└─────────────────────────────────────┘
```

#### **Dynamic CTA Button Logic**
| Workflow | Current Step | CTA Button Text |
|----------|--------------|-----------------|
| **B2C + T3** | Start | بدء مراجعة الكمية |
| **B2C + T1** | Collector | بدء مراجعة الكمية |
| **B2C + T1** | Tank | بدء استلام في الخزان |
| **B2X + T1** | Collector | بدء وزن السيارة |
| **B2X + T1** | Tank | بدء استلام في الخزان |
| **B2B** | Collector | بدء وزن السيارة |
| **B2B** | Tank/Remainder | معالجة الكمية المتبقية |
| **All** | Complete | مكتملة ✓ |

---

## Error Handling & Offline Support

### **Dummy Data Simulation**
- **Weight Generation:** Random realistic weights within expected ranges
- **Simulation Controls:** Allow manual adjustment of generated weights for testing
- **Retry mechanism:** Allow re-generation of weight readings

### **Development Mode Features**
- **Mock Weight Readings:** Consistent dummy data for testing flows
- **Scenario Testing:** Pre-defined weight scenarios (normal, high, low)
- **Manual Override:** Developer can input specific weights for testing

### **Offline Functionality**
- **Browser offline:** Banner **"أنت الآن بدون إنترنت، سيتم الحفظ عند الاتصال"**
- **Action queuing:** Store actions locally until connection restored
- **Sync on reconnect:** Automatically sync all queued actions

---

## Implementation Phases

### **Phase 1: Foundation + B2C + T1 (Week 1-2)**
- Core card architecture and components
- Trip detection and routing logic
- B2C manual audit interface
- Basic tank weighing with dummy data
- Two-step status management
- Inventory state tracking

### **Phase 2: B2X + T1 Integration (Week 3)**
- Vehicle weighing simulation interface
- Channel-specific tank assignment
- Enhanced CTA button logic
- Weight generation and validation
- B2X workflow testing

### **Phase 3: B2B + T1 Complex Logic (Week 4-5)**
- Remainder calculation and loop logic
- Multi-cycle tank receiving
- B2B-specific progress tracking
- Cycle counter and remainder display
- Complex workflow state management

### **Phase 4: UI Polish & Enhancement (Week 6)**
- Loading states and animations
- Error handling and retry mechanisms
- Accessibility features
- Mobile responsiveness
- User experience optimization

### **Phase 5: Integration & Testing (Week 7-8)**
- Navigation integration (Trips ↔ Trip Details)
- Cross-workflow testing
- Edge case handling
- Performance optimization
- End-to-end testing with dummy data scenarios

---

## Conclusion

This updated PRD provides a comprehensive and logically structured approach to UCO receiving within the **الرحلات والطلبات** tab of the Send and Receive system. The key insights include:

**Navigation Structure:** Clear separation between trip selection (Trips section) and trip management (Trip Details section), with UCO receiving as the primary action within trip details.

**Workflow Consistency:** All T1 warehouses follow the same two-step staged approach (Collector → Outside Tank → Inside Tank), differing only in audit methods and remainder processing complexity. T3 warehouses remain simple single-step operations due to lack of tank infrastructure.

**User Experience:** The single "زيت هالك" card provides an intuitive interface that adapts to each workflow while maintaining consistency in interaction patterns.

**Development Approach:** Dummy data simulation enables rapid development and testing without hardware dependencies. Weight generation algorithms provide realistic testing scenarios while allowing for controlled test cases.

**Technical Architecture:** Modular design ensures that the audit methods (manual vs vehicle weighing) and tank processing logic (simple vs remainder loop) can be independently developed and maintained while sharing common infrastructure components.

**Implementation Strategy:** Progressive phase-based development allows for incremental testing and validation of each T1 workflow case, building complexity gradually from B2C through B2X to B2B.

The system maintains full traceability and audit capabilities through comprehensive logging and inventory state management across all workflow variations, while enabling rapid development through simulated weight readings and controlled test scenarios.