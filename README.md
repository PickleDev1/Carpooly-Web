# Carpooly Web

CarPooly is a modern web application designed to help parents organize and manage school carpools efficiently. Built with Next.js 14 and Clerk for authentication, it provides a seamless experience for creating and joining carpool groups.

## Features

- **User Authentication**: Secure sign-in system powered by Clerk
- **Dashboard Interface**: Easy access to all carpool management features
- **Create Carpool**: Set up new carpool groups for school runs
- **Invite System**: Invite other parents to join your carpool network
- **Schedule Management**: Update and manage carpool schedules
- **Join Carpool**: Find and join existing carpool groups in your area

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **TypeScript**: For type safety

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Setup

Create a `.env.local` file with your Clerk credentials:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

## Project Structure

```
carpooly-web/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home page
│   │   └── dashboard/
│   │       └── page.tsx        # Dashboard page
│   ├── components/
│   │   └── SignInRedirect.tsx  # Auth component
│   └── middleware.ts           # Auth middleware
├── public/
│   └── car-icon.png           # Site assets
└── README.md
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
