CREATE DATABASE  IF NOT EXISTS `marketplace` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `marketplace`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: marketplace
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `admin_role` enum('Super admin','Moderator') NOT NULL,
  PRIMARY KEY (`admin_id`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`admin_id`) REFERENCES `user_parent` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'Super admin'),(2,'Moderator');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Electronics'),(2,'Textbooks'),(3,'Furniture'),(4,'Stationery');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ekyc_verification`
--

DROP TABLE IF EXISTS `ekyc_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ekyc_verification` (
  `verification_id` int NOT NULL AUTO_INCREMENT,
  `regular_id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `document_url` varchar(255) NOT NULL,
  `verification_status` enum('Pending','Verified','Rejected') NOT NULL DEFAULT 'Pending',
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`verification_id`),
  KEY `fk_ekyc_user` (`regular_id`),
  KEY `fk_ekyc_admin` (`admin_id`),
  KEY `fk_ekyc_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_ekyc_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ekyc_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `admin` (`admin_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ekyc_user` FOREIGN KEY (`regular_id`) REFERENCES `regular` (`regular_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ekyc_verification`
--

LOCK TABLES `ekyc_verification` WRITE;
/*!40000 ALTER TABLE `ekyc_verification` DISABLE KEYS */;
INSERT INTO `ekyc_verification` VALUES (1,1,NULL,NULL,'','Pending','2026-11-02 20:49:23',NULL),(2,2,NULL,NULL,'','Pending','2026-11-02 20:56:29',NULL),(3,3,NULL,NULL,'','Pending','2026-11-02 21:03:11',NULL),(4,4,NULL,NULL,'','Pending','2026-11-02 21:29:10',NULL),(5,5,NULL,NULL,'','Pending','2026-11-02 21:42:34',NULL),(6,6,NULL,NULL,'','Pending','2026-11-02 21:44:35',NULL);
/*!40000 ALTER TABLE `ekyc_verification` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ekyc_sync_user_status` AFTER UPDATE ON `ekyc_verification` FOR EACH ROW BEGIN
  IF NEW.verification_status IN ('Verified', 'Rejected')
     AND NEW.verification_status <> OLD.verification_status
     AND NEW.admin_id IS NOT NULL THEN
    UPDATE user_parent u
    JOIN regular r ON r.regular_id = u.id
    SET u.eKYC_status = NEW.verification_status
    WHERE r.regular_id = NEW.regular_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `listing`
--

DROP TABLE IF EXISTS `listing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing` (
  `listing_id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` varchar(150) NOT NULL,
  `price` decimal(10,2) unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `listing_condition` enum('Brand new','Used','Refurbished') DEFAULT NULL,
  `listing_status` enum('Active','Inactive','Sold','Removed','Deactivated') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`listing_id`),
  KEY `fk_seller_user` (`seller_id`),
  KEY `fk_category_id_category` (`category_id`),
  CONSTRAINT `fk_category_id_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_seller_user` FOREIGN KEY (`seller_id`) REFERENCES `user_parent` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_quantity_min` CHECK ((`quantity` >= 1))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing`
--

LOCK TABLES `listing` WRITE;
/*!40000 ALTER TABLE `listing` DISABLE KEYS */;
INSERT INTO `listing` VALUES (1,3,1,'Keyboard','keychron mechanical keyboard',4999.00,1,'Brand new','Active','2026-11-02 21:16:54','2026-11-02 21:16:54'),(2,3,2,'Textbook','secondhand principle of economics textbook',389.00,1,'Used','Active','2026-11-02 21:18:39','2026-11-02 21:18:39'),(3,2,1,'Scientific Calculator','casio scientific calculator',1299.00,1,'Brand new','Active','2026-11-02 21:19:42','2026-11-02 21:19:42'),(4,1,1,'Gaming Notebook','secondhand ROG notebook',33999.00,1,'Used','Active','2026-11-02 21:21:36','2026-11-02 21:21:36');
/*!40000 ALTER TABLE `listing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_image`
--

DROP TABLE IF EXISTS `listing_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_image` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary_image` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`image_id`,`listing_id`),
  UNIQUE KEY `uq_listing_image_url` (`listing_id`,`image_url`),
  CONSTRAINT `fk_listing_image_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_image`
--

LOCK TABLES `listing_image` WRITE;
/*!40000 ALTER TABLE `listing_image` DISABLE KEYS */;
INSERT INTO `listing_image` VALUES (18,1,'/uploads/1793629014053-809547148-The-Keychron-K1-Keyboard-Feels-More-Real-_-WERD.jpg',1),(19,2,'/uploads/1793629119027-945160790-a6dadba6868c5161b47b12cb30c14b70.jpg',1),(20,3,'/uploads/1793629182617-503327577-40acd683f3cc3fc9318c9da759b6aa81.jpg',1),(21,4,'/uploads/1793629296692-590420353-4cc8726a66e4ca90b7012fd1dba043b6.jpg',1);
/*!40000 ALTER TABLE `listing_image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regular`
--

DROP TABLE IF EXISTS `regular`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regular` (
  `regular_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`regular_id`),
  CONSTRAINT `fk_regular_user` FOREIGN KEY (`regular_id`) REFERENCES `user_parent` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regular`
--

LOCK TABLES `regular` WRITE;
/*!40000 ALTER TABLE `regular` DISABLE KEYS */;
INSERT INTO `regular` VALUES (1),(2),(3),(4),(5),(6);
/*!40000 ALTER TABLE `regular` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `session_id` varchar(64) NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('Regular','Admin') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `fk_session_user` (`user_id`),
  KEY `idx_session_expires` (`expires_at`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `user_parent` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES ('10f1cdde284521bea8ce0a47a8f9661b30fdc7415f3b6eb8694231db0bb93e12',1,'Admin','2026-11-02 21:32:25','2026-11-03 14:32:25'),('bd5859d99fecda1bb2b96b2f02686ffdcdb5c868d69afc1d634e5be5e00944b6',2,'Admin','2026-11-02 21:00:48','2026-11-03 14:00:48');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_parent`
--

DROP TABLE IF EXISTS `user_parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_parent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `faculty` varchar(100) NOT NULL,
  `campus` enum('Rangsit Center','SIIT Bangkradi Campus','Tha Prachan Campu','Lampang Center','Pattaya Center') NOT NULL,
  `eKYC_status` enum('Pending','Verified','Rejected') NOT NULL,
  `avg_rating` decimal(2,1) NOT NULL DEFAULT '0.0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_student_id` (`student_id`),
  UNIQUE KEY `uq_user_username` (`username`),
  UNIQUE KEY `uq_user_phone_number` (`phone_number`),
  UNIQUE KEY `uq_user_email` (`email`),
  CONSTRAINT `chk_avg_rating` CHECK ((`avg_rating` between 0.0 and 5.0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_parent`
--

LOCK TABLES `user_parent` WRITE;
/*!40000 ALTER TABLE `user_parent` DISABLE KEYS */;
INSERT INTO `user_parent` VALUES (1,6700000001,'admin_dev','$2b$10$MKgj8FOVO6srpFDwQyeWnO/f1F0RLKYbGNZ7hPv.ew19QSsn6ID6O','admin_dev','0800000000','admin_dev@dome.tu.ac.th','SIIT','Rangsit Center','Pending',0.0,'2026-11-02 20:49:23'),(2,6700000002,'admin','$2b$10$IWJiA82T5oBptSZSdshpwunDUYGouCkG9BZFeZhWV3StHRFcrqjPW','admin','0811111111','admin@dome.tu.ac.th','SIIT','SIIT Bangkradi Campus','Pending',0.0,'2026-11-02 20:56:29'),(3,6700000003,'user01','$2b$10$B6l25E1ukGlm/VXFpaY8bOFCIYHqrcyzDl5uxX/VSTQK6PBhuluhC','user01','0822222222','user01@dome.tu.ac.th','Engineering','Rangsit Center','Pending',0.0,'2026-11-02 21:03:11'),(4,6700000004,'user02','$2b$10$Hs7Cuhzva1vZmsT4diz16OaahEZk7d85efpPEV0eewyyNeCC42ARe','user02','0833333333','user02@dome.tu.ac.th','Journalism','Rangsit Center','Pending',0.0,'2026-11-02 21:29:10'),(5,6700000005,'user03','$2b$10$g09L74NDxYxxPhjIuSnNTuSUtGpTc4MTlOcF/byJUTt7ZC40ZEYkm','user03','0844444444','user03@dome.tu.ac.th','Education','Rangsit Center','Pending',0.0,'2026-11-02 21:42:34'),(6,6700000006,'user04','$2b$10$r.Gg1A.PrphqfCwrchPmSu7C4WkN9uQxqyaQ7CY7kCFUs/881XQHC','user04','0855555555','user04@dome.tu.ac.th','Science','Rangsit Center','Pending',0.0,'2026-11-02 21:44:35');
/*!40000 ALTER TABLE `user_parent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'marketplace'
--
/*!50003 DROP PROCEDURE IF EXISTS `process_ekyc_review` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `process_ekyc_review`(
  IN p_session_id VARCHAR(64),
  IN p_verification_id INT,
  IN p_new_status VARCHAR(20)
)
BEGIN
  DECLARE v_admin_id INT DEFAULT NULL;
  DECLARE v_regular_id INT DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  DECLARE CONTINUE HANDLER FOR NOT FOUND
    SET v_regular_id = NULL;

  IF p_new_status IS NULL OR p_new_status NOT IN ('Verified', 'Rejected') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Review status must be Verified or Rejected.';
  END IF;

  START TRANSACTION;

  SELECT s.user_id
    INTO v_admin_id
  FROM session s
  JOIN admin a ON a.admin_id = s.user_id
  WHERE s.session_id = p_session_id
    AND s.role = 'Admin'
    AND s.expires_at > NOW()
  LIMIT 1
  FOR UPDATE;

  IF v_admin_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An active admin session is required.';
  END IF;

  SELECT e.regular_id
    INTO v_regular_id
  FROM ekyc_verification e
  WHERE e.verification_id = p_verification_id
    AND e.verification_status = 'Pending'
  FOR UPDATE;

  IF v_regular_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pending eKYC request was not found.';
  END IF;

  UPDATE ekyc_verification
  SET verification_status = p_new_status,
      resolved_at = NOW(),
      reviewed_by = v_admin_id,
      admin_id = v_admin_id
  WHERE verification_id = p_verification_id
    AND verification_status = 'Pending';

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'eKYC request could not be reviewed.';
  END IF;

  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-02 21:53:05
