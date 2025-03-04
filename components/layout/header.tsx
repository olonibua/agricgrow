"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be managed by your auth context

  const openAuthModal = (tab: "signin" | "signup") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    // Here you would integrate with Appwrite auth logout
    setIsLoggedIn(false);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Apply for Loan", href: "/apply" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="border-b bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="AgriGrow Finance Logo"
                width={40}
                height={40}
              />
              <span className="font-bold text-xl hidden sm:inline-block">AgriGrow Finance</span>
            </Link>
            
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-green-600 ${
                    pathname === item.href ? "text-green-600" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex"
                  onClick={() => openAuthModal("signin")}
                >
                  Sign In
                </Button>
                <Button 
                  className="hidden sm:flex bg-green-600 hover:bg-green-700"
                  onClick={() => openAuthModal("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-green-600 ${
                        pathname === item.href ? "text-green-600" : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    {isLoggedIn ? (
                      <>
                        <Button asChild variant="ghost" className="w-full justify-start mb-2">
                          <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            openAuthModal("signin");
                            document.querySelector('[data-state="open"]')?.setAttribute('data-state', 'closed');
                          }}
                        >
                          Sign In
                        </Button>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            openAuthModal("signup");
                            document.querySelector('[data-state="open"]')?.setAttribute('data-state', 'closed');
                          }}
                        >
                          Sign Up
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab={authModalTab}
      />
    </header>
  );
} 