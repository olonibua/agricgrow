"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Tractor, Building } from "lucide-react";

interface UserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
}

export function UserTypeModal({ isOpen, onClose, mode }: UserTypeModalProps) {
  const title = mode === "signin" ? "Sign In" : "Sign Up";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title} to AgriGrow Finance</DialogTitle>
          <DialogDescription>
            Please select your account type to continue
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Link
            href={`/${mode === "signin" ? "login" : "register/farmer"}`}
            onClick={onClose}
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2"
            >
              <Tractor className="h-8 w-8 text-green-600" />
              <span className="font-medium">Farmer</span>
              <span className="text-xs text-muted-foreground text-center">
                Apply for loans and manage your farm finances
              </span>
            </Button>
          </Link>

          <Link
            href={`/${mode === "signin" ? "login" : "register/imf"}`}
            onClick={onClose}
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2"
            >
              <Building className="h-8 w-8 text-blue-600" />
              <span className="font-medium">IMF Partner</span>
              <span className="text-xs text-muted-foreground text-center">
                Provide loans and manage applications
              </span>
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
} 