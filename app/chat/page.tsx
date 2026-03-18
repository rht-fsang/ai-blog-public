import ChatInterface from "@/components/chat/ChatInterface";
import { siteConfig } from "@/lib/config";

const ChatPage = () => {
  const { owner, ai } = siteConfig;

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4 md:mb-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            {owner.nickname} {ai.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
            {ai.intro}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 dark:text-gray-500">在线</span>
          </div>
        </div>
      </div>
      <ChatInterface />
    </main>
  );
};

export default ChatPage;
