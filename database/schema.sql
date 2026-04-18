-- Sandal Stock Management System — Database Schema
-- Run this file to create all tables

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS stock_sold;
DROP TABLE IF EXISTS stock_in;
DROP TABLE IF EXISTS sandals;
DROP TABLE IF EXISTS categories;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- Table: users
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: categories
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: sandals
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sandals (
  id          INT          NOT NULL AUTO_INCREMENT,
  category_id INT          NOT NULL,
  code        VARCHAR(50)  NOT NULL,
  name        VARCHAR(150) NOT NULL,
  color       VARCHAR(50)  NOT NULL,
  size        VARCHAR(20)  NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_sandals_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: stock_in
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_in (
  id         INT       NOT NULL AUTO_INCREMENT,
  sandal_id  INT       NOT NULL,
  quantity   INT       NOT NULL,
  date       DATE      NOT NULL,
  note       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_stockin_sandal FOREIGN KEY (sandal_id) REFERENCES sandals (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_stockin_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: stock_sold
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_sold (
  id         INT       NOT NULL AUTO_INCREMENT,
  sandal_id  INT       NOT NULL,
  quantity   INT       NOT NULL,
  date       DATE      NOT NULL,
  note       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_stocksold_sandal FOREIGN KEY (sandal_id) REFERENCES sandals (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_stocksold_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Sample seed data
-- -------------------------------------------------------
INSERT INTO categories (name) VALUES
  ('Sandal Jepit'),
  ('Sandal Selop'),
  ('Sandal Gunung');

INSERT INTO sandals (category_id, code, name, color, size) VALUES
  (1, 'SJ-001', 'Jepit Classic', 'Hitam', '38'),
  (1, 'SJ-002', 'Jepit Classic', 'Coklat', '39'),
  (2, 'SS-001', 'Selop Premium', 'Putih', '37'),
  (3, 'SG-001', 'Gunung Trail', 'Hijau', '40');
