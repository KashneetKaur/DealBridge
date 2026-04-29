import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineHome, HiOutlineShieldCheck, HiOutlineChatAlt2, HiOutlineCalendar } from 'react-icons/hi';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ keyword: '', city: '', listingType: '' });

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const { data } = await api.get('/property/featured');
      setFeatured(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.keyword) params.set('search', search.keyword);
    if (search.city) params.set('city', search.city);
    if (search.listingType) params.set('listingType', search.listingType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="page home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="container hero-content animate-slideUp">
          <span className="hero-badge">🏠 #1 Real Estate Marketplace</span>
          <h1 className="hero-title">
            Find Your Perfect<br /><span className="text-gradient">Dream Property</span>
          </h1>
          <p className="hero-subtitle">
            Discover thousands of properties for sale and rent across India. Connect with verified sellers and agents.
          </p>
          <form className="hero-search" onSubmit={handleSearch} id="hero-search-form">
            <div className="search-field">
              <HiOutlineSearch className="search-icon" />
              <input type="text" placeholder="Search properties..." className="form-input" value={search.keyword} onChange={e => setSearch({ ...search, keyword: e.target.value })} id="hero-search-input" />
            </div>
            <div className="search-field">
              <HiOutlineLocationMarker className="search-icon" />
              <input type="text" placeholder="City" className="form-input" value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })} id="hero-city-input" />
            </div>
            <select className="form-select" value={search.listingType} onChange={e => setSearch({ ...search, listingType: e.target.value })} id="hero-type-select">
              <option value="">Buy / Rent</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <button type="submit" className="btn btn-primary btn-lg" id="hero-search-btn">
              <HiOutlineSearch /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '10K+', label: 'Properties Listed' },
              { num: '50+', label: 'Cities Covered' },
              { num: '5K+', label: 'Happy Customers' },
              { num: '200+', label: 'Verified Agents' },
            ].map((s, i) => (
              <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Properties</h2>
            <div className="divider" />
            <p>Handpicked premium properties for you</p>
          </div>
          {loading ? <LoadingSpinner /> : featured.length > 0 ? (
            <div className="grid grid-3">{featured.slice(0, 6).map(p => <PropertyCard key={p._id} property={p} />)}</div>
          ) : (
            <div className="empty-state">
              <HiOutlineHome size={48} />
              <p>No featured properties yet. Check back soon!</p>
            </div>
          )}
          <div className="text-center mt-xl">
            <Link to="/properties" className="btn btn-secondary btn-lg" id="view-all-btn">View All Properties</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <div className="divider" />
            <p>Simple steps to find or list your property</p>
          </div>
          <div className="grid grid-3">
            {[
              { icon: <HiOutlineSearch size={32} />, title: 'Search', desc: 'Browse thousands of verified listings with advanced filters.' },
              { icon: <HiOutlineChatAlt2 size={32} />, title: 'Connect', desc: 'Chat directly with property owners and verified agents.' },
              { icon: <HiOutlineCalendar size={32} />, title: 'Visit & Close', desc: 'Schedule visits and close deals with confidence.' },
            ].map((item, i) => (
              <div key={i} className="how-card card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="how-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to List Your Property?</h2>
            <p>Join thousands of sellers and agents on DealBridge. Reach millions of potential buyers.</p>
            <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">Get Started Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
