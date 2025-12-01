# Authentication & API Security Plan for Instrumentator

## Overview
Implement passcode-protected access with secure API key management using Supabase:
- Single shared passcode: `F|0d3$K!`
- No email/domain verification
- Persistent session (localStorage on frontend)
- Supabase Edge Functions to securely proxy Gemini API
- API key stored server-side in Supabase secrets
- Maximum future flexibility (can migrate anywhere)

## Current Architecture Analysis
- **Frontend**: React 18 + TypeScript (SPA) deployed on Netlify
- **API Key Management**: Currently exposed in browser via Vite `define` ⚠️
- **No Backend**: Running as a frontend-only application
- **Database**: None currently
- **Deployment**: Netlify (frontend only)

## Problem & Solution

### The Challenge
- API key is embedded in the frontend build (security risk to bad actors)
- Need passcode protection before allowing access
- Session must persist across browser restarts
- Want future flexibility (not locked into Netlify/specific platform)

### Solution: Supabase Backend + Client-Side Passcode
**Build with Supabase to:**
1. Keep API key server-side (protected)
2. Proxy Gemini API calls through Supabase Edge Functions
3. Store environment secrets in Supabase
4. Validate passcode client-side (simple UX)
5. Maintain flexibility for future migrations

## Implementation Strategy

### Supabase Architecture
- **Frontend**: React with client-side passcode validation + localStorage
- **Backend**: Supabase Edge Functions (proxy API calls)
- **Storage**: Supabase Secrets (for GEMINI_API_KEY)
- **Database**: Not needed initially, but available for future features

**Why Supabase:**
- ✅ Free tier is generous for internal tools
- ✅ Edge Functions = serverless with great performance
- ✅ Secrets management built-in
- ✅ Can add database later if needed
- ✅ Good migration path to other platforms

## Technical Architecture

```
Browser (Frontend)
    ├── Login Page (if not authenticated)
    │   └── Passcode input → localStorage
    └── Main App (if authenticated)
        └── Calls Supabase Edge Functions
            ↓
Supabase Backend
    ├── Edge Functions (generateEvents, refineEvents)
    ├── Secrets Management (GEMINI_API_KEY)
    └── Calls Gemini API with secure key
```

## Setup: Supabase Project Creation

**Before starting implementation:**

1. **Create new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `instrumentator` (or your preference)
   - Database password: Generate (save it)
   - Region: Choose closest to users
   - Click "Create new project" (takes 1-2 min)

2. **Get your Supabase credentials:**
   - Project Settings → API
   - Copy: **Project URL** and **Anon Public Key**
   - You'll need these for frontend `.env.local`

3. **Store your Gemini API key in Supabase:**
   - Project Settings → Secrets
   - Click "New Secret"
   - Name: `GEMINI_API_KEY`
   - Value: `your-gemini-api-key`
   - Click "Create Secret"

## Implementation Steps

### Phase 1: Frontend - Authentication Infrastructure
1. Create auth utilities
   - `src/utils/auth.ts` - Passcode validation function
   - Constant: `PASSCODE = 'F|0d3$K!'`

2. Create Auth Context
   - `src/contexts/AuthContext.tsx`
   - Manage `isAuthenticated` state
   - Load auth state from localStorage on mount
   - Provide `login()` and `logout()` functions

3. Custom hook
   - `src/hooks/useAuth.ts` - Easy access to auth context

### Phase 2: Frontend - Login UI
1. Create Login Page component
   - `src/pages/LoginPage.tsx`
   - Centered modal-like layout
   - Single passcode input field
   - Submit button
   - Error message for incorrect passcode
   - Professional styling matching app theme

2. Styling
   - Match existing Instrumentator design
   - Activity icon in header
   - "Enter Passcode" heading
   - Input field with focus states

### Phase 3: Backend - Supabase Edge Functions
1. Create Supabase client in frontend
   - Install: `npm install @supabase/supabase-js`
   - Create: `src/lib/supabaseClient.ts`
   - Initialize with Project URL and Anon Key

2. Create Edge Functions
   - `supabase/functions/generateEvents/index.ts`
   - `supabase/functions/refineEvents/index.ts`
   - Both functions:
     - Accept POST requests with description/image
     - Call Gemini API using server-side API key
     - Return generated events as JSON

3. Core logic (platform-agnostic)
   - `supabase/functions/lib/geminiClient.ts` - Gemini wrapper
   - `supabase/functions/lib/config.ts` - Config handling

### Phase 4: Frontend - API Service Integration
1. Update geminiService.ts
   - Replace Gemini client calls with Supabase function calls
   - Use `supabase.functions.invoke()`
   - Pass description and image to backend

2. Update App.tsx
   - Import useAuth hook
   - Show LoginPage if not authenticated
   - Show main app if authenticated
   - Add logout button in header

### Phase 5: Testing & Deployment
1. Test locally with `supabase start` (local development)
2. Deploy Edge Functions to Supabase
3. Test frontend → backend → Gemini flow
4. Build and deploy frontend to Netlify

## Files to Create/Modify

### New Files (Frontend)
```
src/
├── contexts/
│   └── AuthContext.tsx           # Auth state management + localStorage
├── pages/
│   └── LoginPage.tsx             # Login UI (passcode input)
├── hooks/
│   └── useAuth.ts                # Custom hook for auth context
├── utils/
│   └── auth.ts                   # Passcode validation
└── lib/
    └── supabaseClient.ts         # Supabase client initialization
```

