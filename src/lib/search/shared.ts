import type { SearchParams } from '../validation/search';

const STATUS_ORDER: Record<string, number> = {
  AVAILABLE: 0,
  RESERVED: 1,
  SOLD: 2,
};

const normalize = (value?: string) => value?.toString().trim().toLowerCase();

function statusRank(status?: string) {
  const normalized = status?.toString().trim().toUpperCase();
  if (!normalized) return STATUS_ORDER.AVAILABLE ?? 0;
  return STATUS_ORDER[normalized] ?? STATUS_ORDER.SOLD ?? 2;
}

function compareStatus(a: any, b: any) {
  return statusRank(a.status) - statusRank(b.status);
}

function compareDateDesc(a: any, b: any, key: 'updatedAt' | 'createdAt') {
  const aTime = a?.[key] ? new Date(a[key]).getTime() : 0;
  const bTime = b?.[key] ? new Date(b[key]).getTime() : 0;
  return bTime - aTime;
}

export function applyFilters(docs: any[], req: SearchParams) {
  return docs.filter((doc) => {
    if (req.province) {
      const province = normalize(req.province);
      if (
        normalize(doc.province) !== province &&
        normalize(doc.province_th) !== province
      ) {
        return false;
      }
    }
    if (req.district) {
      const district = normalize(req.district);
      if (
        normalize(doc.district) !== district &&
        normalize(doc.district_th) !== district
      ) {
        return false;
      }
    }
    if (req.type) {
      if (normalize(doc.type) !== normalize(req.type)) return false;
    }
    if (req.minPrice !== undefined && doc.price < req.minPrice) return false;
    if (req.maxPrice !== undefined && doc.price > req.maxPrice) return false;
    const beds = doc.beds ?? 0;
    if (req.beds !== undefined && beds < req.beds) return false;
    if (req.bedsMin !== undefined && beds < req.bedsMin) return false;
    if (req.bedsMax !== undefined && beds > req.bedsMax) return false;
    const baths = doc.baths ?? 0;
    if (req.baths !== undefined && baths < req.baths) return false;
    if (req.bathsMin !== undefined && baths < req.bathsMin) return false;
    if (req.bathsMax !== undefined && baths > req.bathsMax) return false;
    const area = doc.area ?? doc.areaBuilt;
    if (req.minArea !== undefined) {
      if (area === undefined || area < req.minArea) return false;
    }
    if (req.maxArea !== undefined) {
      if (area === undefined || area > req.maxArea) return false;
    }
    if (req.status) {
      if (normalize(doc.status) !== normalize(req.status)) return false;
    }
    if (req.freshness !== undefined) {
      const sourceDate = doc.updatedAt ?? doc.createdAt;
      const base = sourceDate ? new Date(sourceDate).getTime() : 0;
      const days = base ? (Date.now() - base) / (1000 * 60 * 60 * 24) : Infinity;
      if (days > req.freshness) return false;
    }
    if (req.nearTransit && !doc.nearTransit) return false;
    if (req.transitLine && normalize(doc.transitLine) !== normalize(req.transitLine)) return false;
    if (
      req.transitStation &&
      normalize(doc.transitStation) !== normalize(req.transitStation)
    )
      return false;
    if (req.furnished && normalize(doc.furnished) !== normalize(req.furnished)) return false;
    if (req.amenities && req.amenities.length) {
      const amenities: string[] = Array.isArray(doc.amenities) ? doc.amenities : [];
      for (const a of req.amenities) {
        if (!amenities.some((value) => normalize(value) === normalize(a))) {
          return false;
        }
      }
    }
    if (req.tags && req.tags.length) {
      const tags: string[] = Array.isArray(doc.tags) ? doc.tags : [];
      for (const tag of req.tags) {
        if (!tags.some((value) => normalize(value) === normalize(tag))) {
          return false;
        }
      }
    }
    return true;
  });
}

export function sortResults(docs: any[], sort: SearchParams['sort']) {
  const byStatus = (a: any, b: any) => {
    const statusCompare = compareStatus(a, b);
    if (statusCompare !== 0) return statusCompare;
    const updatedCompare = compareDateDesc(a, b, 'updatedAt');
    if (updatedCompare !== 0) return updatedCompare;
    return compareDateDesc(a, b, 'createdAt');
  };

  switch (sort) {
    case 'price-asc':
      return docs.sort((a, b) => {
        const priceDiff = (a.price ?? 0) - (b.price ?? 0);
        if (priceDiff !== 0) return priceDiff;
        return byStatus(a, b);
      });
    case 'price-desc':
      return docs.sort((a, b) => {
        const priceDiff = (b.price ?? 0) - (a.price ?? 0);
        if (priceDiff !== 0) return priceDiff;
        return byStatus(a, b);
      });
    case 'views-desc':
      return docs.sort((a, b) => {
        const viewsDiff = (b.views ?? 0) - (a.views ?? 0);
        if (viewsDiff !== 0) return viewsDiff;
        return byStatus(a, b);
      });
    case 'updated-desc':
      return docs.sort((a, b) => {
        const updatedCompare = compareDateDesc(a, b, 'updatedAt');
        if (updatedCompare !== 0) return updatedCompare;
        return byStatus(a, b);
      });
    case 'created-asc':
      return docs.sort((a, b) => {
        const createdCompare = compareDateDesc(b, a, 'createdAt');
        if (createdCompare !== 0) return createdCompare;
        return byStatus(a, b);
      });
    case 'created-desc':
      return docs.sort((a, b) => {
        const createdCompare = compareDateDesc(a, b, 'createdAt');
        if (createdCompare !== 0) return createdCompare;
        return byStatus(a, b);
      });
    default:
      return docs.sort(byStatus);
  }
}
