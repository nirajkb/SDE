# Software Design and Engineering (SDE) Project

## Ad Click Charging System - Pub-Sub Architecture

This repository contains the design and implementation of a publish-subscribe based ad click charging system for academic research purposes.

## Project Structure

```
SDE/
├── docs/
│   ├── architecture/
│   │   ├── system-architecture.md    # High-level system design
│   │   └── detailed-design.md        # Service patterns and algorithms
│   ├── database/
│   │   └── schema-design.md          # Complete MySQL schema
│   ├── presentation/                 # Presentation materials
│   └── report/                       # Technical reports
├── src/
│   ├── services/                     # Microservices implementation
│   └── config/                       # Configuration files
├── tests/                            # Test files
└── deployment/                       # Deployment configurations
```

## Current Status

**Documentation (Complete):**
- `docs/architecture/system-architecture.md` - High-level system architecture and component design
- `docs/architecture/detailed-design.md` - Service patterns, algorithms, and implementation details
- `docs/architecture/quality-attributes-analysis.md` - Performance, scalability, and reliability analysis
- `docs/database/schema-design.md` - Complete MySQL database schema with tables and relationships
- `docs/report/technical-report.md` - Complete technical report
- `docs/presentation/presentation-slides.md` - Presentation slides

**Implementation (Complete):**
- `src/services/` - Four microservices (click ingestion, fraud detection, billing, analytics)
- `src/config/` - Event bus implementation
- `src/utils/` - Logging utilities
- `demo/` - Working demonstration with in-memory pub-sub

**Features Implemented:**
- Pub-sub architecture with event-driven communication
- Real-time fraud detection with scoring
- Budget tracking and billing with transaction details
- Analytics aggregation by campaign and advertiser
- Professional terminal output for demonstrations

## Getting Started

### Understanding the System
1. **System Overview**: Start with `docs/architecture/system-architecture.md` for the high-level design
2. **Technical Details**: Review `docs/architecture/detailed-design.md` for service patterns and algorithms
3. **Quality Attributes**: Check `docs/architecture/quality-attributes-analysis.md` for performance, scalability, and reliability
4. **Database Design**: See `docs/database/schema-design.md` for complete schema specifications
5. **Technical Report**: Read `docs/report/technical-report.md` for comprehensive project documentation

### Running the System

**Prerequisites:**
- Node.js 14 or higher
- npm

**Installation:**
```bash
cd src
npm install
```

**Running the Demo:**

Terminal 1 - Start the system:
```bash
cd src
npm start
```

Terminal 2 - Send test clicks:
```bash
cd src
./demo-script.sh
```

Press Ctrl+C in Terminal 1 to see final statistics including budget summaries.

## Documentation

### Architecture Documentation
- **system-architecture.md**: Pub-sub architecture overview, component relationships, and technology choices
- **detailed-design.md**: Message flow design, fraud detection algorithms, billing logic, and error handling
- **quality-attributes-analysis.md**: Analysis of performance, scalability, and reliability with proof and justification

### Database Documentation  
- **schema-design.md**: MySQL table definitions, indexing strategy, and data management approaches

### Project Documentation
- **technical-report.md**: Complete technical report with problem statement, solution, implementation, testing, and conclusions
- **presentation-slides.md**: Presentation slides covering all aspects of the project

### Implementation
- **src/**: Source code for all services
- **demo/**: Working demonstration with simplified in-memory implementation

## Architecture Overview

The system demonstrates a scalable pub-sub architecture with:

**Current Implementation:**
- **Node.js EventEmitter** for in-memory pub-sub (demonstration)
- **Express.js** for HTTP API
- **Four microservices**: Click Ingestion, Fraud Detection, Billing, Analytics
- **Event-driven communication** with loose coupling

**Production Design (documented):**
- **Apache Kafka** for message queuing
- **MySQL** for data persistence
- **Redis** for caching
- **Docker** for containerization

**Key Features:**
- Real-time fraud detection with scoring algorithm
- Budget tracking with before/after transaction details
- Campaign and advertiser spending analytics
- Asynchronous event processing
- Horizontal scalability design

**Performance Targets:**
- API response time: < 100ms
- Event processing: < 50ms per service
- Target throughput: 10,000 clicks/second (with Kafka)