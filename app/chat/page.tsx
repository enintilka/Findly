"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import Navbar from "@/components/Navbar";
import ChatInbox from "@/components/chat/ChatInbox";

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 px-4 py-10">
        <RequireAuth>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">
              Chat with {` `}
              agencies or owners and arrange in-person meetings.
            </p>
            <div className="mt-8">
              <ChatInbox />
            </div>
          </div>
        </RequireAuth>
      </main>
    </>
  );
}
