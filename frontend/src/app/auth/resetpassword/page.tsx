"use client"
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [confimPaswordVisible, setConfirmPasswordVisible] = useState(false);

    return (
        <div className="w-full">
            <div className="mb-8 space-y-1.5 text-center">
                <h1 className="text-[32px] font-bold leading-tight text-[#0f172a]">Create password</h1>
                <p className="text-[14px] text-[#64748b]">
                    Set your new password and remember it.
                </p>
            </div>

            <form className="space-y-3">
                <div className="flex h-[52px] w-full items-center rounded-[12px] bg-white px-4 focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.08)] transition-shadow">
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        placeholder="New password"
                        autoComplete="new-password"
                        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setIsPasswordVisible((p) => !p); }}
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
                        onClick={(e) => { e.preventDefault(); setConfirmPasswordVisible((p) => !p); }}
                        aria-label={confimPaswordVisible ? "Hide password" : "Show password"}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-[#94a3b8] hover:bg-transparent hover:text-[#64748b]"
                    >
                        {confimPaswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                </div>

                <p className="text-[13px] text-[#94a3b8] pt-1">
                    Password must be at least 8 characters long.
                </p>

                <div className="flex w-full items-center justify-end pt-4">
                    <Button
                        type="submit"
                        className="flex items-center justify-between h-[52px] bg-[#0f172a] text-white rounded-full pl-6 pr-2 min-w-[180px] hover:bg-[#1e293b] gap-3"
                    >
                        <span className="text-[14px] font-medium">Reset Password</span>
                        <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
                            <ArrowUpRight className="h-4 w-4 text-[#0f172a]" />
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
