"use client"
import { Eye, EyeOff, MoveUpRight } from 'lucide-react'
import React, { useState } from 'react'
import google from "../../../../public/assets/auth/google.svg"
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';


export default function Signup() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [confimPaswordVisible, setConfirmPasswordVisible] = useState(false)

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsPasswordVisible((prev) => !prev)
    }

    const toggleConfirmPasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setConfirmPasswordVisible((prev) => !prev)
    }

    return (
        <div className="w-full max-w-[446px]">
            <div className="mb-10 space-y-2 text-center">
                <h1 className="text-[40px] font-bold leading-[48px] text-[#1E1E1E]">Create your Account</h1>
                <p className="text-[16px] font-medium leading-[19px] text-[#77797E]">
                    Enter all required information to discover more
                </p>
            </div>

            <form className="mb-10 space-y-[15px]">
                <Input
                    className="h-[60px] rounded-full border-0 bg-white px-[30px] py-[5px] text-[18px] font-medium placeholder:text-[#CCCCCC] focus-visible:ring-0 focus-visible:ring-offset-0"
                    type="text"
                    name="name"
                    placeholder="Full Name*"
                    autoComplete="name"
                />

                <Input
                    className="h-[60px] rounded-full border-0 bg-white px-[30px] py-[5px] text-[18px] font-medium placeholder:text-[#CCCCCC] focus-visible:ring-0 focus-visible:ring-offset-0"
                    type="email"
                    name="email"
                    placeholder="Email Address*"
                    autoComplete="email"
                />

                <div className="flex h-[60px] w-full items-center rounded-full bg-white px-[30px] py-[5px]">
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        autoComplete="new-password"
                        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-[18px] font-medium placeholder:text-[#CCCCCC] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        variant="ghost"
                        size="icon"
                        className="ml-3 h-10 w-10 rounded-full text-[#77797E] hover:bg-transparent"
                    >
                        {isPasswordVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="flex h-[60px] w-full items-center rounded-full bg-white px-[30px] py-[5px]">
                    <Input
                        type={confimPaswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-[18px] font-medium placeholder:text-[#CCCCCC] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        aria-label={confimPaswordVisible ? "Hide password" : "Show password"}
                        variant="ghost"
                        size="icon"
                        className="ml-3 h-10 w-10 rounded-full text-[#77797E] hover:bg-transparent"
                    >
                        {confimPaswordVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="flex w-full items-start gap-[10px] pt-1">
                    <Checkbox id="terms" />
                    <label
                        htmlFor="terms"
                        className="text-[16px] font-medium leading-[19px] text-[#77797E]"
                    >
                        By clicking{" "}
                        <span className="text-[#1E1E1E]">Create Account</span>, you agree to our{" "}
                        <Link href="/terms" className="font-bold text-[#5D8DE3]">
                            terms of service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-bold text-[#5D8DE3]">
                            privacy policy
                        </Link>
                        .
                    </label>
                </div>

                <div className="flex w-full items-center justify-end pt-7">
                    <Button
                        type="submit"
                        className="flex h-[60px] w-[149px] items-center justify-between rounded-full bg-[#303030] px-0 pl-[25px] pr-[5px] text-white hover:bg-[#303030]/90"
                    >
                        <span className="text-[18px] font-medium">SignUp</span>
                        <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-black">
                            <MoveUpRight className="h-5 w-5" />
                        </span>
                    </Button>
                </div>
            </form>

            <div className="space-y-4">
                <Button
                    type="button"
                    variant="outline"
                    className="flex h-[60px] w-full items-center justify-center gap-[11px] rounded-full border border-[#E5E5E5] bg-white px-[30px] pt-[5px] text-[18px] font-medium text-[#1E1E1E] hover:bg-white"
                >
                    <Image src={google} width={24} height={24} alt="Google" />
                    <span>Continue with Google</span>
                </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-center">
                <span className="text-[18px] text-[#77797E]">{`Already have an account?`}</span>
                <Link href="/auth/login" className="text-[18px] font-bold text-[#5D8DE3]">
                    SignIn
                </Link>
            </div>
        </div>
    )
}
