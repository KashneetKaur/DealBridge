import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineLocationMarker, HiOutlineHome } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import './PropertyCard.css';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(user?.favorites?.includes(property._id) || false);

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Please login to save favorites');
    try {
      const { data } = await api.post(`/property/${property._id}/favorite`);
      setIsFav(!isFav);
      if (onFavoriteToggle) onFavoriteToggle(data.favorites);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const img = property.images?.[0]
    ? property.images[0]
    : `https://placehold.co/400x250/1a1b2e/6366f1?text=${encodeURIComponent(property.title?.slice(0, 15) || 'Property')}`;

  return (
    <Link to={`/property/${property._id}`} className="property-card card" id={`property-${property._id}`}>
      <div className="pc-image-wrap">
        <img src={img} alt={property.title} className="pc-image" loading="lazy" />
        <div className="pc-badges">
          <span className="badge badge-primary">{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</span>
          {property.isFeatured && <span className="badge badge-gold">Featured</span>}
        </div>
        <button className={`pc-fav-btn ${isFav ? 'active' : ''}`} onClick={toggleFav} title="Toggle favorite">
          {isFav ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
        </button>
      </div>
      <div className="pc-body">
        <div className="pc-price">{formatPrice(property.price)}{property.listingType === 'rent' ? '/mo' : ''}</div>
        <h3 className="pc-title">{property.title}</h3>
        <p className="pc-location"><HiOutlineLocationMarker /> {property.locality ? `${property.locality}, ` : ''}{property.city}</p>
        <div className="pc-details">
          <span><HiOutlineHome /> {property.propertyType}</span>
          {property.bhk > 0 && <span>{property.bhk} BHK</span>}
          <span>{property.area} {property.areaUnit || 'sqft'}</span>
          {property.furnishing && <span>{property.furnishing}</span>}
        </div>
      </div>
    </Link>
  );
}
