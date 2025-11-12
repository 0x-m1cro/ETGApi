import { MapPin } from 'lucide-react';
import { formatCurrency, getStarRating } from '../../utils/format';
import type { Hotel } from '../../types';

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (hotelId: string) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  const lowestRate = hotel.rates.length > 0 
    ? hotel.rates.reduce((min, rate) => rate.amount < min.amount ? rate : min)
    : null;

  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(hotel.id)}>
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 flex items-center justify-center">
          {hotel.images && hotel.images.length > 0 ? (
            <img 
              src={hotel.images[0]} 
              alt={hotel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" dy="105" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="text-gray-400 text-sm">No Image Available</div>
          )}
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
              
              {/* Star Rating */}
              {hotel.star_rating && (
                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                  <span className="text-sm">{getStarRating(hotel.star_rating)}</span>
                </div>
              )}

              {/* Address */}
              {hotel.address && (
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{hotel.address}</span>
                </div>
              )}

              {/* Available Rates Info */}
              <div className="text-sm text-gray-600">
                {hotel.rates.length} rate{hotel.rates.length !== 1 ? 's' : ''} available
              </div>
            </div>

            {/* Price */}
            {lowestRate && (
              <div className="text-right ml-4">
                <div className="text-sm text-gray-600 mb-1">From</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(lowestRate.amount, lowestRate.currency)}
                </div>
                <div className="text-sm text-gray-600">per stay</div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(hotel.id);
              }}
              className="btn-primary"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
