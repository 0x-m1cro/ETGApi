import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookingList } from '../components/booking/BookingList';
import { BookingDetails } from '../components/booking/BookingDetails';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { bookingAPI } from '../api/booking';
import type { Booking } from '../types';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll store bookings in localStorage
  // In a real app, you'd fetch from an API endpoint that lists all user's bookings
  useEffect(() => {
    const loadBookings = () => {
      try {
        setIsLoading(true);
        const stored = localStorage.getItem('bookings');
        if (stored) {
          setBookings(JSON.parse(stored));
        }
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const getBookingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await bookingAPI.getBooking(orderId);
      return response.data.booking;
    },
    onSuccess: (booking) => {
      setSelectedBooking(booking);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to load booking details');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return bookingAPI.cancelBooking(orderId);
    },
    onSuccess: (_, orderId) => {
      toast.success('Booking cancelled successfully');
      // Update local state
      setBookings(bookings.map(b => 
        b.partner_order_id === orderId 
          ? { ...b, status: 'cancelled' }
          : b
      ));
      if (selectedBooking?.partner_order_id === orderId) {
        setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
      }
      // Update localStorage
      const updated = bookings.map(b => 
        b.partner_order_id === orderId 
          ? { ...b, status: 'cancelled' }
          : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const handleViewDetails = (orderId: string) => {
    getBookingMutation.mutate(orderId);
  };

  const handleBack = () => {
    setSelectedBooking(null);
  };

  const handleCancel = (orderId: string) => {
    cancelBookingMutation.mutate(orderId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading bookings..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (selectedBooking) {
    return (
      <BookingDetails
        booking={selectedBooking}
        onBack={handleBack}
        onCancel={handleCancel}
        isCancelling={cancelBookingMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <span className="text-gray-600">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {getBookingMutation.isPending && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading booking details..." />
        </div>
      )}

      {!getBookingMutation.isPending && (
        <BookingList bookings={bookings} onViewDetails={handleViewDetails} />
      )}
    </div>
  );
};
