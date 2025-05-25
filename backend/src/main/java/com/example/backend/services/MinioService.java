package com.example.Rock4Mining.services;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    // Create bucket if it doesn't exist
    public void createBucket() throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    // Upload file
    public String uploadFile(MultipartFile file) throws Exception {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );
        return fileName;
    }

    // Download file
    public InputStream downloadFile(String fileName) throws Exception {
        return minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(fileName).build());
    }

    // Get file URL (for access)
    public String getFileUrl(String fileName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(fileName)
                        .expiry(7, TimeUnit.DAYS)
                        .build()
        );
    }

    @PostConstruct
    public void init() {
        try {
            createBucketIfNotExists(); // Ensure bucket exists on startup
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void createBucketIfNotExists() throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            System.out.println("✅ Bucket created: " + bucketName);
        } else {
            System.out.println("✅ Bucket already exists: " + bucketName);
        }
    }

    // Upload file with custom path/name
    public String uploadFile(MultipartFile file, String objectName) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );
        return objectName;
    }

    // Delete file
    public void deleteFile(String fileName) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );
    }

    //Equipment Methods

    public void createEquipmentBucket(UUID equipmentId) throws Exception {
        String bucketName = "equipment-" + equipmentId.toString(); // Ensure valid bucket name
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());

        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            System.out.println("Bucket created: " + bucketName);
        } else {
            System.out.println("Bucket already exists: " + bucketName);
        }
    }

    public String uploadEquipmentFile(UUID equipmentId, MultipartFile file, String fileName) throws Exception {
        String equipmentBucket = "equipment-" + equipmentId.toString();
        // Ensure bucket exists before uploading


        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(equipmentBucket)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        return fileName;
    }

    public String getEquipmentMainPhoto(UUID equipmentId) throws Exception {
        String equipmentBucket = "equipment-" + equipmentId.toString();

        // List objects in the bucket to find the "main image"
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder().bucket(equipmentBucket).build()
        );

        for (Result<Item> result : results) {
            Item item = result.get();
            if (item.objectName().contains("Main_Image")) { // Assuming naming convention
                return minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .method(Method.GET)
                                .bucket(equipmentBucket)
                                .object(item.objectName())
                                .expiry(7, TimeUnit.DAYS)
                                .build()
                );
            }
        }

        throw new Exception("Main image not found for equipment: " + equipmentId);
    }

    public void deleteEquipmentFile(UUID equipmentId, String fileName) throws Exception {
        String equipmentBucket = "equipment-" + equipmentId.toString();

        // List all objects in the bucket
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder().bucket(equipmentBucket).build()
        );

        String matchingFileName = null;

        // Find the file that contains the given fileName
        for (Result<Item> result : results) {
            String objectName = result.get().objectName();
            if (objectName.contains(fileName)) {
                matchingFileName = objectName;
                break; // Stop searching once we find a match
            }
        }

        if (matchingFileName != null) {
            // Delete the found file
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(equipmentBucket)
                            .object(matchingFileName)
                            .build()
            );
            System.out.println("File " + matchingFileName + " deleted successfully from bucket " + equipmentBucket);
        } else {
            System.out.println("File " + fileName + " not found in bucket " + equipmentBucket);
        }
    }

    public String getEquipmentFileUrl(UUID equipmentId, String documentPath) throws Exception {
        String equipmentBucket = "equipment-" + equipmentId.toString();

        // Check if bucket exists
        boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(equipmentBucket).build()
        );

        if (!bucketExists) {
            throw new Exception("Equipment bucket does not exist: " + equipmentBucket);
        }

        // Get the presigned URL for the file
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(equipmentBucket)
                        .object(documentPath)
                        .expiry(7, TimeUnit.DAYS)
                        .build()
        );
    }

    // NEW GENERIC DOCUMENT METHODS

    /**
     * Create a bucket if it does not exist for any entity type
     */
    public void createBucketIfNotExists(String bucketName) throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            System.out.println("Bucket created: " + bucketName);
        }
    }

    /**
     * Upload a file to any bucket
     */
    public void uploadFile(String bucketName, MultipartFile file, String fileName) throws Exception {
        // Ensure bucket exists
        createBucketIfNotExists(bucketName);

        // Upload file
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        System.out.println("File uploaded: " + fileName + " to bucket: " + bucketName);
    }

    /**
     * Get a file URL from any bucket
     */
    public String getFileUrl(String bucketName, String fileName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(fileName)
                        .expiry(7, TimeUnit.DAYS)
                        .build()
        );
    }

    /**
     * Delete a file from any bucket
     */
    public void deleteFile(String bucketName, String fileName) throws Exception {
        // First check if the file exists
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder().bucket(bucketName).build()
        );

        String matchingFileName = null;

        // Find the file that contains the given fileName
        for (Result<Item> result : results) {
            String objectName = result.get().objectName();
            if (objectName.contains(fileName)) {
                matchingFileName = objectName;
                break; // Stop searching once we find a match
            }
        }

        if (matchingFileName != null) {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(matchingFileName)
                            .build()
            );

            System.out.println("File deleted: " + matchingFileName + " from bucket: " + bucketName);
        } else {
            System.out.println("File not found: " + fileName + " in bucket: " + bucketName);
        }
    }

    /**
     * List all files in a bucket
     */
    public Iterable<Result<Item>> listFiles(String bucketName) throws Exception {
        boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
        );

        if (!bucketExists) {
            throw new Exception("Bucket does not exist: " + bucketName);
        }

        return minioClient.listObjects(
                ListObjectsArgs.builder().bucket(bucketName).build()
        );
    }

    /**
     * Create a bucket for any entity type
     */
    public void createEntityBucket(String entityType, UUID entityId) throws Exception {
        String bucketName = entityType.toLowerCase() + "-" + entityId.toString();
        createBucketIfNotExists(bucketName);
    }

    /**
     * Upload a file for any entity
     */
    public String uploadEntityFile(String entityType, UUID entityId, MultipartFile file, String fileName) throws Exception {
        String bucketName = entityType.toLowerCase() + "-" + entityId.toString();
        uploadFile(bucketName, file, fileName);
        return fileName;
    }

    /**
     * Get file URL for any entity
     */
    public String getEntityFileUrl(String entityType, UUID entityId, String fileName) throws Exception {
        String bucketName = entityType.toLowerCase() + "-" + entityId.toString();
        return getFileUrl(bucketName, fileName);
    }

    /**
     * Delete a file for any entity
     */
    public void deleteEntityFile(String entityType, UUID entityId, String fileName) throws Exception {
        String bucketName = entityType.toLowerCase() + "-" + entityId.toString();
        deleteFile(bucketName, fileName);
    }
}