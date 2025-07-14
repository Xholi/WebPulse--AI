# WebPulse AI - Website Generation Platform

## Overview

WebPulse AI is a comprehensive web application that automates website generation for businesses. The platform combines lead management, AI-powered site generation, payment processing, and client portals in a unified dashboard. Built with a modern full-stack architecture, it serves as a complete business solution for agencies offering website services.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **File Processing**: Multer for file uploads with validation
- **Development**: Hot module replacement via Vite integration

### Database & ORM
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Connection**: Connection pooling with serverless optimization

## Key Components

### Lead Management System
- **Business Lead Tracking**: Comprehensive lead capture and status management
- **Industry Classification**: Template selection based on business type
- **Contact Information**: Email, phone, and address management
- **Assignment System**: Team member assignment for lead ownership

### Website Generation Engine
- **Template System**: Pre-built templates for different industries (restaurant, professional, retail, healthcare)
- **Customization Engine**: Dynamic content injection with Handlebars templating
- **Preview System**: Real-time website preview before client approval
- **Asset Management**: Logo upload and file management system

### Payment Processing
- **Payment Gateway**: PayPal integration for global transactions (South Africa compatible)
- **Multiple Payment Types**: Support for deposits, full payments, and refunds
- **Transaction Tracking**: Comprehensive payment status monitoring
- **Order Management**: PayPal order creation and capture workflow

### Client Portal
- **Individual Access**: Unique URLs for client website previews
- **Payment Interface**: Embedded Stripe Elements for secure payments
- **Status Tracking**: Real-time updates on website generation progress
- **Communication**: Email notifications for important updates

### Email System
- **SMTP Integration**: Nodemailer with configurable email providers
- **Template Engine**: HTML email templates for different communications
- **Campaign Management**: Bulk email capabilities for marketing
- **Notification System**: Automated emails for lead and payment updates

## Data Flow

### Lead to Pre-Built Website Generation (3-5 Day Workflow)
1. Lead creation through admin dashboard or API
2. Industry-based template selection and preview generation
3. Preview sent to client via email with approval link
4. Client reviews and approves website design
5. 60% deposit payment processed via PayPal
6. **Development Phase**: 3-5 day pre-built website creation
   - Automated workflow triggers development start
   - Professional team builds custom website
   - Quality assurance and optimization
   - Client receives progress notifications
7. Website completion notification with live URL
8. Final website delivery and client confirmation

### Payment Processing Flow
1. PayPal order creation for 60% deposit (R6800 for R11500 website)
2. Client payment through secure PayPal interface
3. Payment capture and workflow trigger
4. Database synchronization and status updates
5. Automated development workflow initiation
6. Progress notifications throughout 3-5 day build process

## External Dependencies

### Core Services
- **PayPal**: Payment processing for South African market compatibility
- **Neon Database**: Serverless PostgreSQL hosting with workflow tracking
- **SMTP Provider**: Email delivery service for client notifications
- **File Storage**: Local file system for uploads and generated sites
- **Development Workflow**: Automated 3-5 day website building process

### Development Tools
- **Vite**: Development server and build tooling
- **TypeScript**: Type safety and developer experience
- **ESLint/Prettier**: Code quality and formatting
- **Drizzle Kit**: Database schema management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Chart.js**: Data visualization
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static files and uploads managed separately
- **Environment**: NODE_ENV-based configuration switching

### Production Requirements
- **Database**: PostgreSQL connection string via DATABASE_URL
- **Payments**: Stripe secret and public keys
- **Email**: SMTP credentials for email delivery
- **File Storage**: Writable directory for file uploads

### Scaling Considerations
- **Database**: Connection pooling for concurrent requests
- **File Storage**: Migration to cloud storage for production scale
- **Payment Processing**: Webhook endpoint security and validation
- **Email Delivery**: Rate limiting and queue management

## User Preferences

Preferred communication style: Simple, everyday language.