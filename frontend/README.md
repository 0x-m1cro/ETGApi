# ETG API - Frontend

Enterprise-grade React TypeScript application for hotel search and booking management using the RateHawk ETG API.

## ✨ Features

- **Hotel Search**: Search by region, hotel IDs, or geographic location
- **Advanced Filters**: Multi-room support, guest management (adults + children), date range selection
- **Hotel Details**: Comprehensive hotel information with multiple rate options
- **Rate Verification**: Mandatory prebook step to verify availability and pricing
- **Booking Management**: Create, view, and cancel bookings
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Real-time Updates**: Live status updates with toast notifications
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** (React Query) - Server state management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library
- **date-fns** - Date utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Backend API running on http://localhost:3000

### Installation

\`\`\`bash
cd frontend
npm install
\`\`\`

### Configuration

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and configure the backend API URL:

\`\`\`env
VITE_API_BASE_URL=http://localhost:3000/api/v1
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

The application will be available at http://localhost:5173

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist\` directory.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## 📁 Project Structure

\`\`\`
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance
│   │   ├── search.ts     # Search API calls
│   │   └── booking.ts    # Booking API calls
│   ├── components/       # React components
│   │   ├── common/       # Reusable components
│   │   ├── search/       # Search-related components
│   │   └── booking/      # Booking-related components
│   ├── pages/            # Page components
│   │   ├── SearchPage.tsx
│   │   ├── BookingPage.tsx
│   │   └── BookingsPage.tsx
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── public/               # Static assets
└── package.json
\`\`\`

## 🔑 Key Features Explained

### Search Workflow

1. **Search Form**: Users can search hotels by:
   - Region ID
   - Specific hotel IDs (up to 300)
   - Geographic coordinates (lat/lon + radius)

2. **Guest Configuration**:
   - Up to 9 rooms per search
   - 1-6 adults per room
   - Up to 4 children per room (ages 0-17)

3. **Date Selection**:
   - Check-in date: Tomorrow to 730 days in advance
   - Maximum stay: 30 nights

### Hotel Details & Rate Selection

- View all available rates for a selected hotel
- Each rate shows:
  - Room name and meal plan
  - Total price
  - Cancellation policy
  - Tax information

### Prebook (Rate Verification)

- Mandatory step before booking
- Verifies rate availability
- Handles price changes gracefully
- Configurable price increase tolerance (0-100%)

### Booking Process

1. **Guest Information**: Contact details and guest names
2. **Payment Method**: Deposit or pay at hotel
3. **Confirmation**: Real-time booking status
4. **Order Tracking**: Reference numbers for future use

### Booking Management

- View all bookings
- Detailed booking information
- Cancel confirmed bookings
- Track booking status

## 🎨 Design System

### Color Palette

- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

### Component Classes

Custom TailwindCSS classes available:

- \`.btn-primary\` - Primary action button
- \`.btn-secondary\` - Secondary action button
- \`.btn-danger\` - Destructive action button
- \`.input-field\` - Form input fields
- \`.card\` - Content card container

## 🔄 API Integration

The frontend communicates with the backend API at \`/api/v1\`:

- \`POST /search/region\` - Search hotels by region
- \`POST /search/hotels\` - Search specific hotels
- \`POST /search/geo\` - Search by location
- \`POST /search/hotelpage\` - Get hotel details
- \`POST /search/prebook\` - Verify rate
- \`POST /booking\` - Create booking
- \`GET /booking/:orderId\` - Get booking details
- \`POST /booking/:orderId/cancel\` - Cancel booking

## 🐛 Troubleshooting

### Backend Connection Issues

If you see connection errors:
1. Ensure backend is running on http://localhost:3000
2. Check CORS configuration in backend
3. Verify API_BASE_URL in \`.env\`

### Build Issues

\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
\`\`\`

## 📝 Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Lint code

## 📄 License

ISC
