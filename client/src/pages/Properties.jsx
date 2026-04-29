import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Properties.css';

const PROPERTY_TYPES = ['flat', 'house', 'plot', 'villa', 'penthouse', 'commercial'];
const FURNISHING_TYPES = ['furnished', 'semi-furnished', 'unfurnished'];
const BHK_OPTIONS = [1, 2, 3, 4, 5];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('listingType') || '',
    bhk: searchParams.get('bhk') || '',
    furnishing: searchParams.get('furnishing') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchProperties();
  }, [filters.page, filters.sort]);

  const fetchProperties = async (customFilters) => {
    setLoading(true);
    try {
      const f = customFilters || filters;
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const { data } = await api.get(`/property?${params.toString()}`);
      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'newest' && v !== 1) params.set(k, v);
    });
    setSearchParams(params);
    fetchProperties(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const cleared = {
      search: '', city: '', propertyType: '', listingType: '',
      bhk: '', furnishing: '', minPrice: '', maxPrice: '',
      minArea: '', maxArea: '', sort: 'newest', page: 1,
    };
    setFilters(cleared);
    setSearchParams({});
    fetchProperties(cleared);
    setShowFilters(false);
  };

  const changePage = (p) => {
    const newFilters = { ...filters, page: p };
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.city || filters.propertyType || filters.listingType ||
    filters.bhk || filters.furnishing || filters.minPrice || filters.maxPrice ||
    filters.minArea || filters.maxArea;

  return (
    <div className="page properties-page">
      <div className="container">
        {/* Search Bar */}
        <div className="props-header animate-slideUp">
          <div className="props-search-bar">
            <form onSubmit={applyFilters} className="props-search-form" id="properties-search-form">
              <HiOutlineSearch className="props-search-icon" />
              <input
                type="text"
                className="form-input props-search-input"
                placeholder="Search properties by name, description..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                id="properties-search-input"
              />
              <button type="submit" className="btn btn-primary" id="properties-search-btn">Search</button>
            </form>
            <button
              className={`btn btn-secondary props-filter-toggle ${hasActiveFilters ? 'has-filters' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              id="filter-toggle-btn"
            >
              <HiOutlineAdjustments size={18} />
              Filters
              {hasActiveFilters && <span className="filter-dot" />}
            </button>
          </div>

          {/* Sort & Results Count */}
          <div className="props-meta">
            <p className="props-count">{total} properties found</p>
            <select
              className="form-select props-sort"
              value={filters.sort}
              onChange={e => setFilters({ ...filters, sort: e.target.value })}
              id="properties-sort"
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel animate-fadeIn" id="filters-panel">
            <div className="filters-header">
              <h3>Filter Properties</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(false)}>
                <HiOutlineX size={18} />
              </button>
            </div>
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text" className="form-input" placeholder="e.g. Mumbai"
                  value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Listing Type</label>
                <select className="form-select" value={filters.listingType}
                  onChange={e => setFilters({ ...filters, listingType: e.target.value })}>
                  <option value="">All</option>
                  <option value="sale">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select className="form-select" value={filters.propertyType}
                  onChange={e => setFilters({ ...filters, propertyType: e.target.value })}>
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">BHK</label>
                <select className="form-select" value={filters.bhk}
                  onChange={e => setFilters({ ...filters, bhk: e.target.value })}>
                  <option value="">Any</option>
                  {BHK_OPTIONS.map(b => (
                    <option key={b} value={b}>{b} BHK</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Furnishing</label>
                <select className="form-select" value={filters.furnishing}
                  onChange={e => setFilters({ ...filters, furnishing: e.target.value })}>
                  <option value="">Any</option>
                  {FURNISHING_TYPES.map(f => (
                    <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min Price (₹)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Price (₹)</label>
                <input type="number" className="form-input" placeholder="No limit"
                  value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Area (sqft)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={filters.minArea} onChange={e => setFilters({ ...filters, minArea: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Area (sqft)</label>
                <input type="number" className="form-input" placeholder="No limit"
                  value={filters.maxArea} onChange={e => setFilters({ ...filters, maxArea: e.target.value })} />
              </div>
            </div>
            <div className="filters-actions">
              <button className="btn btn-ghost" onClick={clearFilters}>Clear All</button>
              <button className="btn btn-primary" onClick={applyFilters} id="apply-filters-btn">Apply Filters</button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Loading properties..." />
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-3">
              {properties.map(p => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button disabled={filters.page <= 1} onClick={() => changePage(filters.page - 1)}>‹</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  let pageNum;
                  if (pages <= 7) {
                    pageNum = i + 1;
                  } else if (filters.page <= 4) {
                    pageNum = i + 1;
                  } else if (filters.page >= pages - 3) {
                    pageNum = pages - 6 + i;
                  } else {
                    pageNum = filters.page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={filters.page === pageNum ? 'active' : ''}
                      onClick={() => changePage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button disabled={filters.page >= pages} onClick={() => changePage(filters.page + 1)}>›</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <HiOutlineSearch size={48} />
            <h3>No properties found</h3>
            <p>Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
