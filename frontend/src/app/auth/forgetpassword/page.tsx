import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ForgotPassword() {
    return (
        <div className="w-full">
            <div className="mb-8 space-y-1.5 text-center">
                <h1 className="text-[32px] font-bold leading-tight text-[#0f172a]">Forgot Password?</h1>
                <p className="text-[14px] text-[#64748b] max-w-[280px] mx-auto">
                    Enter your email address — we&apos;ll send you instructions to reset it.
                </p>
            </div>

            <form className="space-y-6">
                <Input
                    className="h-[52px] rounded-[12px] border-0 bg-white px-4 text-[14px] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    autoComplete="email"
                />

                <div className="flex w-full items-center justify-end">
                    <Button
                        type="submit"
                        className="flex items-center justify-between h-[52px] bg-[#0f172a] text-white rounded-full pl-6 pr-2 min-w-[150px] hover:bg-[#1e293b] gap-3"
                    >
                        <span className="text-[14px] font-medium">Continue</span>
                        <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
                            <ArrowUpRight className="h-4 w-4 text-[#0f172a]" />
                        </span>
                    </Button>
                </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-1 text-center">
                <span className="text-[14px] text-[#64748b]">Remember your password?</span>
                <Link href="/auth/login" className="text-[14px] font-semibold text-[#4f7ef7]">
                    Sign In
                </Link>
            </div>
        </div>
    );
}
