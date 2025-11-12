import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookingForm } from '../components/booking/BookingForm';
import { BookingSuccess } from '../components/booking/BookingSuccess';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { bookingAPI } from '../api/booking';
import type { CreateBookingRequest, BookingResponse } from '../types';

export const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  const { rate, hotel, checkin, checkout, guests } = location.state || {};

  // Redirect if no booking data
  if (!rate || !hotel || !checkin || !checkout || !guests) {
    navigate('/');
    return null;
  }

  const bookingMutation = useMutation({
    mutationFn: async (data: CreateBookingRequest) => {
      return bookingAPI.createBooking(data);
    },
    onSuccess: (response) => {
      setBookingResult(response);
      toast.success('Booking created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    },
  });

  const handleSubmit = (bookingData: CreateBookingRequest) => {
    bookingMutation.mutate(bookingData);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (bookingResult) {
    return <BookingSuccess booking={bookingResult} />;
  }

  if (bookingMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" text="Processing your booking..." />
        <p className="mt-4 text-gray-600 text-center max-w-md">
          This may take up to 60 seconds. Please do not close or refresh this page.
        </p>
      </div>
    );
  }

  return (
    <BookingForm
      rate={rate}
      hotelId={hotel.id}
      hotelName={hotel.name}
      checkin={checkin}
      checkout={checkout}
      guestCount={guests}
      onSubmit={handleSubmit}
      onBack={handleBack}
      isLoading={bookingMutation.isPending}
    />
  );
};
