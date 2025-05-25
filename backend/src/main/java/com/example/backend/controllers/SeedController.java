//package com.example.Rock4Mining.controllers;
//
//import com.example.Rock4Mining.services.SeedService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/v1/seed")
//public class SeedController {
//
//    @Autowired
//    private SeedService seedService;
//
//    @GetMapping()
//    public String populateDatabase() {
//        try {
//            seedService.seedDatabase();
//            return "Database seeded successfully!";
//        } catch (Exception e) {
//            e.printStackTrace();
//            return "Error: " + e.getMessage();
//        }
//    }
//
//}
