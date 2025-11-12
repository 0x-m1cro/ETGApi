import { useState } from 'react';
import { Search, Plus, Minus, MapPin, Building2 } from 'lucide-react';
import { formatDate, getMinCheckInDate, addDaysToDate } from '../../utils/date';
import type { Guest } from '../../types';

interface SearchFormProps {
  onSearch: (data: {
    searchType: 'region' | 'hotels' | 'geo';
    checkin: string;
    checkout: string;
    guests: Guest[];
    residency: string;
    regionId?: string;
    hotelIds?: string[];
    lat?: number;
    lon?: number;
    radius?: number;
  }) => void;
  isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const tomorrow = getMinCheckInDate();
  const dayAfter = addDaysToDate(tomorrow, 1);

  const [searchType, setSearchType] = useState<'region' | 'hotels' | 'geo'>('region');
  const [checkin, setCheckin] = useState(formatDate(tomorrow));
  const [checkout, setCheckout] = useState(formatDate(dayAfter));
  const [regionId, setRegionId] = useState('');
  const [hotelIds, setHotelIds] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState('5');
  const [residency, setResidency] = useState('US');
  const [rooms, setRooms] = useState<Guest[]>([{ adults: 2, children: [] }]);

  const addRoom = () => {
    if (rooms.length < 9) {
      setRooms([...rooms, { adults: 2, children: [] }]);
    }
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const updateRoomAdults = (index: number, delta: number) => {
    const newRooms = [...rooms];
    const newAdults = newRooms[index].adults + delta;
    if (newAdults >= 1 && newAdults <= 6) {
      newRooms[index].adults = newAdults;
      setRooms(newRooms);
    }
  };

  const addChild = (roomIndex: number) => {
    const newRooms = [...rooms];
    if (newRooms[roomIndex].children.length < 4) {
      newRooms[roomIndex].children.push(10); // Default child age
      setRooms(newRooms);
    }
  };

  const removeChild = (roomIndex: number, childIndex: number) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].children = newRooms[roomIndex].children.filter((_, i) => i !== childIndex);
    setRooms(newRooms);
  };

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].children[childIndex] = age;
    setRooms(newRooms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      searchType,
      checkin,
      checkout,
      guests: rooms,
      residency,
    };

    if (searchType === 'region') {
      onSearch({ ...baseData, regionId });
    } else if (searchType === 'hotels') {
      onSearch({ 
        ...baseData, 
        hotelIds: hotelIds.split(',').map(id => id.trim()).filter(Boolean) 
      });
    } else {
      onSearch({ 
        ...baseData, 
        lat: parseFloat(lat), 
        lon: parseFloat(lon), 
        radius: parseFloat(radius) 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Search Hotels</h2>

      {/* Search Type Selection */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSearchType('region')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchType === 'region'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <MapPin className="w-5 h-5 inline mr-2" />
          By Region
        </button>
        <button
          type="button"
          onClick={() => setSearchType('hotels')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchType === 'hotels'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Building2 className="w-5 h-5 inline mr-2" />
          By Hotel IDs
        </button>
        <button
          type="button"
          onClick={() => setSearchType('geo')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchType === 'geo'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <MapPin className="w-5 h-5 inline mr-2" />
          By Location
        </button>
      </div>

      {/* Search Type Specific Fields */}
      {searchType === 'region' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region ID
          </label>
          <input
            type="text"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            required
            className="input-field"
            placeholder="e.g., 2114"
          />
        </div>
      )}

      {searchType === 'hotels' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hotel IDs (comma separated, max 300)
          </label>
          <input
            type="text"
            value={hotelIds}
            onChange={(e) => setHotelIds(e.target.value)}
            required
            className="input-field"
            placeholder="e.g., test_hotel, test_hotel_do_not_book"
          />
        </div>
      )}

      {searchType === 'geo' && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
              className="input-field"
              placeholder="e.g., 40.7128"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              required
              className="input-field"
              placeholder="e.g., -74.0060"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (km)
            </label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              required
              className="input-field"
              placeholder="5"
            />
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            min={formatDate(tomorrow)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            min={checkin}
            required
            className="input-field"
          />
        </div>
      </div>

      {/* Residency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Residency (Passport Country)
        </label>
        <input
          type="text"
          value={residency}
          onChange={(e) => setResidency(e.target.value.toUpperCase())}
          required
          maxLength={2}
          className="input-field"
          placeholder="US"
        />
      </div>

      {/* Rooms and Guests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Rooms & Guests
          </label>
          {rooms.length < 9 && (
            <button
              type="button"
              onClick={addRoom}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          )}
        </div>

        {rooms.map((room, roomIndex) => (
          <div key={roomIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Room {roomIndex + 1}</h4>
              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(roomIndex)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Adults</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateRoomAdults(roomIndex, -1)}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  disabled={room.adults <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{room.adults}</span>
                <button
                  type="button"
                  onClick={() => updateRoomAdults(roomIndex, 1)}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  disabled={room.adults >= 6}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Children</span>
                {room.children.length < 4 && (
                  <button
                    type="button"
                    onClick={() => addChild(roomIndex)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Add Child
                  </button>
                )}
              </div>
              {room.children.map((age, childIndex) => (
                <div key={childIndex} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Age:</span>
                  <select
                    value={age}
                    onChange={(e) => updateChildAge(roomIndex, childIndex, parseInt(e.target.value))}
                    className="flex-1 input-field py-1"
                  >
                    {Array.from({ length: 18 }, (_, i) => i).map((childAge) => (
                      <option key={childAge} value={childAge}>
                        {childAge} year{childAge !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeChild(roomIndex, childIndex)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        {isLoading ? 'Searching...' : 'Search Hotels'}
      </button>
    </form>
  );
};
