import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePhotograph, HiOutlineX, HiOutlineCloudUpload } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import './AddProperty.css';

const PROPERTY_TYPES = ['flat', 'house', 'plot', 'villa', 'penthouse', 'commercial'];
const FURNISHING_TYPES = ['furnished', 'semi-furnished', 'unfurnished'];
const AMENITIES_LIST = [
  'Parking', 'Lift', 'Swimming Pool', 'Gym', 'Garden', 'Security',
  'Power Backup', 'Water Supply', 'Club House', 'Children Play Area',
  'Fire Safety', 'Intercom', 'Gas Pipeline', 'Rainwater Harvesting',
  'Visitor Parking', 'ATM', 'CCTV', 'Wi-Fi', 'AC', 'Balcony'
];

export default function AddProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: 'flat',
    listingType: 'sale', bhk: '', area: '', areaUnit: 'sqft',
    furnishing: 'unfurnished', city: '', locality: '', address: '',
    pincode: '', floor: '', totalFloors: '', ageOfProperty: 'new',
    amenities: [],
  });

  useEffect(() => {
    if (isEdit) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data } = await api.get(`/property/${id}`);
      setForm({
        title: data.title || '', description: data.description || '',
        price: data.price || '', propertyType: data.propertyType || 'flat',
        listingType: data.listingType || 'sale', bhk: data.bhk || '',
        area: data.area || '', areaUnit: data.areaUnit || 'sqft',
        furnishing: data.furnishing || 'unfurnished', city: data.city || '',
        locality: data.locality || '', address: data.address || '',
        pincode: data.pincode || '', floor: data.floor || '',
        totalFloors: data.totalFloors || '', ageOfProperty: data.ageOfProperty || 'new',
        amenities: data.amenities || [],
      });
      setExistingImages(data.images || []);
    } catch {
      toast.error('Property not found');
      navigate('/dashboard');
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 10) {
      return toast.error('Maximum 10 images allowed');
    }
    setImageFiles([...imageFiles, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImageFiles(imageFiles.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const toggleAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.area || !form.city) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'amenities') {
          formData.append(key, val.join(','));
        } else {
          formData.append(key, val);
        }
      });
      imageFiles.forEach(f => formData.append('images', f));
      if (isEdit) {
        await api.put(`/property/${id}`, form);
        toast.success('Property updated!');
      } else {
        await api.post('/property/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Property listed! It will be visible after admin approval.');
      }
      navigate('/dashboard?tab=listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page"><LoadingSpinner text="Loading property..." /></div>;

  return (
    <div className="page add-property-page">
      <div className="container">
        <div className="add-prop-header animate-slideUp">
          <h1>{isEdit ? 'Edit Property' : 'List New Property'}</h1>
          <p className="add-prop-subtitle">
            {isEdit ? 'Update your property details below' : 'Fill in the details to list your property on DealBridge'}
          </p>
        </div>

        <form className="add-prop-form" onSubmit={handleSubmit} id="add-property-form">
          {/* Basic Info */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-input" placeholder="e.g. Modern 3BHK Apartment in Andheri West"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} id="prop-title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" rows={4} placeholder="Describe your property in detail..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} id="prop-desc" />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input type="number" className="form-input" placeholder="e.g. 5000000"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} id="prop-price" />
              </div>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select className="form-select" value={form.propertyType}
                  onChange={e => setForm({ ...form, propertyType: e.target.value })}>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Listing Type</label>
                <select className="form-select" value={form.listingType}
                  onChange={e => setForm({ ...form, listingType: e.target.value })}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="form-section">
            <h2>Property Details</h2>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">BHK</label>
                <select className="form-select" value={form.bhk}
                  onChange={e => setForm({ ...form, bhk: e.target.value })}>
                  <option value="">N/A</option>
                  {[1,2,3,4,5,6].map(b => <option key={b} value={b}>{b} BHK</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Area *</label>
                <input type="number" className="form-input" placeholder="e.g. 1200"
                  value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Area Unit</label>
                <select className="form-select" value={form.areaUnit}
                  onChange={e => setForm({ ...form, areaUnit: e.target.value })}>
                  <option value="sqft">Sq. Ft.</option>
                  <option value="sqm">Sq. M.</option>
                  <option value="sqyd">Sq. Yd.</option>
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Furnishing</label>
                <select className="form-select" value={form.furnishing}
                  onChange={e => setForm({ ...form, furnishing: e.target.value })}>
                  {FURNISHING_TYPES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input type="number" className="form-input" placeholder="e.g. 5"
                  value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Floors</label>
                <input type="number" className="form-input" placeholder="e.g. 20"
                  value={form.totalFloors} onChange={e => setForm({ ...form, totalFloors: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Age of Property</label>
              <select className="form-select" value={form.ageOfProperty}
                onChange={e => setForm({ ...form, ageOfProperty: e.target.value })} style={{ maxWidth: 300 }}>
                <option value="new">New Construction</option>
                <option value="1-3 years">1-3 Years</option>
                <option value="3-5 years">3-5 Years</option>
                <option value="5-10 years">5-10 Years</option>
                <option value="10+ years">10+ Years</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h2>Location</h2>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" className="form-input" placeholder="e.g. Mumbai"
                  value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Locality</label>
                <input type="text" className="form-input" placeholder="e.g. Andheri West"
                  value={form.locality} onChange={e => setForm({ ...form, locality: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" className="form-input" placeholder="e.g. 400053"
                  value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input type="text" className="form-input" placeholder="Complete address..."
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h2>Amenities</h2>
            <div className="amenities-selector">
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button"
                  className={`amenity-chip ${form.amenities.includes(a) ? 'active' : ''}`}
                  onClick={() => toggleAmenity(a)}>
                  {form.amenities.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          {!isEdit && (
            <div className="form-section">
              <h2>Photos</h2>
              <div className="image-upload-area">
                <label className="upload-zone" htmlFor="image-upload">
                  <HiOutlineCloudUpload size={36} />
                  <p>Click to upload photos</p>
                  <span>Max 10 images • JPEG, PNG, WebP</span>
                </label>
                <input type="file" id="image-upload" multiple accept="image/*"
                  onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
              {previews.length > 0 && (
                <div className="image-previews">
                  {previews.map((p, i) => (
                    <div key={i} className="preview-item">
                      <img src={p} alt="" />
                      <button type="button" className="preview-remove" onClick={() => removeImage(i)}>
                        <HiOutlineX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="submit-property-btn">
              {loading ? 'Saving...' : isEdit ? 'Update Property' : 'List Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
