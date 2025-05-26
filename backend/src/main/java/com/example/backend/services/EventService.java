package com.example.backend.services;

import com.example.backend.models.Event;
import com.example.backend.repositories.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public Event addEvent(Event event) {

        if (event.getTitle() == null || event.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Event title cannot be null or empty.");
        }
        if (event.getEventTime() == null) {
            throw new IllegalArgumentException("Event time cannot be null.");
        }
        if(event.getDescription() == null || event.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be null or empty.");
        }

        return eventRepository.save(event);
    }

    public Event updateEvent(UUID id, Event eventDetails) {
        return eventRepository.findById(id).map(event -> {
            event.setTitle(eventDetails.getTitle());
            event.setDescription(eventDetails.getDescription());
            event.setEventTime(eventDetails.getEventTime());
            event.setLocation(eventDetails.getLocation());
            return eventRepository.save(event);
        }).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findByStatus(Event.EventStatus.SCHEDULED);
    }

    public void cancelEvent(UUID id) {
        eventRepository.findById(id).ifPresent(event -> {
            event.setStatus(Event.EventStatus.CANCELLED);
            eventRepository.save(event);
        });
    }
    public void rescheduleEvent(UUID id) {
        eventRepository.findById(id).ifPresent(event -> {
            event.setStatus(Event.EventStatus.SCHEDULED);
            eventRepository.save(event);
        });
    }
}
