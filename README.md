# Job Posting Web Service

This project is a comprehensive **job posting platform** designed to facilitate the process of posting, searching, and applying for one-time jobs. The application is built with a **microservices architecture** using .NET and incorporates modern technologies and design principles to deliver a robust, scalable, and user-friendly experience.

## Features

### 1. Job Listings Management
- Employers can create, update, and delete job postings.
- Job postings include details such as:
  - Job title
  - Description
  - Location
  - Payment amount

### 2. Interactive Map Integration
- An **interactive map** is included to display job locations visually.
- Users can search for jobs based on their geographic location and view results directly on the map.

### 3. Search Functionality
- Advanced search options are available, allowing job seekers to filter listings by:
  - Keywords
  - Location
  - Payment range
  - Job categories
- Search results are paginated for a seamless browsing experience.

### 4. Authentication & Authorization
- Integrated with an **external Identity server (Duende)** to handle user authentication securely.
- Role-based access control (RBAC):
  - Employers can post and manage jobs.
  - Job seekers can search for and apply to jobs.

### 5. Event-Driven Architecture
- Uses **RabbitMQ** with MassTransit for an efficient **event bus** system:
  - Ensures smooth communication between microservices.
  - Handles events such as job posting creation, updates, and notifications.

### 6. Notifications (Planned)
- A notification service will be implemented to inform users about:
  - New job postings matching their preferences.
  - Updates to existing jobs they have bookmarked.

### 7. Responsive Design
- The front-end is built using **React**, providing a responsive and intuitive interface that works across devices.

## Technology Stack

### Backend
- **.NET Core**: Main framework for developing APIs and business logic.
- **Entity Framework Core**: ORM for database interactions.
- **RabbitMQ + MassTransit**: Event-driven architecture.

### Frontend
- **Next.js**: For building an interactive and responsive user interface.
- **Blazor (for IdentityService)**: Adds functionality that is not provided by Duende.

### Database
- **PostgreSQL**: Main database for storing job postings and user data.
- **Elasticsearch** is now fully integrated for search functionalities.

### Containerization
- **Docker**: For containerizing all services and databases, ensuring consistency and ease of deployment.

### Testing
- **xUnit**: Comprehensive unit and integration tests to ensure reliability.

## Architecture

The application is designed with a **microservices architecture** to achieve modularity and scalability. Each service is responsible for a specific feature, such as job management, search, or notifications.

### Services
1. **Job Service**: Handles CRUD operations for job postings.
2. **Search Service**: Manages Elasticsearch indices and search-related functionalities.
3. **Identity Service (In Progress)**: Manages user profiles and authentication.
4. **Notification Service (Planned)**: Handles user notifications and updates.

### Communication
Services communicate through an **event-driven model** using RabbitMQ. This decouples components and ensures system resilience.

## How to Run

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   ```
2. **Set Up Docker**
   Ensure Docker is installed and running on your machine.
3. **Run Services**
   Navigate to the project directory and start all services using Docker Compose:
   ```bash
   docker-compose up
   ```
4. **Install required packages and run client side**
   ```bash
   npm install
   ```
   ```bash
   npm run dev
   ```
5. **Access the Application**
   - Frontend: `http://localhost:3000` (or specified port)
   - Gateway: `http://localhost:6000` (or specified port)



## Database Schema
```mermaid
erDiagram
    User ||--o{ JobPost : "creates"
    User ||--o{ JobApplication : "applies"
    User ||--o{ Review : "gives"
    User ||--o{ Review : "receives"
    User ||--o{ SavedPost : "saves"
    User ||--o{ CalendarEvent : "has"
    User ||--|| Location : "has"
    
    JobPost ||--o{ JobApplication : "has"
    JobPost ||--o{ SavedPost : "has"
    JobPost ||--o{ CalendarEvent : "has"
    JobPost }|--|| Location : "has"
    JobPost }|--|| User : "has employee"

    User {
        uuid id PK
        string email
        string username
        string password
        string firstName
        string lastName
        enum role
        string taxNumber
        string phoneNumber
        string about
        datetime createdAt
        datetime updatedAt
    }

    JobPost {
        uuid id PK
        string title
        text description
        uuid employerId FK
        uuid employeeId FK
        int paymentAmount
        datetime deadline
        boolean isArchived
        enum status
        enum category
        uuid locationId FK
        string[] photoUrls
        datetime createdAt
        datetime updatedAt
    }

    JobApplication {
        uuid id PK
        string email
        string phone
        uuid jobPostId FK
        uuid applicantId FK
        enum status
        text coverLetter
        text employerNotes
        datetime createdAt
        datetime updatedAt
        datetime reviewedAt
        boolean isArchived
        text message
    }

    Review {
        uuid id PK
        int rating
        text comment
        uuid reviewerId FK
        uuid reviewedUserId FK
        datetime createdAt
        datetime updatedAt
    }

    Location {
        uuid id PK
        string country
        string city
        string street
        string state
        string postalCode
        float latitude
        float longitude
        string formattedAddress
        uuid userId FK
    }

    SavedPost {
        uuid id PK
        uuid userId FK
        uuid jobPostId FK
        datetime createdAt
    }

    CalendarEvent {
        uuid id PK
        string title
        text description
        datetime eventDate
        enum type
        uuid userId FK
        uuid jobPostId FK
        datetime createdAt
        datetime updatedAt
    }
```

## Screenshots

![alt text](image.png)
