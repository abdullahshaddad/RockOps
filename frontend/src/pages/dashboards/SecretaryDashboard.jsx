import React from 'react';
// import './SecretaryDashboard.scss';
import {FaCalendarAlt, FaSearch} from 'react-icons/fa';
// import Calendar from '../../Components/Calendars/Calendar';

export default class SecretaryDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'overview',
            notifications: [
                {id: 1, text: 'New document needs approval', time: '10 mins ago', isRead: false},
                {id: 2, text: 'Meeting with Team A at 3:00 PM', time: '1 hour ago', isRead: false},
                {id: 3, text: 'Call with Client XYZ scheduled', time: '2 hours ago', isRead: true},
                {id: 4, text: 'Document #2458 has been processed', time: '1 day ago', isRead: true},
            ],
            tasks: [
                {id: 1, text: 'Prepare meeting notes', deadline: 'Today, 5:00 PM', status: 'pending'},
                {id: 2, text: 'Send welcome package to new client', deadline: 'Tomorrow', status: 'pending'},
                {id: 3, text: 'Update contact database', deadline: '25 Apr', status: 'completed'},
                {id: 4, text: 'Review monthly expense report', deadline: '27 Apr', status: 'pending'},
                {id: 5, text: 'Order office supplies', deadline: '30 Apr', status: 'pending'},
            ],
            recentDocuments: [
                {id: 'DOC-2458', title: 'Contract Agreement', updated: '2 hours ago', type: 'pdf'},
                {id: 'DOC-2457', title: 'Meeting Minutes', updated: '1 day ago', type: 'docx'},
                {id: 'DOC-2456', title: 'Project Proposal', updated: '2 days ago', type: 'pptx'},
                {id: 'DOC-2455', title: 'Budget Report', updated: '3 days ago', type: 'xlsx'},
            ],
            upcomingEvents: [
                {id: 1, title: 'Team Meeting', date: 'Today, 3:00 PM', location: 'Conference Room A'},
                {id: 2, title: 'Client Call - ABC Corp', date: 'Tomorrow, 10:00 AM', location: 'Zoom'},
                {id: 3, title: 'Project Review', date: 'Apr 26, 2:00 PM', location: 'Meeting Room C'},
                {id: 4, title: 'Department Lunch', date: 'Apr 28, 12:30 PM', location: 'Cafeteria'},
            ],
            visitors: [
                {id: 1, name: 'John Smith', company: 'ABC Corp', time: '3:00 PM', status: 'confirmed'},
                {id: 2, name: 'Sarah Johnson', company: 'XYZ Inc', time: '4:30 PM', status: 'pending'},
            ],
        };
    }

    setActiveTab = (tab) => {
        this.setState({activeTab: tab});
    }

    markNotificationAsRead = (id) => {
        this.setState(prevState => ({
            notifications: prevState.notifications.map(notification =>
                notification.id === id ? {...notification, isRead: true} : notification
            )
        }));
    }

    toggleTaskStatus = (id) => {
        this.setState(prevState => ({
            tasks: prevState.tasks.map(task =>
                task.id === id ? {
                    ...task,
                    status: task.status === 'completed' ? 'pending' : 'completed'
                } : task
            )
        }));
    }

    render() {
        const {activeTab, notifications, tasks, recentDocuments, upcomingEvents, visitors} = this.state;

        return (

            <div className="secretary-dashboard">
                <div className="content">
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <h1>Welcome Back, Jane!</h1>
                            <p className="date">{new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>

                            <div className="widgets-container">
                                <div className="widget tasks-widget">
                                    <div className="widget-header">
                                        <h3>Tasks for Today</h3>
                                        <button>View All</button>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="tasks-list">
                                            {tasks.filter((_, index) => index < 3).map(task => (
                                                <li key={task.id}
                                                    className={task.status === 'completed' ? 'completed' : ''}>
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'completed'}
                                                        onChange={() => this.toggleTaskStatus(task.id)}
                                                    />
                                                    <div className="task-details">
                                                        <p>{task.text}</p>
                                                        <span className="deadline">{task.deadline}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="widget notifications-widget">
                                    <div className="widget-header">
                                        <h3>Recent Notifications</h3>
                                        <button>View All</button>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="notifications-list">
                                            {notifications.filter((_, index) => index < 3).map(notification => (
                                                <li
                                                    key={notification.id}
                                                    className={notification.isRead ? 'read' : 'unread'}
                                                    onClick={() => this.markNotificationAsRead(notification.id)}
                                                >
                                                    <div className="notification-content">
                                                        <p>{notification.text}</p>
                                                        <span className="notification-time">{notification.time}</span>
                                                    </div>
                                                    {!notification.isRead && <span className="unread-indicator"></span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="widget events-widget">
                                    <div className="widget-header">
                                        <h3>Upcoming Events</h3>
                                        <button>View Calendar</button>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="events-list">
                                            {upcomingEvents.filter((_, index) => index < 3).map(event => (
                                                <li key={event.id}>
                                                    <div className="event-icon">
                                                        <FaCalendarAlt/>
                                                    </div>
                                                    <div className="event-details">
                                                        <p className="event-title">{event.title}</p>
                                                        <div className="event-meta">
                                                            <span className="event-date">{event.date}</span>
                                                            <span className="event-location">{event.location}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="widget visitors-widget">
                                    <div className="widget-header">
                                        <h3>Today's Visitors</h3>
                                        <button>Manage</button>
                                    </div>
                                    <div className="widget-content">
                                        {visitors.length > 0 ? (
                                            <ul className="visitors-list">
                                                {visitors.map(visitor => (
                                                    <li key={visitor.id}>
                                                        <div className="visitor-avatar">
                                                            {visitor.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="visitor-details">
                                                            <p className="visitor-name">{visitor.name}</p>
                                                            <p className="visitor-company">{visitor.company}</p>
                                                            <div className="visitor-time">Expected
                                                                at: {visitor.time}</div>
                                                        </div>
                                                        <div className={`visitor-status ${visitor.status}`}>
                                                            {visitor.status}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="no-visitors">No visitors scheduled for today</p>
                                        )}
                                    </div>
                                </div>

                                <div className="widget documents-widget">
                                    <div className="widget-header">
                                        <h3>Recent Documents</h3>
                                        <button>View All</button>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="documents-list">
                                            {recentDocuments.filter((_, index) => index < 3).map(doc => (
                                                <li key={doc.id}>
                                                    <div className={`document-icon ${doc.type}`}>
                                                        {doc.type.toUpperCase()}
                                                    </div>
                                                    <div className="document-details">
                                                        <p className="document-title">{doc.title}</p>
                                                        <div className="document-meta">
                                                            <span className="document-id">{doc.id}</span>
                                                            <span
                                                                className="document-updated">Updated {doc.updated}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="calendar-tab">
                            <h2>Calendar</h2>
                            <Calendar/>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="documents-tab">
                            <h2>Documents</h2>
                            <div className="documents-controls">
                                <div className="search-documents">
                                    <FaSearch/>
                                    <input type="text" placeholder="Search documents..."/>
                                </div>
                                <div className="document-filters">
                                    <select>
                                        <option>All Types</option>
                                        <option>PDF</option>
                                        <option>Word</option>
                                        <option>Excel</option>
                                        <option>PowerPoint</option>
                                    </select>
                                    <select>
                                        <option>Last Modified</option>
                                        <option>Name A-Z</option>
                                        <option>Name Z-A</option>
                                        <option>Size</option>
                                    </select>
                                </div>
                                <button className="upload-btn">Upload Document</button>
                            </div>

                            <div className="documents-table">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Document Title</th>
                                        <th>Type</th>
                                        <th>Last Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentDocuments.map(doc => (
                                        <tr key={doc.id}>
                                            <td>{doc.id}</td>
                                            <td>{doc.title}</td>
                                            <td className="document-type">{doc.type.toUpperCase()}</td>
                                            <td>{doc.updated}</td>
                                            <td className="document-actions">
                                                <button className="view-btn">View</button>
                                                <button className="download-btn">Download</button>
                                                <button className="share-btn">Share</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="tasks-tab">
                            <h2>Tasks</h2>
                            <div className="tasks-controls">
                                <button className="add-task-btn">Add New Task</button>
                                <div className="task-filters">
                                    <button className="active">All</button>
                                    <button>Pending</button>
                                    <button>Completed</button>
                                </div>
                            </div>

                            <div className="tasks-table">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Task</th>
                                        <th>Deadline</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tasks.map(task => (
                                        <tr key={task.id}
                                            className={task.status === 'completed' ? 'completed-task' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={task.status === 'completed'}
                                                    onChange={() => this.toggleTaskStatus(task.id)}
                                                />
                                            </td>
                                            <td>{task.text}</td>
                                            <td>{task.deadline}</td>
                                            <td className="task-actions">
                                                <button className="edit-btn">Edit</button>
                                                <button className="delete-btn">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="notifications-tab">
                            <h2>Notifications</h2>
                            <div className="notifications-controls">
                                <button className="mark-all-read">Mark All as Read</button>
                                <div className="notification-filters">
                                    <button className="active">All</button>
                                    <button>Unread</button>
                                </div>
                            </div>

                            <ul className="notifications-full-list">
                                {notifications.map(notification => (
                                    <li
                                        key={notification.id}
                                        className={notification.isRead ? 'read' : 'unread'}
                                        onClick={() => this.markNotificationAsRead(notification.id)}
                                    >
                                        <div className="notification-content">
                                            <p>{notification.text}</p>
                                            <span className="notification-time">{notification.time}</span>
                                        </div>
                                        {!notification.isRead && <span className="unread-indicator"></span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}