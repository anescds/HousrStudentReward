# Housr Helper - Dev Board Story

## Inspiration

As students navigating the challenging world of budgeting and financial independence, we noticed a critical gap: traditional banking apps don't understand the unique spending patterns of student life. We wanted to create something that not only rewards responsible spending but also provides genuine, personalized financial insights in a way that resonates with Gen Z.

The idea for Housr Helper was born from the frustration of watching friends struggle with budgeting while simultaneously missing out on cashback opportunities. We envisioned a platform that would make financial management engaging, rewarding, and actually fun—something students would want to use, not feel obligated to check.

## What it does

Housr Helper is a comprehensive student rewards platform that transforms everyday spending into opportunities for savings and financial growth. At its core, the app:

- **Tracks all transactions** with automatic 5% cashback on every payment, from rent to groceries
- **Partners with local businesses** (Aldi, Co-op, Lidl, Morrisons) to offer exclusive student deals and perks
- **Provides AI-powered financial insights** through a unique "roast" feature that analyzes spending habits with humor and actionable advice
- **Offers real-time analytics** for both students and partner businesses through a dedicated dashboard
- **Simulates spending scenarios** to help students understand their financial trajectory over time

The platform features two interconnected applications:
1. **Student Rewards App**: Where students track their balance, redeem perks, view transactions, and receive personalized financial roasts
2. **Partner Dashboard**: Where businesses can manage deals, track redemption analytics, and monitor engagement in real-time

## How we built it

We architected Housr Helper as a full-stack application with a focus on real-time capabilities and seamless user experience:

**Backend (Express.js + Socket.IO)**
- RESTful API with authentication using session-based cookies
- WebSocket integration for real-time updates between frontend and backend
- In-memory data structures (designed to scale to databases later)
- Integration with Google's Gemini AI for intelligent financial analysis
- Dynamic deal management system allowing partners to add new offers on-the-fly

**Frontend (React + TypeScript + Vite)**
- Modern, brutalist UI design that stands out from typical fintech apps
- Real-time balance and transaction updates via WebSocket connections
- Responsive design optimized for mobile-first student users
- Context-based state management for seamless data flow

**Key Technical Decisions**
- Used Socket.IO for bidirectional communication, eliminating the need for constant polling
- Implemented a simulation engine that generates realistic spending patterns over 12 months
- Created a threshold-based alert system that triggers financial reality checks at £1,300 and emergency alerts at £1,500
- Built a flexible icon system supporting dynamic perk/deal icons

## Challenges we ran into

**Real-time Synchronization**: One of our biggest challenges was ensuring the frontend stayed in sync with backend state changes, especially during the simulation. We solved this by implementing WebSocket events that trigger specific UI refreshes, ensuring users always see the latest balance and transactions.

**AI Integration Complexity**: Integrating Gemini AI for the roast feature required careful prompt engineering to ensure the AI understood the context (rewards vs. spending) and generated appropriate, helpful content. We iterated multiple times on the system instructions to get the right tone and insights.

**State Management**: Managing complex state across multiple components (balance, transactions, perks, redemptions) while maintaining real-time updates proved challenging. We solved this by creating a centralized WebSocket context and using React Context API for shared state.

**Transaction Generation Logic**: Creating realistic spending patterns that gradually increase to trigger threshold alerts required careful mathematical modeling. We implemented a weighted distribution system that ensures variety while maintaining spending targets.

**Dashboard-Student App Integration**: Ensuring that deals added in the partner dashboard immediately appear in the student app required careful coordination of WebSocket events and API endpoints. We implemented a real-time deal propagation system that updates all connected clients instantly.

## Accomplishments that we're proud of

**Seamless Real-time Experience**: We're particularly proud of how smoothly the real-time updates work. When a partner adds a new deal, students see it instantly. When transactions are processed, balances update immediately. This creates a truly responsive, modern user experience.

**AI Financial Roast Feature**: The AI roast feature is something we're really excited about. It combines humor with genuine financial insights, making financial education accessible and engaging for students who might otherwise ignore traditional budgeting advice.

**Comprehensive Simulation Engine**: Our 12-month simulation feature allows students to visualize their financial future, complete with threshold alerts and AI-generated insights. This predictive capability helps students make better financial decisions.

**Dual-Application Architecture**: Building both the student-facing app and the partner dashboard as integrated systems demonstrates our ability to think about the entire ecosystem, not just one user type.

**Clean, Scalable Codebase**: Despite being built for a hackathon, we structured the code to be production-ready with clear separation of concerns, TypeScript for type safety, and modular architecture that can easily scale to a database-backed system.

## What we learned

**WebSocket Power**: We learned how powerful WebSockets can be for creating truly real-time applications. Moving from polling to event-driven updates dramatically improved both performance and user experience.

**AI Prompt Engineering**: Working with Gemini AI taught us the importance of carefully crafted prompts. Small changes in system instructions can dramatically alter the quality and relevance of AI-generated content.

**User Experience in Fintech**: We discovered that financial apps don't have to be boring. By adding personality (the roast feature) and making the UI visually engaging, we can make financial management something students actually want to engage with.

**Full-Stack Integration**: This project reinforced the importance of thinking about the entire stack holistically. Decisions made in the backend (like WebSocket events) directly impact frontend UX, and vice versa.

**Real-world Constraints**: Building a simulation that generates realistic spending patterns taught us about the complexity of financial modeling and the importance of edge case handling.

## What's next for Housr Helper

**Database Migration**: The next major step is migrating from in-memory data structures to a proper database (PostgreSQL or MongoDB) to support multiple users and persistent data.

**Enhanced AI Features**: We want to expand the AI capabilities to include personalized budgeting recommendations, spending category analysis, and predictive financial health scores.

**Mobile App Development**: While the current web app is mobile-responsive, we plan to develop native iOS and Android apps for a more seamless mobile experience.

**Expanded Partner Network**: We're excited to onboard more local businesses and create a comprehensive network of student-friendly deals across various categories.

**Social Features**: Adding friend connections, spending comparisons (anonymized), and group challenges could make financial management more social and engaging.

**Advanced Analytics**: For partners, we want to add more sophisticated analytics including conversion rates, customer lifetime value, and seasonal trend analysis.

**Gamification**: Introducing achievement badges, spending streaks, and reward tiers could further incentivize responsible financial behavior.

**Integration with Banking APIs**: Direct integration with student bank accounts would automate transaction tracking and provide even more accurate financial insights.

Housr Helper is just getting started. We're building the future of student financial wellness, one transaction at a time.

