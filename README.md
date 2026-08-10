# University Assessment and Mastery Portal (UAMP)

A comprehensive examination platform with AI-powered proctoring, question paper management, and real-time monitoring capabilities.

## 🎓 Features

- **User Management**: Role-based access (Student, Teacher, Admin)
- **Question Paper Management**: Upload DOCX/PDF, manual MCQ builder, AI-generated questions
- **Exam Scheduling**: Flexible exam creation with proctoring controls
- **Real-time Proctoring**: Tab switch monitoring, webcam streaming, AI-powered surveillance
- **Audit Trail**: Comprehensive logging of all critical actions
- **Offline Support**: IndexedDB for exam runtime reliability
- **Secure Authentication**: JWT-based auth with role permissions

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Angular 22.1.0
- TypeScript
- TensorFlow.js (AI proctoring)
- Dexie.js (IndexedDB storage)

**Backend:**
- Node.js + Express.js
- Neon PostgreSQL (Database)
- AWS S3-compatible storage (Neon storage)
- JWT Authentication

**DevOps:**
- Docker & Docker Compose
- Nginx (Reverse proxy)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Chaitanya2005-hub/UAMP.git
cd UAMP

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+
- Neon Database account
- AWS S3 (or Neon storage) credentials

#### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Update .env with your Neon and AWS credentials
npm start
```

Backend runs on `http://localhost:3000`

#### Frontend Setup

```bash
cd uamp-angular
npm install
npm start
```

Frontend runs on `http://localhost:4200`

## 🔧 Configuration

### Environment Variables

**Backend (`.env`):**
```env
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:4200
AWS_ENDPOINT_URL_S3=your-s3-endpoint
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-2
S3_BUCKET_NAME=uamp-exam-storage
```

