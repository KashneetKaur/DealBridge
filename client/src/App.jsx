import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import AddProperty from './pages/AddProperty';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="properties" element={<Properties />} />
        <Route path="property/:id" element={<PropertyDetail />} />
        <Route
          path="add-property"
          element={
            <ProtectedRoute roles={['seller', 'agent', 'admin']}>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit-property/:id"
          element={
            <ProtectedRoute roles={['seller', 'agent', 'admin']}>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat/:id"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
