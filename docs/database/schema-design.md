# Database Schema Design

## Overview

The system uses MySQL as the primary database for all persistent storage needs. This document outlines the complete database schema design, including table structures, relationships, indexing strategies, and data management approaches.

## Database Architecture

### Single Database Strategy

Selected MySQL for all data storage requirements:
- **Operational Simplicity**: Single database technology reduces complexity
- **ACID Compliance**: Critical for financial transaction integrity
- **Proven Scalability**: MySQL handles both transactional and analytical workloads
- **Team Expertise**: Familiar technology reduces learning curve

### Schema Organization

The database is organized into three logical domains:
- **Core Domain**: Advertisers, campaigns, ads, publishers
- **Transaction Domain**: Click events, billing transactions, fraud logs
- **Analytics Domain**: Aggregated metrics and reporting data

## Core Domain Tables

### Advertisers Table

```sql
CREATE TABLE advertisers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    budget_limit DECIMAL(12,2),
    current_spend DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_advertisers_status (status),
    INDEX idx_advertisers_email (email)
);
```

**Design Decisions:**
- UUID primary key for global uniqueness
- Decimal precision for financial accuracy
- Enum for status to ensure data integrity
- Automatic timestamp management

### Campaigns Table

```sql
CREATE TABLE campaigns (
    id VARCHAR(36) PRIMARY KEY,
    advertiser_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(12,2),
    daily_budget DECIMAL(12,2),
    current_spend DECIMAL(12,2) DEFAULT 0.00,
    cpc_bid DECIMAL(8,4) NOT NULL,
    status ENUM('active', 'paused', 'completed') DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id) ON DELETE CASCADE,
    INDEX idx_campaigns_advertiser (advertiser_id),
    INDEX idx_campaigns_status (status),
    INDEX idx_campaigns_dates (start_date, end_date)
);
```

### Ads Table

```sql
CREATE TABLE ads (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    landing_url TEXT NOT NULL,
    creative_url TEXT,
    status ENUM('active', 'paused', 'rejected') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_ads_campaign (campaign_id),
    INDEX idx_ads_status (status)
);
```

### Publishers Table

```sql
CREATE TABLE publishers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    revenue_share DECIMAL(5,4) DEFAULT 0.7000,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_publishers_domain (domain),
    INDEX idx_publishers_status (status)
);
```

## Transaction Domain Tables

### Click Events Table

```sql
CREATE TABLE click_events (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ad_id VARCHAR(36),
    campaign_id VARCHAR(36) NOT NULL,
    advertiser_id VARCHAR(36) NOT NULL,
    publisher_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    device_type ENUM('desktop', 'mobile', 'tablet', 'unknown') DEFAULT 'unknown',
    is_fraud BOOLEAN DEFAULT FALSE,
    fraud_score DECIMAL(5,4) DEFAULT 0.0000,
    cost DECIMAL(8,4),
    currency VARCHAR(3) DEFAULT 'USD',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ad_id) REFERENCES ads(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
    FOREIGN KEY (publisher_id) REFERENCES publishers(id),
    
    UNIQUE KEY uk_event_id (event_id),
    INDEX idx_click_events_timestamp (created_at),
    INDEX idx_click_events_campaign_time (campaign_id, created_at),
    INDEX idx_click_events_advertiser_time (advertiser_id, created_at),
    INDEX idx_click_events_fraud (is_fraud, created_at),
    INDEX idx_click_events_session (session_id),
    INDEX idx_click_events_ip (ip_address)
);
```

**Design Features:**
- Unique event_id prevents duplicate processing
- Comprehensive indexing for query performance
- Fraud detection fields for ML analysis
- Geographic data for targeting analysis

### Billing Transactions Table

```sql
CREATE TABLE billing_transactions (
    id VARCHAR(36) PRIMARY KEY,
    click_event_id VARCHAR(255) NOT NULL,
    advertiser_id VARCHAR(36) NOT NULL,
    campaign_id VARCHAR(36) NOT NULL,
    amount DECIMAL(8,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type ENUM('charge', 'refund', 'adjustment') DEFAULT 'charge',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    
    INDEX idx_billing_click_event (click_event_id),
    INDEX idx_billing_advertiser_time (advertiser_id, created_at),
    INDEX idx_billing_campaign_time (campaign_id, created_at),
    INDEX idx_billing_status (status),
    INDEX idx_billing_type (transaction_type)
);
```

### Fraud Detection Log Table

