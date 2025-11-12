import { z } from 'zod';

export const guestRoomSchema = z.object({
  adults: z.number().min(1).max(6),
  children: z.array(z.number().min(0).max(17)).max(4),
});

export const searchBaseSchema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  residency: z.string().length(2),
  language: z.string().min(2).max(5),
  guests: z.array(guestRoomSchema).min(1).max(9),
  currency: z.string().length(3).optional(),
});

export const regionSearchSchema = searchBaseSchema.extend({
  region_id: z.number(),
});

export const hotelSearchSchema = searchBaseSchema.extend({
  ids: z.array(z.string()).min(1).max(300),
});

export const geoSearchSchema = searchBaseSchema.extend({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number(),
});

export const hotelpageSchema = z.object({
  id: z.string(),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  residency: z.string().length(2),
  language: z.string().min(2).max(5),
  guests: z.array(guestRoomSchema).min(1).max(9),
  currency: z.string().length(3).optional(),
});

export const prebookSchema = z.object({
  hash: z.string(),
  price_increase_percent: z.number().min(0).max(100).optional(),
});

export const bookingGuestSchema = z.object({
  name: z.string(),
  surname: z.string(),
  is_child: z.boolean().optional(),
});

export const bookingFormSchema = z.object({
  partner_order_id: z.string(),
  book_hash: z.string(),
  user: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  language: z.string().min(2).max(5),
});

export const bookingFinishSchema = z.object({
  partner_order_id: z.string(),
  payment_type: z.string(),
  holder: z.object({
    name: z.string(),
    surname: z.string(),
  }),
  guests: z.array(bookingGuestSchema).min(1),
});
