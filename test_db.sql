-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 19, 2026 at 04:52 PM
-- Server version: 8.0.17
-- PHP Version: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('paid','unpaid') DEFAULT 'paid'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `access_level` enum('admin','manager','employee','visitor') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'employee',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `access_level`, `status`, `created_at`, `last_login_at`, `profile_image`) VALUES
(1, 'admin', 'nattapoom3409@gmail.com', '$2b$10$qN/cESKvKVanWuvjztqoj.Gxs51vO/igRsvNlTHImfvdJlpyY/pOK', 'Nattapoom', 'Kathongthung', 'admin', 'active', '2026-03-04 11:27:19', '2026-03-17 17:33:20', '1773768731057.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `plate_number` varchar(50) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `vehicle_type_id` int(11) DEFAULT NULL,
  `owner_name` varchar(150) DEFAULT NULL,
  `owner_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `current_status` enum('parked','checked_out','maintenance','overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'parked',
  `current_slot_id` int(11) DEFAULT NULL,
  `maintenance_reason` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_movements`
--

CREATE TABLE `vehicle_movements` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `slot_id` int(11) DEFAULT NULL,
  `handled_by` int(11) DEFAULT NULL,
  `movement_type` enum('check_in','check_out','move_slot') DEFAULT NULL,
  `movement_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `checkout_price` decimal(10,2) DEFAULT NULL,
  `expected_checkout_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `type_name`) VALUES
(1, 'Sedan'),
(2, 'SUV'),
(3, 'Truck');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_slots`
--

CREATE TABLE `warehouse_slots` (
  `id` int(11) NOT NULL,
  `slot_code` varchar(50) NOT NULL,
  `zone` varchar(50) DEFAULT NULL,
  `status` enum('available','occupied') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `warehouse_slots`
--

INSERT INTO `warehouse_slots` (`id`, `slot_code`, `zone`, `status`) VALUES
(1, 'A1', 'A', 'occupied'),
(2, 'A2', 'A', 'available'),
(3, 'A3', 'A', 'available'),
(4, 'A4', 'A', 'available'),
(5, 'A5', 'A', 'available'),
(6, 'B1', 'B', 'available'),
(7, 'B2', 'B', 'available'),
(8, 'B3', 'B', 'available'),
(9, 'B4', 'B', 'available'),
(10, 'B5', 'B', 'available'),
(11, 'C1', 'C', 'available'),
(12, 'C2', 'C', 'available'),
(13, 'C3', 'C', 'available'),
(14, 'C4', 'C', 'available'),
(15, 'C5', 'C', 'available');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plate_number` (`plate_number`),
  ADD KEY `vehicle_type_id` (`vehicle_type_id`),
  ADD KEY `fk_current_slot` (`current_slot_id`);

--
-- Indexes for table `vehicle_movements`
--
ALTER TABLE `vehicle_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `slot_id` (`slot_id`),
  ADD KEY `handled_by` (`handled_by`);

--
-- Indexes for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `warehouse_slots`
--
ALTER TABLE `warehouse_slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slot_code` (`slot_code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vehicle_movements`
--
ALTER TABLE `vehicle_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `warehouse_slots`
--
ALTER TABLE `warehouse_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `fk_current_slot` FOREIGN KEY (`current_slot_id`) REFERENCES `warehouse_slots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `vehicle_movements`
--
ALTER TABLE `vehicle_movements`
  ADD CONSTRAINT `vehicle_movements_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vehicle_movements_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `warehouse_slots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `vehicle_movements_ibfk_3` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
