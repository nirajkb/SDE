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

**Committed Files:**
- `docs/architecture/system-architecture.md` - High-level system architecture and component design
- `docs/architecture/detailed-design.md` - Service patterns, algorithms, and implementation details
- `docs/database/schema-design.md` - Complete MySQL database schema with tables and relationships

**Work in Progress:**
- Implementation files (Node.js services)
- Test suites and validation
- Deployment configurations
- Presentation materials

## Getting Started

1. **System Overview**: Start with `docs/architecture/system-architecture.md` for the high-level design
2. **Technical Details**: Review `docs/architecture/detailed-design.md` for service patterns and algorithms
3. **Database Design**: Check `docs/database/schema-design.md` for complete schema specifications
4. **Implementation**: Source code and tests will be added incrementally

## Documentation

### Architecture Documentation
- **system-architecture.md**: Pub-sub architecture overview, component relationships, and technology choices
- **detailed-design.md**: Message flow design, fraud detection algorithms, billing logic, and error handling

### Database Documentation  
- **schema-design.md**: MySQL table definitions, indexing strategy, and data management approaches

## Architecture Overview

The system demonstrates a scalable pub-sub architecture using:
- **Apache Kafka** for message queuing
- **Node.js** for API services
- **MySQL** for data persistence
- **Redis** for caching
- **Docker** for containerization

Target performance: 10,000 clicks/second with sub-100ms response times.