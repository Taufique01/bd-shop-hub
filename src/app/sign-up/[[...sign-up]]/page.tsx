import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white text-xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Join Hozoborolo</h1>
          <p className="text-blue-200 mt-1">Create your account and start exploring</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: "shadow-2xl rounded-2xl border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
