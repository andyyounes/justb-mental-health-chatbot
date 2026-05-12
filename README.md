# JustB - Mental Health Chatbot 

A compassionate mental health chatbot providing empathetic support for anxiety, stress, sleep, relationships, and mood. Built with React, TypeScript, and powered by Groq's LLaMA 3.3 70B.

## Features

### Conversational AI Chat
- **Short, friendly responses** - Like texting a supportive friend (2-3 sentences max)
- **Quick topic buttons** - Fast access to anxiety, stress, sleep, relationships, and mood support
- **Smart action cards** - Dynamic suggestions based on conversation context
- **3-level risk assessment** - Automatic crisis detection with appropriate interventions
- **Chat history** - Browse past conversations with AI-generated titles

### Calming Activities
- Box breathing exercise with visual guide
- Grounding techniques (5-4-3-2-1)
- Progressive muscle relaxation
- Safe place visualization
- Daily affirmations
- Journaling prompts
- Breathing cat animation

### Task Scheduling
- Google Calendar integration
- AI-powered task recommendations
- Schedule management for self-care activities

### Beautiful, Responsive Design
- **Fully responsive** - Optimized for mobile (~375px), tablet (~768px), and desktop (1024px+)
- **Dark/Light mode** - Automatic theme detection with manual override
- **Soft lavender aesthetic** - Calming colors with smooth gradients
- **Safe area support** - Works perfectly with notch/Dynamic Island/home indicator
- **Custom typography** - DM Sans for body, Black Ops One for logo

### Privacy & Security
- Anonymous authentication via Supabase
- No personal data collection
- Secure backend with Supabase Edge Functions

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI**: Groq API with LLaMA 3.3 70B Versatile
- **Server**: Hono web framework on Deno
- **Styling**: CSS custom properties with dark mode support

## Project Structure

```
/
├── App.tsx                          # Main app entry point
├── components/
│   ├── AuthPage.tsx                 # Authentication UI
│   ├── ChatBackground.tsx           # Animated gradient wallpaper
│   ├── ChatHistorySidebar.tsx       # Past conversations
│   ├── ChatMessage.tsx              # Message bubbles
│   ├── JustBHeader.tsx              # Navigation header
│   ├── JustBLogo.tsx                # Custom SVG logo
│   ├── QuickTopics.tsx              # Topic shortcut buttons
│   ├── ActionCard.tsx               # Smart suggestion cards
│   ├── RiskResponseCard.tsx         # Crisis intervention UI
│   ├── CrisisEmergencyModal.tsx     # Emergency resources
│   ├── CrisisCallWidget.tsx         # Crisis hotline widget
│   ├── ProfileDropdown.tsx          # User menu with theme toggle
│   ├── ActivitiesPage.tsx           # Calming exercises hub
│   ├── SchedulePage.tsx             # Calendar integration
│   └── ui/                          # Reusable UI components (shadcn/ui)
├── supabase/functions/server/
│   ├── index.tsx                    # Hono server routes
│   ├── groq_handler.ts              # LLM integration
│   └── kv_store.tsx                 # Key-value database utils
├── styles/
│   └── globals.css                  # Global styles with CSS variables
└── utils/
    ├── calendar.ts                  # Google Calendar integration
    └── supabase/info.tsx            # Supabase config

```

## Design System

### Color Palette (Dark Mode)
- Background: `#1e1a3f` (deep lavender)
- Surface: `#2d2860` (medium lavender)
- Input: `#241e52` (dark lavender)
- Accent: `#9b87f5` (soft purple)
- Text: Lavender-tinted whites

### Typography
- **Body**: DM Sans (Google Fonts)
- **Logo**: Black Ops One (Google Fonts)

### Responsive Breakpoints
- Mobile: ~375px
- Tablet: ~768px
- Desktop: 1024px+

Uses `clamp()` for fluid scaling and `dvh` units for viewport height.

## Setup & Development

### Prerequisites
- Node.js 18+
- Supabase account
- Groq API key

### Environment Variables

Create a `.env` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/andyyounes/justb-mental-health-chatbot.git
cd justb-mental-health-chatbot

# Install dependencies
npm install

# Start development server
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. The `kv_store_97cb3ddd` table will be automatically created
3. Deploy the Edge Function:
   ```bash
   supabase functions deploy make-server-97cb3ddd
   ```

## AI Response Guidelines

JustB follows strict conversational guidelines:
- 2-3 short sentences maximum
- Friendly, supportive tone
- Line breaks between thoughts
- No bullet points or lists
- No formal therapy language
- Never start with "I"
- No long paragraphs
- No clinical terminology

## Crisis Response System

### Level 1: Mild Concern
- Affirming message
- Breathing exercise suggestion
- Green-themed card

### Level 2: Moderate Risk
- Supportive message
- Multiple calming activities
- Amber-themed card

### Level 3: High Risk / Crisis
- Immediate crisis resources
- Emergency hotline widget
- Grounding exercises
- Red-themed urgent card

## License

MIT License - See LICENSE file for details

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI components (MIT License)
- [Unsplash](https://unsplash.com) - Stock photos (Unsplash License)
- [Groq](https://groq.com/) - LLM inference
- [Supabase](https://supabase.com/) - Backend infrastructure

## Links

- **Repository**: [github.com/andyyounes/justb-mental-health-chatbot](https://github.com/andyyounes/justb-mental-health-chatbot)
- **Issues**: [Report a bug or request a feature](https://github.com/andyyounes/justb-mental-health-chatbot/issues)

---

**Note**: This is a support tool, not a replacement for professional mental health care. If you're experiencing a crisis, please contact emergency services or a crisis hotline immediately.

**US Crisis Resources**:
- 988 Suicide & Crisis Lifeline: Call/Text 988
- Crisis Text Line: Text HOME to 741741
- Emergency: 911
