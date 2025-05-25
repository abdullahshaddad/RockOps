package com.example.Rock4Mining.controllers;

import com.example.Rock4Mining.models.Event;
import com.example.Rock4Mining.services.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<Event> addEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.addEvent(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable UUID id, @RequestBody Event eventDetails) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDetails));
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelEvent(@PathVariable UUID id) {
        eventService.cancelEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Void> rescheduleEvent(@PathVariable UUID id) {
        eventService.rescheduleEvent(id);
        return ResponseEntity.noContent().build();
    }


}
