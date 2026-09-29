# __CT_PROJECT_NAME__

Ultra-fast web and REST API service built with Go and Go Fiber v2.

## 🚀 Getting Started

### 1. Download and sync dependencies
```bash
go mod tidy
```

### 2. Configure environment
```bash
cp .env.example .env
```

### 3. Start development server
```bash
go run main.go
```
The server will run on [http://localhost:8080](http://localhost:8080).
Health check: [http://localhost:8080/health](http://localhost:8080/health).

### 4. Build binary
```bash
go build -o server main.go
```
