'use client';

import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { Logo, Footer, DashboardPreview, SectionHeading, FeatureCards, FAQSection } from '../components/Shared';
import { nexaraApi, type NexaraDocument } from '../services/nexara-api';

export default function DocsPage() {
  const [documents, setDocuments] = useState<NexaraDocument[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    nexaraApi.publicDocuments()
      .then(({ data }) => { if (active) setDocuments(data); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Documents could not be loaded."); });
    return () => { active = false; };
  }, []);
  const docs: [typeof Sparkles, string, string, string, string][] = [
    [Sparkles, '01', 'Quick start', 'Create your workspace, connect an app, and launch your first agent.', '/docs/quick-start'],
    [Workflow, '02', 'Build a workflow', 'Choose a trigger, add steps, and decide when your team should review.', '/docs/build-a-workflow'],
    [Plug, '03', 'Connect your stack', 'See how integrations and webhooks fit into your workflows.', '/docs/connect-integrations'],
    [CircleHelp, '04', 'Troubleshooting', 'Find answers to common setup, access, and billing questions.', '/docs/troubleshooting'],
  ]

  return <><main className="page-main"><SectionHeading eyebrow="NEXARA DOCS" title="A clear path from idea to automation." copy="Everything you need to connect your tools and launch a reliable AI workflow." /><div className="docs-grid">{docs.map(([Icon, number, title, copy, href]) => <a className="doc-card" href={href} key={number}><span className="doc-number">{number}</span><Icon size={20} /><h3>{title}</h3><p>{copy}</p><span className="text-link">Read guide <ArrowRight size={14} /></span></a>)}</div>{error && <p className="cms-api-warning" role="status">{error}</p>}{documents.length > 0 && <section className="docs-library"><h2>Documents from the Nexara team</h2><div className="docs-grid">{documents.map((document) => <a className="doc-card" href={`/docs/${encodeURIComponent(document.slug)}`} key={document.id}><FileText size={20} /><h3>{document.title}</h3><p>{document.description}</p><span className="text-link">View document <ArrowRight size={14} /></span></a>)}</div></section>}<div className="docs-callout"><FileText size={22} /><div><b>Looking for API documentation?</b><p>Get in touch and tell us what you're building. Our team can help you get started.</p></div><a className="button button-small" href="/contact">Contact us</a></div></main><Footer /></>
}

type GuideSection = { heading: string; paragraphs: string[]; items?: string[] };
type Guide = { title: string; summary: string; sections: GuideSection[] };

const guides: Record<string, Guide> = {
  "quick-start": {
    title: "Quick start",
    summary: "Set up a workspace, connect a trusted tool, and validate a first AI workflow before it reaches your team.",
    sections: [
      { heading: "1. Prepare your first use case", paragraphs: ["Start with one repeatable task that has a clear beginning and a result you can verify. Examples include summarizing an incoming request, drafting a response for review, or organizing a short set of notes. Keep the first workflow narrow; a small, measurable outcome is easier to evaluate than an attempt to automate an entire department.", "Before building, decide who owns the workflow, which information it may use, and what a successful result looks like. Note any cases that must be escalated to a person. This gives you a practical test plan and prevents the agent from being treated as an unchecked source of truth."], items: ["Choose a task with predictable input and an observable result.", "Use sample or non-sensitive data for the first run.", "Identify actions that should always require a person to approve them."] },
      { heading: "2. Create a workspace and connect one app", paragraphs: ["Open the workspace and select the integration needed for the chosen task. Authenticate with an account that has only the required permissions. If your organization manages access centrally, ask the app owner to create a dedicated connection rather than using a personal administrator account.", "Review the requested access before authorizing it. A workflow that only reads records should not need permission to delete them. Keep a note of who owns the connection and how it can be renewed or revoked."], items: ["Confirm the connected account and the data it can access.", "Enable only the events or resources needed for the workflow.", "Store credentials in the integration connection, never in prompts or documents."] },
      { heading: "3. Run a controlled test", paragraphs: ["Send a representative sample through the workflow and inspect every step, not just the final answer. Check whether the input was interpreted correctly, whether the generated output follows your requirements, and whether any action was attempted unexpectedly. Test a normal case and at least one incomplete or unusual case.", "Make one change at a time when a test fails. Adjust the instructions or input mapping, run the same sample again, and compare the result. Keep a short record of the test cases that passed so future edits can be checked against them."], items: ["Verify the trigger, input fields, generated result, and next action.", "Use approval gates for messages, updates, or other external changes.", "Do not publish until a teammate can explain what the workflow will do."] },
      { heading: "4. Publish and maintain", paragraphs: ["When tests pass, publish the workflow and tell its intended users what it does, what it does not do, and how to report a problem. Begin with a limited audience or a low-risk task when possible. Review activity regularly, especially after changing an integration, prompt, or source of data.", "Treat the workflow as maintained software: access can expire, upstream data can change, and team policies can evolve. Assign an owner to review its behavior and disable it if an unexpected result could cause harm."] },
    ],
  },
  "build-a-workflow": {
    title: "Build a workflow",
    summary: "Design a reliable automation by defining its trigger, inputs, actions, review points, and recovery path.",
    sections: [
      { heading: "Understand the workflow model", paragraphs: ["A workflow starts when a selected event occurs, gathers the data it needs, performs a sequence of steps, and records an outcome. Keeping those pieces explicit makes it easier to reason about failures. A useful design answers four questions: what starts the run, which information is available, what may change, and who should be notified?", "Separate interpretation from action. An AI step can classify or draft; a later action can save or send the result. This separation gives reviewers a place to inspect the proposed outcome before anything irreversible happens."], items: ["Trigger: the event that starts a run.", "Context: the fields and references the steps are allowed to use.", "Action: the change or draft the workflow produces.", "Review: the person or rule that decides whether to continue."] },
      { heading: "Configure the trigger and inputs", paragraphs: ["Choose a trigger that is specific enough to avoid unnecessary runs. Map only fields that contribute to the task, and provide clear labels so a teammate can understand where each value came from. Missing values should be handled deliberately: stop the run, request clarification, or route it to a person instead of silently guessing.", "Use realistic examples to check how the trigger behaves with duplicates, delayed events, and incomplete records. If the source system can send the same event more than once, consider how the workflow owner will recognize and resolve duplicate work."] },
      { heading: "Add steps and decision points", paragraphs: ["Build the smallest sequence that produces the intended result. Give each step a single responsibility, then make the output of one step explicit before passing it on. Clear instructions should describe the desired format, important constraints, and what to do when the available evidence is insufficient.", "Place a review step before sending an external message, changing a customer record, or making another consequential update. A reviewer should see the source information, the proposed change, and enough context to approve or reject it."], items: ["Keep generated drafts separate from actions that publish them.", "Define a safe fallback for missing or contradictory information.", "Record useful run details without copying unnecessary sensitive data."] },
      { heading: "Test, publish, and revise", paragraphs: ["Test ordinary input, edge cases, and a case that should be rejected or sent for review. Inspect the complete run history and confirm each step has the expected input and output. If a failure occurs, start with the first failed step; later failures may only be consequences of that earlier issue.", "After publishing, compare a sample of completed runs with the intended outcome. Update the workflow when its source data or team process changes, and rerun your tests after every meaningful revision. Keep an owner responsible for monitoring and pausing the workflow if its behavior is no longer predictable."] },
    ],
  },
  "connect-integrations": {
    title: "Connect integrations",
    summary: "Connect existing tools thoughtfully, limit access to what a workflow needs, and verify data flow before launch.",
    sections: [
      { heading: "Plan the connection", paragraphs: ["List the application, records, and events the workflow actually needs before authorizing an integration. This helps you select the least-privileged account and avoid granting broad access simply because it is convenient. Decide who will own the connection and who should be able to change or revoke it.", "Use separate connections for separate purposes when practical. A draft-generation workflow and a record-update workflow may need different access. Keeping them separate makes permissions easier to review and limits the impact of a misconfiguration."], items: ["Identify the exact data and actions required.", "Choose an account approved by the owner of the source application.", "Confirm how access will be reviewed, renewed, and revoked."] },
      { heading: "Authorize and verify access", paragraphs: ["Select the integration and complete its authorization flow using the account chosen during planning. Read the permission request before confirming it. If the access is broader than the workflow requires, cancel and consult the application owner rather than accepting permissions you do not understand.", "After connecting, verify the displayed account and run a harmless test against sample data. Confirm that read operations return the expected fields and that a workflow cannot perform an action outside its intended scope. Do not paste access tokens or secrets into instructions, sample prompts, or support messages."] },
      { heading: "Use events and webhooks safely", paragraphs: ["When an integration offers event subscriptions or webhooks, subscribe only to events that can start a useful workflow. Validate the incoming event shape and decide how to handle retries, repeated deliveries, and events that arrive out of order. A robust workflow should not create duplicate external actions when the same notification is delivered twice.", "For custom webhook setups, keep the endpoint and any verification secret in the appropriate connection settings. Do not publish a secret in a browser page, source repository, or shared document. If an event contains personal or confidential data, map only the fields needed for the task."] },
      { heading: "Maintain the connection", paragraphs: ["Connections may stop working when an account is disabled, permissions change, or an authorization expires. Assign an owner who can renew access and review whether the granted permissions are still appropriate. After reconnecting, repeat the integration test and review the first production runs.", "If an integration is no longer needed, pause workflows that depend on it, then revoke its access in the source application. Removing a connection without checking dependent workflows can leave runs failing repeatedly."] },
    ],
  },
  troubleshooting: {
    title: "Troubleshooting",
    summary: "Use a consistent diagnostic process for sign-in, integration, workflow, and output problems.",
    sections: [
      { heading: "Start with the exact failure", paragraphs: ["Record what you expected, what happened, and the approximate time of the run. Open the relevant activity or run history and find the earliest step that did not complete as expected. Later steps often fail because they did not receive the output of an earlier one, so fixing the first failure is usually the most useful starting point.", "Before retrying, check whether the failed run already completed an external action. A retry can send a duplicate message or create another record if an earlier step succeeded before the workflow reported an error."] },
      { heading: "Connection or permission errors", paragraphs: ["Confirm that the integration is connected to the expected account and that the required permission has not been removed. If the source account requires reauthorization, renew the connection through its normal authorization flow. Avoid copying tokens into chat, prompts, or logs while diagnosing the issue.", "If the integration is connected but a field is missing, verify that the source record contains that field and that it is included in the workflow input mapping. Ask the source application owner to confirm access when the required information is restricted."], items: ["Check connection status and account identity.", "Review the permission request and input-field mapping.", "Reauthorize only through the trusted integration flow."] },
      { heading: "Paused runs or unexpected outputs", paragraphs: ["For a paused run, inspect the first incomplete step and its required inputs. An approval step may be waiting for a reviewer; an action step may be missing a destination or required field. Correct the specific issue and continue only after confirming that the proposed action is still appropriate.", "For an incomplete or inaccurate generated result, compare the input with the instructions and provide only the relevant context that is missing. Test the change on a small sample first. If the result remains uncertain, route the case to a person rather than expanding access or allowing an unverified action."] },
      { heading: "Account, billing, and escalation", paragraphs: ["For sign-in problems, check the account email and use the normal account recovery process. For billing questions, include the account email and a short description of the plan or charge; never send a password, payment-card number, or authentication secret.", "When asking the Nexara team for help, include the workflow name, time of the run, the step that failed, and a redacted description of the error. Remove customer names, tokens, and other sensitive values. Pause the workflow first if repeated failures could create duplicate or unintended actions."] },
    ],
  },
};

export function DocumentDetailPage({ slug }: { slug: string }) {
  const [document, setDocument] = useState<NexaraDocument | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (guides[slug]) return;
    let active = true;
    nexaraApi.publicDocument(slug)
      .then(({ data }) => { if (active) setDocument(data); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "This document could not be loaded."); });
    return () => { active = false; };
  }, [slug]);

  const guide = guides[slug];
  if (guide) return <><main className="page-main docs-detail"><a className="back-link" href="/docs">← All documentation</a><SectionHeading eyebrow="PRODUCT DOCUMENTATION" title={guide.title} copy={guide.summary} />{guide.sections.map((section) => <section className="docs-article-section" key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}<a className="button" href="/trial">Try it with your team <ArrowRight size={15} /></a></main><Footer /></>;
  if (error) return <><main className="page-main docs-detail"><a className="back-link" href="/docs">← All documentation</a><p className="cms-api-warning" role="alert">{error}</p></main><Footer /></>;
  if (!document?.contentBase64) return <><main className="page-main docs-detail"><p className="cms-empty">Loading document…</p></main><Footer /></>;

  const fileUrl = `data:${document.contentType};base64,${document.contentBase64}`;
  const textContent = document.contentType === "application/pdf" ? "" : new TextDecoder().decode(Uint8Array.from(atob(document.contentBase64), (character) => character.charCodeAt(0)));
  return <><main className="page-main docs-detail"><a className="back-link" href="/docs">← All documentation</a><SectionHeading eyebrow="NEXARA DOCS" title={document.title} copy={document.description} /><a className="button button-small" href={fileUrl} download={document.filename}>Download {document.filename} <ArrowRight size={14} /></a>{document.contentType === "application/pdf" ? <iframe className="docs-pdf-viewer" title={document.title} src={fileUrl} /> : <pre className="docs-text-viewer">{textContent}</pre>}</main><Footer /></>;
}
