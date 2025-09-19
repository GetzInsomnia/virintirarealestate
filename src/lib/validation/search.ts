import { z } from 'zod';
import { MIN_PRICE, MAX_PRICE, isValidPrice } from '../filters/price';

const safeString = z
  .string()
  .trim()
  .regex(/^[\p{L}\p{N}\s_\-\/&()]+$/u);

export const searchParamsSchema = z
  .object({
  query: safeString.optional(),
  province: safeString.optional(),
  district: safeString.optional(),
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
  bedsMin: z.coerce.number().int().nonnegative().optional(),
  bedsMax: z.coerce.number().int().nonnegative().optional(),
  bathsMin: z.coerce.number().int().nonnegative().optional(),
  bathsMax: z.coerce.number().int().nonnegative().optional(),
  minArea: z.coerce.number().int().nonnegative().optional(),
  maxArea: z.coerce.number().int().nonnegative().optional(),
  status: safeString.optional(),
  freshness: z.coerce.number().int().nonnegative().optional(),
  nearTransit: z.coerce.boolean().optional(),
  furnished: safeString.optional(),
  sort: z
    .enum(['price-asc', 'price-desc', 'views-desc', 'updated-desc', 'created-asc', 'created-desc'])
    .optional(),
  amenities: z
    .union([safeString, z.array(safeString)])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  tags: z
    .union([safeString, z.array(safeString)])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  transitLine: safeString.optional(),
  transitStation: safeString.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    const addRangeIssue = (
      minKey: 'minPrice' | 'bedsMin' | 'bathsMin' | 'minArea',
      maxKey: 'maxPrice' | 'bedsMax' | 'bathsMax' | 'maxArea',
      message: string
    ) => {
      const min = data[minKey] as number | undefined;
      const max = data[maxKey] as number | undefined;
      if (min !== undefined && max !== undefined && min > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [maxKey],
          message,
        });
      }
    };

    addRangeIssue('minPrice', 'maxPrice', 'minPrice cannot exceed maxPrice');
    addRangeIssue('bedsMin', 'bedsMax', 'bedsMin cannot exceed bedsMax');
    addRangeIssue('bathsMin', 'bathsMax', 'bathsMin cannot exceed bathsMax');
    addRangeIssue('minArea', 'maxArea', 'minArea cannot exceed maxArea');
  });

export type SearchParams = z.infer<typeof searchParamsSchema>;
export const filterParamsSchema = searchParamsSchema.pick({
  province: true,
  district: true,
  type: true,
  minPrice: true,
  maxPrice: true,
  beds: true,
  baths: true,
  bedsMin: true,
  bedsMax: true,
  bathsMin: true,
  bathsMax: true,
  minArea: true,
  maxArea: true,
  status: true,
  freshness: true,
  nearTransit: true,
  furnished: true,
  sort: true,
  amenities: true,
  tags: true,
  transitLine: true,
  transitStation: true,
});
