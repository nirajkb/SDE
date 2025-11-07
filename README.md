# Software Design and Engineering (SDE) Project

## Ad Click Charging System - Pub-Sub Architecture

This repository contains the design and implementation of a publish-subscribe based ad click charging system for academic research purposes.

## Project Structure

```
SDE/
├── docs/
│   ├── architecture/
│   │   └── system-architecture.md    # Main architecture document
│   ├── database/                     # Database design documents
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
- `docs/architecture/system-architecture.md` - Complete system architecture documentation

**Work in Progress:**
- Implementation files
- Database schemas
- Test suites
- Deployment configurations

## Getting Started

1. Review the system architecture: `docs/architecture/system-architecture.md`
2. Implementation files will be added incrementally
3. Each component will be committed separately after review

## Architecture Overview

The system demonstrates a scalable pub-sub architecture using:
- **Apache Kafka** for message queuing
- **Node.js** for API services
- **MySQL** for data persistence
- **Redis** for caching
- **Docker** for containerization

Target performance: 10,000 clicks/second with sub-100ms response times.