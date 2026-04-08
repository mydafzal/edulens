"use client"
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import google from "../../../../public/assets/auth/google.svg";
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsPasswordVisible((prev) => !prev);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        localStorage.setItem('scora-token', 'demo');
        router.push('/role');
    };

    return (
        <div className="w-full">
            <div className="mb-8 space-y-1.5 text-center">
                <h1 className="text-[32px] font-bold leading-tight text-[#0f172a]">Hey, Welcome Back!</h1>
                <p className="text-[14px] text-[#64748b]">
                    Enter your credentials to access your account
                </p>
            </div>

            <form className="mb-6 space-y-3" onSubmit={handleSubmit}>
                <Input
                    className="h-[52px] rounded-[12px] border-0 bg-white px-4 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    autoComplete="email"
                />

                <div className="flex h-[52px] w-full items-center rounded-[12px] bg-white px-4 focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.08)] transition-shadow">
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-[#94a3b8] hover:bg-transparent hover:text-[#64748b]"
                    >
                        {isPasswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="flex w-full items-center justify-between gap-4 pt-4">
                    <Link href="/auth/forgetpassword" className="text-[14px] font-semibold text-[#4f7ef7]">
                        Forgot Password?
                    </Link>

                    <Button
                        type="submit"
                        className="flex items-center justify-between h-[52px] bg-[#0f172a] text-white rounded-full pl-6 pr-2 min-w-[140px] hover:bg-[#1e293b] gap-3"
                    >
                        <span className="text-[14px] font-medium">Sign In</span>
                        <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
                            <ArrowUpRight className="h-4 w-4 text-[#0f172a]" />
                        </span>
                    </Button>
                </div>
            </form>

            <div className="space-y-4">
                <Button
                    type="button"
                    variant="outline"
                    className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-[#e2e8f0] bg-white text-[14px] font-medium text-[#0f172a] hover:bg-white"
                >
                    <Image src={google} width={20} height={20} alt="Google" />
                    <span>Sign in with Google</span>
                </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1 text-center">
                <span className="text-[14px] text-[#64748b]">{`Don't have an account?`}</span>
                <Link href="/auth/signup" className="text-[14px] font-semibold text-[#4f7ef7]">
                    Register
                </Link>
            </div>
        </div>
    );
}
