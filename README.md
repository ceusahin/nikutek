# Nikutek - Full Stack Corporate Website

Portfolio Project, Full Stack Dev. - React | Spring Boot | PostgreSQL | Tailwind CSS	[GitHub](https://github.com) | [Website](https://nikutek.com)

## Overview

A comprehensive, multilingual corporate website with a full-featured admin panel for content management. Built with modern web technologies to provide a seamless user experience and powerful backend administration capabilities.

## Key Features

●	Developed a dynamic and manageable state management system using React and Context API for global state management (Language, Theme, Panel contexts).

●	Integrated RESTful APIs using Axios to connect the frontend with Spring Boot backend services and PostgreSQL database.

●	Created a modern and user-friendly design using Tailwind CSS with responsive breakpoints and dark mode support.

●	Designed a fully responsive interface for seamless usage on all devices (mobile, tablet, desktop).

●	Implemented multilingual support (Turkish/English) with dynamic routing and content localization throughout the application.

●	Built an interactive admin panel with rich text editing, drag-and-drop functionality, real-time content management, and visitor analytics dashboard.

●	Developed a secure authentication system with JWT tokens and auto-logout feature for admin panel access.

●	Integrated Cloudinary for efficient image upload and management within the content management system.

## Tech Stack

### Frontend
- React 19 | Vite | React Router | Tailwind CSS 4 | Axios | Framer Motion | React Quill | GSAP

### Backend
- Spring Boot 3.5.6 | PostgreSQL | Spring Security | Spring Data JPA | Cloudinary | Lombok

## Project Structure

```
nikutek/                          # Frontend (React)
├── src/
│   ├── api/                      # Axios instance and API configuration
│   ├── components/
│   │   ├── admin/                # Admin panel components
│   │   └── site/                 # Public site components
│   ├── contexts/                 # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/                  # Layout components (Header, Footer)
│   ├── pages/                    # Page components
│   └── utils/                    # Utility functions
└── package.json

nikutek-backend-guncel/           # Backend (Spring Boot)
├── src/main/java/
│   └── com/example/nikutek/
│       ├── config/               # Spring configuration
│       ├── controller/           # REST controllers
│       ├── entity/               # JPA entities
│       ├── repository/           # Data access layer
│       ├── service/              # Business logic
│       └── dto/                  # Data transfer objects
└── pom.xml
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- PostgreSQL database
- Maven 3.6+

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
cd ../nikutek-backend-guncel

# Configure database in application.properties
# Update PostgreSQL connection details

# Run with Maven
./mvnw spring-boot:run
```

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_APP_TYPE=site  # or "admin" for admin panel
VITE_API_URL=http://localhost:8080/api/nikutek
```

Backend requires PostgreSQL connection configuration in `application.properties`.

## Features in Detail

### Multilingual Support
- Dynamic routing for Turkish and English
- Language context provider for global language state
- Localized content management in admin panel

### Admin Panel
- Secure login with JWT authentication
- Real-time dashboard with visitor analytics
- Rich text editor for content creation
- Drag-and-drop product hierarchy management
- SEO optimization tools
- Image upload with Cloudinary integration
- Auto-logout for security

### Public Website
- Responsive hero section with image slider
- Product/Technology showcase
- Blog system
- Reference/project gallery
- Contact form with message management
- SEO-optimized pages with dynamic meta tags

## License

This project is private and proprietary.

---

**Note**: Backend repository is located in `../nikutek-backend-guncel/` directory.
