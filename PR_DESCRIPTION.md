# Mobile Flutter Integration

## Overview
This PR implements Flutter WebView integration for the EcoCash Assistant, enabling seamless embedding of the chat UI in mobile applications with JWT authentication and context-aware transaction help flows.

## Key Features

### 🔐 Authentication & Security
- JWT token passing from Flutter app to WebView via postMessage
- Token forwarding through CopilotKit to backend API
- Backend JWT extraction utilities for authenticated tool calls
- Secure origin validation for postMessage communication

### 📱 Mobile Integration
- Flutter WebView integration with JavaScript bridge
- Mobile wrapper HTML for testing WebView scenarios
- Context-aware flows (transaction help with automatic detail fetching)
- Responsive UI optimized for mobile devices

### 🎯 Transaction Help Flow
- Automatic transaction detail fetching when transaction ID is provided
- Context-aware conversation initiation
- Seamless user experience from transaction page to chat

### 🐛 Bug Fixes
- Fixed React hydration errors in Next.js
- Prevented welcome message flash in mobile/iframe scenarios
- Consistent server/client rendering

### 💰 Cost Optimization
- Updated LLM from `gpt-4-turbo-preview` to `gpt-4o-mini` for significant cost savings

### 📚 Documentation
- Organized all documentation into `docs/` folder
- Comprehensive documentation index in README
- Mobile integration guide for Flutter developers
- Removed outdated and temporary documentation files

## Technical Changes

### Frontend
- **New Files:**
  - `frontend/lib/hooks/use-mobile-auth.ts` - JWT authentication hook
  - `frontend/lib/hooks/use-mobile-context.ts` - Context management hook
  - `frontend/lib/mobile-bridge.ts` - TypeScript types for mobile communication
  - `frontend/public/mobile-wrapper.html` - Testing wrapper for WebView simulation

- **Modified Files:**
  - `frontend/app/page.tsx` - Integrated mobile hooks, fixed hydration issues
  - `frontend/app/api/copilotkit/route.ts` - Header forwarding for JWT
  - `frontend/components/widgets/*` - Mobile responsiveness improvements

### Backend
- **New Files:**
  - `backend/app/auth.py` - JWT extraction utilities

- **Modified Files:**
  - `backend/engine/chat.py` - Updated to use gpt-4o-mini, enhanced transaction help workflow
  - `backend/agent/tools.py` - Prepared for JWT-based authenticated calls

## Testing

### Manual Testing
1. **Mobile Wrapper Testing:**
   ```bash
   # Start frontend
   cd frontend && npm run dev
   
   # Open in browser
   http://localhost:3000/mobile-wrapper.html?transactionId=txn_1
   ```

2. **Transaction Help Flow:**
   - Load wrapper with transaction ID
   - Verify automatic transaction detail fetching
   - Verify no welcome message flash
   - Verify conversation continues from transaction context

### Test Scenarios
- ✅ JWT token passing via postMessage
- ✅ Transaction context triggering automatic detail fetch
- ✅ No hydration errors
- ✅ No welcome message flash in mobile scenarios
- ✅ Responsive UI on mobile devices

## Breaking Changes
None - All changes are backward compatible. Web version continues to work without mobile bridge.

## Migration Guide
No migration needed. Mobile integration is opt-in via WebView embedding.

## Related Issues
- Mobile Flutter integration requirement
- Transaction help flow enhancement
- Cost optimization (LLM model update)

## Checklist
- [x] Code follows project style guidelines
- [x] Tests pass (manual testing completed)
- [x] Documentation updated
- [x] No breaking changes
- [x] Mobile responsiveness verified
- [x] Security considerations addressed (origin validation)

## Screenshots/Demo
- Mobile wrapper HTML provides full testing environment
- Transaction help flow automatically fetches and displays transaction details
- Clean, responsive UI optimized for mobile devices

