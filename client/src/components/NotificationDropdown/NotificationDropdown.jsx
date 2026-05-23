import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        onClose();
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>
            
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif._id} 
                            className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notif)}
                        >
                            <div className="notification-content">
                                <h4>{notif.title}</h4>
                                <p>{notif.message}</p>
                                <span className="notification-time">{formatTime(notif.createdAt)}</span>
                            </div>
                            {!notif.isRead && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
