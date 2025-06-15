console.log("SignUp page loaded");

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp 
      afterSignUpUrl="/onboarding"
      redirectUrl="/dashboard"
    />
  );
}