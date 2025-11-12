import searchService from '../services/search.service';

describe('SearchService', () => {
  describe('validateSearchDates', () => {
    it('should throw error for past check-in dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const checkin = yesterday.toISOString().split('T')[0];
      const checkout = new Date().toISOString().split('T')[0];

      expect(() => {
        searchService.validateSearchDates(checkin, checkout);
      }).toThrow('Check-in date must be in the future');
    });

    it('should throw error for check-in > 730 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 731);
      const checkin = future.toISOString().split('T')[0];
      const checkout = future.toISOString().split('T')[0];

      expect(() => {
        searchService.validateSearchDates(checkin, checkout);
      }).toThrow('Check-in date must be within 730 days from today');
    });

    it('should throw error for stays > 30 nights', () => {
      const checkin = new Date();
      checkin.setDate(checkin.getDate() + 10);
      const checkout = new Date(checkin);
      checkout.setDate(checkout.getDate() + 31);

      expect(() => {
        searchService.validateSearchDates(
          checkin.toISOString().split('T')[0],
          checkout.toISOString().split('T')[0]
        );
      }).toThrow('Maximum stay is 30 nights');
    });

    it('should pass for valid dates', () => {
      const checkin = new Date();
      checkin.setDate(checkin.getDate() + 10);
      const checkout = new Date(checkin);
      checkout.setDate(checkout.getDate() + 5);

      expect(() => {
        searchService.validateSearchDates(
          checkin.toISOString().split('T')[0],
          checkout.toISOString().split('T')[0]
        );
      }).not.toThrow();
    });
  });

  describe('validateGuests', () => {
    it('should throw error for more than 6 adults per room', () => {
      const guests = [{ adults: 7, children: [] }];

      expect(() => {
        searchService.validateGuests(guests);
      }).toThrow('Maximum 6 adults per room');
    });

    it('should throw error for more than 4 children per room', () => {
      const guests = [{ adults: 2, children: [5, 7, 9, 11, 13] }];

      expect(() => {
        searchService.validateGuests(guests);
      }).toThrow('Maximum 4 children per room');
    });

    it('should throw error for children over 17', () => {
      const guests = [{ adults: 2, children: [18] }];

      expect(() => {
        searchService.validateGuests(guests);
      }).toThrow('Children must be 17 years or younger');
    });

    it('should throw error for more than 9 rooms', () => {
      const guests = Array(10).fill({ adults: 2, children: [] });

      expect(() => {
        searchService.validateGuests(guests);
      }).toThrow('Maximum 9 rooms per booking');
    });

    it('should pass for valid guests', () => {
      const guests = [
        { adults: 2, children: [7, 15] },
        { adults: 4, children: [] },
      ];

      expect(() => {
        searchService.validateGuests(guests);
      }).not.toThrow();
    });
  });
});
