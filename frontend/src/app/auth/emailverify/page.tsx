/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { MoveUpRight } from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EmailVerify() {
    const OTP_LENGTH = 6
    const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""))
    const inputsRef = useRef<Array<HTMLInputElement | null>>([])

    const otpValue = useMemo(() => otp.join(""), [otp])

    const focusIndex = (idx: number) => {
        inputsRef.current[idx]?.focus()
    }

    const setCharAt = (idx: number, value: string) => {
        setOtp((prev) => {
            const next = [...prev]
            next[idx] = value
            return next
        })
    }

    return (
        <div className="w-full max-w-[446px]">
            <div className="space-y-2 text-center">
                <h1 className="text-[40px] font-bold leading-[40px] text-[#1E1E1E]">Email Verification</h1>
                <p className="mx-auto max-w-[315px] text-[16px] font-medium leading-[19px] text-[#77797E]">
                    We&apos;ve sent a 6-character code to your email. The code expires shortly, so enter it soon.
                </p>
            </div>

            <form
                className="mt-[50px] space-y-[50px]"
                onSubmit={(e) => {
                    e.preventDefault()
                    // TODO: hook into verification action
                    void otpValue
                }}
            >
                <div className="flex h-[60px] w-full items-center justify-center gap-[13px]">
                    {Array.from({ length: OTP_LENGTH }).map((_, idx) => {
                        const isDividerAfter = idx === 2
                        return (
                            <React.Fragment key={idx}>
                                <Input
                                    ref={(el) => {
                                        inputsRef.current[idx] = el
                                    }}
                                    value={otp[idx]}
                                    onChange={(e) => {
                                        const raw = e.target.value
                                        const digit = raw.replace(/\D/g, "").slice(-1)
                                        setCharAt(idx, digit)
                                        if (digit && idx < OTP_LENGTH - 1) focusIndex(idx + 1)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                                            focusIndex(idx - 1)
                                        }
                                    }}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    className="h-[60px] w-[60px] rounded-full border-0 bg-white px-0 text-center text-[18px] font-medium text-[#77797E] placeholder:text-[#CCCCCC] focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="-"
                                />
                                {isDividerAfter ? (
                                    <div className="h-0 w-[10px] border border-white" />
                                ) : null}
                            </React.Fragment>
                        )
                    })}
                </div>

                <div className="flex w-full items-center justify-between gap-[50px]">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-[60px] w-[147px] rounded-full border border-[#E5E5E5] bg-white px-[25px] text-[18px] font-medium text-[#77797E] hover:bg-white"
                    >
                        Resend 0:25
                    </Button>

                    <Button
                        type="submit"
                        className="flex h-[60px] w-[138px] items-center justify-between rounded-full bg-[#312F2F] px-0 pl-[25px] pr-[5px] text-white hover:bg-[#312F2F]/90"
                    >
                        <span className="text-[18px] font-medium leading-[22px]">Verify</span>
                        <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-black">
                            <MoveUpRight className="h-5 w-5" />
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    )
}
