-- Host: localhost
-- Generation Time: Mar 08, 2020 at 12:34 AM
-- Server version: 10.4.11-MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myDB`
--
CREATE DATABASE IF NOT EXISTS `myDB` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `myDB`;

-- --------------------------------------------------------

--
-- Table structure for table `aided`
--

DROP TABLE IF EXISTS `aided`;
CREATE TABLE IF NOT EXISTS `aided` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `idAided` bigint(10) UNSIGNED NOT NULL,
  `present` tinyint(1) NOT NULL,
  `evaluation` int(2) NOT NULL DEFAULT 0,
  KEY `idAssistance` (`idAssistance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `aided`:
--   `idAssistance`
--       `assistance` -> `idAssistance`
--

-- --------------------------------------------------------

--
-- Table structure for table `assistance`
--

DROP TABLE IF EXISTS `assistance`;
CREATE TABLE IF NOT EXISTS `assistance` (
  `idAssistant` bigint(10) UNSIGNED NOT NULL,
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `assistanceName` varchar(200) NOT NULL,
  `numberParticipants` int(11) NOT NULL,
  `location` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `schedule` time(6) NOT NULL,
  `course` int(5) UNSIGNED NOT NULL,
  `active` tinyint(1) NOT NULL,
  KEY `idTutoring` (`idAssistance`),
  KEY `course` (`course`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `assistance`:
--   `idAssistance`
--       `user` -> `id`
--   `course`
--       `collegeSubject` -> `idSubject`
--

-- --------------------------------------------------------

--
-- Table structure for table `auxiliaryMonitor`
--

DROP TABLE IF EXISTS `auxiliaryMonitor`;
CREATE TABLE IF NOT EXISTS `auxiliaryMonitor` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `idAssistant` bigint(10) UNSIGNED NOT NULL,
  `present` tinyint(1) NOT NULL,
  `evaluation` int(2) NOT NULL DEFAULT 0,
  KEY `idAssistant` (`idAssistant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `auxiliaryMonitor`:
--   `idAssistant`
--       `user` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `collegeSubject`
--

DROP TABLE IF EXISTS `collegeSubject`;
CREATE TABLE IF NOT EXISTS `collegeSubject` (
  `idSubject` int(10) UNSIGNED NOT NULL,
  `nameSubject` varchar(50) NOT NULL,
  `idCourse` int(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`idSubject`),
  KEY `idCourse` (`idCourse`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `collegeSubject`:
--   `idCourse`
--       `course` -> `idCourse`
--

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
CREATE TABLE IF NOT EXISTS `course` (
  `idCourse` int(5) UNSIGNED NOT NULL,
  `nameCourse` varchar(30) NOT NULL,
  UNIQUE KEY `idCourse` (`idCourse`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `course`:
--

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
CREATE TABLE IF NOT EXISTS `tag` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `tagName` text NOT NULL,
  PRIMARY KEY (`idAssistance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `tag`:
--   `idAssistance`
--       `assistance` -> `idAssistance`
--

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `name` varchar(30) NOT NULL,
  `surname` varchar(40) NOT NULL,
  `iduffs` int(10) NOT NULL,
  `numAssistance` int(10) NOT NULL DEFAULT 0,
  `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `course` varchar(40) NOT NULL,
  `cpf` int(11) NOT NULL,
  `assistantEvaluation` int(1) NOT NULL DEFAULT 0,
  `studentEvaluation` int(1) NOT NULL DEFAULT 0,
  `currentCreatTime` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `iduffs` (`iduffs`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELATIONSHIPS FOR TABLE `user`:
--

--
-- Constraints for dumped tables
--

--
-- Constraints for table `aided`
--
ALTER TABLE `aided`
  ADD CONSTRAINT `aided_ibfk_1` FOREIGN KEY (`idAssistance`) REFERENCES `assistance` (`idAssistance`);

--
-- Constraints for table `assistance`
--
ALTER TABLE `assistance`
  ADD CONSTRAINT `assistance_ibfk_1` FOREIGN KEY (`idAssistance`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`course`) REFERENCES `collegeSubject` (`idSubject`);

--
-- Constraints for table `auxiliaryMonitor`
--
ALTER TABLE `auxiliaryMonitor`
  ADD CONSTRAINT `auxiliaryMonitor_ibfk_1` FOREIGN KEY (`idAssistant`) REFERENCES `user` (`id`);

--
-- Constraints for table `collegeSubject`
--
ALTER TABLE `collegeSubject`
  ADD CONSTRAINT `collegeSubject_ibfk_1` FOREIGN KEY (`idCourse`) REFERENCES `course` (`idCourse`);

--
-- Constraints for table `tag`
--
ALTER TABLE `tag`
  ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`idAssistance`) REFERENCES `assistance` (`idAssistance`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
