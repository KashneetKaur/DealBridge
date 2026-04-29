import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">⬡</span>
              <span className="logo-text">Deal<span className="logo-accent">Bridge</span></span>
            </Link>
            <p className="footer-desc">
              Premium real estate marketplace connecting buyers, sellers, and agents. Find your dream property today.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/properties">Browse Properties</Link>
            <Link to="/properties?listingType=sale">Buy</Link>
            <Link to="/properties?listingType=rent">Rent</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Contact</Link>
            <Link to="/">Careers</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/">Help Center</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DealBridge. Made with <HiOutlineHeart className="heart-icon" /> All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
