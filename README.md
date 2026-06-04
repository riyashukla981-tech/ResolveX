ResolveX 

ResolveX is a smart complaint management system designed for educational institutions. Students can submit complaints — anonymously if needed — with supporting proofs, while admins get a powerful dashboard with analytics, complaint categorization, and management tools. Built to make the resolution process transparent, organized, and efficient for everyone involved.

✨ Features

📋 Complaint Submission — Students can submit complaints with supporting proof/attachments
🕵️ Anonymous Mode — Option to submit complaints anonymously for sensitive issues
🗂 Complaint Categories — Organized complaint types for easier tracking and routing
📊 Analytics Dashboard — Visual insights into complaint trends, statuses, and resolution rates
👤 Dual Role Access — Separate views and permissions for students and admins
✅ Status Tracking — Real-time updates on complaint progress and resolution


🛠 Tech Stack

Framework: React 18 + TypeScript
Build Tool: Vite
Styling: Tailwind CSS
UI Components: Radix UI
Routing: React Router v6
Forms: React Hook Form + Zod
Charts: Recharts
HTTP Client: Axios


📦 Prerequisites
Make sure you have the following installed:

Node.js (v18 or higher recommended)
npm or yarn


🚀 Getting Started
1. Clone the repository
bashgit clone https://github.com/riyashukla981-tech/ResolveX.git
cd resolvex-frontend
2. Install dependencies
bashnpm install
3. Set up environment variables
Create a .env file in the root directory and add the required variables:
envVITE_API_BASE_URL=http://localhost:8000

Update the values to match your backend configuration.

4. Start the development server
bashnpm run dev
The app will be available at http://localhost:5173.

📜 Available Scripts
CommandDescriptionnpm run devStart the development servernpm run buildBuild for productionnpm run previewPreview the production build locally

📁 Project Structure
resolvex-frontend/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API calls (Axios)
│   ├── types/          # TypeScript type definitions
│   └── main.tsx        # App entry point
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts

🤝 Contributing

Fork the repository
Create a new branch: git checkout -b feature/your-feature-name
Make your changes and commit: git commit -m 'Add some feature'
Push to the branch: git push origin feature/your-feature-name
Open a pull request


📄 License
This project is private and not licensed for public use.
