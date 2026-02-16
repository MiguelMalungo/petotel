"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-surface/7 backdrop-blur-md shadow-sm"
        : "bg-transparent border-none shadow-none"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0 group">
          <Image
            src="/media/logovector.svg"
            alt="PetOtel Logo"
            width={55}
            height={55}
            className="w-[55px] h-[55px] object-contain"
          />
          <span className={`text-4xl font-bold tracking-tight ${isHome ? "text-white" : "text-foreground"}`}>
            Pet<span className="text-accent">Otel</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-text-secondary">
          <span className="text-xs bg-accent-light text-accent font-medium px-2 py-1 rounded-full inline-flex items-center gap-1">
            <FlaskConical className="w-3 h-3" />
            Sandbox Mode
          </span>
        </nav>
      </div>
    </header>
  );
}
