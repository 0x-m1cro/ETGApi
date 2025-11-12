import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDisplayDate } from '../../utils/date';
import type { HotelRate, GuestInfo, CreateBookingRequest } from '../../types';

interface BookingFormProps {
  rate: HotelRate;
  hotelId: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  guestCount: { adults: number; children: number[] }[];
  onSubmit: (bookingData: CreateBookingRequest) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  rate,
  hotelId,
  hotelName,
  checkin,
  checkout,
  guestCount,
  onSubmit,
  onBack,
  isLoading,
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [holderName, setHolderName] = useState('');
  const [holderSurname, setHolderSurname] = useState('');
  const [paymentType, setPaymentType] = useState('deposit');

  // Calculate total guests needed
  const totalAdults = guestCount.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = guestCount.reduce((sum, room) => sum + room.children.length, 0);

  // Initialize guest forms
  const [guests, setGuests] = useState<GuestInfo[]>(() => {
    const initialGuests: GuestInfo[] = [];
    guestCount.forEach((room) => {
      // Add adults
      for (let i = 0; i < room.adults; i++) {
        initialGuests.push({ name: '', surname: '', is_child: false });
      }
      // Add children
      room.children.forEach((age) => {
        initialGuests.push({ name: '', surname: '', is_child: true, age });
      });
    });
    return initialGuests;
  });

  const updateGuest = (index: number, field: keyof GuestInfo, value: string | number | boolean) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setGuests(newGuests);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bookingData: CreateBookingRequest = {
      book_hash: rate.book_hash,
      hotel_id: hotelId,
      checkin,
      checkout,
      total_amount: rate.amount,
      currency: rate.currency,
      user: { email, phone },
      holder: { name: holderName, surname: holderSurname },
      guests,
      payment_type: paymentType,
      language: 'en',
    };

    onSubmit(bookingData);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Booking Summary */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Hotel:</span>
            <span className="font-medium text-gray-900">{hotelName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Room:</span>
            <span className="font-medium text-gray-900">{rate.room_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Meal:</span>
            <span className="font-medium text-gray-900">{rate.meal || 'No meal'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium text-gray-900">{formatDisplayDate(checkin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium text-gray-900">{formatDisplayDate(checkout)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Guests:</span>
            <span className="font-medium text-gray-900">
              {totalAdults} Adult{totalAdults !== 1 ? 's' : ''}
              {totalChildren > 0 && `, ${totalChildren} Child${totalChildren !== 1 ? 'ren' : ''}`}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="text-lg font-medium text-gray-900">Total Price:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(rate.amount, rate.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Guest Information</h2>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input-field"
              placeholder="+1234567890"
            />
          </div>
        </div>

        {/* Booking Holder */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Booking Holder</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required
                className="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={holderSurname}
                onChange={(e) => setHolderSurname(e.target.value)}
                required
                className="input-field"
                placeholder="Doe"
              />
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Guest Details</h3>
          
          {guests.map((guest, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                <User className="w-4 h-4 inline mr-1" />
                Guest {index + 1}
                {guest.is_child && ` (Child, Age: ${guest.age})`}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(index, 'name', e.target.value)}
                    required
                    className="input-field"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={guest.surname}
                    onChange={(e) => updateGuest(index, 'surname', e.target.value)}
                    required
                    className="input-field"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="deposit"
                checked={paymentType === 'deposit'}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium text-gray-900">Deposit (B2B)</div>
                <div className="text-sm text-gray-600">Pay from your deposit account</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="hotel"
                checked={paymentType === 'hotel'}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium text-gray-900">Pay at Hotel</div>
                <div className="text-sm text-gray-600">Payment directly at the property</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-lg"
        >
          {isLoading ? 'Processing Booking...' : 'Confirm Booking'}
        </button>

        {isLoading && (
          <p className="text-sm text-gray-600 text-center">
            This may take up to 60 seconds. Please do not close this window.
          </p>
        )}
      </form>
    </div>
  );
};
