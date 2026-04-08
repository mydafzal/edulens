"use client"
import { Eye, EyeOff, MoveUpRight } from 'lucide-react'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


export default function ResetPassword() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [confimPaswordVisible, setConfirmPasswordVisible] = useState(false)


    return (
        <div className="w-full max-w-[446px]">
            <div className="space-y-2 text-center">
                <h1 className="text-[40px] font-bold leading-[40px] text-[#1E1E1E]">Create password</h1>
                <p className="text-[16px] font-medium leading-[19px] text-[#77797E]">
                    Set your new password and remember it.
                </p>
            </div>

            <form className="mt-[50px] space-y-[10px]">
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
                        onClick={(e) => {
                            e.preventDefault()
                            setIsPasswordVisible((prev) => !prev)
                        }}
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
                        onClick={(e) => {
                            e.preventDefault()
                            setConfirmPasswordVisible((prev) => !prev)
                        }}
                        aria-label={confimPaswordVisible ? "Hide password" : "Show password"}
                        variant="ghost"
                        size="icon"
                        className="ml-3 h-10 w-10 rounded-full text-[#77797E] hover:bg-transparent"
                    >
                        {confimPaswordVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </Button>
                </div>

                <p className="pt-[10px] text-[14px] font-normal leading-[17px] text-[#77797E]">
                    Password must be at least 8 characters long.
                </p>

                <div className="flex w-full items-center justify-end pt-[40px]">
                    <Button
                        type="submit"
                        className="flex h-[60px] w-[215px] items-center justify-between rounded-full bg-[#312F2F] px-0 pl-[25px] pr-[5px] text-white hover:bg-[#312F2F]/90"
                    >
                        <span className="text-[18px] font-medium leading-[22px]">Reset Password</span>
                        <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-black">
                            <MoveUpRight className="h-5 w-5" />
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    )
}
