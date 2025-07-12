console.log("SignUp page loaded");

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard";
  return (
    <SignUp 
      afterSignUpUrl={redirectUrl}
      redirectUrl={redirectUrl}
    />
  );
}