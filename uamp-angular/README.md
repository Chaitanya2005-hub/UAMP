# UAMP Angular Frontend

This is the Angular frontend for the University Assessment and Mastery Portal (UAMP). It provides a comprehensive examination platform with AI-powered proctoring, question paper management, and real-time monitoring capabilities.

## 🎯 Application Overview

UAMP Angular is built with **Angular 22.1.0** and provides a modern, responsive interface for:

- **User Management**: Role-based access (Student, Teacher, Admin)
- **Question Paper Management**: Upload DOCX/PDF, manual MCQ builder, AI-generated questions
- **Exam Scheduling**: Flexible exam creation with proctoring controls
- **Real-time Proctoring**: Tab switch monitoring, webcam streaming, AI-powered surveillance
- **Audit Trail**: Comprehensive logging of all critical actions
- **Offline Support**: IndexedDB for exam runtime reliability

## 🏗️ Technology Stack

- **Angular 22.1.0** - Modern web framework
- **TypeScript 6.0.2** - Type-safe JavaScript
- **TensorFlow.js 4.20.0** - AI proctoring capabilities
- **Dexie.js 4.4.4** - IndexedDB storage for offline support
- **Vitest 2.1.0** - Testing framework
- **RxJS 7.8.0** - Reactive programming
- **WebRTC API** - Real-time video/audio streaming
- **WebSocket API** - Real-time signaling for WebRTC connections

## 🚀 Development Server

To start a local development server, run:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🔧 Building

To build the project for production:

```bash
npm run build
# or
ng build
```

This will compile the project and store the build artifacts in the `dist/` directory. The production build optimizes the application for performance and speed.

### Development Build

For a development build with source maps:

```bash
ng build --configuration development
```

## 🧪 Testing

### Unit Tests

To execute unit tests with Vitest:

```bash
npm test
# or
ng test
```

### Watch Mode

To run tests in watch mode:

```bash
npm run test:watch
```

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/              # Admin module
│   │   ├── admin-dashboard/
│   │   ├── approvals/
│   │   ├── manage-exams/
│   │   ├── permission-management/
│   │   └── live-audit-dashboard/
│   ├── teacher/            # Teacher module
│   │   ├── teacher-dashboard/
│   │   ├── question-paper/
│   │   │   ├── ai-generator/
│   │   │   ├── mcq-builder/
│   │   │   ├── upload-parser/
│   │   │   └── uploaded-papers/
│   │   ├── exam-schedule/
│   │   ├── scheduled-exams/
│   │   └── monitoring/
│   │       ├── live-proctoring/
│   │       └── incident-timeline/
│   ├── student/            # Student module
│   │   ├── student-dashboard/
│   │   ├── exam/
│   │   │   ├── exam-lobby/
│   │   │   ├── exam-runner/
│   │   │   ├── exam-submitted/
│   │   │   ├── question-panel/
│   │   │   └── proctor-overlay/
│   │   └── hall-ticket/
│   ├── auth/               # Authentication module
│   ├── core/               # Core services and models
│   │   ├── services/
│   │   ├── models/
│   │   └── guards/
│   └── shared/             # Shared components
│       ├── glass-panel/
│       ├── exam-config/
│       └── pipes/
├── environments/           # Environment configurations
└── styles/                # Global styles
```

## 🔐 Environment Configuration

The application uses environment files for different configurations:

- `src/environments/environment.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment

### Environment Variables

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  websocketUrl: 'ws://localhost:3000/ws',
};
```

## 🎨 Available Courses

The system supports the following courses:

- **CS101** - Introduction to Computer Science
- **CS201** - Data Structures and Analysis
- **CS301** - Theory of Computation
- **CS401** - Angular Framework
- **CS402** - Advanced Java Programming

## 👥 User Roles & Access

### Admin
- Approve/reject question papers
- Monitor live audit dashboard
- Control interventions during exams
- View audit trails
- Manage permissions

### Teacher
- Create and manage question papers
- Upload DOCX/PDF files
- Build MCQs manually
- Generate questions with AI
- **Monitor student proctoring feeds** with live video streaming
- View incident timelines
- Schedule exams
- **Real-time video monitoring** of students during exams

### Student
- View exam dashboard
- Access hall tickets
- Take exams with proctoring
- View submission status
- Check performance metrics
- **Live Video Streaming**: Real-time webcam and microphone streaming during exams

## 🔌 API Integration

The frontend communicates with the backend API through the following services:

- **AuthService** - Authentication and authorization
- **ExamService** - Exam management and execution
- **QuestionPaperService** - Question paper CRUD operations
- **ProctoringFeedService** - Real-time proctoring data
- **LocalEncryptionService** - Client-side encryption
- **IndexedDbExamStoreService** - Offline exam storage

## 🐳 Docker Deployment

The Angular application can be deployed using Docker:

```bash
# Build the Docker image
docker build -t uamp-angular .

# Run the container
docker run -p 80:80 uamp-angular
```

## 📝 Recent Updates

**August 2026:**
- ✅ **Live Video Streaming**: Implemented real-time WebRTC video streaming for exam proctoring
- ✅ **Student Camera Integration**: Enhanced proctor overlay with camera/microphone capture and streaming
- ✅ **Teacher Video Dashboard**: Updated live proctoring component to receive and display student video feeds
- ✅ **WebRTC Signaling**: Added WebSocket-based WebRTC signaling infrastructure
- ✅ **Multiple Stream Support**: Enabled simultaneous video streaming from multiple students
- ✅ **Resource Management**: Implemented proper cleanup for WebRTC connections and WebSockets
- ✅ **Fixed exam starting issue** - students were stuck on "Starting..."
- ✅ **Improved exam lobby logic** to better detect admin-started exams
- ✅ **Enhanced admin approvals component** with real API integration
- ✅ **Added comprehensive student account support**
- ✅ **Improved question paper workflow** with immediate saving
- ✅ **Fixed timetable issues** for exam scheduling
- ✅ **Updated course list** with new subjects
- ✅ **Configured Vitest** for proper testing setup

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## 📄 License

This project is part of the University Assessment and Mastery Portal system.

## 🔗 Related Resources

- [Backend Server](../server/README.md)
- [Main Project README](../README.md)
- [Angular Documentation](https://angular.dev)
- [Angular CLI](https://angular.dev/tools/cli)
