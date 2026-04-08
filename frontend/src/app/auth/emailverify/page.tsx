/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { ArrowUpRight } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EmailVerify() {
    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const otpValue = useMemo(() => otp.join(""), [otp]);

    const focusIndex = (idx: number) => {
        inputsRef.current[idx]?.focus();
    };

    const setCharAt = (idx: number, value: string) => {
        setOtp((prev) => {
            const next = [...prev];
            next[idx] = value;
            return next;
        });
    };

    return (
        <div className="w-full">
            <div className="mb-8 space-y-1.5 text-center">
                <h1 className="text-[32px] font-bold leading-tight text-[#0f172a]">Email Verification</h1>
                <p className="text-[14px] text-[#64748b] max-w-[280px] mx-auto">
                    We&apos;ve sent a 6-character code to your email. Enter it below before it expires.
                </p>
            </div>

            <form
                className="space-y-8"
                onSubmit={(e) => {
                    e.preventDefault();
                    // TODO: hook into verification action
                    void otpValue;
                }}
            >
                {/* OTP inputs */}
                <div className="flex w-full items-center justify-center gap-2.5">
                    {Array.from({ length: OTP_LENGTH }).map((_, idx) => {
                        const isDividerAfter = idx === 2;
                        return (
                            <React.Fragment key={idx}>
                                <Input
                                    ref={(el) => { inputsRef.current[idx] = el; }}
                                    value={otp[idx]}
                                    onChange={(e) => {
                                        const digit = e.target.value.replace(/\D/g, "").slice(-1);
                                        setCharAt(idx, digit);
                                        if (digit && idx < OTP_LENGTH - 1) focusIndex(idx + 1);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                                            focusIndex(idx - 1);
                                        }
                                    }}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    className="h-[52px] w-[52px] rounded-[12px] border-0 bg-white px-0 text-center text-[18px] font-semibold text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                                    placeholder="–"
                                />
                                {isDividerAfter && (
                                    <div className="w-3 h-px bg-[#e2e8f0]" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="flex w-full items-center justify-between gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-[52px] rounded-full border border-[#e2e8f0] bg-white px-5 text-[14px] font-medium text-[#64748b] hover:bg-white"
                    >
                        Resend 0:25
                    </Button>

                    <Button
                        type="submit"
                        className="flex items-center justify-between h-[52px] bg-[#0f172a] text-white rounded-full pl-6 pr-2 min-w-[130px] hover:bg-[#1e293b] gap-3"
                    >
                        <span className="text-[14px] font-medium">Verify</span>
                        <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
                            <ArrowUpRight className="h-4 w-4 text-[#0f172a]" />
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
