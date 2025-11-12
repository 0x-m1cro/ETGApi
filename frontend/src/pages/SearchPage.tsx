import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SearchForm } from '../components/search/SearchForm';
import { HotelList } from '../components/search/HotelList';
import { HotelDetails } from '../components/search/HotelDetails';
import { PrebookModal } from '../components/booking/PrebookModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { searchAPI } from '../api/search';
import type { Hotel, HotelRate, PrebookResponse, Guest } from '../types';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRate, setSelectedRate] = useState<HotelRate | null>(null);
  const [showPrebookModal, setShowPrebookModal] = useState(false);
  const [prebookResult, setPrebookResult] = useState<PrebookResponse | null>(null);
  const [searchParams, setSearchParams] = useState<{
    checkin: string;
    checkout: string;
    guests: Guest[];
    residency: string;
  } | null>(null);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.searchType === 'region') {
        return searchAPI.searchByRegion({
          region_id: data.regionId,
          checkin: data.checkin,
          checkout: data.checkout,
          guests: data.guests,
          residency: data.residency,
        });
      } else if (data.searchType === 'hotels') {
        return searchAPI.searchByHotels({
          ids: data.hotelIds,
          checkin: data.checkin,
          checkout: data.checkout,
          guests: data.guests,
          residency: data.residency,
        });
      } else {
        return searchAPI.searchByGeo({
          lat: data.lat,
          lon: data.lon,
          radius: data.radius,
          checkin: data.checkin,
          checkout: data.checkout,
          guests: data.guests,
          residency: data.residency,
        });
      }
    },
    onSuccess: (response, variables) => {
      setSearchResults(response.data.hotels);
      setSearchParams({
        checkin: variables.checkin,
        checkout: variables.checkout,
        guests: variables.guests,
        residency: variables.residency,
      });
      toast.success(`Found ${response.data.hotels.length} hotels`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Search failed. Please try again.');
    },
  });

  // Hotel details mutation
  const hotelpageMutation = useMutation({
    mutationFn: async (hotelId: string) => {
      if (!searchParams) throw new Error('Search parameters not found');
      return searchAPI.getHotelpage({
        id: hotelId,
        checkin: searchParams.checkin,
        checkout: searchParams.checkout,
        guests: searchParams.guests,
        residency: searchParams.residency,
      });
    },
    onSuccess: (response) => {
      const hotel = { ...response.data.hotel, rates: response.data.rates };
      setSelectedHotel(hotel);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to load hotel details');
    },
  });

  // Prebook mutation
  const prebookMutation = useMutation({
    mutationFn: async (data: { book_hash: string; price_increase_percent?: number }) => {
      return searchAPI.prebookRate(data);
    },
    onSuccess: (response) => {
      setPrebookResult(response);
      if (response.data.price_changed) {
        toast('Price has changed. Please review before continuing.', { icon: '⚠️' });
      } else {
        toast.success('Rate verified successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Rate verification failed');
    },
  });

  const handleSearch = (data: any) => {
    setSearchResults([]);
    setSelectedHotel(null);
    searchMutation.mutate(data);
  };

  const handleSelectHotel = (hotelId: string) => {
    hotelpageMutation.mutate(hotelId);
  };

  const handleBackToResults = () => {
    setSelectedHotel(null);
  };

  const handleSelectRate = (rate: HotelRate) => {
    setSelectedRate(rate);
    setShowPrebookModal(true);
    setPrebookResult(null);
  };

  const handlePrebookConfirm = (data: any) => {
    if (data.book_hash) {
      // Already prebooked, proceed to booking
      navigate('/booking', {
        state: {
          rate: { ...selectedRate, book_hash: data.book_hash, amount: data.amount },
          hotel: selectedHotel,
          checkin: searchParams?.checkin,
          checkout: searchParams?.checkout,
          guests: searchParams?.guests,
        },
      });
    } else {
      // Start prebook
      prebookMutation.mutate({
        book_hash: selectedRate!.book_hash,
        price_increase_percent: data.price_increase_percent,
      });
    }
  };

  const handlePrebookCancel = () => {
    setShowPrebookModal(false);
    setSelectedRate(null);
    setPrebookResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <SearchForm onSearch={handleSearch} isLoading={searchMutation.isPending} />

      {/* Loading State */}
      {searchMutation.isPending && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Searching for hotels..." />
        </div>
      )}

      {/* Error State */}
      {searchMutation.isError && (
        <ErrorMessage
          message="Failed to search hotels. Please check your parameters and try again."
          onRetry={() => searchMutation.reset()}
        />
      )}

      {/* Hotel Details */}
      {selectedHotel && searchParams && (
        <>
          {hotelpageMutation.isPending && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading hotel details..." />
            </div>
          )}
          {!hotelpageMutation.isPending && (
            <HotelDetails
              hotel={selectedHotel}
              checkin={searchParams.checkin}
              checkout={searchParams.checkout}
              onBack={handleBackToResults}
              onSelectRate={handleSelectRate}
            />
          )}
        </>
      )}

      {/* Search Results */}
      {!selectedHotel && searchResults.length > 0 && !searchMutation.isPending && (
        <HotelList hotels={searchResults} onSelectHotel={handleSelectHotel} />
      )}

      {/* Prebook Modal */}
      {showPrebookModal && selectedRate && selectedHotel && (
        <PrebookModal
          rate={selectedRate}
          hotelName={selectedHotel.name}
          onConfirm={handlePrebookConfirm}
          onCancel={handlePrebookCancel}
          isLoading={prebookMutation.isPending}
          prebookResult={prebookResult}
          error={prebookMutation.isError ? 'Failed to verify rate' : null}
        />
      )}
    </div>
  );
};
