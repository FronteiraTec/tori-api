-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 20/03/2020 às 23:35
-- Versão do servidor: 10.4.11-MariaDB
-- Versão do PHP: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `myDB`
--
CREATE DATABASE IF NOT EXISTS `myDB` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `myDB`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aided`
--

DROP TABLE IF EXISTS `aided`;
CREATE TABLE `aided` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `idAided` bigint(10) UNSIGNED NOT NULL,
  `present` tinyint(1) NOT NULL,
  `evaluation` int(2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `assistance`
--

DROP TABLE IF EXISTS `assistance`;
CREATE TABLE `assistance` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `idAssistant` bigint(10) UNSIGNED NOT NULL,
  `assistanceName` varchar(200) NOT NULL,
  `numberParticipants` int(11) NOT NULL,
  `location` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `schedule` time(6) NOT NULL,
  `course` int(5) UNSIGNED NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `assistance`
--

INSERT INTO `assistance` (`idAssistance`, `idAssistant`, `assistanceName`, `numberParticipants`, `location`, `description`, `schedule`, `course`, `active`) VALUES
(11123, 1821, 'Assistencia de CC', 20, 'UFFS - universidade da Fronteira Sul', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\r\nWhy do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n', '12:32:12.000000', 5455, 1),
(12311, 1821, 'ajudando os caloutrinhos', 50, 'Fernando Machado', 'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas \"Letraset\", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.', '14:13:13.000000', 5556, 1),
(12311, 1821, 'ajudando os caloutrinhos', 50, 'Fernando Machado', 'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas \"Letraset\", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.', '14:13:13.000000', 5556, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `auxiliaryMonitor`
--

DROP TABLE IF EXISTS `auxiliaryMonitor`;
CREATE TABLE `auxiliaryMonitor` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `idAssistant` bigint(10) UNSIGNED NOT NULL,
  `present` tinyint(1) NOT NULL,
  `evaluation` int(2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `collegeSubject`
--

DROP TABLE IF EXISTS `collegeSubject`;
CREATE TABLE `collegeSubject` (
  `idSubject` int(10) UNSIGNED NOT NULL,
  `nameSubject` varchar(50) NOT NULL,
  `idCourse` int(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `collegeSubject`
--

INSERT INTO `collegeSubject` (`idSubject`, `nameSubject`, `idCourse`) VALUES
(5455, 'MATEMATICA C', 1873),
(5555, 'ESTRUTURA DE DADOS', 1873),
(5556, 'PROBABILIDADE E ESTATISTICA', 1873);

-- --------------------------------------------------------

--
-- Estrutura para tabela `course`
--

DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `idCourse` int(5) UNSIGNED NOT NULL,
  `nameCourse` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `course`
--

INSERT INTO `course` (`idCourse`, `nameCourse`) VALUES
(1873, 'CIENCIA DA COMPUTACAO');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tag`
--

DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `idAssistance` bigint(10) UNSIGNED NOT NULL,
  `tagName` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `name` varchar(30) NOT NULL,
  `surname` varchar(40) NOT NULL,
  `iduffs` int(10) NOT NULL,
  `numAssistance` int(10) NOT NULL DEFAULT 0,
  `id` bigint(10) UNSIGNED NOT NULL,
  `course` varchar(40) NOT NULL,
  `cpf` bigint(11) NOT NULL,
  `assistantEvaluation` int(1) NOT NULL DEFAULT 0,
  `studentEvaluation` int(1) NOT NULL DEFAULT 0,
  `currentCreatTime` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `user`
--

INSERT INTO `user` (`name`, `surname`, `iduffs`, `numAssistance`, `id`, `course`, `cpf`, `assistantEvaluation`, `studentEvaluation`, `currentCreatTime`) VALUES
('Patrick', 'luz', 1821101028, 2, 1821, 'Ciencia da computacao', 2682482066, 1, 2, '2020-03-08 03:38:02');

--
-- Índices de tabelas apagadas
--

--
-- Índices de tabela `aided`
--
ALTER TABLE `aided`
  ADD KEY `idAssistance` (`idAssistance`);

--
-- Índices de tabela `assistance`
--
ALTER TABLE `assistance`
  ADD KEY `idTutoring` (`idAssistant`),
  ADD KEY `course` (`course`);

--
-- Índices de tabela `auxiliaryMonitor`
--
ALTER TABLE `auxiliaryMonitor`
  ADD KEY `idAssistant` (`idAssistant`);

--
-- Índices de tabela `collegeSubject`
--
ALTER TABLE `collegeSubject`
  ADD PRIMARY KEY (`idSubject`),
  ADD KEY `idCourse` (`idCourse`);

--
-- Índices de tabela `course`
--
ALTER TABLE `course`
  ADD UNIQUE KEY `idCourse` (`idCourse`);

--
-- Índices de tabela `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`idAssistance`);

--
-- Índices de tabela `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `iduffs` (`iduffs`);

--
-- AUTO_INCREMENT de tabelas apagadas
--

--
-- AUTO_INCREMENT de tabela `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1822;

--
-- Restrições para dumps de tabelas
--

--
-- Restrições para tabelas `aided`
--
ALTER TABLE `aided`
  ADD CONSTRAINT `aided_ibfk_1` FOREIGN KEY (`idAssistance`) REFERENCES `assistance` (`idAssistant`);

--
-- Restrições para tabelas `assistance`
--
ALTER TABLE `assistance`
  ADD CONSTRAINT `assistance_ibfk_1` FOREIGN KEY (`idAssistant`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`course`) REFERENCES `collegeSubject` (`idSubject`);

--
-- Restrições para tabelas `auxiliaryMonitor`
--
ALTER TABLE `auxiliaryMonitor`
  ADD CONSTRAINT `auxiliaryMonitor_ibfk_1` FOREIGN KEY (`idAssistant`) REFERENCES `user` (`id`);

--
-- Restrições para tabelas `collegeSubject`
--
ALTER TABLE `collegeSubject`
  ADD CONSTRAINT `collegeSubject_ibfk_1` FOREIGN KEY (`idCourse`) REFERENCES `course` (`idCourse`);

--
-- Restrições para tabelas `tag`
--
ALTER TABLE `tag`
  ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`idAssistance`) REFERENCES `assistance` (`idAssistant`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
