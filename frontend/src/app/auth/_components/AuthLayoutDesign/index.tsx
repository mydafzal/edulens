import { CalendarCheck2, MessageCircle } from 'lucide-react'
import React from 'react'
import logo from "../../../../../public/assets/logo.png"
import man from "../../../../../public/assets/man.svg"
import woman from "../../../../../public/assets/woman.svg"
import woman2 from "../../../../../public/assets/woman2.svg"
import Image from 'next/image'
export default function AuthLayoutDesign() {
    return (
        <div className="hidden h-[1080px] max-h-[1080px] flex-1 overflow-hidden lg:flex">
            <div className="flex h-full w-full">
                {/* Left column */}
                <div className="flex w-[36%] min-w-[280px] flex-col">
                    {/* Top (blue) */}
                    <div className="relative flex flex-[2] flex-col justify-between bg-[#5D8DE3] p-6">
                        <div className="absolute left-[40px] top-[70px] flex h-[30.34px] w-[153.29px] items-center gap-[12px] p-0">
                            <Image src={logo} width={30.34} height={30.34} alt="logo" priority />
                            <span className="text-[20px] font-[500] leading-none text-white">EduLens</span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center pb-6 pl-[22%] pt-[18%]">
                            <h2 className="max-w-[12ch] text-left text-[38px] font-[600] leading-[1.2] text-white">
                                Smart
                                <br />
                                Resource
                                <br />
                                Discovery
                            </h2>
                        </div>

                        <div className="relative pb-4">
                            <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-full bg-[#FF967C]">
                                <Image
                                    src={man}
                                    alt="person"
                                    fill
                                    sizes="(min-width: 1280px) 260px, (min-width: 1024px) 240px, 0px"
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Instant Lesson Creation (pill) */}
                            <div className="absolute left-[58%] top-[55%] z-30 flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#312F2F] text-white">
                                    <MessageCircle className="h-5 w-5" />
                                </span>
                                <span className="whitespace-nowrap text-[14px] font-[400] text-[#312F2F]">
                                    Instant Lesson Creation
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom (teal) */}
                    <div className="flex flex-1 flex-col justify-center bg-[#A3CAD6] px-8 py-10">
                        <h3 className="max-w-[16ch] text-left text-[36px] font-[500] leading-[1.2] text-black">
                            Transparent
                            <br />
                            Evaluation &amp;
                            <br />
                            Trust
                        </h3>

                        <div className="mt-6">
                            <div className="relative h-12 w-[120px]">
                                <div className="absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-white/80" />
                                <div className="absolute left-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-white/80" />
                                <div className="absolute left-12 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white">
                                    <CalendarCheck2 className="h-5 w-5 text-[#312F2F]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-1 flex-col">
                    {/* Top row */}
                    <div className="flex flex-1">
                        <div className="relative flex flex-1 items-end justify-center overflow-hidden bg-[#A3CAD6]">
                            <div
                                className="absolute right-[-38%] top-[8%] aspect-square w-[64%] rounded-full bg-[#FF967C]"
                                style={{ clipPath: "circle(50% at 0 50%)" }}
                            />
                            <div className="relative h-[88%] w-[78%]">
                                <Image
                                    src={woman}
                                    alt="person"
                                    fill
                                    sizes="(min-width: 1280px) 320px, (min-width: 1024px) 260px, 0px"
                                    className="object-contain object-bottom"
                                    priority
                                />
                            </div>

                            {/* Floating label */}
                            <div className="absolute left-[56%] top-[62%] z-30 flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#312F2F] text-white">
                                    <MessageCircle className="h-5 w-5" />
                                </span>
                                <span className="whitespace-nowrap text-[14px] font-[400] text-[#312F2F]">
                                    AI-Powered Search
                                </span>
                            </div>
                        </div>

                        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#FF967C] p-8">
                            <div className="absolute left-[-45%] top-0 aspect-square w-[78%] rounded-full bg-[#5D8DE3]" />
                            <h2 className="relative max-w-[14ch] text-left text-[38px] font-[500] leading-[1.2] text-white">
                                One-Click
                                <br />
                                Adaptation &amp;
                                <br />
                                Creation
                            </h2>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="relative flex flex-1 items-end justify-center overflow-hidden bg-[#303030]">
                        <div className="pointer-events-none absolute top-0 h-[55%] w-[92%] rounded-t-full bg-[#5D8DE3]" />
                        <div className="pointer-events-none absolute bottom-[-8%] h-[55%] w-[110%] rounded-t-full bg-[#5D8DE3]" />

                        <div className="relative h-[92%] w-[86%]">
                            <Image
                                src={woman2}
                                alt="person"
                                fill
                                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 440px, 0px"
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>

                        {/* Floating label */}
                        <div className="absolute bottom-[22%] left-[14%] flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#312F2F] text-white">
                                <MessageCircle className="h-5 w-5" />
                            </span>
                            <span className="whitespace-nowrap text-[14px] font-[400] text-[#312F2F]">
                                Curriculum Aligned Resources
                            </span>
                        </div>

                        <div className="absolute bottom-[10%] right-[10%] flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#312F2F] text-white">
                                <MessageCircle className="h-5 w-5" />
                            </span>
                            <span className="whitespace-nowrap text-[14px] font-[400] text-[#312F2F]">
                                Classroom Context Matching
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
