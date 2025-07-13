# Project Compass: Context and Vision

This document outlines the core vision, features, and technical plan for Project Compass. It will be kept updated to serve as a single source of truth for the project's development.

## 1. Core Vision

Project Compass is a highly personalized, AI-driven learning platform designed to help users enrich their skill sets by working on real projects. The core philosophy is to move away from one-size-fits-all tutorials and instead provide a learning environment that is deeply tailored to the user's individual skills, goals, learning style, and ambitions. The platform should feel like a personal mentor, not just a website.

## 2. Key Features

### 2.1. Public-Facing Landing Page
- **Goal:** Introduce the platform's vision and features to new users.
- **Authentication:** No login required (guest mode).
- **Design:** Modern, sleek, and interactive, using libraries like Framer Motion for animations.
- **CTAs:** All "Get Started" or "Explore" buttons will lead to the login page.

### 2.2. User Authentication
- **Providers:** Google, GitHub, and standard Email/Password.
- **Flow:**
    1. Unauthenticated users access the landing page.
    2. CTAs lead to the `/login` page.
    3. Upon successful sign-up/login, users are directed to the onboarding flow.
    4. Existing, onboarded users are directed to their dashboard.

### 2.3. AI-Powered Onboarding
- **Goal:** To deeply understand the user in a natural, conversational way.
- **Mechanism:** A chat-based interface where a Genkit-powered AI mentor asks a series of dynamic questions.
- **Scope:** The AI will inquire about the user's current skills, learning preferences (videos vs. docs), career goals, interests, and availability.
- **Outcome:** The conversation history is saved to the user's Firestore document, and the user is marked as `completedOnboarding`.

### 2.4. Personalized Dashboard
- **Goal:** Serve as the user's central hub, displaying personalized content.
- **Mechanism:** A new AI flow will analyze the user's onboarding data to generate:
    - A concise profile summary.
    - A list of personalized project recommendations tailored to their goals.
- **Content:** The dashboard will feature these AI-generated insights prominently.

### 2.5. The RAG AI Chatbot (The Star of the Game)
- **Goal:** Provide instant, context-aware help on any topic.
- **Accessibility:** A permanent, easily accessible chat interface throughout the user portal.
- **Context:** The chatbot will have full access to the user's profile, onboarding data, and the project they are currently working on.
- **Technology:** It will use RAG (Retrieval-Augmented Generation) to pull information from integrated resources (docs, videos, etc.) to provide accurate answers.

## 3. Technical Implementation Details

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS.
- **UI Libraries:** shadcn/ui, Framer Motion.
- **Backend:** Firebase for Authentication and Firestore as the database.
- **AI:** Google's Genkit framework with the Gemini Pro model.
- **State Management:** React Context (`AuthContext`) for managing user authentication state globally.

## 4. Current Status & Next Steps

- **DONE:**
    - Landing Page UI.
    - Authentication flow (Login/Sign-up/Sign-out).
    - Basic AI-powered onboarding chat.
- **NEXT:**
    1.  **Build the Dashboard:** Create the AI flow to generate profile summaries and project recommendations. Implement the UI to display this information.
    2.  **Create the Profile Page:** Display user details and potentially a GitHub-like activity graph.
    3.  **Implement the RAG Chatbot.**
    4.  **Integrate External Resources:** Add APIs for YouTube, Reddit, etc.
