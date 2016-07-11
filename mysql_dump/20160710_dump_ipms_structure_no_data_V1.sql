CREATE DATABASE IF NOT EXISTS `bpmspace_ipms_v1` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `bpmspace_ipms_v1`;
CREATE TABLE `connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dbhost` varchar(45) DEFAULT NULL,
  `dbuser` varchar(140) DEFAULT NULL,
  `dbport` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
