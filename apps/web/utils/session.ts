import { Session } from "@/components/doc-template/DocTemplate";
import { useSession } from "next-auth/react";

export const useCustomSession = (): Session | null => {
  const { data: sessionData } = useSession();
  return sessionData ? (sessionData as unknown as Session) : null;
};
