import { ChangeEvent, useEffect, useState } from 'react';

export interface Filters {
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  status?: string;
  freshness?: number;
  nearTransit?: boolean;
  furnished?: string;
  sort?: string;
  amenities?: string[];
  transitLine?: string;
  transitStation?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function PropertyFilters({ filters, onChange }: Props) {
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [transitLines, setTransitLines] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch('/data/amenities.json')
      .then((res) => res.json())
      .then((data) => setAmenitiesList(data.amenities || []))
      .catch(() => setAmenitiesList([]));
    fetch('/data/transit-bkk.json')
      .then((res) => res.json())
      .then((data) => setTransitLines(data))
      .catch(() => setTransitLines({}));
  }, []);
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value ? Number(value) : undefined });
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value || undefined });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;
    if (name === 'amenities') {
      const set = new Set(filters.amenities || []);
      checked ? set.add(value) : set.delete(value);
      onChange({ ...filters, amenities: Array.from(set) });
    } else {
      onChange({ ...filters, [name]: checked });
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label>
          Min Price
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice ?? ''}
            onChange={handleNumberChange}
          />
        </label>
        <label>
          Max Price
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice ?? ''}
            onChange={handleNumberChange}
          />
        </label>
      </div>
      <div>
        <label>
          Beds
          <input
            type="number"
            name="beds"
            value={filters.beds ?? ''}
            onChange={handleNumberChange}
          />
        </label>
        <label>
          Baths
          <input
            type="number"
            name="baths"
            value={filters.baths ?? ''}
            onChange={handleNumberChange}
          />
        </label>
      </div>
      <div>
        <label>
          Status
          <select name="status" value={filters.status ?? ''} onChange={handleSelectChange}>
            <option value="">Any</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </label>
        <label>
          Freshness
          <select
            name="freshness"
            value={filters.freshness ?? ''}
            onChange={handleSelectChange}
          >
            <option value="">Any</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="nearTransit"
            checked={filters.nearTransit ?? false}
            onChange={handleCheckboxChange}
          />
          Near Transit
        </label>
        {Object.keys(transitLines).length > 0 && (
          <>
            <label>
              Line
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
            {filters.transitLine && (
              <label>
                Station
                <select
                  name="transitStation"
                  value={filters.transitStation ?? ''}
                  onChange={handleSelectChange}
                >
                  <option value="">Any</option>
                  {transitLines[filters.transitLine].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        <label>
          Furnished
          <select
            name="furnished"
            value={filters.furnished ?? ''}
            onChange={handleSelectChange}
          >
            <option value="">Any</option>
            <option value="furnished">Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Sort
          <select name="sort" value={filters.sort ?? ''} onChange={handleSelectChange}>
            <option value="">Default</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="created-desc">Newest</option>
            <option value="created-asc">Oldest</option>
          </select>
        </label>
      </div>
      <div>
        Amenities:
        {amenitiesList.map((a) => (
          <label key={a}>
            <input
              type="checkbox"
              name="amenities"
              value={a}
              checked={filters.amenities?.includes(a) ?? false}
              onChange={handleCheckboxChange}
            />
            {a}
          </label>
        ))}
      </div>
    </div>
  );
}
