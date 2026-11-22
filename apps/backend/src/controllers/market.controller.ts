import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { getValidatedQuery } from '../middleware/validation.middleware';
import {
  listMarketAreaUnits,
  listMarketCities,
  listMarketLocations,
  listMarketPropertyTypes,
} from '../services/market-data.service';
import type { PropertyType } from '../types/domain';

export const meta = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{ city?: string; property_type?: PropertyType }>(req);
  const [cities, property_types, area_units] = await Promise.all([
    listMarketCities(),
    listMarketPropertyTypes(query.city),
    listMarketAreaUnits(query.city, query.property_type),
  ]);
  sendSuccess(res, 'Market metadata retrieved', {
    cities,
    property_types,
    area_units,
  });
});

export const locations = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{ city: string; q: string; limit: number }>(req);
  const items = await listMarketLocations(query.city, query.q, query.limit);
  sendSuccess(res, 'Market locations retrieved', items);
});
