// Pack catalogue shared by the site build (Buy now buttons) and the delivery functions.
// No secrets here: payment links and Stripe ids come from env vars set per environment (test now, live at launch).
// The single public contact address (forwards to the owner's inbox; never publish a personal address).
export const SUPPORT_EMAIL = 'support@aiforthisjob.com';

export const packs = [
  { slug: 'email-replies', linkEnv: 'PACK_LINK_EMAIL', idsEnv: 'PACK_STRIPE_IDS_EMAIL', file: 'aiforthisjob-email-replies-pack.zip',
    name: 'Customer Email Replies Pack', price: '£19', blurb: 'Reply-drafting prompts for common customer emails, a tone-of-voice template, an FAQ assistant set-up and escalation rules so nothing risky goes out unchecked.' },
  { slug: 'meeting-admin', linkEnv: 'PACK_LINK_ADMIN', idsEnv: 'PACK_STRIPE_IDS_ADMIN', file: 'aiforthisjob-meeting-admin-pack.zip',
    name: 'Meeting Notes & Admin Pack', price: '£19', blurb: 'Prompts and workflows for meeting notes and actions, inbox triage, receipts and expense categories, plus a simple checklist for what to automate first.' },
  { slug: 'investment-ops-roi', linkEnv: 'PACK_LINK_INVOPS', idsEnv: 'PACK_STRIPE_IDS_INVOPS', file: 'aiforthisjob-investment-ops-roi-pack.zip',
    name: 'Investment Ops AI ROI Pack', price: '£49', blurb: 'Prompts for reconciliation breaks, settlement exceptions (UK T+1) and KYC/onboarding, an ROI business-case worksheet and a governance and controls checklist.' },
];

export const packBySlug = (slug) => packs.find((p) => p.slug === slug) || null;

// Stripe ids that identify each pack: comma-separated Payment Link (plink_), Price (price_) and/or Product (prod_) ids.
const idsFor = (p, env = process.env) => String(env[p.idsEnv] || '').split(',').map((s) => s.trim()).filter(Boolean);

// Returns the pack whose configured ids include any of the given ids, or null.
export function packForStripeIds(ids, env = process.env) {
  const want = new Set(ids.filter(Boolean));
  return packs.find((p) => idsFor(p, env).some((id) => want.has(id))) || null;
}
