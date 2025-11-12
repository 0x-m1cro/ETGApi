import { Router } from 'express';
import searchController from '../controllers/search.controller';
import { validate } from '../middleware/validation';
import {
  regionSearchSchema,
  hotelSearchSchema,
  geoSearchSchema,
  hotelpageSchema,
  prebookSchema,
} from '../utils/validators';

const router = Router();

// Step 1: Initial Search Methods
router.post('/region', validate(regionSearchSchema), searchController.searchByRegion);
router.post('/hotels', validate(hotelSearchSchema), searchController.searchByHotels);
router.post('/geo', validate(geoSearchSchema), searchController.searchByGeo);

// Step 2: Hotel Details
router.post('/hotelpage', validate(hotelpageSchema), searchController.getHotelpage);

// Step 3: Rate Verification (Mandatory)
router.post('/prebook', validate(prebookSchema), searchController.prebookRate);

export default router;