```sql
CREATE TABLE fraud_detection_log (
    id VARCHAR(36) PRIMARY KEY,
    click_event_id VARCHAR(255) NOT NULL,
    fraud_indicators JSON,
    ml_model_version VARCHAR(50),
    confidence_score DECIMAL(5,4),
    decision ENUM('valid', 'suspicious', 'fraud') NOT NULL,
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_fraud_log_event (click_event_id),
    INDEX idx_fraud_log_decision (decision, created_at),
    INDEX idx_fraud_log_confidence (confidence_score)
);
```

## Analytics Domain Tables

### Hourly Metrics Table

```sql
CREATE TABLE hourly_metrics (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    advertiser_id VARCHAR(36) NOT NULL,
    publisher_id VARCHAR(36),
    hour_timestamp TIMESTAMP NOT NULL,
    clicks INT DEFAULT 0,
    valid_clicks INT DEFAULT 0,
    fraud_clicks INT DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0.0000,
    avg_cost DECIMAL(8,4) DEFAULT 0.0000,
    unique_sessions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
    FOREIGN KEY (publisher_id) REFERENCES publishers(id),
    
    UNIQUE KEY uk_hourly_metrics (campaign_id, hour_timestamp),
    INDEX idx_hourly_advertiser_time (advertiser_id, hour_timestamp),
    INDEX idx_hourly_publisher_time (publisher_id, hour_timestamp)
);
```

### Daily Metrics Table

```sql
CREATE TABLE daily_metrics (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    advertiser_id VARCHAR(36) NOT NULL,
    date_day DATE NOT NULL,
    clicks INT DEFAULT 0,
    valid_clicks INT DEFAULT 0,
    fraud_clicks INT DEFAULT 0,
    total_cost DECIMAL(12,4) DEFAULT 0.0000,
    avg_cost DECIMAL(8,4) DEFAULT 0.0000,
    peak_hour_clicks INT DEFAULT 0,
    unique_sessions INT DEFAULT 0,
    countries JSON,
    devices JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
    
    UNIQUE KEY uk_daily_metrics (campaign_id, date_day),
    INDEX idx_daily_advertiser_date (advertiser_id, date_day),
    INDEX idx_daily_date (date_day)
);
```

## Indexing Strategy

### Performance Optimization

**Primary Indexes:**
- All tables have UUID primary keys
- Unique constraints on business keys (event_id, email)
- Foreign key indexes for join performance

**Query-Specific Indexes:**
- Time-based queries: (entity_id, timestamp) composite indexes
- Filtering queries: Single column indexes on status, type fields
- Analytics queries: Covering indexes for common aggregations

**Index Maintenance:**
- Regular ANALYZE TABLE for statistics updates
- Monitor index usage with EXPLAIN plans
- Remove unused indexes to improve write performance

## Data Partitioning Strategy

### Time-Based Partitioning

**Click Events Partitioning:**
```sql
-- Partition by month for click_events table
ALTER TABLE click_events 
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p202501 VALUES LESS THAN (202502),
    -- Add partitions as needed
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Benefits:**
- Improved query performance for time-range queries
- Efficient data archival and deletion
- Parallel processing capabilities
- Reduced index maintenance overhead

### Archival Strategy

**Data Retention Policy:**
- Click events: 2 years online, then archive
- Billing transactions: 7 years (regulatory requirement)
- Fraud logs: 1 year online, then archive
- Analytics data: 5 years online

**Archive Process:**
```sql
-- Monthly archival job
CREATE TABLE click_events_archive_202411 
AS SELECT * FROM click_events 
WHERE created_at >= '2024-11-01' AND created_at < '2024-12-01';

-- Drop old partition after archival
ALTER TABLE click_events DROP PARTITION p202411;
```

## Data Integrity and Constraints

### Referential Integrity

**Cascade Rules:**
- Advertiser deletion cascades to campaigns and ads
- Campaign deletion cascades to ads
- Soft delete for click events (update status instead of delete)

**Constraint Validation:**
- Budget amounts must be positive
- Fraud scores between 0.0000 and 1.0000
- Valid currency codes (USD, EUR, GBP)
- Date ranges (end_date >= start_date)

### Data Quality Checks

**Automated Validation:**
```sql
-- Budget validation trigger
DELIMITER //
CREATE TRIGGER validate_campaign_budget 
BEFORE INSERT ON campaigns
FOR EACH ROW
BEGIN
    IF NEW.budget <= 0 OR NEW.daily_budget <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Budget amounts must be positive';
    END IF;
    IF NEW.daily_budget > NEW.budget THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily budget cannot exceed total budget';
    END IF;
END//
DELIMITER ;
```