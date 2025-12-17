# IPC Framework

A comprehensive Inter-Process Communication (IPC) framework with security features, built with C backend and modern web frontend.

## 🚀 How It's Running

### Current Mode: **Browser Simulation**

The dashboard you're viewing is running in **simulation mode** - a fully functional browser-based demo that:
- ✅ Runs entirely in your browser (no backend required)
- ✅ Simulates realistic IPC operations with random activity
- ✅ Demonstrates all UI features and monitoring capabilities
- ✅ Perfect for exploring the interface and understanding the framework

**To switch to PRODUCTION MODE** with real system-level IPC:
1. Compile and run the C backend (see Backend Setup below)
2. Uncomment the API calls in `app/page.tsx` and `components/ipc-methods-panel.tsx`
3. The dashboard will connect to the actual C backend on `localhost:8080`

## Features

### IPC Methods
- **Pipes**: Unidirectional data streams between processes
- **Message Queues**: Asynchronous message passing with priority support
- **Shared Memory**: Direct memory access shared between processes

### Security
- Token-based authentication
- SHA-256 password hashing
- AES-256 encryption support
- 24-hour session expiry
- Unauthorized access prevention

### Dashboard
- Real-time monitoring of IPC channels
- System statistics and metrics
- Activity feed with live updates
- Beautiful dark theme optimized for technical users

## Architecture

```
ipc-framework/
├── backend/           # C backend with IPC core
│   ├── ipc_core.c    # Core IPC implementation
│   ├── ipc_server.c  # Web server bridge
│   ├── Makefile      # Build configuration
│   └── README.md     # Backend documentation
├── app/              # Next.js frontend
├── components/       # React components
└── README.md         # This file
```

## Getting Started

### Option 1: Explore Simulation Mode (Current)

**No setup required!** The dashboard is already running with simulated IPC data. Perfect for:
- Understanding the UI and features
- Seeing how IPC monitoring works
- Testing the reporting module
- Evaluating the framework before implementation

### Option 2: Run with Real C Backend (Production)

#### Prerequisites

**Backend:**
- GCC compiler
- OpenSSL development libraries (`libssl-dev` on Ubuntu/Debian)
- POSIX-compliant system (Linux/Unix/macOS)

**Frontend:**
- Node.js 18+ (automatically handled by v0)

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install OpenSSL if needed (Ubuntu/Debian)
sudo apt-get install libssl-dev

# Build the IPC server
make

# Run the server
make run_server
```

The backend server will start on **http://localhost:8080**

Expected output:
```
[IPC Server] Initializing security system...
[IPC Server] Security initialized
[IPC Server] Server listening on port 8080...
```

#### Connect Frontend to Backend

Uncomment the fetch calls in:
- `app/page.tsx` (lines with `// await fetch...`)
- `components/ipc-methods-panel.tsx` (API POST requests)

The dashboard will now display **real** IPC operations from the C backend!

#### Quick Test

1. Send a message via pipe: Dashboard → "Send via Pipe" button
2. Watch backend console for: `[Pipe] Data sent successfully`
3. See activity appear in the Activity Feed
4. Check Reports module for detailed metrics

## API Endpoints

- `GET /api/stats` - Get system statistics
- `POST /api/auth/login` - Authenticate user
- `POST /api/pipe/send` - Send data via pipe
- `POST /api/queue/send` - Send message to queue

## Security Features

- **Authentication**: Token-based with 24-hour expiry
- **Encryption**: AES-256 for sensitive data
- **Hashing**: SHA-256 for passwords
- **Access Control**: Prevents unauthorized IPC access

## 📊 Reports Module

The framework includes a comprehensive reporting system:

**Overview Tab:**
- Total operations across all IPC methods
- Success rate and average latency
- Security events and active processes
- System health status

**Performance Tab:**
- Per-method operation counts
- Average execution times
- Throughput statistics
- Error distribution charts
- Resource utilization graphs

**Security Tab:**
- Authentication attempts and status
- Warning and critical event counts
- Detailed security event log with timestamps

**Export Options:**
- JSON format for programmatic analysis
- CSV format for spreadsheet analysis

## Technical Stack

**Backend:**
- C with POSIX IPC APIs
- OpenSSL for cryptography
- Multi-threaded socket server
- HTTP/1.1 REST API

**Frontend:**
- Next.js 16 with App Router
- React 19 with hooks and useEffectEvent
- Tailwind CSS v4 with custom design tokens
- shadcn/ui components
- Real-time state management with React hooks

## 🔧 Troubleshooting

**Backend won't compile:**
- Ensure OpenSSL is installed: `sudo apt-get install libssl-dev`
- Check GCC version: `gcc --version` (requires 7.0+)

**Frontend can't connect to backend:**
- Verify backend is running: `curl http://localhost:8080/api/stats`
- Check CORS settings in `ipc_server.c`
- Ensure ports 8080 (backend) and 3000 (frontend) are available

**Simulation mode shows no activity:**
- Check browser console for errors
- Refresh the page to restart simulation
- Clear browser cache if issues persist

## License

MIT License - feel free to use in your projects!
