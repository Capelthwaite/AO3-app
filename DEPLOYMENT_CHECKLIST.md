# 🚀 Localhost Deployment Checklist

## Pre-Deployment Checks

### 1. **Clean Process Environment**
```bash
# Kill any stuck Next.js processes
ps aux | grep -E "(next|node)" | grep -v grep
# If found, kill specific PIDs: kill -9 <PID>

# Clear port 3000
lsof -ti :3000 | xargs -r kill -9 2>/dev/null || true
netstat -an | grep :3000  # Should show no output
```

### 2. **Code Validation** ⚠️ CRITICAL - This prevents "server ready but not accessible" issues
```bash
# ⚠️  REQUIRED: Check TypeScript compilation FIRST (prevents startup crashes)
npm run typecheck

# Check for linting issues  
npm run lint

# Test build compilation
npm run build
```

### 3. **Database Connectivity**
```bash
# Push any pending schema changes
npx drizzle-kit push

# Test database connection
# (Connection test would go here if we had one)
```

### 4. **Environment Variables**
- [ ] `.env.local` exists and is properly configured
- [ ] Database URL is accessible
- [ ] Auth secrets are set
- [ ] All required environment variables are present

## Deployment Process

### 1. **Clean Startup**
```bash
# Navigate to project directory
cd "/Users/marsha/Claude AO3 app /nextjs-starter-kit"

# Clear Next.js cache
rm -rf .next

# Fresh install (if needed)
# npm install

# ⚠️  RECOMMENDED: Use safe dev script that includes pre-checks
npm run dev:safe
# OR use regular dev (only if you've already run typecheck)
# npm run dev
```

### 2. **Health Check**
```bash
# Wait 30 seconds after startup
sleep 30

# Test localhost connectivity
curl -s -I http://localhost:3000
# Should return HTTP/1.1 200 OK

# Test specific route
curl -s -I http://localhost:3000/dashboard/browse
# Should return HTTP/1.1 200 OK
```

### 3. **Functional Verification**
- [ ] Homepage loads successfully
- [ ] Dashboard loads successfully  
- [ ] Browse Stories shows empty state (filter selection)
- [ ] Filter creation wizard works
- [ ] Story search functionality works
- [ ] Authentication system works

## Critical Issue: "Server Ready but Not Accessible"

### **TypeScript Compilation Errors**  
**Symptoms**: Next.js says "Ready in X ms" but localhost:3000 is not accessible  
**Root Cause**: TypeScript compilation errors cause immediate server crashes  
**Solution**:
```bash
# Always check TypeScript compilation FIRST
npm run typecheck
# Fix any errors shown, then restart
npm run dev
```

**Prevention**: Always use `npm run dev:safe` instead of `npm run dev`

---

## Common Issue Fixes

### **Port 3000 Blocked**
```bash
# Find and kill process using port 3000
lsof -ti :3000 | xargs -r kill -9 2>/dev/null
# Alternative: pkill -f "next-server"
```

### **Import Path Errors**
- Check all import paths use correct aliases (@/lib, @/components, etc.)
- Verify file extensions are correct (.ts, .tsx)
- Ensure all imported files exist

### **Authentication Issues**
- Verify auth import: `import { auth } from '@/lib/auth'`
- Use correct auth API: `auth.api.getSession({ headers: request.headers })`
- Check database connection for auth tables

### **Build/Compilation Errors**
- Fix TypeScript errors first
- Address linting warnings
- Check for missing dependencies
- Verify all components are properly exported

## Prevention Measures

### **Before Each Development Session:**
1. Run process cleanup commands
2. Verify port 3000 is free
3. Test build compilation
4. Check environment variables

### **After Each Development Session:**
1. Gracefully stop development server (Ctrl+C)
2. Verify no orphaned processes remain
3. Note any recurring issues

### **Regular Maintenance:**
- Weekly: Clear node_modules and reinstall if issues persist
- Monthly: Update dependencies and test compatibility
- Keep deployment checklist updated with new fixes

## Emergency Reset Process

If localhost is completely broken:

```bash
# Nuclear option - complete reset
pkill -f "next"
pkill -f "node.*3000"
rm -rf .next
rm -rf node_modules  
npm install
npm run build
npm run dev
```

## Success Indicators

✅ Port 3000 is accessible  
✅ No compilation errors  
✅ No import path issues  
✅ Database connections work  
✅ Authentication functions properly  
✅ All major routes load successfully  

Last Updated: $(date)