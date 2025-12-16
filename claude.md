# Amplitude Architect - Project Context

## Project Overview
**Instrumentator** is a React/TypeScript application that uses Google Gemini AI to generate Amplitude event tracking specifications from UI screenshots and text descriptions. Users can provide a feature snapshot (image) and description, and the AI will suggest appropriate tracking events with proper naming conventions, properties, and hierarchies.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini 3 Pro Preview API
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure
```
amplitude-architect/
├── App.tsx                      # Main application component
├── components/
│   ├── InputSection.tsx          # Feature snapshot & description input form
│   ├── ChatInterface.tsx         # Chat UI for event refinement
│   ├── EventTable.tsx            # Table view of generated events
│   ├── Button.tsx                # Reusable button component with loading state
│   ├── SystemPromptPopover.tsx   # Popover showing Gemini system instruction
│   └── icons/
│       └── index.tsx             # SVG icon library (8-bit pixel art style)
├── services/
│   └── geminiService.ts          # Supabase Functions client integration
├── supabase/
│   └── functions/
│       ├── generateEvents/       # Edge Function for initial event generation
│       └── refineEvents/         # Edge Function for chat-based event refinement
├── lib/
│   └── supabaseClient.ts         # Supabase client configuration
├── types.ts                      # TypeScript type definitions
├── vite.config.ts                # Vite configuration
├── .env.local                    # Environment variables (see Environment Setup)
└── index.tsx                     # React entry point
```

## Key Components

### App.tsx
Main application container with layout management.
- **Header**: Centered "Instrumentator" branding with activity icon (32x32)
- **Main Heading**: "Image recognition finds your [Amplitude logo] events" with inline Amplitude A-mark logo (opacity-60)
- **Two-State UI**:
  - Pre-generation: Large centered input form
  - Post-generation: Two-column layout (input/chat on left, event table on right)
- **State Management**: Events, chat history, app state (IDLE/GENERATING/REFINING), input persistence

### InputSection.tsx
Feature input form with image upload and description textarea.
- Image upload with preview (max 4MB)
- Feature description textarea
- Two-column control section:
  - Left: "Model: Gemini 3 Pro" badge
  - Right: "System prompt:" with document icon that opens SystemPromptPopover
- Generate events button with loading animation

