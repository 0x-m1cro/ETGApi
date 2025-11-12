import { Request, Response, NextFunction } from 'express';
import searchService from '../services/search.service';
import logger from '../config/logger';

class SearchController {
  async searchByRegion(req: Request, res: Response, next: NextFunction) {
    try {
      searchService.validateSearchDates(req.body.checkin, req.body.checkout);
      searchService.validateGuests(req.body.guests);

      const result = await searchService.searchByRegion(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error in searchByRegion controller', error);
      next(error);
    }
  }

  async searchByHotels(req: Request, res: Response, next: NextFunction) {
    try {
      searchService.validateSearchDates(req.body.checkin, req.body.checkout);
      searchService.validateGuests(req.body.guests);

      const result = await searchService.searchByHotels(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error in searchByHotels controller', error);
      next(error);
    }
  }

  async searchByGeo(req: Request, res: Response, next: NextFunction) {
    try {
      searchService.validateSearchDates(req.body.checkin, req.body.checkout);
      searchService.validateGuests(req.body.guests);

      const result = await searchService.searchByGeo(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error in searchByGeo controller', error);
      next(error);
    }
  }

  async getHotelpage(req: Request, res: Response, next: NextFunction) {
    try {
      searchService.validateSearchDates(req.body.checkin, req.body.checkout);
      searchService.validateGuests(req.body.guests);

      const result = await searchService.getHotelpage(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error in getHotelpage controller', error);
      next(error);
    }
  }

  async prebookRate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchService.prebookRate(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error in prebookRate controller', error);
      next(error);
    }
  }
}

export default new SearchController();
