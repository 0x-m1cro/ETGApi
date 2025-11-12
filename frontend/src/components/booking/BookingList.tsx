import { Calendar, DollarSign, MapPin, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDisplayDate } from '../../utils/date';
import type { Booking } from '../../types';

interface BookingListProps {
  bookings: Booking[];
  onViewDetails: (orderId: string) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ bookings, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'form_created':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-600 text-lg">No bookings found.</p>
        <p className="text-gray-500 text-sm mt-2">Start by searching for hotels and making a booking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Booking #{booking.partner_order_id.slice(-8)}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Hotel ID: {booking.hotel_id}
                </p>
              </div>
              <button
                onClick={() => onViewDetails(booking.partner_order_id)}
                className="btn-primary flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dates */}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDisplayDate(booking.checkin_date)}
                  </div>
                  <div className="text-xs">Check-in</div>
                </div>
                <span className="mx-2">→</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDisplayDate(booking.checkout_date)}
                  </div>
                  <div className="text-xs">Check-out</div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {booking.guest_name}
                  </div>
                  <div className="text-xs">{booking.guest_email}</div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-5 h-5" />
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(booking.total_amount, booking.currency)}
                  </div>
                  <div className="text-xs">Total Amount</div>
                </div>
              </div>
            </div>

            {/* ETG Order ID */}
            {booking.etg_order_id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Confirmation: <span className="font-mono font-medium text-gray-900">{booking.etg_order_id}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
