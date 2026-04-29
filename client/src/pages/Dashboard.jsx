import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineViewGrid, HiOutlineHome, HiOutlineHeart,
  HiOutlineCalendar, HiOutlineUser, HiOutlineTrash,
  HiOutlinePencil, HiOutlineCheck, HiOutlineX,
  HiOutlineEye, HiOutlineClock
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './Dashboard.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <HiOutlineViewGrid size={18} /> },
  { id: 'listings', label: 'My Listings', icon: <HiOutlineHome size={18} />, roles: ['seller', 'agent', 'admin'] },
  { id: 'favorites', label: 'Favorites', icon: <HiOutlineHeart size={18} /> },
  { id: 'bookings', label: 'Bookings', icon: <HiOutlineCalendar size={18} /> },
  { id: 'profile', label: 'Profile', icon: <HiOutlineUser size={18} /> },
];

export default function Dashboard() {
  const { user, updateUser, fetchUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'overview';

  const setTab = (tab) => setSearchParams({ tab });

  const visibleTabs = TABS.filter(t => !t.roles || t.roles.includes(user?.role));

  return (
    <div className="page dashboard-page">
      <div className="container">
        <div className="dash-layout">
          {/* Sidebar */}
          <aside className="dash-sidebar">
            <div className="dash-user-card">
              <div className="dash-avatar">
                {user?.avatar ? <img src={user.avatar} alt="" /> : <span>{user?.name?.charAt(0)}</span>}
              </div>
              <h3>{user?.name}</h3>
              <span className="badge badge-primary">{user?.role}</span>
            </div>
            <nav className="dash-nav">
              {visibleTabs.map(t => (
                <button key={t.id} className={`dash-nav-item ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="dash-content">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'listings' && <ListingsTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} fetchUser={fetchUser} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, favorites: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const promises = [api.get('/property/favorites'), api.get('/booking')];
        if (['seller', 'agent', 'admin'].includes(user?.role)) {
          promises.push(api.get('/property/my-listings'));
        }
        const results = await Promise.allSettled(promises);
        setStats({
          favorites: results[0].status === 'fulfilled' ? results[0].value.data.length : 0,
          bookings: results[1].status === 'fulfilled' ? results[1].value.data.length : 0,
          listings: results[2]?.status === 'fulfilled' ? results[2].value.data.length : 0,
        });
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <h2 className="dash-section-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
      <div className="overview-grid">
        {['seller', 'agent', 'admin'].includes(user?.role) && (
          <div className="overview-card">
            <HiOutlineHome size={28} className="overview-icon" />
            <span className="overview-num">{stats.listings}</span>
            <span className="overview-label">My Listings</span>
          </div>
        )}
        <div className="overview-card">
          <HiOutlineHeart size={28} className="overview-icon" />
          <span className="overview-num">{stats.favorites}</span>
          <span className="overview-label">Saved Properties</span>
        </div>
        <div className="overview-card">
          <HiOutlineCalendar size={28} className="overview-icon" />
          <span className="overview-num">{stats.bookings}</span>
          <span className="overview-label">Bookings</span>
        </div>
      </div>
      {['seller', 'agent', 'admin'].includes(user?.role) && (
        <Link to="/add-property" className="btn btn-primary btn-lg mt-xl" id="dash-add-btn">
          + List New Property
        </Link>
      )}
    </div>
  );
}

function ListingsTab() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/property/my-listings');
      setListings(data);
    } catch { /* */ }
    setLoading(false);
  };

  const deleteListing = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/property/${id}`);
      toast.success('Property deleted');
      setListings(listings.filter(l => l._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <div className="dash-section-header">
        <h2 className="dash-section-title">My Listings</h2>
        <Link to="/add-property" className="btn btn-primary btn-sm">+ Add Property</Link>
      </div>
      {listings.length > 0 ? (
        <div className="listings-list">
          {listings.map(l => (
            <div key={l._id} className="listing-row">
              <img src={l.images?.[0] || `https://placehold.co/120x80/1a1b2e/6366f1?text=P`} alt="" className="listing-thumb" />
              <div className="listing-info">
                <Link to={`/property/${l._id}`} className="listing-title">{l.title}</Link>
                <p className="listing-meta">{l.city} • {l.propertyType} • ₹{l.price?.toLocaleString('en-IN')}</p>
              </div>
              <span className={`badge badge-${l.status === 'approved' ? 'approved' : l.status === 'pending' ? 'pending' : 'rejected'}`}>
                {l.status}
              </span>
              <div className="listing-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/edit-property/${l._id}`)} title="Edit">
                  <HiOutlinePencil size={16} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteListing(l._id)} title="Delete" style={{ color: 'var(--error)' }}>
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <HiOutlineHome size={48} />
          <p>You haven't listed any properties yet</p>
          <Link to="/add-property" className="btn btn-primary">List Your First Property</Link>
        </div>
      )}
    </div>
  );
}

function FavoritesTab() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/property/favorites');
        setFavorites(data);
      } catch { /* */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <h2 className="dash-section-title">Saved Properties</h2>
      {favorites.length > 0 ? (
        <div className="grid grid-2">{favorites.map(p => <PropertyCard key={p._id} property={p} />)}</div>
      ) : (
        <div className="empty-state">
          <HiOutlineHeart size={48} />
          <p>No saved properties. Browse and save the ones you love!</p>
          <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
        </div>
      )}
    </div>
  );
}

function BookingsTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/booking');
      setBookings(data);
    } catch { /* */ }
    setLoading(false);
  };

  const updateBooking = async (id, status) => {
    try {
      await api.put(`/booking/${id}`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch { toast.error('Failed to update booking'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <h2 className="dash-section-title">Bookings</h2>
      {bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map(b => {
            const isOwner = b.owner?._id === user?._id;
            const other = isOwner ? b.user : b.owner;
            return (
              <div key={b._id} className="booking-card">
                <div className="booking-prop">
                  <img src={b.property?.images?.[0] || `https://placehold.co/80x60/1a1b2e/6366f1?text=P`} alt="" />
                  <div>
                    <Link to={`/property/${b.property?._id}`} className="booking-prop-title">{b.property?.title}</Link>
                    <p className="booking-prop-city">{b.property?.city}</p>
                  </div>
                </div>
                <div className="booking-details">
                  <div className="booking-detail"><HiOutlineCalendar /> {formatDate(b.date)}</div>
                  <div className="booking-detail"><HiOutlineClock /> {b.time}</div>
                  <div className="booking-detail"><HiOutlineUser /> {other?.name} ({isOwner ? 'Visitor' : 'Owner'})</div>
                </div>
                {b.notes && <p className="booking-notes">"{b.notes}"</p>}
                <div className="booking-footer">
                  <span className={`badge badge-${b.status === 'approved' ? 'approved' : b.status === 'rejected' || b.status === 'cancelled' ? 'rejected' : 'pending'}`}>
                    {b.status}
                  </span>
                  {isOwner && b.status === 'pending' && (
                    <div className="booking-actions">
                      <button className="btn btn-accent btn-sm" onClick={() => updateBooking(b._id, 'approved')}>
                        <HiOutlineCheck size={14} /> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateBooking(b._id, 'rejected')}>
                        <HiOutlineX size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <HiOutlineCalendar size={48} />
          <p>No bookings yet</p>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, updateUser, fetchUser }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '', city: user?.city || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put('/auth/change-password', passForm);
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    setSaving(false);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="dash-section-title">Edit Profile</h2>
      <form className="profile-form" onSubmit={handleProfile} id="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input type="text" className="form-input" value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" rows={3} value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div style={{ borderTop: '1px solid var(--border)', margin: 'var(--space-xl) 0', paddingTop: 'var(--space-xl)' }}>
        <h2 className="dash-section-title">Change Password</h2>
        <form className="profile-form" onSubmit={handlePassword} id="password-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passForm.currentPassword}
                onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passForm.newPassword}
                onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={saving}>
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
