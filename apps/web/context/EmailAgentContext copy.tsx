"use client";
import { createContext, useContext, useState } from "react";

interface EmailAgentContextType {
  emailContent: string;
  setEmailContent: (content: string) => void;
}

const EmailAgentContext = createContext<EmailAgentContextType | undefined>(
  undefined
);

export const EmailAgentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [emailContent, setEmailContent] = useState("");

  return (
    <EmailAgentContext.Provider value={{ emailContent, setEmailContent }}>
      {children}
    </EmailAgentContext.Provider>
  );
};

export const useEmailAgentContext = () => {
  const content = useContext(EmailAgentContext);
  if (!content) {
    throw new Error(
      "useEmailAgentContext must be used within an EmailAgentProvider"
    );
  }
  return content;
};
