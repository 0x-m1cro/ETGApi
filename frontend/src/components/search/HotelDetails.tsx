import { useState } from 'react';
import { MapPin, ArrowLeft, Check, X } from 'lucide-react';
import { formatCurrency, getStarRating } from '../../utils/format';
import { formatDisplayDate } from '../../utils/date';
import type { Hotel, HotelRate } from '../../types';

interface HotelDetailsProps {
  hotel: Hotel;
  checkin: string;
  checkout: string;
  onBack: () => void;
  onSelectRate: (rate: HotelRate) => void;
}

export const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotel,
  checkin,
  checkout,
  onBack,
  onSelectRate,
}) => {
  const [selectedRateHash, setSelectedRateHash] = useState<string | null>(null);

  const handleSelectRate = (rate: HotelRate) => {
    setSelectedRateHash(rate.book_hash);
    onSelectRate(rate);
  };

  const formatCancellationPolicy = (rate: HotelRate) => {
    if (!rate.cancellation_penalties) {
      return 'No cancellation information available';
    }

    const { policies, free_cancellation_before } = rate.cancellation_penalties;

    if (free_cancellation_before) {
      return `Free cancellation until ${formatDisplayDate(free_cancellation_before)}`;
    }

    if (policies && policies.length > 0) {
      return 'Cancellation fees apply';
    }

    return 'Non-refundable';
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Results
      </button>

      {/* Hotel Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
            
            {hotel.star_rating && (
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                <span className="text-lg">{getStarRating(hotel.star_rating)}</span>
              </div>
            )}

            {hotel.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{hotel.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Images Gallery */}
        {hotel.images && hotel.images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {hotel.images.slice(0, 4).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${hotel.name} - ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}

        {/* Stay Info */}
        <div className="mt-6 flex gap-8 text-sm">
          <div>
            <span className="text-gray-600">Check-in:</span>
            <span className="ml-2 font-medium">{formatDisplayDate(checkin)}</span>
          </div>
          <div>
            <span className="text-gray-600">Check-out:</span>
            <span className="ml-2 font-medium">{formatDisplayDate(checkout)}</span>
          </div>
        </div>
      </div>

      {/* Available Rates */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Available Rates ({hotel.rates.length})
        </h2>

        {hotel.rates.map((rate) => (
          <div
            key={rate.book_hash}
            className={`card p-6 transition-all ${
              selectedRateHash === rate.book_hash
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {rate.room_name}
                </h3>

                {/* Meal Type */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {rate.meal || 'No meal'}
                  </span>
                </div>

                {/* Cancellation Policy */}
                <div className="flex items-center gap-2 mb-3">
                  {rate.cancellation_penalties?.free_cancellation_before ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      <span>{formatCancellationPolicy(rate)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <X className="w-4 h-4" />
                      <span>{formatCancellationPolicy(rate)}</span>
                    </div>
                  )}
                </div>

                {/* Taxes Info */}
                {rate.included_by_supplier === false && (
                  <div className="text-sm text-amber-600">
                    ⚠ Additional taxes may apply at the hotel
                  </div>
                )}
              </div>

              {/* Price and Action */}
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(rate.amount, rate.currency)}
                </div>
                <div className="text-sm text-gray-600 mb-4">Total for stay</div>
                <button
                  onClick={() => handleSelectRate(rate)}
                  className="btn-primary"
                >
                  Select Room
                </button>
              </div>
            </div>

            {/* Cancellation Details */}
            {rate.cancellation_penalties?.policies && rate.cancellation_penalties.policies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Cancellation Policy Details:</h4>
                <div className="space-y-1">
                  {rate.cancellation_penalties.policies.map((policy, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {policy.penalty_ends_on ? (
                        <span>
                          From {formatDisplayDate(policy.penalty_starts_on)} to{' '}
                          {formatDisplayDate(policy.penalty_ends_on)}:{' '}
                          <span className="font-medium">
                            {formatCurrency(policy.charge, rate.currency)} penalty
                          </span>
                        </span>
                      ) : (
                        <span>
                          After {formatDisplayDate(policy.penalty_starts_on)}:{' '}
                          <span className="font-medium">
                            {formatCurrency(policy.charge, rate.currency)} penalty
                          </span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
