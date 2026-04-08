import AuthLayoutDesign from "./_components/AuthLayoutDesign";


import { Urbanist } from "next/font/google";
const urbanist = Urbanist({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});


export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className={`${urbanist.className} min-h-screen bg-[#F6F6F6] sm:p-6`}>
            <div className="mx-auto w-full max-w-[1440px] overflow-hidden rounded-[32px] sm:rounded-[48px] lg:rounded-[60px] bg-[#F6F6F6]">
                <div className="flex min-h-[calc(100vh-2rem)] items-stretch lg:min-h-[calc(100vh-3rem)]">
                    <AuthLayoutDesign />
                    <div className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:max-w-[520px] lg:px-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}