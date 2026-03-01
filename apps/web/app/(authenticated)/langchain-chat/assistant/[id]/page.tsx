import { AssistantWindow } from "@/components/lang-chat/AssistantChat/AssistantWindow";

interface IndexProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: IndexProps) {
  const assistantId = (await params).id;

  return (
    <div className="mx-auto">
      {/* <AIOptions /> */}
      <AssistantWindow
        key={assistantId || "new-chat"} // Force remount when chatId changes
        endpoint="/api/chat"
        emoji="🏴‍☠️"
        placeholder="Enter prompt..."
        assistantId={assistantId}
        chatId={undefined}
      />
    </div>
  );
}