### SystemPromptPopover.tsx
Smart popover displaying Gemini system instructions.
- Viewport boundary detection (prevents clipping on edges)
- Accepts custom trigger content via `children` prop
- Dark theme: charcoal background (#2B2B2B for trigger, #1a1a1a for code block)
- Fixed positioning with dynamic calculation

### EventTable.tsx
Displays generated Amplitude events in table format.
- Columns: Action, View, Click, Event Name, Event Properties
- Shows loading state during generation/refinement

### ChatInterface.tsx
Chat UI for refining events with AI.
- User/model message display
- Message input with send button
- Scrollable message history

## Recent Changes & Fixes

### Session 1: API Integration & Initial UI
✅ Fixed Gemini API integration errors:
- Environment variable mismatch: changed `.env.local` from `VITE_GEMINI_API_KEY` to `GEMINI_API_KEY`
- Schema validation error: moved `click` field from optional to required in EVENT_SCHEMA
- Result: Event generation now works end-to-end

### Session 2: Production Error Fixes (December 2024)
✅ Fixed 500 error in production:
- **Root cause**: Edge Functions were using incorrect model name `gemini-2.0-flash`
- **Solution**: Updated both `generateEvents` and `refineEvents` functions to use `gemini-3-pro-preview`
- Location: `supabase/functions/generateEvents/index.ts` and `supabase/functions/refineEvents/index.ts`

✅ Fixed 401 authentication error:
- **Root cause**: Production was using service role key (`sb_secret_...`) instead of anon key
- **Solution**: Updated `.env.local` and Netlify environment variables with correct anon key (starts with `eyJ...`)
- Enhanced error handling in `services/geminiService.ts` to display detailed error messages

### Session 3: Header & Layout Restructuring
✅ Header redesign:
- Centered "Instrumentator" logo and title
- Icon: 24x24 → 32x32 (IconActivity)
- Text: text-xl → text-2xl
- Padding: h-16 (fixed) → py-8 (flexible)

✅ Main heading redesign:
- Changed text: "Tracking specs generator" → "Image recognition finds your [Amplitude logo] events"
- Amplitude logo: Inline SVG image with opacity-60 filter
- Used `inline-block` and `align-middle` to keep logo on same line as text
- Text color: text-primary → text-primary/85 (softer appearance)
- Font size: text-7xl → text-5xl
- Container: max-w-2xl → max-w-lg (better line breaking)

✅ SystemPromptPopover relocation:
- Moved from header to InputSection
- Now positioned above Generate button in two-column layout
- Added viewport boundary detection to prevent clipping
- Changed to accept custom trigger (document icon)

## Type Definitions (types.ts)
```typescript
interface AmplitudeEvent {
  id: string;
  action: string;              // Human-readable action (e.g., "Click on plan card CTA")
  view: string;                // View identifier (e.g., "view:pricing")
  click: string;               // Click identifier (e.g., "click:plan-card-CTA") or ""
  eventName: string;           // Full event name: "view:page:click:element" or "view:page"
  eventProperties: string;     // Key-value pairs (e.g., "Plan: [Free, Pro], Source: [Header, Footer]")
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

enum AppState {
  IDLE = 'idle',
  GENERATING = 'generating',
  REFINING = 'refining'
}
```

## Gemini API Integration (services/geminiService.ts)

### System Instruction
The Gemini model is instructed to:
- Generate precise Amplitude event tracking specifications
- Use consistent naming: `view:<page>` and `click:<element>`
- Include detailed event properties with possible values
- Handle view-only events (no click) by leaving click field empty
- Analyze both images and text descriptions

### Event Schema
Structured JSON response with required fields:
- `action`: Human-readable description
- `view`: View/page identifier
- `click`: Click identifier or empty string
- `eventName`: Full event name per naming convention
- `eventProperties`: Detailed property descriptions

### Main Functions
- `generateEventsFromInput(description, imageBase64)`: Initial event generation from user input
- `refineEventsWithChat(currentEvents, userInstruction)`: Chat-based event refinement

## Environment Setup

### ⚠️ CRITICAL: Gemini Model Configuration
Both Supabase Edge Functions (`generateEvents` and `refineEvents`) MUST use:
```typescript
model: "gemini-3-pro-preview"
```
**Do NOT use:** `gemini-2.0-flash` or other model names - this will cause 500 errors.

### Environment Variables

#### Frontend (.env.local)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  # JWT token (starts with "eyJ")
GEMINI_API_KEY=your_gemini_api_key  # For reference only
```

**⚠️ CRITICAL:** `VITE_SUPABASE_ANON_KEY` must be the **anon key** (starts with `eyJ...`), NOT the service role key (starts with `sb_secret_...`). Using the wrong key causes **401 authentication errors**.

**Get correct keys:**
```bash
npx supabase projects api-keys --project-ref fuqhjshscnmqynwieiwx
```

#### Supabase Secrets (Edge Functions)
```bash
# Set in Supabase Vault for Edge Functions
npx supabase secrets set GEMINI_API_KEY="your_key" --project-ref fuqhjshscnmqynwieiwx

# Verify
npx supabase secrets list --project-ref fuqhjshscnmqynwieiwx
```

#### Production (Netlify)
Set in Netlify Dashboard → Site Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (must be anon key, not service role key)

## Current UI State
- ✅ Header: Centered, properly padded (py-8)
- ✅ Main heading: Smaller (text-5xl), softer colors (text-primary/85), inline logo (opacity-60)
- ✅ Input form: Two-column layout with Model and System prompt controls
- ✅ System prompt popover: Smart positioning, dark theme, custom trigger icon
- ✅ Post-generation layout: Two-column split view (input/chat left, table right)

## Known Limitations & Notes
1. Images must be base64 encoded (PNG, JPG, WebP up to 4MB)
2. Gemini 3 Pro Preview model used (may change as API evolves)
3. Event schema does not support optional fields in response schema (all fields required)
4. System prompt popover uses fixed positioning with viewport boundary detection

## Next Steps for Development
- [ ] Add event export functionality (CSV, JSON)
- [ ] Implement event template library
- [ ] Add keyboard shortcuts for common actions
- [ ] Enhance chat context with event history
- [ ] Add undo/redo functionality for events
- [ ] Implement event validation rules
- [ ] Add analytics for generated events

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## Recent Git Commits
- `c658006` fix: Update Gemini model to gemini-3-pro-preview and improve error handling
- `4eb8c2c` fix: Change page title from 'Amplitude Architect' to 'Instrumentator'
- `b69caa0` feat: Implement trash icon overlay on event properties column
- `f066680` feat: Increase header vertical padding (py-4 → py-8)

---

*Last updated: December 16, 2024*
*Session: Production error fixes - model name and authentication*
