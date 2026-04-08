import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function EmailSuccess() {
    return (
        <div className="w-full text-center">
            <div className="mb-8 space-y-1.5">
                <h1 className="text-[32px] font-bold leading-tight text-[#0f172a]">
                    Email Verification<br />Successful 🚀
                </h1>
                <p className="text-[14px] text-[#64748b]">
                    Your account is ready. Let&apos;s get started.
                </p>
            </div>

            <div className="flex justify-center">
                <Link
                    href="/auth/login"
                    className="flex items-center justify-between h-[52px] bg-[#0f172a] text-white rounded-full pl-6 pr-2 min-w-[150px] hover:bg-[#1e293b] gap-3"
                >
                    <span className="text-[14px] font-medium">Continue</span>
                    <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
                        <ArrowUpRight className="h-4 w-4 text-[#0f172a]" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
