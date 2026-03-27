-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Mar 27, 2026 alle 12:52
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `goguest`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `lavoratore`
--

CREATE TABLE `lavoratore` (
  `IdLavoratore` int(11) NOT NULL,
  `Nome` varchar(100) NOT NULL,
  `Cognome` varchar(100) NOT NULL,
  `Ruolo` varchar(50) DEFAULT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `Amministratore` tinyint(1) DEFAULT NULL,
  `Firma` longtext DEFAULT NULL,
  `IdUtente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utente`
--

CREATE TABLE `utente` (
  `IdUtente` int(11) NOT NULL,
  `Ruolo` varchar(50) DEFAULT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `visitatore`
--

CREATE TABLE `visitatore` (
  `IdVisitatore` int(11) NOT NULL,
  `Nome` varchar(100) NOT NULL,
  `Cognome` varchar(100) NOT NULL,
  `Azienda` varchar(150) DEFAULT NULL,
  `VisitaAttiva` tinyint(1) DEFAULT NULL,
  `IdUtente` int(11) DEFAULT NULL,
  `Firma` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `lavoratore`
--
ALTER TABLE `lavoratore`
  ADD PRIMARY KEY (`IdLavoratore`),
  ADD KEY `IdUtente` (`IdUtente`);

--
-- Indici per le tabelle `utente`
--
ALTER TABLE `utente`
  ADD PRIMARY KEY (`IdUtente`);

--
-- Indici per le tabelle `visitatore`
--
ALTER TABLE `visitatore`
  ADD PRIMARY KEY (`IdVisitatore`),
  ADD KEY `IdUtente` (`IdUtente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `lavoratore`
--
ALTER TABLE `lavoratore`
  MODIFY `IdLavoratore` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `utente`
--
ALTER TABLE `utente`
  MODIFY `IdUtente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `visitatore`
--
ALTER TABLE `visitatore`
  MODIFY `IdVisitatore` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `lavoratore`
--
ALTER TABLE `lavoratore`
  ADD CONSTRAINT `lavoratore_ibfk_1` FOREIGN KEY (`IdUtente`) REFERENCES `utente` (`IdUtente`);

--
-- Limiti per la tabella `visitatore`
--
ALTER TABLE `visitatore`
  ADD CONSTRAINT `visitatore_ibfk_1` FOREIGN KEY (`IdUtente`) REFERENCES `utente` (`IdUtente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
