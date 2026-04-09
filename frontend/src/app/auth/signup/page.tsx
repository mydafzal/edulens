"use client"
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import google from "../../../../public/assets/auth/google.svg";
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function Signup() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [confimPaswordVisible, setConfirmPasswordVisible] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsPasswordVisible((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setConfirmPasswordVisible((prev) => !prev);
    };

    return (
        <div className="w-full">
            <div className="mb-8 space-y-1.5 text-center">
                <h1 className="text-[32px] font-bold leading-tight text-[#0f172a]">Create your Account</h1>
                <p className="text-[14px] text-[#64748b]">
                    Enter all required information to discover more
                </p>
            </div>

            <form className="mb-6 space-y-3" onSubmit={(e) => { e.preventDefault(); localStorage.setItem('scora-token', 'demo'); router.push('/role'); }}>
                <Input
                    className="h-[52px] rounded-[12px] border-0 bg-white px-4 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                    type="text"
                    name="name"
                    placeholder="Full name"
                    autoComplete="name"
                />

                <Input
                    className="h-[52px] rounded-[12px] border-0 bg-white px-4 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                    type="email"
                    name="email"
                    placeholder="Email address"
                    autoComplete="email"
                />

                <div className="flex h-[52px] w-full items-center rounded-[12px] bg-white px-4 focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.08)] transition-shadow">
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        autoComplete="new-password"
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

                <div className="flex h-[52px] w-full items-center rounded-[12px] bg-white px-4 focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.08)] transition-shadow">
                    <Input
                        type={confimPaswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        aria-label={confimPaswordVisible ? "Hide password" : "Show password"}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-[#94a3b8] hover:bg-transparent hover:text-[#64748b]"
                    >
                        {confimPaswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="flex w-full items-start gap-2.5 pt-1">
                    <Checkbox id="terms" className="mt-0.5" />
                    <label htmlFor="terms" className="text-[13px] leading-[1.5] text-[#64748b]">
                        By clicking{" "}
                        <span className="text-[#0f172a] font-medium">Create Account</span>, you agree to our{" "}
                        <Link href="/terms" className="font-semibold text-[#4f7ef7]">terms of service</Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-semibold text-[#4f7ef7]">privacy policy</Link>.
                    </label>
                </div>

                <div className="flex w-full items-center justify-end pt-4">
                    <Button
                        type="submit"
                        className="flex items-center justify-between h-[52px] bg-[#0f172a] text-white rounded-full pl-6 pr-2 min-w-[150px] hover:bg-[#1e293b] gap-3"
                    >
                        <span className="text-[14px] font-medium">Sign Up</span>
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
                    <span>Continue with Google</span>
                </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1 text-center">
                <span className="text-[14px] text-[#64748b]">{`Already have an account?`}</span>
                <Link href="/auth/login" className="text-[14px] font-semibold text-[#4f7ef7]">
                    Sign In
                </Link>
            </div>
        </div>
    );
}
