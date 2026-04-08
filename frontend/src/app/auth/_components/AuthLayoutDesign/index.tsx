import Image from 'next/image';
import man from "../../../../../public/assets/man.svg";
import woman from "../../../../../public/assets/woman.svg";
import woman2 from "../../../../../public/assets/woman2.svg";

// Shared pill component
function Pill({ icon, label, style }: { icon: string; label: string; style: React.CSSProperties }) {
    return (
        <div
            className="absolute z-20 flex items-center gap-2 bg-white whitespace-nowrap"
            style={{
                borderRadius: 9999,
                padding: '8px 16px 8px 10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                ...style,
            }}
        >
            <span
                className="flex items-center justify-center rounded-full bg-[#0f172a] shrink-0"
                style={{ width: 28, height: 28 }}
            >
                <span className="text-white text-[14px]">{icon}</span>
            </span>
            <span className="text-[13px] font-medium text-[#0f172a]">{label}</span>
        </div>
    );
}

// Scora logo SVG
function ScoraLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="16" r="5" fill="currentColor" />
        </svg>
    );
}

export default function AuthLayoutDesign() {
    return (
        // overflow-visible so pills can bleed across cell borders
        <div className="hidden lg:flex flex-[6] min-h-screen" style={{ overflow: 'visible', position: 'relative' }}>
            {/* Mosaic grid — overflow visible so the pill overlay is not clipped */}
            <div className="flex h-full w-full min-h-screen" style={{ position: 'relative', overflow: 'visible' }}>

                {/* ── Left column (36%) ─────────────────────────────────── */}
                <div className="flex w-[36%] min-w-[260px] flex-col">

                    {/* Top — blue block (overflow-hidden for internal decorations only) */}
                    <div className="relative flex flex-[2] flex-col justify-between bg-[#4f7ef7] p-6 overflow-hidden rounded-br-[20px]">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 z-10">
                            <div className="w-8 h-8 rounded-full border-[1.5px] border-white flex items-center justify-center p-1">
                                <ScoraLogo className="w-full h-full text-white" />
                            </div>
                            <span className="text-[18px] font-bold text-white">Scora</span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center pb-6 pt-8 z-10">
                            <h2 className="text-[28px] font-bold leading-[1.2] text-white">
                                Smart<br />Resource<br />Discovery
                            </h2>
                        </div>

                        <div className="relative pb-4 z-10">
                            <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-full bg-[#f0a58a]">
                                <Image
                                    src={man}
                                    alt="person"
                                    fill
                                    sizes="220px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom — teal/sage block */}
                    <div className="flex flex-1 flex-col justify-center bg-[#b8d4d0] px-8 py-10 rounded-tr-[20px]">
                        <h3 className="text-[22px] font-bold leading-[1.2] text-[#1e293b]">
                            Transparent<br />Evaluation &amp;<br />Trust
                        </h3>
                        <div className="mt-5">
                            <div className="relative h-12 w-[120px]">
                                <div className="absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-white/80" />
                                <div className="absolute left-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-white/80" />
                                <div className="absolute left-12 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white">
                                    <ScoraLogo className="h-5 w-5 text-[#2d2d2d]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right column (64%) ────────────────────────────────── */}
                <div className="flex flex-1 flex-col">

                    {/* Top row */}
                    <div className="flex flex-1">
                        {/* Top-left — teal with woman photo */}
                        <div className="relative flex flex-1 items-end justify-center overflow-hidden bg-[#b8d4d0] rounded-bl-[20px]">
                            <div
                                className="absolute right-[-38%] top-[8%] aspect-square w-[64%] rounded-full bg-[#f0a58a]"
                                style={{ clipPath: "circle(50% at 0 50%)" }}
                            />
                            <div className="relative h-[88%] w-[78%]">
                                <Image
                                    src={woman}
                                    alt="person"
                                    fill
                                    sizes="300px"
                                    className="object-contain object-bottom"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Top-right — salmon/orange with headline */}
                        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#f0a58a] p-8 rounded-bl-[20px]">
                            <div className="absolute left-[-45%] top-0 aspect-square w-[78%] rounded-full bg-[#4f7ef7]" />
                            <h2 className="relative text-[28px] font-bold leading-[1.2] text-white">
                                One-Click<br />Adaptation &amp;<br />Creation
                            </h2>
                        </div>
                    </div>

                    {/* Bottom row — dark block */}
                    <div className="relative flex flex-1 items-end justify-center overflow-hidden bg-[#2d2d2d] rounded-tl-[20px]">
                        <div className="pointer-events-none absolute top-0 h-[55%] w-[92%] rounded-t-full bg-[#4f7ef7]" />
                        <div className="pointer-events-none absolute bottom-[-8%] h-[55%] w-[110%] rounded-t-full bg-[#4f7ef7]" />

                        <div className="relative h-[92%] w-[86%]">
                            <Image
                                src={woman2}
                                alt="person"
                                fill
                                sizes="500px"
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* ── Pill overlay — positioned relative to the full panel ── */}
                {/* pointer-events-none so pills don't block clicks on the form */}
                <div
                    className="pointer-events-none"
                    style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 20 }}
                >
                    {/* "Instant Lesson Creation" — bridges left col / right col, ~65% down */}
                    <Pill
                        icon="💬"
                        label="Instant Lesson Creation"
                        style={{ left: '28%', bottom: '35%', transform: 'translateX(-10%)' }}
                    />

                    {/* "AI-Powered Search" — top half, border of teal and salmon cells */}
                    <Pill
                        icon="🔍"
                        label="AI-Powered Search"
                        style={{ left: '55%', top: '45%', transform: 'translateX(-50%)' }}
                    />

                    {/* "Curriculum Aligned Resources" — lower dark block, left */}
                    <Pill
                        icon="📚"
                        label="Curriculum Aligned Resources"
                        style={{ left: '25%', bottom: '22%' }}
                    />

                    {/* "Classroom Context Matching" — very bottom, center-right */}
                    <Pill
                        icon="🏫"
                        label="Classroom Context Matching"
                        style={{ left: '40%', bottom: '8%' }}
                    />
                </div>

            </div>
        </div>
    );
}
