import { CheckCircle, Download, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BookingResponse } from '../../types';

interface BookingSuccessProps {
  booking: BookingResponse;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ booking }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        {/* Success Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your booking has been successfully confirmed. You will receive a confirmation email shortly.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 p-6 rounded-lg text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking Reference:</span>
            <span className="font-mono font-bold text-gray-900">
              {booking.data.partner_order_id}
            </span>
          </div>
          {booking.data.etg_order_id && (
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmation Number:</span>
              <span className="font-mono font-bold text-gray-900">
                {booking.data.etg_order_id}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {booking.data.booking_status}
            </span>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>A confirmation email has been sent to your registered email address</li>
            <li>Please check your spam folder if you don't see the email within 10 minutes</li>
            <li>Keep your booking reference number for future correspondence</li>
            <li>You can view or manage this booking from your bookings page</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Link to="/bookings" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            View My Bookings
          </Link>
          <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
