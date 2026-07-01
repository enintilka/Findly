"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import Navbar from "@/components/Navbar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatThreadPage({
  params,
}: {
  params: { threadId: string };
}) {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 px-4 py-10">
        <RequireAuth>
          <div className="mx-auto max-w-4xl">
            <ChatWindow threadId={params.threadId} />
          </div>
        </RequireAuth>
      </main>
    </>
  );
}
