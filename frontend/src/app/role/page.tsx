"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const ROLES = [
  {
    id: "teacher",
    emoji: "👩‍🏫",
    name: "Teacher",
    description: "I create lesson plans and search for resources",
  },
  {
    id: "admin",
    emoji: "👨‍💼",
    name: "School Admin",
    description: "I manage curriculum and teacher resources",
  },
  {
    id: "student",
    emoji: "🎓",
    name: "Student",
    description: "I access learning materials and resources",
  },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

export default function RolePage() {
  const [selected, setSelected] = useState<RoleId | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem("edulens-role", selected);
    localStorage.setItem("scora-role", selected);
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-start justify-center px-4 py-20">
      <div
        className="bg-white w-full"
        style={{ borderRadius: 24, padding: 48, maxWidth: 560 }}
      >
        <h1 className="text-[28px] font-bold text-[#0f172a] leading-tight">
          What&apos;s your role?
        </h1>
        <p className="text-[14px] text-[#64748b] mt-2 mb-8">
          This helps us personalise your experience
        </p>

        <div className="flex flex-col gap-3 mb-8">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                className={[
                  "flex items-center gap-4 rounded-[16px] p-5 text-left transition-colors border cursor-pointer",
                  isSelected
                    ? "border-[#0f172a] bg-[#f8fafc]"
                    : "border-[#e2e8f0] hover:border-[#0f172a]",
                ].join(" ")}
              >
                {/* Emoji */}
                <span className="text-[32px] leading-none shrink-0">{role.emoji}</span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-[#0f172a] leading-tight">
                    {role.name}
                  </p>
                  <p className="text-[13px] text-[#64748b] mt-0.5">{role.description}</p>
                </div>

                {/* Radio */}
                <div
                  className={[
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "border-[#0f172a]" : "border-[#e2e8f0]",
                  ].join(" ")}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0f172a]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className={[
            "flex items-center justify-between h-[52px] rounded-full pl-6 pr-2 min-w-[160px] gap-3 transition-colors",
            selected
              ? "bg-[#0f172a] text-white hover:bg-[#1e293b] cursor-pointer"
              : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed",
          ].join(" ")}
        >
          <span className="text-[14px] font-medium">Continue</span>
          <span
            className={[
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
              selected ? "bg-white" : "bg-[#cbd5e1]",
            ].join(" ")}
          >
            <ArrowUpRight
              className={[
                "h-4 w-4",
                selected ? "text-[#0f172a]" : "text-[#94a3b8]",
              ].join(" ")}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
