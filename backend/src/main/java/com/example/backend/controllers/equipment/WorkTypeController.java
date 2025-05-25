package com.example.backend.controllers;

import com.example.backend.dto.WorkTypeDTO;
import com.example.backend.services.WorkTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class WorkTypeController {

    @Autowired
    private WorkTypeService workTypeService;

    @GetMapping("/worktypes")
    public ResponseEntity<List<WorkTypeDTO>> getAllWorkTypes() {
        return ResponseEntity.ok(workTypeService.getAllWorkTypes());
    }

    @GetMapping("/worktypes/{id}")
    public ResponseEntity<WorkTypeDTO> getWorkTypeById(@PathVariable UUID id) {
        return ResponseEntity.ok(workTypeService.getWorkTypeById(id));
    }

    @PostMapping("/worktypes")
    public ResponseEntity<WorkTypeDTO> createWorkType(@RequestBody WorkTypeDTO workTypeDTO) {
        return new ResponseEntity<>(workTypeService.createWorkType(workTypeDTO), HttpStatus.CREATED);
    }

    @PutMapping("/worktypes/{id}")
    public ResponseEntity<WorkTypeDTO> updateWorkType(@PathVariable UUID id, @RequestBody WorkTypeDTO workTypeDTO) {
        return ResponseEntity.ok(workTypeService.updateWorkType(id, workTypeDTO));
    }

    @DeleteMapping("/worktypes/{id}")
    public ResponseEntity<Void> deleteWorkType(@PathVariable UUID id) {
        workTypeService.deleteWorkType(id);
        return ResponseEntity.noContent().build();
    }
}