import { MoveUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


export default function ForgotPasword() {


    return (
        <div className="w-full max-w-[446px]">
            <div className="space-y-2 text-center">
                <h1 className="text-[40px] font-bold leading-[40px] text-[#1E1E1E]">Forget Password?</h1>
                <p className="mx-auto max-w-[301px] text-[16px] font-medium leading-[19px] text-[#77797E]">
                    Please enter your email address we’ll send you instructions to reset it.
                </p>
            </div>

            <form className="mt-[50px] space-y-[50px]">
                <Input
                    className="h-[60px] rounded-full border-0 bg-white px-[30px] py-[5px] text-[18px] font-medium placeholder:text-[#CCCCCC] focus-visible:ring-0 focus-visible:ring-offset-0"
                    type="email"
                    name="email"
                    placeholder="Your Email Address"
                    autoComplete="email"
                />

                <div className="flex w-full items-center justify-end">
                    <Button
                        type="submit"
                        className="flex h-[60px] w-[162px] items-center justify-between rounded-full bg-[#312F2F] px-0 pl-[25px] pr-[5px] text-white hover:bg-[#312F2F]/90"
                    >
                        <span className="text-[18px] font-medium leading-[22px]">Continue</span>
                        <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-black">
                            <MoveUpRight className="h-5 w-5" />
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    )
}
