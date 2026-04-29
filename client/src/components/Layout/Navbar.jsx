import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineBell, HiOutlineChatAlt2, HiOutlineHeart, HiOutlineLogout, HiOutlineUser, HiOutlineViewGrid, HiOutlinePlus } from 'react-icons/hi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" id="logo-link">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Deal<span className="logo-accent">Bridge</span></span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/properties" className={`nav-link ${isActive('/properties') ? 'active' : ''}`}>Properties</Link>
          {user && (user.role === 'seller' || user.role === 'agent' || user.role === 'admin') && (
            <Link to="/add-property" className={`nav-link ${isActive('/add-property') ? 'active' : ''}`}>
              <HiOutlinePlus size={16} /> List Property
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/chat" className="nav-action-btn" title="Messages" id="nav-chat-btn">
                <HiOutlineChatAlt2 size={20} />
              </Link>
              <Link to="/dashboard?tab=favorites" className="nav-action-btn" title="Favorites" id="nav-fav-btn">
                <HiOutlineHeart size={20} />
              </Link>

              <div className="profile-dropdown" ref={profileRef}>
                <button
                  className="profile-trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                  id="profile-menu-btn"
                >
                  <div className="profile-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>

                {profileOpen && (
                  <div className="profile-menu animate-fadeIn">
                    <div className="profile-menu-header">
                      <p className="profile-name">{user.name}</p>
                      <p className="profile-email">{user.email}</p>
                      <span className="badge badge-primary">{user.role}</span>
                    </div>
                    <div className="profile-menu-divider" />
                    <Link to="/dashboard" className="profile-menu-item" id="nav-dashboard">
                      <HiOutlineViewGrid size={18} /> Dashboard
                    </Link>
                    <Link to="/dashboard?tab=profile" className="profile-menu-item" id="nav-profile">
                      <HiOutlineUser size={18} /> Profile
                    </Link>
                    <div className="profile-menu-divider" />
                    <button className="profile-menu-item logout" onClick={handleLogout} id="nav-logout">
                      <HiOutlineLogout size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">Get Started</Link>
            </div>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
