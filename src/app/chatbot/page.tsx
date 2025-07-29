import { ChatbotClient } from "@/components/chatbot-client";
import { Bot } from "lucide-react";

export default function ChatbotPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full p-3 mb-4">
                    <Bot className="h-10 w-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">AI Pet Care Assistant</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
                    Have questions about pet care? Our AI assistant is here to help you 24/7.
                </p>
            </div>
            <ChatbotClient />
        </div>
    );
}
