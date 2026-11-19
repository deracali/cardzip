"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, MessageSquare, ShieldCheck } from "lucide-react";
import { PageIntro, PageLayout } from "../components/Shared";
import { agencyApi, getSessionUser } from "../services/agency-api";
import type { Message, User } from "../services/agency-api";

export default function ContactPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = getSessionUser();
    if (!currentUser || currentUser.role !== "client") {
      window.location.replace(`/login?redirect=${encodeURIComponent("/messages")}`);
      return;
    }
    setUser(currentUser);
    agencyApi.client.dashboard()
      .then((dashboard) => setMessages(dashboard.messages))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load your conversation."))
      .finally(() => setMessagesLoaded(true));
  }, []);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") || "");
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const { message: sentMessage } = await agencyApi.client.sendMessage(message);
      form.reset();
      setMessages((currentMessages) => [...currentMessages, sentMessage]);
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Your message could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageLayout>
      <div className="route-page quote-page client-messages-page">
        <PageIntro label="CLIENT MESSAGES" title={<>A direct line to<br /><em>your creative team.</em></>} description="Send a private message to the studio and follow replies in this conversation or your client dashboard." />
        <div className="quote-route-layout client-messages-layout">
          <section className="quote-card messages-compose-card">
            <div className="messages-card-heading"><span className="messages-heading-icon"><MessageSquare size={18} /></span><span><h2>Message the studio</h2><p>We’ll get back to you as soon as we can.</p></span></div>
            {user ? <p className="messages-account">Sending as <strong>{user.name}</strong> · {user.email}<i>Private</i></p> : <p className="dashboard-notice" role="status">Checking your client account…</p>}
            <form onSubmit={sendMessage}>
              <label className="quote-form-label">Your message<textarea name="message" maxLength={2000} rows={6} placeholder="Write your message here…" required /><small>Up to 2,000 characters</small></label>
              {error && <p className="auth-notice" role="alert">{error}</p>}
              {sent && <p className="quote-success" role="status"><Check size={18} /> Message sent. We’ll reply in your client portal.</p>}
              <button className="button button-cyan full-width messages-send-button" type="submit" disabled={busy || !user}>{busy ? "Sending…" : "Send message"} <ArrowRight size={14} /></button>
              <small className="quote-note"><ShieldCheck size={13} /> Only you and the studio can see this conversation.</small>
            </form>
          </section>
          <aside className="quote-aside client-conversation-card">
            <div className="conversation-heading"><span className="messages-heading-icon"><MessageSquare size={17} /></span><span><strong>Your conversation</strong><small>Messages with NOVA Studio</small></span><i>Private</i></div>
            <div className="conversation-thread" aria-live="polite">
              {!messagesLoaded ? <p className="conversation-empty">Loading your conversation…</p> : messages.length ? messages.slice().reverse().map((message) => <article className={`client-record conversation-message ${message.sender === "client" ? "from-client" : "from-studio"}`} key={message.id}><div><strong>{message.sender === "client" ? "You" : "NOVA Studio"}</strong><small>{new Date(message.createdAt).toLocaleString()}</small></div><span>{message.body}</span></article>) : <p className="conversation-empty">Your conversation starts here. Send your first message and the studio’s replies will appear here.</p>}
            </div>
            <Link className="conversation-dashboard-link" href="/dashboard"><MessageSquare size={14} /> Open client dashboard</Link>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