### New Files (Backend)
```
supabase/
├── functions/
│   ├── generateEvents/
│   │   └── index.ts              # Edge function for event generation
│   ├── refineEvents/
│   │   └── index.ts              # Edge function for event refinement
│   └── lib/
│       ├── geminiClient.ts       # Gemini API client (reusable)
│       ├── types.ts              # Type definitions
│       └── config.ts             # Config and env helpers
└── migrations/
    └── (Supabase auto-manages)
```

### Modified Files
```
src/
├── index.tsx                # Wrap App with AuthProvider
├── App.tsx                  # Use useAuth, show LoginPage if not authenticated
├── services/
│   └── geminiService.ts     # Update to call Supabase functions instead
└── vite.config.ts           # Add Supabase env vars, remove GEMINI_API_KEY define
```

### New Config Files
```
.env.local (add to .gitignore - never commit!)
├── VITE_SUPABASE_URL=<your-project-url>
├── VITE_SUPABASE_ANON_KEY=<your-anon-key>
└── GEMINI_API_KEY=<not needed here anymore>

supabase/.env.local (local dev only)
└── (Supabase handles this)
```

## Authentication & API Flow

### User Login (Client-Side)
1. User lands on app
2. Check `localStorage.instrumentator_auth`
   - If valid → Show main app
   - If not → Show LoginPage
3. User enters passcode
4. Validate locally against `'F|0d3$K!'`
5. If correct:
   - Store `{ authenticated: true, timestamp: Date.now() }` in localStorage
   - Show main app
6. If incorrect:
   - Show error message
   - User can retry

### API Call Flow (When using app)
1. User uploads image/description
2. Frontend calls Supabase Edge Function: `generateEvents`
3. Supabase function receives:
   - `description`: string
   - `imageBase64`: string (optional)
4. Function retrieves API key from Supabase Secrets
5. Function calls Gemini API with server-side key
6. Returns generated events to frontend
7. Frontend displays in table

**User's API key never exposed to browser!**

### Logout
1. User clicks logout button in header
2. Clear localStorage
3. Return to LoginPage

### Session Persistence
- On page load: Check localStorage for auth token
- If valid: Restore authenticated state
- If not: Show LoginPage
- Session persists across browser restarts until user manually logs out

## Security Considerations

1. **API Key**: Server-side in Supabase Secrets
   - ✅ Never exposed to browser
   - ✅ Protected from bad actors exploiting it
   - ✅ Can rotate in Supabase dashboard without code changes

2. **Passcode**: Hardcoded in frontend code
   - ⚠️ Inspectable in browser (but that's OK - it's just an access gate)
   - Only protects against casual/accidental access
   - Bad actors can't use API directly (key is server-side)

3. **Session Persistence**: localStorage
   - ✅ Data survives browser restart (per requirement)
   - ⚠️ Persists until manual logout
   - Future: Could add auto-logout after X days if needed

4. **Edge Function Calls**: Standard HTTPS
   - ✅ Supabase handles TLS encryption
   - ✅ Functions have CORS protection built-in
   - Future: Could add rate limiting if needed

## Technology Stack
- **Frontend Auth**: React Context API
- **Frontend Storage**: localStorage
- **Frontend Styling**: Tailwind CSS
- **Backend**: Supabase Edge Functions (TypeScript)
- **API Key Storage**: Supabase Secrets
- **Frontend Dependencies**:
  - `@supabase/supabase-js` (Supabase client)
  - `@google/genai` (for Edge Functions)

## Implementation Timeline

1. **Setup** (~10 min):
   - Create Supabase project
   - Add Gemini API key to Secrets
   - Get credentials

2. **Frontend Auth** (~40 min):
   - Create AuthContext and LoginPage
   - Implement localStorage persistence
   - Integrate with App.tsx

3. **Backend Edge Functions** (~50 min):
   - Create Supabase client
   - Build generateEvents function
   - Build refineEvents function
   - Test locally

4. **Integration & Testing** (~30 min):
   - Update geminiService to use Supabase
   - Test frontend → backend → Gemini flow
   - Deploy functions

5. **Total: ~2.5 hours**

## Deployment Steps

1. **Frontend**:
   - Build: `npm run build`
   - Deploy to Netlify (existing setup)

2. **Backend**:
   - Install Supabase CLI: `npm install -g supabase`
   - Deploy functions: `supabase functions deploy`
   - Verify in Supabase dashboard

3. **Configuration**:
   - Netlify environment variables (Supabase URL + Key)
   - Already have in `.env.local` for dev

## Known Limitations & Future Enhancements

1. **Session timeout**: Not implemented
   - Future: Add auto-logout after X days of inactivity

2. **Passcode rotation**: No admin interface
   - Future: Add ability to change passcode

3. **Usage logging**: Not implemented (per requirement)
   - Future: Could add optional analytics

4. **Rate limiting**: Not implemented (per requirement)
   - Future: Could add if needed

## Design Notes

- LoginPage will match Instrumentator's existing design language
- Use same color scheme, fonts, and components as main app
- Activity icon in header (consistent with app)
- Centered layout for focus
- Clear error states and feedback

---

**Status**: Plan updated and ready for implementation
