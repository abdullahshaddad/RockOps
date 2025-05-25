package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByStatus(Event.EventStatus status);
}
