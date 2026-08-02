<div align="center">

# 🌍 DisasterWatch

### AI-Powered Real-Time Natural Disaster Alert System

A production-oriented full-stack MERN application that enables users to report, verify, and monitor natural disasters in real time using crowdsourced data, AI-assisted validation, and interactive geospatial visualization.

Designed with scalability, security, maintainability, and modern software engineering practices in mind.

</div>

---

# 📌 Overview

DisasterWatch is a modern disaster management platform built using the MERN stack.

The platform enables communities to report natural disasters in real time while leveraging AI to improve report reliability and reduce misinformation.

The long-term objective is to create a scalable disaster intelligence platform capable of supporting emergency response organizations with timely and verified information.

---

# ✨ Key Features

## Authentication

- Secure JWT Authentication
- Refresh Token Rotation
- HTTP-Only Cookies
- Protected Routes
- Role Based Access Control (RBAC)
- Email Verification
- Forgot Password
- Reset Password

---

## Disaster Reporting

- Create Disaster Reports
- Upload Disaster Images
- Geolocation Support
- Report Verification
- Report Status Tracking

---

## AI Features

- NLP-Based Disaster Classification
- Image-Based Disaster Detection
- Confidence Scoring
- Duplicate Report Detection
- AI-Assisted Report Verification

---

## Dashboard

- Live Disaster Feed
- Interactive Maps
- Report Analytics
- Filter by Disaster Type
- Search Reports

---

## Notifications

- Email Notifications
- In-App Alerts
- Real-Time Updates

---

# 🌪 Supported Disaster Types

- 🌍 Earthquake
- 🌊 Flood
- 🔥 Wildfire
- ⛰️ Landslide

---

# 🏗 Tech Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- shadcn/ui

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

---

## Authentication

- JWT
- HTTP Only Cookies
- bcrypt

---

## Testing

- Vitest
- React Testing Library
- Playwright
- MSW
- Supertest

---

## DevOps

- GitHub Actions
- Docker (Planned)
- CodeQL
- Dependency Review

---

# 📂 Project Structure

```text
DisasterWatch
│
├── Backend
├── Frontend
├── Docs
├── .github
│   ├── workflows
│   ├── ISSUE_TEMPLATE
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docker
├── Scripts
└── README.md
```

---

# 🔒 Security

Security is treated as a first-class concern throughout the application.

## Authentication Security

- JWT Access Tokens
- Refresh Token Rotation
- HTTP-Only Cookies
- Secure Password Hashing
- Token Expiration

---

## Application Security

- Helmet
- CORS Protection
- Rate Limiting
- Input Validation
- MongoDB Injection Prevention
- XSS Protection
- CSRF Protection
- Environment Variable Management

---

## Code Security

- GitHub CodeQL
- Dependency Review
- npm Audit
- Secret Scanning

---

# 🧪 Testing Strategy

The project follows the Testing Pyramid.

```text
                Playwright
             End-to-End Tests

         Integration Tests

      Unit & Component Tests
```

### Backend

- Unit Tests
- Integration Tests
- API Tests

### Frontend

- Component Tests
- UI Tests
- MSW Mock Testing

### End-to-End

- Complete User Flows
- Authentication
- Disaster Reporting
- Dashboard Navigation

---

# 🚀 CI/CD

The project uses GitHub Actions.

Current workflow includes:

- Backend Testing
- Frontend Testing
- Playwright E2E Testing
- Build Validation

Planned workflows:

- Continuous Deployment
- CodeQL Security Analysis
- Dependency Review
- Release Automation

---

# 📈 Development Workflow

```text
Create Feature Branch
        │
        ▼
Develop Feature
        │
        ▼
Unit Tests
        │
        ▼
Integration Tests
        │
        ▼
Playwright Tests
        │
        ▼
Pull Request
        │
        ▼
GitHub Actions
        │
        ▼
Code Review
        │
        ▼
Merge
```

---

# 📖 Documentation

Project documentation will include:

- Architecture
- API Documentation
- Database Design
- Security Guide
- Deployment Guide
- Testing Guide

---

# 🎯 Roadmap

### Phase 1

- Authentication
- User Management
- RBAC

### Phase 2

- Disaster Reporting
- Maps
- Dashboard

### Phase 3

- AI Classification
- Image Analysis
- Verification Engine

### Phase 4

- Notifications
- Analytics
- Performance Optimization

### Phase 5

- Docker
- Kubernetes
- Monitoring
- Production Deployment

---

# 🤝 Contributing

Contributions, ideas, and feedback are welcome.

Please read the contribution guidelines before opening issues or pull requests.

---

# ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

# 👨‍💻 Author

**Amir Shaikh**

Computer Science Graduate

Full Stack Developer

Building secure, scalable, and production-ready web applications.

---
