# University Assessment and Mastery Portal (UAMP)

A comprehensive examination platform with AI-powered proctoring, question paper management, real-time monitoring, and multi-user support.

## 🎓 Features

### Core Features
- **User Management**: Role-based access (Student, Teacher, Admin) with 14+ test accounts
- **Question Paper Management**: Upload DOCX/PDF, manual MCQ builder, AI-generated questions
- **Exam Scheduling**: Flexible exam creation with proctoring controls and student assignment
- **Real-time Proctoring**: Tab switch monitoring, webcam streaming, AI-powered surveillance
- **Audit Trail**: Comprehensive logging of all critical actions
- **Offline Support**: IndexedDB for exam runtime reliability
- **Secure Authentication**: JWT-based auth with role permissions
- **Multi-Browser Support**: Login from different browsers with separate sessions

### Recent Enhancements (August 2026)
- ✅ **Select All Students**: One-click student selection in exam scheduling
- ✅ **Admin-Teacher Flow**: Teachers can see and manage exams created by admins
- ✅ **Automatic Announcements**: System-wide notifications for new exam schedules
- ✅ **Password Validation**: Clear error messages for wrong password/user not found
- ✅ **Student Submit Button**: Fixed visibility and submission workflow
- ✅ **Live Proctoring for Admins**: Admins can access live monitoring dashboard
- ✅ **Focus Color Fix**: Purple accent colors instead of white rings
- ✅ **WebSocket Server Fix**: Resolved WebSocket crash issues
- ✅ **Multi-Browser Login**: Full support for concurrent logins from different browsers

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Angular 22.1.0
- TypeScript
- TensorFlow.js (AI proctoring)
- Dexie.js (IndexedDB storage)
- WebRTC (Real-time video streaming)

**Backend:**
- Node.js + Express.js
- Neon PostgreSQL (Database)
- AWS S3-compatible storage (Neon storage)
- JWT Authentication
- WebSocket Server (WebRTC signaling)
- WebRTC (Real-time video streaming)

**DevOps:**
- Docker & Docker Compose
- Nginx (Reverse proxy)
- Render (Cloud deployment platform)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Neon Database account
- AWS S3 (or Neon storage) credentials (optional)

### Option 1: Manual Setup (Recommended for Development)

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Update .env with your Neon and AWS credentials
npm start
```
**Backend runs on:** `http://localhost:3000`

#### Frontend Setup
```bash
cd uamp-angular
npm install
ng serve
```
**Frontend runs on:** `http://localhost:4200`

### Option 2: Docker (Production)
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

