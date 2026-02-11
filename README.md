# SubTrack Pro - WhatsApp Subscription Management System

**SubTrack Pro** is a cutting-edge, premium subscription management platform designed to help users track, manage, and optimize their digital expenses with a seamless "WhatsApp-style" experience.

![Dashboard Preview](https://ik.imagekit.io/BakhshuTaekwondo/herogithub.png?updatedAt=1770782769983)

## Key Features

### Family Sharing & Social
- **Family Groups**: Create family sharing groups and split costs automatically.
- **Smart Invitations**: Send invitation links to friends or family via WhatsApp or Copy-Link.
- **Role Management**: Assign roles (Owner, Admin, Member, Viewer) with specific permissions.
- **Cost Splitting**: View your individual share of shared subscriptions.

### Smart Dashboard
- **Monthly Analytics**: Visual breakdown of your spending by category.
- **Upcoming Bills**: Never miss a payment with a prioritized list of upcoming renewals.
- **Multi-Currency**: Support for multiple currencies with real-time conversion (PKR, USD, etc.).

### Smart Reminders
- **WhatsApp Style Notifications**: Familiar UI for tracking and receiving payment alerts.
- **Custom Alert Timing**: Set reminders 1, 3, or 7 days before the billing date.

### Premium UI/UX
- **Immersive 3D Experience**: Glassmorphism, particles, and smooth transitions powered by Three.js and Framer Motion.
- **Dark & Light Mode**: Seamless theme switching for comfort in any environment.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Backend/Auth**: Supabase (PostgreSQL + Serverless Functions)
- **Styling**: Vanilla CSS + Tailwind Utility Classes
- **Icons**: Lucide React
- **Notifications**: Sonner (Toasts)
- **State Management**: React Context API + TanStack Query

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/subtrack-pro.git
   cd subtrack-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

##  Project Structure

- `src/components`: UI components (Dashboard, Sidebar, FamilySharing, etc.)
- `src/contexts`: Global state management for Subscriptions, Family, and Auth.
- `src/utils`: API wrappers and helper functions.
- `src/supabase`: Server-side logic and database configuration.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for better financial management.