**Frontend (`src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  websocketUrl: 'ws://localhost:3000/ws',
};
```

## 📁 Project Structure

```
UAMP/
├── server/                      # Backend API
│   ├── src/
│   │   ├── index.js            # Main server file
│   │   └── services/
│   │       └── s3.service.js   # S3 file storage
│   ├── scripts/
│   │   ├── setup-test-data.js  # Database seeding
│   │   ├── seed-demo-data.js   # Demo data seeding
│   │   ├── add-new-courses.js  # Add new courses to database
│   │   ├── verify-courses.js   # Verify courses in database
│   │   ├── create-students.js  # Create student accounts
│   │   └── verify-students.js  # Verify student accounts
│   ├── Dockerfile
│   └── package.json
├── uamp-angular/                # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── auth/               # Authentication module
│   │   ├── admin/              # Admin module
│   │   ├── teacher/            # Teacher module
│   │   ├── student/            # Student module
│   │   ├── core/               # Core services
│   │   └── shared/             # Shared components
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml          # Docker orchestration
├── .docker.env                 # Docker environment variables
└── README.md
```

## 🔐 Default Login Credentials

After running the setup script (`node server/scripts/setup-test-data.js`):

**Admin:**
- Email: `admin@uamp.edu`
- Password: `admin123`

**Teacher:**
- Email: `teacher@uamp.edu`
- Password: `teacher123`

**Students:**
- STU001 - Student User: `student@uamp.edu` / `student123`
- STU002 - Priya Sharma: `priya.sharma@uamp.edu` / `priya123`
- STU003 - Arjun Reddy: `arjun.reddy@uamp.edu` / `arjun123`
- STU004 - Fatima Khan: `fatima.khan@uamp.edu` / `fatima123`
- STU005 - Rahul Kumar: `rahul.kumar@uamp.edu` / `rahul123`
- STU006 - Priya Singh: `priya.singh@uamp.edu` / `priya123`
- STU007 - Amit Patel: `amit.patel@uamp.edu` / `amit123`
- STU008 - Sneha Gupta: `sneha.gupta@uamp.edu` / `sneha123`
- STU009 - Vikram Sharma: `vikram.sharma@uamp.edu` / `vikram123`
- STU010 - Nisha Verma: `nisha.verma@uamp.edu` / `nisha123`
- STU011 - Rohit Mehta: `rohit.mehta@uamp.edu` / `rohit123`
- STU012 - Kavita Rani: `kavita.rani@uamp.edu` / `kavita123`
- STU013 - Deepak Joshi: `deepak.joshi@uamp.edu` / `deepak123`
- STU014 - Pooja Kumari: `pooja.kumari@uamp.edu` / `pooja123`

## 📊 Database Schema

The application uses Neon PostgreSQL with 16 tables:

- **Identity**: institutions, users, roles_permissions, user_permission_overrides
- **Academic**: courses, question_papers, questions
- **Exams**: exams, exam_slots, hall_tickets
- **Submissions**: submissions, submission_answers
- **Proctoring**: proctoring_logs, audit_trails
- **Sessions**: active_sessions, notifications

See `02-neon-database-schema.md` for complete schema details.

## 🎯 Available API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Courses
- `GET /api/courses` - Get all courses

**Available Courses:**
- CS101 - Introduction to Computer Science
- CS201 - Data Structures and Analysis
- CS301 - Theory of Computation
- CS401 - Angular Framework
- CS402 - Advanced Java Programming

### Question Papers
- `GET /api/question-papers` - Get all question papers
- `POST /api/question-papers` - Create question paper

### Exams
- `GET /api/exams` - Get all exams

### File Upload
- `POST /api/upload/question-paper` - Upload question paper
- `POST /api/upload/proctoring-snapshot` - Upload proctoring snapshot
- `GET /api/files/presigned-url/:key` - Get download URL

### Proctoring
- `POST /api/proctoring/events` - Log proctoring events

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### List Database Tables
```bash
curl http://localhost:3000/api/tables
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uamp.edu","password":"admin123"}'
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up -d --build backend
```

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication with refresh tokens
- **Role-Based Access Control**: Fine-grained permissions for each user role
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via Neon serverless
- **Proctoring**: Tab switch monitoring, fullscreen guard, webcam streaming

## 📱 User Roles

### Admin
- Approve/reject question papers
- Monitor live audit dashboard
- Control interventions during exams
- View audit trails

### Teacher
- Create and manage question papers
- Upload DOCX/PDF files
- Build MCQs manually
- Generate questions with AI
- Monitor student proctoring feeds
- View incident timelines

### Student
- View exam dashboard
- Access hall tickets
- Take exams with proctoring
- View submission status

## 🌐 Development

### Running Manual Setup

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd uamp-angular
npm start
```

### Database Setup

1. Create a Neon project at [console.neon.tech](https://console.neon.tech)
2. Run the schema from `02-neon-database-schema.md`
3. Run the setup script: `node server/scripts/setup-test-data.js`

### Database Management Scripts

The project includes several utility scripts for database management:

```bash
# Add new courses to the database
node server/scripts/add-new-courses.js

# Verify courses in the database
node server/scripts/verify-courses.js

# Create student accounts
node server/scripts/create-students.js

# Verify student accounts and credentials
node server/scripts/verify-students.js

# Seed demo data for testing
node server/scripts/seed-demo-data.js
```

### 🎯 Recent Updates

**August 2026:**
- ✅ Added new courses: CS201 (Data Structures and Analysis), CS301 (Theory of Computation), CS401 (Angular Framework), CS402 (Advanced Java Programming)
- ✅ Created 10 new student accounts with login credentials (STU005-STU014)
- ✅ Fixed exam starting issue - students were stuck on "Starting..." 
- ✅ Improved exam lobby logic to better detect admin-started exams
- ✅ Fixed question paper saving and admin portal reflection issues
- ✅ Enhanced admin approvals component with real API integration
- ✅ Added PATCH endpoint for question paper approval/rejection workflow
- ✅ Fixed timetable issue for exam starting with better server authority prioritization
- ✅ Added missing `/api/student/submissions` endpoint for student submission history
- ✅ Fixed environment configuration for proper API URL handling
- ✅ Updated CORS configuration to support multiple frontend ports
- ✅ Fixed exam scheduling API parameter handling
- ✅ Improved backend server startup and error handling
- ✅ Fixed Angular build issues with environment imports
- ✅ Removed unnecessary dependencies from frontend package.json
- ✅ Configured Vitest for testing with proper setup

## 📝 Documentation

- `01-system-architecture.md` - System architecture overview
- `02-neon-database-schema.md` - Complete database schema
- `03-angular-component-blueprint.md` - Angular component specifications
- `04-proctoring-security-engine.md` - Proctoring system details
- `05-ui-ux-animation-guide.md` - UI/UX guidelines

## 📋 August 2026 Updates Summary

### New Features
- **4 New Courses Added**: CS201 (Data Structures), CS301 (Theory of Computation), CS401 (Angular), CS402 (Advanced Java)
- **10 New Student Accounts**: STU005-STU014 with login credentials
- **Database Management Scripts**: Utility scripts for course and student management
- **Enhanced Question Paper Workflow**: Real-time approval/rejection system

### Bug Fixes
- **Exam Starting Issue**: Fixed students stuck on "Starting..." with improved lobby logic
- **Question Paper Saving**: Fixed immediate saving and admin portal reflection
- **Timetable Issues**: Resolved exam scheduling time validation problems
- **TypeScript Errors**: Fixed all compilation and build issues

### Documentation Updates
- Complete student account credentials list
- Enhanced README files with project details
- Database management script documentation
- Recent changes tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or use different ports in .env files
```

### Database Connection Issues
- Verify Neon connection string in `.env`
- Check Neon project status at console.neon.tech
- Ensure SSL mode is enabled in connection string

### Build Errors
- Clear Angular cache: `rm -rf node_modules/.angular`
- Reinstall dependencies: `npm install`
- Check Node.js version compatibility

## 🎓 Acknowledgments

- Neon PostgreSQL for managed database
- Angular framework for frontend
- TensorFlow.js for AI proctoring
- Dexie.js for IndexedDB storage