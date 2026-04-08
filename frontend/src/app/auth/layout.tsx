import AuthLayoutDesign from "./_components/AuthLayoutDesign";
import { Urbanist } from "next/font/google";

const urbanist = Urbanist({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className={`${urbanist.className} min-h-screen flex flex-row overflow-hidden`}>
            {/* Left panel — 60%, hidden on mobile */}
            <AuthLayoutDesign />

            {/* Right panel — 40%, bg-[#f5f5f5] */}
            <div className="flex-[4] bg-[#f5f5f5] flex items-center justify-center px-10 py-12 min-h-screen">
                <div className="w-full max-w-[400px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
