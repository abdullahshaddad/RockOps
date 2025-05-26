package com.example.backend.controllers;//package com.example.Rock4Mining.controllers;
//
//
//import com.example.Rock4Mining.models.PartyType;
//import com.example.Rock4Mining.models.WarehouseTransaction;
//import com.example.Rock4Mining.services.WarehouseTransactionService;
//import jakarta.persistence.Column;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//
//@RequestMapping("/api/v1/warehouseTransactions")
//@CrossOrigin(origins = "*")
//@RestController
//public class WarehouseTransactionController {
//
//    @Autowired
//    private WarehouseTransactionService warehouseTransactionService;
//
//
//    @GetMapping
//    public List<WarehouseTransaction> getAllTransactions() {
//        return warehouseTransactionService.getAllTransactions();
//    }
//
//    @GetMapping("/warehouse/{warehouseId}")
//    public List<WarehouseTransaction> getTransactionsByWarehouse(@PathVariable UUID warehouseId) {
//        return warehouseTransactionService.getTransactionsByWarehouseId(warehouseId);
//    }
//
//
//    // POST request to add a new WarehouseTransaction
////    @PostMapping("/{warehouseId}")
////    public ResponseEntity<WarehouseTransaction> addTransaction(
////            @PathVariable UUID warehouseId,
////            @RequestBody Map<String, Object> requestBody) {
////        try {
////            WarehouseTransaction transaction = warehouseTransactionService.addTransaction(warehouseId, requestBody);
////            return new ResponseEntity<>(transaction, HttpStatus.CREATED);
////        } catch (RuntimeException e) {
////            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
////        }
////    }
//
//    @DeleteMapping("/{transactionId}")
//    public ResponseEntity<String> deleteTransaction(@PathVariable UUID transactionId) {
//        warehouseTransactionService.deleteTransaction(transactionId);
//        return ResponseEntity.ok("Transaction deleted successfully.");
//    }
//
//    @PostMapping("/send/{warehouseId}")
//    public ResponseEntity<WarehouseTransaction> sendTransaction(
//            @PathVariable UUID warehouseId,
//            @RequestBody Map<String, Object> request) {
//
//        WarehouseTransaction transaction = warehouseTransactionService.sendTransactionFromWarehouse(
//                warehouseId,
//                PartyType.valueOf((String) request.get("receiverType")),
//                UUID.fromString((String) request.get("receiverId")),
//                UUID.fromString((String) request.get("itemTypeId")),
//                (int) request.get("quantity"),
//                LocalDateTime.parse((String) request.get("transactionDate")),
//                (String) request.get("username")
//        );
//
//        return ResponseEntity.ok(transaction);
//    }
//
//    @PostMapping("/receive/{warehouseId}")
//    public ResponseEntity<WarehouseTransaction> receiveTransaction(
//            @PathVariable UUID warehouseId,
//            @RequestBody Map<String, Object> request) {
//
//        WarehouseTransaction transaction = warehouseTransactionService.receiveTransactionToWarehouse(
//                PartyType.valueOf((String) request.get("senderType")),
//                UUID.fromString((String) request.get("senderId")),
//                warehouseId,
//                UUID.fromString((String) request.get("itemTypeId")),
//                (int) request.get("quantity"),
//                LocalDateTime.parse((String) request.get("transactionDate")),
//                (String) request.get("username")
//        );
//
//        return ResponseEntity.ok(transaction);
//    }
//
//}
