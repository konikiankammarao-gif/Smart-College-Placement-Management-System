import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBell, IconCheckCircle, IconLogOut } from './Icons';
import api from '../services/api';

const Navbar = ({ pageTitle, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
      const countRes = await api.get('/notifications/unread-count');
      if (countRes.success) {
        setUnreadCount(countRes.count || 0);
      }
    } catch (err) {
      // Ignore notification fetch errors silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <button 
          className="nav-icon-btn" 
          onClick={toggleSidebar} 
          style={{ display: 'none' }} 
          id="sidebar-toggle"
          aria-label="Toggle navigation sidebar"
        >
          ☰
        </button>
        <h1 className="page-title-header">{pageTitle || 'Placement Portal'}</h1>
      </div>

      <div className="nav-right">
        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="nav-icon-btn" 
            onClick={() => setShowDropdown(!showDropdown)} 
            aria-label="View notifications"
          >
            <IconBell size={18} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '340px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 60,
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '14px' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '13px' }}>
                  No notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && handleMarkSingleRead(notif._id)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: notif.isRead ? '#f8fafc' : '#eef2ff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }}></span>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Pill & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {user?.name}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="nav-icon-btn"
            title="Sign Out"
            aria-label="Sign Out"
            style={{ width: '34px', height: '34px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
