import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineLocationMarker, HiOutlineHome, HiOutlineHeart, HiHeart,
  HiOutlineChatAlt2, HiOutlineCalendar, HiOutlineEye, HiOutlineStar,
  HiStar, HiOutlinePhone, HiOutlineMail, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlineShieldCheck, HiOutlineArrowLeft
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './PropertyDetail.css';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '10:00', notes: '' });

  useEffect(() => { fetchProperty(); fetchReviews(); }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/property/${id}`);
      setProperty(data);
      setIsFav(user?.favorites?.includes(data._id) || false);
    } catch {
      toast.error('Property not found');
      navigate('/properties');
    } finally { setLoading(false); }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/review/property/${id}`);
      setReviews(data.reviews || []);
      setReviewStats({ average: data.average, total: data.total });
    } catch { /* silent */ }
  };

  const toggleFav = async () => {
    if (!user) return toast.error('Please login to save favorites');
    try {
      await api.post(`/property/${id}/favorite`);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch { toast.error('Failed to update'); }
  };

  const startChat = async () => {
    if (!user) return toast.error('Please login to message the owner');
    try {
      const { data } = await api.post('/chat/start', {
        recipientId: property.owner._id, propertyId: property._id
      });
      navigate(`/chat/${data._id}`);
    } catch { toast.error('Failed to start conversation'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to submit a review');
    if (!reviewForm.comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await api.post('/review', { property: id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login');
    if (!bookingForm.date) return toast.error('Please select a date');
    setSubmitting(true);
    try {
      await api.post('/booking', {
        property: id, owner: property.owner._id,
        date: bookingForm.date, time: bookingForm.time, notes: bookingForm.notes
      });
      toast.success('Visit scheduled!');
      setShowBooking(false);
      setBookingForm({ date: '', time: '10:00', notes: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const fmt = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakh`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className="page"><LoadingSpinner text="Loading..." /></div>;
  if (!property) return null;

  const images = property.images?.length > 0 ? property.images
    : [`https://placehold.co/800x500/1a1b2e/6366f1?text=${encodeURIComponent(property.title?.slice(0, 20) || 'Property')}`];

  return (
    <div className="page detail-page">
      <div className="container">
        <button className="btn btn-ghost btn-sm mb-md" onClick={() => navigate(-1)}><HiOutlineArrowLeft /> Back</button>

        {/* Gallery */}
        <div className="detail-gallery animate-fadeIn">
          <div className="gallery-main">
            <img src={images[activeImg]} alt={property.title} className="gallery-img" />
            {images.length > 1 && (<>
              <button className="gallery-nav prev" onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}><HiOutlineChevronLeft size={24} /></button>
              <button className="gallery-nav next" onClick={() => setActiveImg(i => (i + 1) % images.length)}><HiOutlineChevronRight size={24} /></button>
              <div className="gallery-counter">{activeImg + 1} / {images.length}</div>
            </>)}
            <div className="gallery-badges">
              <span className="badge badge-primary">{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</span>
              {property.isVerified && <span className="badge badge-accent"><HiOutlineShieldCheck /> Verified</span>}
              {property.isFeatured && <span className="badge badge-gold">Featured</span>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`gallery-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            {/* Header */}
            <div className="detail-header animate-slideUp">
              <div>
                <h1 className="detail-title">{property.title}</h1>
                <p className="detail-location"><HiOutlineLocationMarker />{[property.locality, property.city, property.pincode].filter(Boolean).join(', ')}</p>
              </div>
              <div className="detail-price-section">
                <span className="detail-price">{fmt(property.price)}</span>
                {property.listingType === 'rent' && <span className="detail-per-month">/ month</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="detail-stats">
              {property.bhk > 0 && <div className="detail-stat"><span className="stat-value">{property.bhk}</span><span className="stat-key">BHK</span></div>}
              <div className="detail-stat"><span className="stat-value">{property.area}</span><span className="stat-key">{property.areaUnit || 'sqft'}</span></div>
              <div className="detail-stat"><span className="stat-value capitalize">{property.propertyType}</span><span className="stat-key">Type</span></div>
              <div className="detail-stat"><span className="stat-value capitalize">{property.furnishing || 'N/A'}</span><span className="stat-key">Furnishing</span></div>
              {property.floor > 0 && <div className="detail-stat"><span className="stat-value">{property.floor}/{property.totalFloors}</span><span className="stat-key">Floor</span></div>}
              <div className="detail-stat"><span className="stat-value"><HiOutlineEye /> {property.views}</span><span className="stat-key">Views</span></div>
            </div>

            {/* Description */}
            <div className="detail-section"><h2>Description</h2><p className="detail-desc">{property.description}</p></div>

            {/* Details Grid */}
            <div className="detail-section">
              <h2>Property Details</h2>
              <div className="details-grid">
                <div className="detail-item"><span className="detail-key">Type</span><span className="detail-val capitalize">{property.propertyType}</span></div>
                <div className="detail-item"><span className="detail-key">Listing</span><span className="detail-val capitalize">{property.listingType}</span></div>
                {property.bhk > 0 && <div className="detail-item"><span className="detail-key">BHK</span><span className="detail-val">{property.bhk}</span></div>}
                <div className="detail-item"><span className="detail-key">Area</span><span className="detail-val">{property.area} {property.areaUnit || 'sqft'}</span></div>
                <div className="detail-item"><span className="detail-key">Furnishing</span><span className="detail-val capitalize">{property.furnishing || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-key">Age</span><span className="detail-val capitalize">{property.ageOfProperty || 'New'}</span></div>
                <div className="detail-item"><span className="detail-key">Available</span><span className="detail-val">{fmtDate(property.availableFrom)}</span></div>
                <div className="detail-item"><span className="detail-key">City</span><span className="detail-val">{property.city}</span></div>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="detail-section"><h2>Amenities</h2>
                <div className="amenities-grid">{property.amenities.map((a, i) => <span key={i} className="amenity-tag">✓ {a}</span>)}</div>
              </div>
            )}

            {/* Reviews */}
            <div className="detail-section">
              <div className="reviews-header">
                <h2>Reviews</h2>
                {reviewStats.total > 0 && (
                  <div className="review-summary"><HiStar className="star-filled" /><span className="review-avg">{reviewStats.average}</span><span className="review-count">({reviewStats.total})</span></div>
                )}
              </div>
              {user && (
                <form className="review-form" onSubmit={submitReview}>
                  <div className="star-rating">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" className={`star-btn ${s <= reviewForm.rating ? 'active' : ''}`} onClick={() => setReviewForm({...reviewForm, rating: s})}>
                        {s <= reviewForm.rating ? <HiStar size={24} /> : <HiOutlineStar size={24} />}
                      </button>
                    ))}
                  </div>
                  <textarea className="form-textarea" placeholder="Write your review..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3} />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                </form>
              )}
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-card">
                      <div className="review-card-header">
                        <div className="review-user">
                          <div className="review-avatar"><span>{r.user?.name?.charAt(0)}</span></div>
                          <div><p className="review-name">{r.user?.name}</p><p className="review-date">{fmtDate(r.createdAt)}</p></div>
                        </div>
                        <div className="review-stars">{[1,2,3,4,5].map(s => <span key={s}>{s <= r.rating ? <HiStar className="star-filled" /> : <HiOutlineStar />}</span>)}</div>
                      </div>
                      <p className="review-text">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{color:'var(--text-muted)',marginTop:'var(--space-md)'}}>No reviews yet.</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-actions">
                <button className={`btn ${isFav?'btn-danger':'btn-secondary'} btn-lg sidebar-btn`} onClick={toggleFav}>{isFav?<HiHeart />:<HiOutlineHeart />}{isFav?'Saved':'Save'}</button>
                <button className="btn btn-primary btn-lg sidebar-btn" onClick={startChat}><HiOutlineChatAlt2 /> Contact Owner</button>
                <button className="btn btn-accent btn-lg sidebar-btn" onClick={()=>setShowBooking(!showBooking)}><HiOutlineCalendar /> Schedule Visit</button>
              </div>
              {showBooking && (
                <form className="booking-form animate-fadeIn" onSubmit={submitBooking}>
                  <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={bookingForm.date} onChange={e=>setBookingForm({...bookingForm,date:e.target.value})} min={new Date().toISOString().split('T')[0]} /></div>
                  <div className="form-group"><label className="form-label">Time</label>
                    <select className="form-select" value={bookingForm.time} onChange={e=>setBookingForm({...bookingForm,time:e.target.value})}>
                      {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'].map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={2} value={bookingForm.notes} onChange={e=>setBookingForm({...bookingForm,notes:e.target.value})} placeholder="Optional message..." /></div>
                  <button type="submit" className="btn btn-accent" disabled={submitting} style={{width:'100%'}}>{submitting?'Scheduling...':'Confirm Visit'}</button>
                </form>
              )}
            </div>
            {property.owner && (
              <div className="sidebar-card owner-card">
                <h3>Listed by</h3>
                <div className="owner-info">
                  <div className="owner-avatar"><span>{property.owner.name?.charAt(0)}</span></div>
                  <div><p className="owner-name">{property.owner.name}</p><span className="badge badge-primary">{property.owner.role}</span></div>
                </div>
                {property.owner.phone && <a href={`tel:${property.owner.phone}`} className="owner-contact"><HiOutlinePhone /> {property.owner.phone}</a>}
                {property.owner.email && <a href={`mailto:${property.owner.email}`} className="owner-contact"><HiOutlineMail /> {property.owner.email}</a>}
              </div>
            )}
            <div className="sidebar-card" style={{padding:'var(--space-md)'}}>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',textAlign:'center'}}>Listed on {fmtDate(property.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
