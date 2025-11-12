import { HotelCard } from './HotelCard';
import type { Hotel } from '../../types';

interface HotelListProps {
  hotels: Hotel[];
  onSelectHotel: (hotelId: string) => void;
}

export const HotelList: React.FC<HotelListProps> = ({ hotels, onSelectHotel }) => {
  if (hotels.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-600 text-lg">No hotels found matching your search criteria.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your search parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {hotels.length} Hotel{hotels.length !== 1 ? 's' : ''} Found
      </h2>
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} onSelect={onSelectHotel} />
      ))}
    </div>
  );
};
