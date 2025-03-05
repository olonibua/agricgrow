"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { UserTypeModal } from "@/components/auth/user-type-modal";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userType, logout } = useAuth();
  
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");

  const openUserTypeModal = (mode: "signin" | "signup") => {
    setModalMode(mode);
    setIsUserTypeModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch  {
    }
  };

  // Only show public navigation in the header
  const navItems = !user ? [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
  ] : [];

  // If user is logged in, determine their dashboard link
  const dashboardLink = userType === 'farmer' ? '/dashboard' : '/imf-dashboard';

  return (
    <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={user ? dashboardLink : '/'} className="flex items-center gap-2">
              <Image
                src="/globe.svg"
                alt="AgriGrow Finance Logo"
                width={40}
                height={40}
              />
              <span className="font-bold text-xl hidden sm:inline-block">AgriGrow Finance</span>
            </Link>
            
            {/* Only show navigation items for public pages */}
            {!user && (
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
            )}
            
            {/* Show dashboard link when user is logged in */}
            {user && (
              <nav className="hidden md:flex gap-6">
                <Link
                  href={dashboardLink}
                  className="text-sm font-medium transition-colors hover:text-green-600 text-gray-600 dark:text-gray-300"
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="outline" onClick={handleLogout} className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex"
                  onClick={() => openUserTypeModal("signin")}
                >
                  Sign In
                </Button>
                <Button 
                  className="hidden sm:flex bg-green-600 hover:bg-green-700 cursor-pointer"
                  onClick={() => openUserTypeModal("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Mobile menu - only for public pages */}
            {!user && (
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
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start mb-2 cursor-pointer"
                        onClick={() => {
                          openUserTypeModal("signin");
                          document.querySelector('[data-state="open"]')?.setAttribute('data-state', 'closed');
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                        onClick={() => {
                          openUserTypeModal("signup");
                          document.querySelector('[data-state="open"]')?.setAttribute('data-state', 'closed');
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            {/* Mobile logout button when user is logged in */}
            {user && (
              <Button variant="outline" size="icon" className="md:hidden" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <UserTypeModal 
        isOpen={isUserTypeModalOpen} 
        onClose={() => setIsUserTypeModalOpen(false)} 
        mode={modalMode}
      />
    </header>
  );
} 