### Option 3: Cloud Deployment (Render)
```bash
# Deploy to Render cloud platform
# Follow DEPLOYMENT_GUIDE.md for detailed instructions
# Repository: https://github.com/Chaitanya2005-hub/UAMP
```

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
  apiBaseUrl: '/api',  // Uses proxy in development
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
│   │   ├── add-new-courses.js  # Add new courses to database
│   │   ├── add-notifications.js  # Add notifications
│   │   ├── add-question-paper-deadline.js  # Manage paper deadlines
│   │   ├── create-students.js  # Create student accounts
│   │   ├── seed-demo-data.js   # Demo data seeding
│   │   ├── setup-exam-data.js   # Setup exam data
│   │   ├── setup-test-data.js   # Setup test data
│   │   ├── verify-courses.js   # Verify courses in database
│   │   └── verify-students.js  # Verify student accounts
│   ├── Dockerfile
│   ├── render.yaml              # Render deployment config
│   └── package.json
├── uamp-angular/                # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/               # Authentication module
│   │   │   ├── admin/              # Admin module
│   │   │   │   ├── approvals/       # Question paper approvals
│   │   │   │   ├── live-audit-dashboard/  # Live monitoring
│   │   │   │   ├── intervention-controls/  # Proctoring controls
│   │   │   │   └── manage-exams/     # Exam management
│   │   │   ├── teacher/            # Teacher module
│   │   │   │   ├── exam-schedule/    # Exam scheduling with select all
│   │   │   │   ├── monitoring/       # Live proctoring
│   │   │   │   ├── question-paper/  # Question paper management
│   │   │   │   └── teacher-dashboard/  # Teacher dashboard
│   │   │   ├── student/            # Student module
│   │   │   │   ├── exam/             # Exam taking with submit button
│   │   │   │   └── proctor-overlay/   # Camera streaming
│   │   │   ├── core/               # Core services and interceptors
│   │   │   └── shared/             # Shared components
│   │   ├── environments/         # Environment configuration
│   │   └── styles.scss           # Global styles with focus colors
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── render.yaml              # Render deployment config
│   └── package.json
├── docker-compose.yml          # Docker orchestration
├── .docker.env                 # Docker environment variables
├── DEPLOYMENT_GUIDE.md         # Cloud deployment instructions
├── LOCAL_NETWORK_DEPLOYMENT.md # Local network testing guide
├── RUNNING_GUIDE.md            # Quick start and troubleshooting
└── README.md
```

## 🔐 Default Login Credentials

### Admin
- Email: `admin@uamp.edu`
- Password: `admin123`

### Teacher
- Email: `teacher@uamp.edu`
- Password: `teacher123`

### Students (14 Accounts)
1. STU001 - Student User: `student@uamp.edu` / `student123`
2. STU002 - Priya Sharma: `priya.sharma@uamp.edu` / `priya123`
3. STU003 - Arjun Reddy: `arjun.reddy@uamp.edu` / `arjun123`
4. STU004 - Fatima Khan: `fatima.khan@uamp.edu` / `fatima123`
5. STU005 - Rahul Kumar: `rahul.kumar@uamp.edu` / `rahul123`
6. STU006 - Priya Singh: `priya.singh@uamp.edu` / `priya123`
7. STU007 - Amit Patel: `amit.patel@uamp.edu` / `amit123`
8. STU008 - Sneha Gupta: `sneha.gupta@uamp.edu` / `sneha123`
9. STU009 - Vikram Sharma: `vikram.sharma@uamp.edu` / `vikram123`
10. STU010 - Nisha Verma: `nisha.verma@uamp.edu` / `nisha123`
11. STU011 - Rohit Mehta: `rohit.mehta@uamp.edu` / `rohit123`
12. STU012 - Kavita Rani: `kavita.rani@uamp.edu` / `kavita123`
13. STU013 - Deepak Joshi: `deepak.joshi@uamp.edu` / `deepak123`
14. STU014 - Pooja Kumari: `pooja.kumari@uamp.edu` / `pooja123`

## 📊 Available Courses

- CS101 - Introduction to Computer Science
- CS201 - Data Structures and Analysis
- CS301 - Theory of Computation
- CS401 - Angular Framework
- CS402 - Advanced Java Programming

## 🎯 Key Features & Usage

### Multi-Browser Login
- **Chrome**: Login as admin for full system access
- **Firefox**: Login as teacher for exam management
- **Edge**: Login as student for exam taking
- **Incognito**: Separate sessions for testing different roles

### Exam Scheduling with Select All
- Navigate to Teacher → Schedule Exam
- Fill in exam details (title, course, duration, etc.)
- In "Assign Students" section, click "Select All" to assign all students at once
- Click "Deselect All" to clear all selections
- Individual selection still available

### Admin-Teacher Collaboration
- Admins can create exams that teachers can see and manage
- Teachers can upload question papers for any exam they have access to
- Automatic announcements notify all admins and teachers of new exams
- Unified dashboard shows all relevant exams regardless of creator

### Live Proctoring System
- **Student Side**: Camera and microphone capture during exams
- **Teacher Side**: Live video feeds of all students during exams
- **Admin Side**: Access to live proctoring dashboard
- **WebRTC**: Real-time peer-to-peer video streaming
- **WebSocket**: Signaling server for connection management

### Improved Error Handling
- **Login**: Clear messages for "Wrong password" vs "User not found"
- **Form Validation**: Purple accent focus rings instead of white
- **API Errors**: User-friendly error messages throughout

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uamp.edu","password":"admin123"}'
```

### Test API Through Proxy
```bash
curl http://localhost:4200/api/health
curl -X POST http://localhost:4200/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uamp.edu","password":"admin123"}'
```

## 🌐 Deployment Options

### Local Network Testing
- Run servers locally with your local IP
- Access from different devices on your network
- Quick multi-device testing without cloud deployment
- See `LOCAL_NETWORK_DEPLOYMENT.md` for details

### Cloud Deployment (Render)
- Free tier available for testing
- HTTPS/SSL automatically configured
- Public URL for remote access
- See `DEPLOYMENT_GUIDE.md` for step-by-step instructions
- Repository: https://github.com/Chaitanya2005-hub/UAMP

### Docker Deployment
- Production-ready containerized setup
- Easy local deployment with `docker-compose up`
- See existing `docker-compose.yml` for configuration

