# Warehouse Management System

A modern warehouse management system built with React and Vite, featuring RTL (Right-to-Left) Arabic support.

## Project Structure

The application follows a modular architecture for better maintainability and scalability:

```
src/
├── components/          # Reusable UI components
│   ├── NavigationBar.jsx
│   ├── NavigationBar.css
│   ├── Sidebar.jsx
│   ├── TopMenuBar.jsx
│   ├── TripCard.jsx
│   ├── TripDetailsPanel.jsx
│   └── index.js         # Component exports
├── pages/               # Page-level components
│   ├── HomePage.jsx
│   ├── SendReceivePage.jsx
│   └── index.js         # Page exports
├── utils/               # Utility functions and data
│   ├── tripData.js
│   └── index.js         # Utility exports
├── assets/              # Static assets
├── App.jsx              # Main application component
├── App.css              # Global styles
├── index.css            # Base styles
└── main.jsx             # Application entry point
```

## Architecture Principles

### 1. **Modular Components**
- **Components folder**: Contains reusable UI components that can be used across multiple pages
- **Pages folder**: Contains page-level components that represent entire screens/routes
- **Utils folder**: Contains utility functions, data generators, and constants

### 2. **RTL Support**
- All components follow RTL design principles using CSS logical properties
- Arabic font family (Tajawal) is used throughout the application
- Proper text direction and layout flow for Arabic content

### 3. **Component Separation**
- **TripCard**: Reusable card component for displaying trip information
- **TripDetailsPanel**: Side panel component for showing detailed trip information
- **HomePage**: Landing page with welcome content
- **SendReceivePage**: Main page for managing trip send/receive operations

## Features

### Phase 1: Send and Receive Operations
- ✅ Trip cards grid layout with 12 sample trips
- ✅ Trip details side panel
- ✅ RTL Arabic interface
- ✅ Responsive design
- ✅ Modular component architecture

### Future Phases
- 🔄 Inventory Control
- 🔄 Quality Management
- 🔄 Container Operations
- 🔄 Worker Performance
- 🔄 Settings

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd warehose-updated

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Component Usage

### Using TripCard Component
```jsx
import { TripCard } from '../components';

<TripCard
  trip={tripData}
  isSelected={selectedTrip?.id === trip.id}
  onClick={() => handleTripClick(trip)}
/>
```

### Using TripDetailsPanel Component
```jsx
import { TripDetailsPanel } from '../components';

<TripDetailsPanel
  trip={selectedTrip}
  onClose={handleCloseTripDetails}
/>
```

### Using Trip Data Utilities
```jsx
import { generateDummyTrips, TRIP_STATUSES, TRIP_TYPES } from '../utils';

const trips = generateDummyTrips();
const completedStatus = TRIP_STATUSES.COMPLETED;
```

## RTL Implementation

The application follows comprehensive RTL guidelines:

- **CSS Logical Properties**: Using `margin-inline-start/end`, `padding-inline-start/end`, etc.
- **Text Alignment**: Using `text-align: start/end` instead of `left/right`
- **Positioning**: Using `inset-inline-start/end` for positioning
- **Arabic Typography**: Tajawal font family optimized for Arabic text
- **Layout Flow**: Natural RTL flow for navigation and content

## Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tabler Icons**: Comprehensive icon library
- **CSS Logical Properties**: RTL-aware styling
- **Modern JavaScript**: ES6+ features

## Contributing

1. Follow the modular architecture principles
2. Place reusable components in `src/components/`
3. Place page-level components in `src/pages/`
4. Place utility functions in `src/utils/`
5. Follow RTL design guidelines for all new components
6. Use CSS logical properties for spacing and positioning
7. Test with Arabic content to ensure proper RTL behavior

## License

This project is licensed under the MIT License.
