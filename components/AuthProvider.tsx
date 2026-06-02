"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import SignInModal from "@/components/SignInModal";

type AuthContextValue = {
  isSignInOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  isSignInOpen: false,
  openSignIn: () => {},
  closeSignIn: () => {},
});

/** Hook to trigger sign-in modal from anywhere in the app */
export function useAuthModal() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignIn = useCallback(() => setIsSignInOpen(true), []);
  const closeSignIn = useCallback(() => setIsSignInOpen(false), []);

  return (
    <AuthContext.Provider value={{ isSignInOpen, openSignIn, closeSignIn }}>
      {children}
      <SignInModal isOpen={isSignInOpen} onClose={closeSignIn} />
    </AuthContext.Provider>
  );
}
