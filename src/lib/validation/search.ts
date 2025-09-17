import { z } from 'zod';
import { MIN_PRICE, MAX_PRICE, isValidPrice } from '../filters/price';

const safeString = z.string().trim().regex(/^[\p{L}\p{N}\s-]+$/u);

export const searchParamsSchema = z.object({
  query: safeString.optional(),
  province: safeString.optional(),
  type: safeString.optional(),
  locale: z.enum(['en', 'th', 'zh']).optional(),
  minPrice: z
    .coerce
    .number()
    .int()
    .min(MIN_PRICE)
    .max(MAX_PRICE)
    .refine(isValidPrice, 'Invalid price step')
    .optional(),
  maxPrice: z
    .coerce
    .number()
    .int()
    .min(MIN_PRICE)
    .max(MAX_PRICE)
    .refine(isValidPrice, 'Invalid price step')
    .optional(),
  beds: z.coerce.number().int().nonnegative().optional(),
  baths: z.coerce.number().int().nonnegative().optional(),
  status: z.enum(['sale', 'rent']).optional(),
  freshness: z.coerce.number().int().nonnegative().optional(),
  nearTransit: z.coerce.boolean().optional(),
  furnished: z.enum(['furnished', 'unfurnished']).optional(),
  sort: z.enum(['price-asc', 'price-desc', 'created-asc', 'created-desc']).optional(),
  amenities: z
    .union([safeString, z.array(safeString)])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  transitLine: safeString.optional(),
  transitStation: safeString.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
}).refine(
  (data) =>
    data.minPrice === undefined ||
    data.maxPrice === undefined ||
    data.minPrice <= data.maxPrice,
  {
    message: 'minPrice cannot exceed maxPrice',
    path: ['maxPrice'],
  }
);

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const filterParamsSchema = searchParamsSchema.pick({
  minPrice: true,
  maxPrice: true,
  beds: true,
  baths: true,
  status: true,
  freshness: true,
  nearTransit: true,
  furnished: true,
  sort: true,
  amenities: true,
  transitLine: true,
  transitStation: true,
});
