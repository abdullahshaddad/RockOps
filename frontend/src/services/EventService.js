// EventService.js - Handles API calls for event operations

const API_URL = "http://localhost:8080/api/v1/events";

/**
 * Fetches all events from the API
 * @returns {Promise<Array>} - Promise resolving to array of events
 */
export const fetchEvents = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const data = await response.json();

        // Convert eventTime to JavaScript Date object
        return data.map(event => ({
            ...event,
            date: new Date(event.eventTime),
        }));
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

/**
 * Creates a new event
 * @param {Object} eventData - Data for the event to create
 * @returns {Promise<Object>} - Promise resolving to created event
 */
export const createEvent = async (eventData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create event: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
};

/**
 * Cancels an event
 * @param {string} eventId - ID of the event to cancel
 * @returns {Promise<void>}
 */
export const cancelEvent = async (eventId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/${eventId}/cancel`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to cancel event: ${response.status}`);
        }
    } catch (error) {
        console.error("Error cancelling event:", error);
        throw error;
    }
};

/**
 * Reschedules a cancelled event
 * @param {string} eventId - ID of the event to reschedule
 * @returns {Promise<void>}
 */
export const rescheduleEvent = async (eventId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/${eventId}/reschedule`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to reschedule event: ${response.status}`);
        }
    } catch (error) {
        console.error("Error rescheduling event:", error);
        throw error;
    }
};