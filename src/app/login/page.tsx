// app/login/page.tsx

import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div>
        <h1 className="text-center text-2xl font-bold mb-6">
          Login atau Register
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}