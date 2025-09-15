import type { SearchParams } from '../validation/search';

export function applyFilters(docs: any[], req: SearchParams) {
  return docs.filter((doc) => {
    if (req.minPrice !== undefined && doc.price < req.minPrice) return false;
    if (req.maxPrice !== undefined && doc.price > req.maxPrice) return false;
    if (req.beds !== undefined && (doc.beds ?? 0) < req.beds) return false;
    if (req.baths !== undefined && (doc.baths ?? 0) < req.baths) return false;
    if (req.status && doc.status !== req.status) return false;
    if (req.freshness !== undefined) {
      const days = (Date.now() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (days > req.freshness) return false;
    }
    if (req.nearTransit && !doc.nearTransit) return false;
    if (req.transitLine && doc.transitLine !== req.transitLine) return false;
    if (req.transitStation && doc.transitStation !== req.transitStation) return false;
    if (req.furnished && doc.furnished !== req.furnished) return false;
    if (req.amenities && req.amenities.length) {
      for (const a of req.amenities) {
        if (!doc.amenities.includes(a)) return false;
      }
    }
    return true;
  });
}

export function sortResults(docs: any[], sort: SearchParams['sort']) {
  switch (sort) {
    case 'price-asc':
      return docs.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return docs.sort((a, b) => b.price - a.price);
    case 'created-asc':
      return docs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'created-desc':
    default:
      return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
