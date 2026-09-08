import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { user, isValidatingToken, isLoggingOut } = useAuth();

  useEffect(() => {
    if (isValidatingToken || isLoggingOut) {
      return;
    }

    if (!user) {
      router.push("/login");
    }
  }, [user, isValidatingToken, router, isLoggingOut]);

  if (isValidatingToken || !user || isLoggingOut) {
    return null;
  }

  return <>{children}</>;
};
