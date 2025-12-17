# IPC Framework Backend

## Prerequisites

- GCC compiler
- OpenSSL development libraries
- POSIX-compliant system (Linux/Unix/macOS)

## Installation

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install build-essential libssl-dev
```

### macOS
```bash
brew install openssl
```

### Fedora/RHEL
```bash
sudo dnf install gcc openssl-devel
```

## Building

```bash
cd backend
make
```

This will create two executables:
- `ipc_core` - Standalone IPC system for testing
- `ipc_server` - Web server with IPC backend (port 8080)

## Running

### Option 1: Run standalone IPC core
```bash
make run_core
```

### Option 2: Run web server (recommended for frontend)
```bash
make run_server
```

The server will listen on http://localhost:8080

## Cleaning Up

```bash
make clean
```

This removes executables and cleans up IPC resources (shared memory, message queues).

## API Endpoints

- `GET /api/stats` - Get system statistics
- `POST /api/auth/login` - Authenticate user
- `POST /api/pipe/send` - Send data via pipe
- `POST /api/queue/send` - Send message via queue

## Security Features

- Token-based authentication
- SHA-256 password hashing
- 24-hour token expiration
- Encrypted IPC communication support
