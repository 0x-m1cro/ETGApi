import { useState } from 'react';
import { ArrowLeft, Calendar, User, Mail, Phone, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDisplayDate } from '../../utils/date';
import type { Booking } from '../../types';

interface BookingDetailsProps {
  booking: Booking;
  onBack: () => void;
  onCancel: (orderId: string) => void;
  isCancelling: boolean;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  onBack,
  onCancel,
  isCancelling,
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  const canCancel = booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'ok';

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    onCancel(booking.partner_order_id);
    setShowCancelConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Bookings
      </button>

      {/* Booking Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Details
            </h1>
            <p className="text-gray-600">
              Reference: <span className="font-mono font-medium">{booking.partner_order_id}</span>
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        {/* Confirmation Number */}
        {booking.etg_order_id && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-900">
              Confirmation Number: <span className="font-mono font-bold">{booking.etg_order_id}</span>
            </p>
          </div>
        )}

        {/* Booking Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Hotel Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Hotel ID:</span>
                <p className="font-medium text-gray-900">{booking.hotel_id}</p>
              </div>
            </div>
          </div>

          {/* Stay Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Stay Dates</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-900">{formatDisplayDate(booking.checkin_date)}</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-medium text-gray-900">{formatDisplayDate(booking.checkout_date)}</p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{booking.guest_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{booking.guest_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{booking.guest_phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(booking.total_amount, booking.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Timeline */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Timeline</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDisplayDate(booking.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium text-gray-900">{formatDisplayDate(booking.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Section */}
      {canCancel && !showCancelConfirm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancel Booking</h3>
          <p className="text-gray-600 mb-4">
            Need to cancel this booking? Please note that cancellation fees may apply based on the hotel's policy.
          </p>
          <button
            onClick={handleCancelClick}
            className="btn-danger"
            disabled={isCancelling}
          >
            Cancel This Booking
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">Confirm Cancellation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone and cancellation fees may apply.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary flex-1"
                disabled={isCancelling}
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="btn-danger flex-1"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
