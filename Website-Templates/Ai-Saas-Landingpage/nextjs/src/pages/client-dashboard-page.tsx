'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Clock3, LogOut, MessageSquareText } from 'lucide-react';
import { Footer } from '../components/Shared';
import { getUserToken, NexaraApiError, nexaraApi, setUserToken, type NexaraLead, type NexaraUser } from '../services/nexara-api';

export default function ClientDashboardPage() {
  const [user, setUser] = useState<NexaraUser | null>(null);
  const [leads, setLeads] = useState<NexaraLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const token = getUserToken();
    if (!token) {
      window.location.replace('/login');
      return () => { active = false; };
    }

    Promise.all([nexaraApi.currentUser(token), nexaraApi.accountLeads(token)])
      .then(([account, inquiries]) => {
        if (!active) return;
        setUser(account.user);
        setLeads(inquiries.data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof NexaraApiError && requestError.status === 401) {
          setUserToken(null);
          window.location.replace('/login');
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Could not load your dashboard.');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  function signOut() {
    setUserToken(null);
    window.location.assign('/');
  }

  return <><main className="client-dashboard"><section className="client-dashboard-hero"><div><span className="eyebrow">YOUR NEXARA ACCOUNT</span><h1>{user ? `Welcome, ${user.name}.` : 'Your client dashboard'}</h1><p>Track inquiries and read replies from the Nexara team.</p></div><button className="button button-ghost" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></section>
    <section className="client-dashboard-panel"><div className="client-dashboard-panel-heading"><div><span className="eyebrow">SUPPORT & SALES</span><h2>Your inquiries</h2></div><a className="text-link" href="/contact">Send an inquiry <ArrowRight size={14} /></a></div>
      {loading ? <p className="client-dashboard-state">Loading your inquiries…</p> : error ? <p className="client-dashboard-error" role="alert">{error}</p> : leads.length === 0 ? <div className="client-dashboard-empty"><MessageSquareText size={23} /><h3>No inquiries yet</h3><p>Inquiries you send while signed in as {user?.email} appear here, along with replies from our team.</p><a className="button" href="/contact">Contact sales <ArrowRight size={14} /></a></div> : <div className="client-inquiry-list">{leads.map((lead) => <article className="client-inquiry" key={lead.id}><header><div><span className={`client-inquiry-type ${lead.type}`}>{lead.type}</span><h3>{lead.company || (lead.plan ? `${lead.plan} plan` : 'Nexara inquiry')}</h3></div><time dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleDateString()}</time></header>{lead.message && <p className="client-inquiry-message">{lead.message}</p>}<div className="client-inquiry-status"><Clock3 size={14} /><span>Status: {lead.status}</span></div>{lead.response ? <div className="client-inquiry-response"><span className="client-inquiry-response-label"><Check size={14} /> Reply from Nexara{lead.respondedAt ? ` · ${new Date(lead.respondedAt).toLocaleString()}` : ''}</span><p>{lead.response}</p></div> : <p className="client-inquiry-waiting">Our team has received your inquiry and will post its reply here.</p>}</article>)}</div>}
    </section>
  </main><Footer /></>;
}