## 📹 Live Video Streaming System

The UAMP platform features a **real-time video streaming system** for exam proctoring using WebRTC technology.

### Technical Implementation
- **Student Portal**: WebRTC API for video/audio capture and streaming
- **Backend**: WebSocket server for WebRTC signaling and connection management
- **Teacher Dashboard**: Live video feeds of all students during exams
- **Admin Dashboard**: Access to live proctoring monitoring
- **Protocol**: WebRTC for P2P video streaming, WebSocket for signaling

### Features
- ✅ Real-time video streaming from students to teachers/admins
- ✅ Multiple concurrent student video feeds
- ✅ Connection status indicators for all participants
- ✅ Automatic resource cleanup when connections end
- ✅ Low latency peer-to-peer connections
- ✅ Fixed WebSocket server crash issues

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication with refresh tokens
- **Role-Based Access Control**: Fine-grained permissions for each user role
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via Neon serverless
- **Proctoring**: Tab switch monitoring, fullscreen guard, webcam streaming

## 📱 User Roles & Capabilities

### Admin
- Approve/reject question papers
- Monitor live audit dashboard
- Control interventions during exams
- View audit trails
- Access live proctoring monitoring
- Create exams visible to teachers

### Teacher
- Create and manage question papers
- Upload DOCX/PDF files
- Build MCQs manually
- Generate questions with AI
- Monitor student proctoring feeds
- View incident timelines
- Manage exams created by admins
- Upload question papers for accessible exams

### Student
- View exam dashboard
- Access hall tickets
- Take exams with proctoring and video streaming
- View submission status
- Use enhanced submit button during exams
- Real-time camera and microphone capture

## 🎯 Recent Updates (August 2026)

### New Features
- ✅ **Select All Option**: One-click student selection in exam scheduling
- ✅ **Admin-Teacher Collaboration**: Teachers can manage admin-created exams
- ✅ **Automatic Announcements**: System-wide notifications for new exams
- ✅ **Admin Live Proctoring**: Admins can access live monitoring dashboard
- ✅ **Multi-Browser Login**: Full support for concurrent sessions
- ✅ **Password Show/Hide**: Toggle password visibility in login form
- ✅ **Focus Color Fix**: Purple accent colors throughout the application

### Bug Fixes
- ✅ **Student Submit Button**: Fixed visibility and functionality
- ✅ **WebSocket Server**: Resolved crash issues
- ✅ **Focus Ring Colors**: Changed from white to purple accent
- ✅ **Login Error Messages**: Clear validation feedback
- ✅ **CORS Issues**: Fixed proxy configuration
- ✅ **Environment Variables**: Corrected API URL handling
- ✅ **Database Scripts**: Cleaned up test scripts, kept essential utilities

### Documentation
- ✅ **DEPLOYMENT_GUIDE.md**: Complete cloud deployment instructions
- ✅ **LOCAL_NETWORK_DEPLOYMENT.md**: Local network testing guide
- ✅ **RUNNING_GUIDE.md**: Quick start and troubleshooting
- ✅ **render.yaml files**: Ready for Render deployment
- ✅ **Updated README**: This comprehensive documentation

## 📝 Additional Documentation

- `01-system-architecture.md` - System architecture overview
- `02-neon-database-schema.md` - Complete database schema
- `03-angular-component-blueprint.md` - Angular component specifications
- `04-proctoring-security-engine.md` - Proctoring system details
- `05-ui-ux-animation-guide.md` - UI/UX guidelines

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or use different ports in .env files
```

### Angular Commands Not Working
```bash
# Make sure you're in the right directory
cd E:\UAMP\uamp-angular  # For Angular commands
ng serve  # Correct
ng build  # Correct

# NOT from server directory
cd E:\UAMP\server
ng serve  # ERROR: Not an Angular project
```

### Database Connection Issues
- Verify Neon connection string in `.env`
- Check Neon project status at console.neon.tech
- Ensure SSL mode is enabled in connection string

### Build Errors
- Clear Angular cache: `rm -rf node_modules/.angular`
- Reinstall dependencies: `npm install`
- Check Node.js version compatibility

### WebSocket Issues
- Ensure backend server is running on port 3000
- Check firewall allows WebSocket connections
- Verify WebSocket URL in environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎓 Acknowledgments

- Neon PostgreSQL for managed database
- Angular framework for frontend
- TensorFlow.js for AI proctoring
- Dexie.js for IndexedDB storage
- Render for cloud deployment platform
