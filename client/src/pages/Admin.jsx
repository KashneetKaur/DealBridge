import { useState, useEffect } from 'react';
import {
  HiOutlineViewGrid, HiOutlineUsers, HiOutlineHome,
  HiOutlineCheck, HiOutlineX, HiOutlineStar, HiOutlineTrash,
  HiOutlineSearch, HiOutlineShieldCheck
} from 'react-icons/hi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './Admin.css';

export default function Admin() {
  const [tab, setTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineViewGrid size={18} /> },
    { id: 'users', label: 'Users', icon: <HiOutlineUsers size={18} /> },
    { id: 'properties', label: 'Properties', icon: <HiOutlineHome size={18} /> },
  ];

  return (
    <div className="page admin-page">
      <div className="container">
        <h1 className="admin-title animate-slideUp">Admin Dashboard</h1>
        <div className="tabs" style={{ marginBottom: 'var(--space-xl)' }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {tab === 'overview' && <AdminOverview />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'properties' && <AdminProperties />}
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch { toast.error('Failed to load stats'); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'var(--primary-light)' },
    { label: 'Total Properties', value: stats.totalProperties, color: 'var(--accent-light)' },
    { label: 'Pending Approval', value: stats.pendingProperties, color: 'var(--gold-light)' },
    { label: 'Approved', value: stats.approvedProperties, color: 'var(--accent-light)' },
    { label: 'Buyers', value: stats.userBreakdown?.buyers, color: 'var(--primary-light)' },
    { label: 'Sellers', value: stats.userBreakdown?.sellers, color: 'var(--accent-light)' },
    { label: 'Agents', value: stats.userBreakdown?.agents, color: 'var(--gold-light)' },
    { label: 'Total Leads', value: stats.totalLeads, color: 'var(--error-light)' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="admin-stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="admin-stat-card">
            <span className="admin-stat-num" style={{ color: c.color }}>{c.value}</span>
            <span className="admin-stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="admin-recents">
        <div className="admin-recent-card">
          <h3>Recent Users</h3>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {stats.recentUsers?.map(u => (
                <tr key={u._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-primary">{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-recent-card">
          <h3>Recent Properties</h3>
          <table className="data-table">
            <thead><tr><th>Title</th><th>City</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentProperties?.map(p => (
                <tr key={p._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.title?.slice(0, 30)}</td>
                  <td>{p.city}</td>
                  <td><span className={`badge badge-${p.status === 'approved' ? 'approved' : p.status === 'pending' ? 'pending' : 'rejected'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setPages(data.pages || 1);
    } catch { /* */ }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const updateUser = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-search">
          <HiOutlineSearch />
          <input type="text" className="form-input" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select className="form-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ width: 'auto', minWidth: 130 }}>
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select className="form-select" value={u.role} style={{ padding: '4px 28px 4px 8px', fontSize: '0.8rem', minWidth: 90 }}
                        onChange={e => updateUser(u._id, { role: e.target.value })}>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button className={`btn btn-ghost btn-sm ${u.verified ? 'text-accent' : ''}`}
                        onClick={() => updateUser(u._id, { verified: !u.verified })}
                        style={{ color: u.verified ? 'var(--accent)' : 'var(--text-muted)' }}>
                        <HiOutlineShieldCheck size={16} /> {u.verified ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteUser(u._id)}
                        style={{ color: 'var(--error)' }}>
                        <HiOutlineTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetchProps(); }, [page, statusFilter]);

  const fetchProps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/properties?${params}`);
      setProperties(data.properties || []);
      setPages(data.pages || 1);
    } catch { /* */ }
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProps(); };

  const approveProperty = async (id) => {
    try { await api.put(`/admin/properties/${id}/approve`); toast.success('Property approved'); fetchProps(); }
    catch { toast.error('Failed'); }
  };

  const rejectProperty = async (id) => {
    try { await api.put(`/admin/properties/${id}/reject`); toast.success('Property rejected'); fetchProps(); }
    catch { toast.error('Failed'); }
  };

  const toggleFeatured = async (id) => {
    try { await api.put(`/admin/properties/${id}/feature`); toast.success('Updated'); fetchProps(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-search">
          <HiOutlineSearch />
          <input type="text" className="form-input" placeholder="Search properties..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 'auto', minWidth: 130 }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Owner</th><th>City</th><th>Price</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p._id}>
                    <td><a href={`/property/${p._id}`} target="_blank" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {p.title?.slice(0, 35)}{p.title?.length > 35 ? '...' : ''}</a></td>
                    <td>{p.owner?.name || 'N/A'}</td>
                    <td>{p.city}</td>
                    <td>₹{p.price?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${p.status === 'approved' ? 'approved' : p.status === 'pending' ? 'pending' : 'rejected'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {p.status !== 'approved' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => approveProperty(p._id)}
                            title="Approve" style={{ color: 'var(--accent)' }}>
                            <HiOutlineCheck size={16} />
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => rejectProperty(p._id)}
                            title="Reject" style={{ color: 'var(--error)' }}>
                            <HiOutlineX size={16} />
                          </button>
                        )}
                        <button className={`btn btn-ghost btn-sm`} onClick={() => toggleFeatured(p._id)}
                          title="Toggle Featured" style={{ color: p.isFeatured ? 'var(--gold)' : 'var(--text-muted)' }}>
                          <HiOutlineStar size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
