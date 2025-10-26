import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Mic } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I can help you check the status of your complaints or answer questions about civic issues.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'I understand you want to check on your complaint. AI chat functionality will be integrated soon!',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-primary-foreground/90 mt-2">
            Get help with your civic issues
          </p>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card className="h-[60vh] flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/10'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                title="Voice input (coming soon)"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
