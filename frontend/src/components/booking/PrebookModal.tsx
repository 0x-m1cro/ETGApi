import { useState } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { HotelRate, PrebookResponse } from '../../types';

interface PrebookModalProps {
  rate: HotelRate;
  hotelName: string;
  onConfirm: (prebookData: PrebookResponse) => void;
  onCancel: () => void;
  isLoading: boolean;
  prebookResult: PrebookResponse | null;
  error: string | null;
}

export const PrebookModal: React.FC<PrebookModalProps> = ({
  rate,
  hotelName,
  onConfirm,
  onCancel,
  isLoading,
  prebookResult,
  error,
}) => {
  const [priceIncreasePercent, setPriceIncreasePercent] = useState(10);

  const showPriceChanged = prebookResult?.data.price_changed;
  const newAmount = prebookResult?.data.amount;
  const originalAmount = rate.amount;
  const priceDifference = newAmount && originalAmount ? newAmount - originalAmount : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Verify Rate Availability</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hotel & Rate Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{hotelName}</h3>
            <p className="text-gray-700">{rate.room_name}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Original Price:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(rate.amount, rate.currency)}
              </span>
            </div>
          </div>

          {/* Price Flexibility */}
          {!prebookResult && !isLoading && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Increase Tolerance (0-100%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={priceIncreasePercent}
                onChange={(e) => setPriceIncreasePercent(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium text-blue-600">{priceIncreasePercent}%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This allows the system to find alternative rates if the original is unavailable,
                up to {priceIncreasePercent}% higher than the original price.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Verifying rate availability...</p>
              <p className="text-sm text-gray-500 mt-2">This may take up to 60 seconds</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Verification Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success State - Price Unchanged */}
          {prebookResult && !showPriceChanged && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Rate Verified Successfully</p>
                  <p className="text-sm text-green-700 mt-1">
                    The rate is available at the original price.
                  </p>
                  <div className="mt-3 flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-700">Confirmed Price:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(newAmount!, prebookResult.data.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success State - Price Changed */}
          {prebookResult && showPriceChanged && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">Price Changed</p>
                  <p className="text-sm text-amber-700 mt-1">
                    The price has changed since your initial search.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between bg-white p-3 rounded">
                      <span className="text-gray-700">Original Price:</span>
                      <span className="font-medium text-gray-900 line-through">
                        {formatCurrency(originalAmount, rate.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded">
                      <span className="text-gray-700">New Price:</span>
                      <span className="text-xl font-bold text-amber-600">
                        {formatCurrency(newAmount!, prebookResult.data.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded">
                      <span className="text-gray-700">Difference:</span>
                      <span className={`font-medium ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {priceDifference > 0 ? '+' : ''}{formatCurrency(priceDifference, rate.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Alternative Rates */}
                  {prebookResult.data.alternative_rates && prebookResult.data.alternative_rates.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Alternative rates available:
                      </p>
                      <div className="space-y-2">
                        {prebookResult.data.alternative_rates.slice(0, 3).map((altRate, index) => (
                          <div key={index} className="bg-white p-3 rounded text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">{altRate.room_name}</span>
                              <span className="font-medium">
                                {formatCurrency(altRate.amount, altRate.currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          {!prebookResult && !isLoading && !error && (
            <button
              onClick={() => onConfirm({ price_increase_percent: priceIncreasePercent } as any)}
              className="btn-primary flex-1"
            >
              Verify Rate
            </button>
          )}
          {prebookResult && (
            <button
              onClick={() => onConfirm(prebookResult)}
              className="btn-primary flex-1"
            >
              {showPriceChanged ? 'Accept New Price & Continue' : 'Continue to Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
