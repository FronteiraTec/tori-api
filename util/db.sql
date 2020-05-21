-- Valentina Studio --
-- MySQL dump --
-- ---------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
-- ---------------------------------------------------------


-- DROP DATABASE "myDB" -------------------------------
DROP DATABASE IF EXISTS `myDB`;
-- ---------------------------------------------------------


-- CREATE DATABASE "myDB_test" -----------------------------
CREATE DATABASE `myDB` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `myDB`;
-- ---------------------------------------------------------


-- CREATE TABLE "subject" --------------------------------------
CREATE TABLE `subject`( 
	`subject_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`subject_name` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`subject_description` Text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`subject_code` VarChar( 50 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	PRIMARY KEY ( `subject_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 41;
-- -------------------------------------------------------------


-- CREATE TABLE "assistance_tag" -------------------------------
CREATE TABLE `assistance_tag`( 
	`assistances_tags_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`assistance_id` Int( 11 ) NOT NULL,
	`tag_id` Int( 11 ) NOT NULL,
	`created_at` Timestamp NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY ( `assistances_tags_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 302;
-- -------------------------------------------------------------


-- CREATE TABLE "tag" ------------------------------------------
CREATE TABLE `tag`( 
	`tag_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`tag_name` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`tag_description` MediumText CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`tag_created_at` Timestamp NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY ( `tag_id` ),
	CONSTRAINT `tag_name` UNIQUE( `tag_name` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 42;
-- -------------------------------------------------------------


-- CREATE TABLE "course" ---------------------------------------
CREATE TABLE `course`( 
	`course_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`course_name` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`courses_number_semesters` Int( 11 ) NULL DEFAULT NULL,
	`course_description` Text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	PRIMARY KEY ( `course_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 21;
-- -------------------------------------------------------------


-- CREATE TABLE "user" -----------------------------------------
CREATE TABLE `user`( 
	`user_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`user_full_name` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`user_created_at` Timestamp NOT NULL DEFAULT current_timestamp(),
	`user_is_assistant` TinyInt( 1 ) NOT NULL DEFAULT 0,
	`user_course_id` Int( 11 ) NOT NULL,
	`user_cpf` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`user_matricula` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`user_idUFFS` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`user_assistant_stars` Float( 12, 0 ) NOT NULL DEFAULT 10,
	`user_student_stars` Float( 12, 0 ) NOT NULL DEFAULT 10,
	`user_email` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`user_phone_number` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`user_password` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`user_verified_assistant` TinyInt( 1 ) NOT NULL DEFAULT 0,
	PRIMARY KEY ( `user_id` ),
	CONSTRAINT `user_cpf` UNIQUE( `user_cpf` ),
	CONSTRAINT `user_email` UNIQUE( `user_email` ),
	CONSTRAINT `user_idUFFS` UNIQUE( `user_idUFFS` ),
	CONSTRAINT `user_matricula` UNIQUE( `user_matricula` ),
	CONSTRAINT `user_phone_number` UNIQUE( `user_phone_number` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 20;
-- -------------------------------------------------------------


-- CREATE TABLE "assistance" -----------------------------------
CREATE TABLE `assistance`( 
	`assistance_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`assistance_owner_id` Int( 11 ) NOT NULL,
	`assistance_title` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`assistance_total_vacancies` Int( 11 ) NOT NULL,
	`assistance_avaliable` TinyInt( 1 ) NOT NULL,
	`assistance_avaliable_vacancies` Int( 10 ) UNSIGNED NOT NULL DEFAULT 0,
	`assistance_local_id` Int( 11 ) NOT NULL,
	`assistance_description` Text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`assistance_date` DateTime NOT NULL,
	`assistance_created_at` Timestamp NOT NULL DEFAULT current_timestamp(),
	`assistance_course_id` Int( 11 ) NULL DEFAULT NULL,
	`assistance_subject_id` Int( 11 ) NULL DEFAULT NULL,
	PRIMARY KEY ( `assistance_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 1001;
-- -------------------------------------------------------------


-- CREATE TABLE "address" --------------------------------------
CREATE TABLE `address`( 
	`address_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`address_cep` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`address_street` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`address_number` Int( 11 ) NOT NULL,
	`address_complement` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`address_reference` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
	`address_nickname` VarChar( 255 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	`address_latitude` Double( 22, 0 ) NULL DEFAULT NULL,
	`address_logintude` Double( 22, 0 ) NULL DEFAULT NULL,
	PRIMARY KEY ( `address_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 21;
-- -------------------------------------------------------------


-- CREATE TABLE "subject_course" -------------------------------
CREATE TABLE `subject_course`( 
	`course_id` Int( 11 ) NOT NULL,
	`subject_id` Int( 11 ) NOT NULL,
	`subject_course_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`subject_course_semester` Int( 11 ) NULL DEFAULT NULL,
	PRIMARY KEY ( `subject_course_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 1;
-- -------------------------------------------------------------


-- CREATE TABLE "presence_list" --------------------------------
CREATE TABLE `presence_list`( 
	`presence_list_id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`aided_student_id` Int( 11 ) NOT NULL,
	`presence_list_owner_id` Int( 11 ) NOT NULL,
	`assistance_id` Int( 11 ) NOT NULL,
	`presence_list_assistant_avaliation` Float( 12, 0 ) NOT NULL,
	`presence_list_aided_student_avaliation` Float( 12, 0 ) NOT NULL,
	`presence_list_aided_student_presence` TinyInt( 1 ) NOT NULL,
	PRIMARY KEY ( `presence_list_id`, `assistance_id` ) )
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 1;
-- -------------------------------------------------------------


-- CREATE INDEX "assistance_id" --------------------------------
CREATE INDEX `assistance_id` USING BTREE ON `assistance_tag`( `assistance_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "tag_id" ---------------------------------------
CREATE INDEX `tag_id` USING BTREE ON `assistance_tag`( `tag_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "user_course_id" -------------------------------
CREATE INDEX `user_course_id` USING BTREE ON `user`( `user_course_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "assistance_course_id" -------------------------
CREATE INDEX `assistance_course_id` USING BTREE ON `assistance`( `assistance_course_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "assistance_local_id" --------------------------
CREATE INDEX `assistance_local_id` USING BTREE ON `assistance`( `assistance_local_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "assistance_owner_id" --------------------------
CREATE INDEX `assistance_owner_id` USING BTREE ON `assistance`( `assistance_owner_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "assistance_subject_id" ------------------------
CREATE INDEX `assistance_subject_id` USING BTREE ON `assistance`( `assistance_subject_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "course_id" ------------------------------------
CREATE INDEX `course_id` USING BTREE ON `subject_course`( `course_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "subject_id" -----------------------------------
CREATE INDEX `subject_id` USING BTREE ON `subject_course`( `subject_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "aided_student_id" -----------------------------
CREATE INDEX `aided_student_id` USING BTREE ON `presence_list`( `aided_student_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "assistance_id" --------------------------------
CREATE INDEX `assistance_id` USING BTREE ON `presence_list`( `assistance_id` );
-- -------------------------------------------------------------


-- CREATE INDEX "presence_list_owner_id" -----------------------
CREATE INDEX `presence_list_owner_id` USING BTREE ON `presence_list`( `presence_list_owner_id` );
-- -------------------------------------------------------------


-- CREATE LINK "assistance_tag_ibfk_1" -------------------------
ALTER TABLE `assistance_tag`
	ADD CONSTRAINT `assistance_tag_ibfk_1` FOREIGN KEY ( `assistance_id` )
	REFERENCES `assistance`( `assistance_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "assistance_tag_ibfk_2" -------------------------
ALTER TABLE `assistance_tag`
	ADD CONSTRAINT `assistance_tag_ibfk_2` FOREIGN KEY ( `tag_id` )
	REFERENCES `tag`( `tag_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "user_ibfk_1" -----------------------------------
ALTER TABLE `user`
	ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY ( `user_course_id` )
	REFERENCES `course`( `course_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "assistance_ibfk_1" -----------------------------
ALTER TABLE `assistance`
	ADD CONSTRAINT `assistance_ibfk_1` FOREIGN KEY ( `assistance_local_id` )
	REFERENCES `address`( `address_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "assistance_ibfk_2" -----------------------------
ALTER TABLE `assistance`
	ADD CONSTRAINT `assistance_ibfk_2` FOREIGN KEY ( `assistance_owner_id` )
	REFERENCES `user`( `user_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "assistance_ibfk_3" -----------------------------
ALTER TABLE `assistance`
	ADD CONSTRAINT `assistance_ibfk_3` FOREIGN KEY ( `assistance_course_id` )
	REFERENCES `course`( `course_id` )
	ON DELETE Restrict
	ON UPDATE Set NULL;
-- -------------------------------------------------------------


-- CREATE LINK "assistance_ibfk_4" -----------------------------
ALTER TABLE `assistance`
	ADD CONSTRAINT `assistance_ibfk_4` FOREIGN KEY ( `assistance_subject_id` )
	REFERENCES `subject`( `subject_id` )
	ON DELETE Restrict
	ON UPDATE Set NULL;
-- -------------------------------------------------------------


-- CREATE LINK "subject_course_ibfk_1" -------------------------
ALTER TABLE `subject_course`
	ADD CONSTRAINT `subject_course_ibfk_1` FOREIGN KEY ( `course_id` )
	REFERENCES `course`( `course_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "subject_course_ibfk_2" -------------------------
ALTER TABLE `subject_course`
	ADD CONSTRAINT `subject_course_ibfk_2` FOREIGN KEY ( `subject_id` )
	REFERENCES `subject`( `subject_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "presence_list_ibfk_1" --------------------------
ALTER TABLE `presence_list`
	ADD CONSTRAINT `presence_list_ibfk_1` FOREIGN KEY ( `aided_student_id` )
	REFERENCES `user`( `user_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "presence_list_ibfk_2" --------------------------
ALTER TABLE `presence_list`
	ADD CONSTRAINT `presence_list_ibfk_2` FOREIGN KEY ( `presence_list_owner_id` )
	REFERENCES `user`( `user_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


-- CREATE LINK "presence_list_ibfk_3" --------------------------
ALTER TABLE `presence_list`
	ADD CONSTRAINT `presence_list_ibfk_3` FOREIGN KEY ( `assistance_id` )
	REFERENCES `assistance`( `assistance_id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
-- ---------------------------------------------------------


