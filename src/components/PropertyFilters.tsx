import { ChangeEvent, useMemo } from 'react';
import { PRICE_OPTIONS } from '../lib/filters/price';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrencyTHBBase, formatPriceTHB } from '../lib/fx/convert';
import useCachedFetch from '../hooks/useCachedFetch';

export interface Filters {
  province?: string;
  district?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  bedsMin?: number;
  bedsMax?: number;
  bathsMin?: number;
  bathsMax?: number;
  minArea?: number;
  maxArea?: number;
  status?: string;
  freshness?: number;
  nearTransit?: boolean;
  furnished?: string;
  sort?: string;
  amenities?: string[];
  tags?: string[];
  transitLine?: string;
  transitStation?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const COUNT_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const FURNISHING_OPTIONS: { value: string; label: string }[] = [
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'PARTLY_FURNISHED', label: 'Partly Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'views-desc', label: 'Most Viewed' },
  { value: 'updated-desc', label: 'Recently Updated' },
];

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function PropertyFilters({ filters, onChange }: Props) {
  const { currency, rates } = useCurrency();

  const { data: amenitiesData } = useCachedFetch<{ amenities: string[] }>(
    '/data/amenities.json'
  );
  const { data: transitData } = useCachedFetch<Record<string, string[]>>(
    '/data/transit-bkk.json'
  );
  const { data: geoData } = useCachedFetch<Record<string, string[]>>(
    '/data/geo-th-lite.json'
  );
  const { data: manifestData } = useCachedFetch<{
    shards: { key: string; type?: string }[];
  }>('/data/index/manifest.json');

  const amenitiesList = amenitiesData?.amenities || [];
  const transitLines = transitData || {};
  const provinces = useMemo(() => {
    if (!geoData) return [];
    return Object.keys(geoData).sort((a, b) => a.localeCompare(b));
  }, [geoData]);

  const provinceKey = useMemo(() => {
    if (!filters.province || !geoData) return undefined;
    if (geoData[filters.province]) return filters.province;
    const match = Object.keys(geoData).find(
      (name) => name.toLowerCase() === filters.province?.toLowerCase()
    );
    return match;
  }, [filters.province, geoData]);

  const districtOptions = useMemo(() => {
    if (!provinceKey || !geoData) return [];
    return geoData[provinceKey] ?? [];
  }, [provinceKey, geoData]);

  const propertyTypes = useMemo(() => {
    const seen = new Set<string>();
    const types: { value: string; label: string }[] = [];
    const addType = (raw?: string) => {
      const trimmed = raw?.trim();
      if (!trimmed) return;
      const normalized = trimmed.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      types.push({ value: normalized, label: titleCase(trimmed) });
    };
    manifestData?.shards?.forEach((shard) => {
      addType(shard.type);
      if (shard.key) {
        const parts = shard.key.split('-');
        addType(parts[parts.length - 1]);
      }
    });
    if (types.length === 0) {
      ['condo', 'house', 'land', 'townhouse'].forEach(addType);
    }
    return types.sort((a, b) => a.label.localeCompare(b.label));
  }, [manifestData]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      onChange({ ...filters, type: value ? value.toLowerCase() : undefined });
      return;
    }
    if (name === 'status') {
      onChange({ ...filters, status: value ? value.toUpperCase() : undefined });
      return;
    }
    if (name === 'furnished') {
      onChange({ ...filters, furnished: value ? value.toUpperCase() : undefined });
      return;
    }
    if (name === 'transitLine') {
      const lineValue = value || undefined;
      const updated: Filters = { ...filters, transitLine: lineValue };
      if (!lineValue) {
        delete updated.transitStation;
      } else if (
        filters.transitStation &&
        !(transitLines[lineValue] || []).includes(filters.transitStation)
      ) {
        delete updated.transitStation;
      }
      onChange(updated);
      return;
    }
    onChange({ ...filters, [name]: value || undefined });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;
    if (name === 'amenities' || name === 'tags') {
      const current = name === 'amenities' ? filters.amenities : filters.tags;
      const set = new Set(current || []);
      checked ? set.add(value) : set.delete(value);
      onChange({ ...filters, [name]: Array.from(set) });
    } else {
      onChange({ ...filters, [name]: checked });
    }
  };

  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const provinceValue = value || undefined;
    const updated: Filters = { ...filters, province: provinceValue };
    if (!provinceValue) {
      delete updated.district;
    } else {
      const availableDistricts = new Set(geoData?.[provinceValue] ?? []);
      if (filters.district && !availableDistricts.has(filters.district)) {
        delete updated.district;
      }
    }
    onChange(updated);
  };

  const handleRangeSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numeric = value ? Number(value) : undefined;
    const updated: Filters = { ...filters, [name]: numeric };
    if (name === 'bedsMin' && numeric !== undefined) {
      if (filters.bedsMax !== undefined && numeric > filters.bedsMax) {
        updated.bedsMax = numeric;
      }
    } else if (name === 'bedsMax' && numeric !== undefined) {
      if (filters.bedsMin !== undefined && numeric < filters.bedsMin) {
        updated.bedsMin = numeric;
      }
    } else if (name === 'bathsMin' && numeric !== undefined) {
      if (filters.bathsMax !== undefined && numeric > filters.bathsMax) {
        updated.bathsMax = numeric;
      }
    } else if (name === 'bathsMax' && numeric !== undefined) {
      if (filters.bathsMin !== undefined && numeric < filters.bathsMin) {
        updated.bathsMin = numeric;
      }
    }
    onChange(updated);
  };

  const handleAreaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numeric = value ? Number(value) : undefined;
    const updated: Filters = { ...filters, [name]: numeric };
    if (name === 'minArea' && numeric !== undefined) {
      if (filters.maxArea !== undefined && numeric > filters.maxArea) {
        updated.maxArea = numeric;
      }
    } else if (name === 'maxArea' && numeric !== undefined) {
      if (filters.minArea !== undefined && numeric < filters.minArea) {
        updated.minArea = numeric;
      }
    }
    onChange(updated);
  };

  const priceTooltip = (value?: number) =>
    value !== undefined ? formatCurrencyTHBBase(value, currency, rates) : undefined;

  const handlePriceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const num = value ? Number(value) : undefined;
    const updated: Filters = { ...filters, [name]: num };
    if (name === 'minPrice' && num !== undefined) {
      if (filters.maxPrice !== undefined && num > filters.maxPrice) {
        updated.maxPrice = num;
      }
    } else if (name === 'maxPrice' && num !== undefined) {
      if (filters.minPrice !== undefined && num < filters.minPrice) {
        updated.minPrice = num;
      }
    }
    onChange(updated);
  };

  const rangeTooltip =
    priceTooltip(filters.minPrice) || priceTooltip(filters.maxPrice)
      ? `${priceTooltip(filters.minPrice) ?? 'Any'} – ${priceTooltip(filters.maxPrice) ?? 'Any'}`
      : undefined;

  const bedsOptions = COUNT_OPTIONS.map((value) => ({
    value,
    label: value === 0 ? 'Studio' : `${value}+`,
  }));

  const bathsOptions = COUNT_OPTIONS.map((value) => ({
    value,
    label: value === 0 ? 'Any' : `${value}+`,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Province</span>
          <select name="province" value={filters.province ?? ''} onChange={handleProvinceChange}>
            <option value="">Any</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">District</span>
          <select
            name="district"
            value={filters.district ?? ''}
            onChange={handleSelectChange}
            disabled={!districtOptions.length}
          >
            <option value="">Any</option>
            {districtOptions.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Property Type</span>
          <select
            name="type"
            value={filters.type ? filters.type.toLowerCase() : ''}
            onChange={handleSelectChange}
          >
            <option value="">Any</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            value={filters.status ? filters.status.toUpperCase() : ''}
            onChange={handleSelectChange}
          >
            <option value="">Any</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2" title={rangeTooltip}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Min Price</span>
          <select
            name="minPrice"
            value={filters.minPrice ?? ''}
            onChange={handlePriceChange}
            title={priceTooltip(filters.minPrice)}
          >
            <option value="">Any</option>
            {PRICE_OPTIONS.filter((p) =>
              filters.maxPrice !== undefined ? p <= filters.maxPrice : true
            ).map((p) => (
              <option key={p} value={p} title={priceTooltip(p)}>
                {formatPriceTHB(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Max Price</span>
          <select
            name="maxPrice"
            value={filters.maxPrice ?? ''}
            onChange={handlePriceChange}
            title={priceTooltip(filters.maxPrice)}
          >
            <option value="">Any</option>
            {PRICE_OPTIONS.filter((p) =>
              filters.minPrice !== undefined ? p >= filters.minPrice : true
            ).map((p) => (
              <option key={p} value={p} title={priceTooltip(p)}>
                {formatPriceTHB(p)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Bedrooms</span>
          <div className="flex gap-2">
            <select
              name="bedsMin"
              value={filters.bedsMin ?? ''}
              onChange={handleRangeSelectChange}
            >
              <option value="">Min</option>
              {bedsOptions.map((option) => (
                <option key={`beds-min-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="bedsMax"
              value={filters.bedsMax ?? ''}
              onChange={handleRangeSelectChange}
            >
              <option value="">Max</option>
              {bedsOptions.map((option) => (
                <option key={`beds-max-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Bathrooms</span>
          <div className="flex gap-2">
            <select
              name="bathsMin"
              value={filters.bathsMin ?? ''}
              onChange={handleRangeSelectChange}
            >
              <option value="">Min</option>
              {bathsOptions.map((option) => (
                <option key={`baths-min-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="bathsMax"
              value={filters.bathsMax ?? ''}
              onChange={handleRangeSelectChange}
            >
              <option value="">Max</option>
              {bathsOptions.map((option) => (
                <option key={`baths-max-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Area (sqm)</span>
          <div className="flex gap-2">
            <input
              type="number"
              name="minArea"
              min={0}
              value={filters.minArea ?? ''}
              onChange={handleAreaChange}
              placeholder="Min"
            />
            <input
              type="number"
              name="maxArea"
              min={0}
              value={filters.maxArea ?? ''}
              onChange={handleAreaChange}
              placeholder="Max"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Furnished</span>
          <select
            name="furnished"
            value={filters.furnished ? filters.furnished.toUpperCase() : ''}
            onChange={handleSelectChange}
          >
            <option value="">Any</option>
            {FURNISHING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Freshness</span>
          <select name="freshness" value={filters.freshness ?? ''} onChange={handleSelectChange}>
            <option value="">Any</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Sort</span>
          <select name="sort" value={filters.sort ?? ''} onChange={handleSelectChange}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="nearTransit"
            checked={filters.nearTransit ?? false}
            onChange={handleCheckboxChange}
          />
          <span className="text-sm font-medium">Near Transit (BTS/MRT)</span>
        </label>
        {Object.keys(transitLines).length > 0 && (
          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Transit Line</span>
              <select
                name="transitLine"
                value={filters.transitLine ?? ''}
                onChange={handleSelectChange}
              >
                <option value="">Any</option>
                {Object.keys(transitLines).map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Transit Station</span>
              <select
                name="transitStation"
                value={filters.transitStation ?? ''}
                onChange={handleSelectChange}
                disabled={!filters.transitLine}
              >
                <option value="">Any</option>
                {filters.transitLine &&
                  (transitLines[filters.transitLine] || []).map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Amenities / Tags</span>
        <div className="flex flex-wrap gap-2">
          {amenitiesList.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="amenities"
                value={a}
                checked={filters.amenities?.includes(a) ?? false}
                onChange={handleCheckboxChange}
              />
              {titleCase(a)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
