# Claude Development Notes

## Localhost Connection Issues - SOLVED ✅

### Problem
- Browser shows "This site can't be reached" for localhost:3000
- Next.js shows "✓ Ready" but no actual HTTP connection possible
- `curl` returns "Connection refused" errors
- Issue persists across different ports (3000, 3001, 8080)

### Root Cause Analysis Process
1. **Test actual HTTP connection** - Don't trust startup messages
   ```bash
   curl -v http://localhost:3000
   ```
2. **Check if processes are actually running**
   ```bash
   ps aux | grep -E "(next|node)" | grep -v grep
   ```
3. **Verify port availability**
   ```bash
   lsof -i :3000
   ```

### Key Discovery
**The Next.js process wasn't actually staying running in the background.** The interactive terminal commands (`npm run dev`) were timing out and terminating the process, even though they showed "✓ Ready" messages.

### Solution
Start Next.js server in background with persistent process:
```bash
nohup npm run dev > server.log 2>&1 &
```

Then verify it's actually running:
```bash
ps aux | grep "next dev" | grep -v grep
```

Test connection:
```bash
curl -s http://localhost:3000 | head -5
```

### Verification Signs of Success
- `ps aux` shows the Next.js node process
- `server.log` shows compilation messages and HTTP requests
- `curl` returns HTML content instead of connection errors
- Browser successfully loads the application

### Prevention for Future
1. Always use background process (`nohup ... &`) for development servers
2. Verify actual process is running, not just startup messages
3. Test HTTP connection with `curl` before assuming browser issues
4. Check `server.log` for real-time request/error monitoring

### Commands for Quick Diagnosis
```bash
# Check if server is actually running
ps aux | grep "next dev" | grep -v grep

# Test HTTP connection
curl -v http://localhost:3000

# View server logs in real-time
tail -f server.log

# Restart server properly
pkill -f "next" && nohup npm run dev > server.log 2>&1 &
```

## Development Server Management

### Start Development Server
```bash
nohup npm run dev > server.log 2>&1 &
```

### Stop Development Server
```bash
pkill -f "next"
```

### Monitor Server Status
```bash
tail -f server.log
```

### Test Scripts Available
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## CSS Configuration Notes
- Using Tailwind CSS v4.1.7 with PostCSS
- Fixed CSS compilation issues by removing problematic utility classes
- Replace `@apply border-border` with `border-color: hsl(var(--border))`
- Replace `@apply bg-background` with `background-color: hsl(var(--background))`