// Content for AIForThisJob. British English. Public sources only.
// Rule: never invent statistics. Vendor claims are labelled as such.

export const categories = [
  { slug: 'customer-support', name: 'Customer support', blurb: 'Answer customers faster without losing the human touch.' },
  { slug: 'marketing', name: 'Marketing and social', blurb: 'Plan, write and repurpose content without starting from a blank page.' },
  { slug: 'admin', name: 'Admin and productivity', blurb: 'Meetings, inboxes, documents and the glue work between apps.' },
  { slug: 'finance', name: 'Finance and bookkeeping', blurb: 'Get receipts, invoices and numbers where they need to be.' },
  { slug: 'software', name: 'Building software', blurb: 'Vibe coding, internal tools and fixing what the AI wrote.' },
  { slug: 'hr', name: 'HR and recruitment', blurb: 'Hiring admin, done carefully and lawfully.' },
  { slug: 'gaming', name: 'Gaming and indie dev', blurb: 'Concepts, quest text and game-jam speed.' },
  { slug: 'investment-operations', name: 'Investment operations', blurb: 'Reconciliations, trade exceptions, onboarding and the controls around them.' },
];

const S = {
  nber: { title: 'Brynjolfsson, Li and Raymond, "Generative AI at Work", NBER Working Paper 31161', url: 'https://www.nber.org/papers/w31161', kind: 'Independent research' },
  boe: { title: 'Bank of England and FCA, "Artificial intelligence in UK financial services – 2024"', url: 'https://www.bankofengland.co.uk/report/2024/artificial-intelligence-in-uk-financial-services-2024', kind: 'Regulator survey' },
  icoAI: { title: 'ICO, Guidance on AI and data protection', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/', kind: 'Regulator guidance' },
  icoRec: { title: 'ICO, "AI in recruitment" audit outcomes report (November 2024)', url: 'https://ico.org.uk/media2/migrated/4031620/ai-in-recruitment-outcomes-report.pdf', kind: 'Regulator report' },
  ncsc: { title: 'NCSC, Guidelines for secure AI system development', url: 'https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development', kind: 'Government guidance' },
  ghCopilot: { title: 'GitHub, "Research: quantifying GitHub Copilot\'s impact on developer productivity and happiness"', url: 'https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/', kind: 'Vendor research' },
  googleAIContent: { title: 'Google Search Central, "Google Search\'s guidance about AI-generated content"', url: 'https://developers.google.com/search/blog/2023/02/google-search-and-ai-content', kind: 'Platform guidance' },
  steam: { title: 'Steamworks, "AI content on Steam" (Valve announcement, January 2024)', url: 'https://store.steampowered.com/news/group/4145017/view/3862463747997849618', kind: 'Platform policy' },
  t1gov: { title: 'GOV.UK, "Accelerated Settlement (T+1)"', url: 'https://www.gov.uk/government/publications/accelerated-settlement-t1', kind: 'Government publication' },
  t1fca: { title: 'FCA, "About T+1 settlement"', url: 'https://www.fca.org.uk/markets/about-t1-settlement', kind: 'Regulator page' },
  fcaFinCrime: { title: 'FCA, Money laundering and terrorist financing', url: 'https://www.fca.org.uk/firms/financial-crime/money-laundering-terrorist-financing', kind: 'Regulator page' },
  anthropicAgents: { title: 'Anthropic, "Building effective agents"', url: 'https://www.anthropic.com/engineering/building-effective-agents', kind: 'Vendor guidance' },
  openaiPrompt: { title: 'OpenAI, Prompt engineering guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', kind: 'Vendor documentation' },
  anthropicPrompt: { title: 'Anthropic, Prompt engineering overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', kind: 'Vendor documentation' },
  gartner: { title: 'Gartner press release, 25 June 2025: over 40% of agentic AI projects predicted to be cancelled by end of 2027', url: 'https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027', kind: 'Analyst prediction' },
  govAdoption: { title: 'GOV.UK, AI adoption research', url: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research', kind: 'Government research' },
  fin: { title: 'Intercom Fin (product page)', url: 'https://www.fin.ai/', kind: 'Vendor page' },
  zendesk: { title: 'Zendesk AI (product page)', url: 'https://www.zendesk.co.uk/service/ai/', kind: 'Vendor page' },
  buffer: { title: 'Buffer AI Assistant (product page)', url: 'https://buffer.com/ai-assistant', kind: 'Vendor page' },
  meet: { title: 'Google Meet Help, "Take notes for me"', url: 'https://support.google.com/meet/answer/14754931', kind: 'Vendor documentation' },
  otter: { title: 'Otter.ai (product page)', url: 'https://otter.ai/', kind: 'Vendor page' },
  fireflies: { title: 'Fireflies.ai (product page)', url: 'https://fireflies.ai/', kind: 'Vendor page' },
  zapier: { title: 'Zapier AI (product page)', url: 'https://zapier.com/ai', kind: 'Vendor page' },
  n8n: { title: 'n8n (product page)', url: 'https://n8n.io/', kind: 'Vendor page' },
  make: { title: 'Make (product page)', url: 'https://www.make.com/en', kind: 'Vendor page' },
  dext: { title: 'Dext (product page)', url: 'https://dext.com/uk', kind: 'Vendor page' },
  xero: { title: 'Xero UK (product page)', url: 'https://www.xero.com/uk/', kind: 'Vendor page' },
  notebooklm: { title: 'Google NotebookLM (product page)', url: 'https://notebooklm.google/', kind: 'Vendor page' },
  cursor: { title: 'Cursor (product page)', url: 'https://cursor.com/', kind: 'Vendor page' },
  v0: { title: 'v0 by Vercel (product page)', url: 'https://v0.app/', kind: 'Vendor page' },
  lovable: { title: 'Lovable (product page)', url: 'https://lovable.dev/', kind: 'Vendor page' },
  replit: { title: 'Replit (product page)', url: 'https://replit.com/', kind: 'Vendor page' },
  unity: { title: 'Unity AI (product page)', url: 'https://unity.com/products/unity-ai', kind: 'Vendor page' },
  duco: { title: 'Duco (product page)', url: 'https://www.duco.com/', kind: 'Vendor page' },
  smartstream: { title: 'SmartStream (product page)', url: 'https://www.smartstream-stp.com/', kind: 'Vendor page' },
  gresham: { title: 'Gresham (product page)', url: 'https://www.greshamtech.com/', kind: 'Vendor page' },
  fenergo: { title: 'Fenergo (product page)', url: 'https://www.fenergo.com/', kind: 'Vendor page' },
};
export const sources = S;

export const useCases = [
  {
    slug: 'draft-customer-email-replies', cat: 'customer-support',
    title: 'Draft replies to customer emails',
    summary: 'Let AI write a first draft of each reply from your own help articles and past answers, then a person checks and sends it.',
    job: 'Your team answers the same twenty questions every week by email or chat, and response times slip whenever someone is off.',
    whatAIDoes: [
      'Reads the incoming message and works out what the customer is actually asking.',
      'Pulls the relevant answer from your help centre, policies or previous replies.',
      'Writes a draft in your tone of voice for a person to check, edit and send.',
    ],
    tools: ['Help-desk built-in AI such as Zendesk AI or Intercom Fin', 'A general assistant (ChatGPT, Claude, Gemini) with your policies pasted in, for very small teams'],
    needFirst: [
      'Up-to-date help articles or a written policy sheet: AI can only be as accurate as what it reads.',
      'A rule that a person approves every reply at first.',
      'A check of where customer data goes, and that your tool’s data-processing terms fit UK GDPR (see the ICO guidance).',
    ],
    roi: [
      'Measure median handling time per ticket for two weeks before and after.',
      'Track the share of drafts sent with little or no editing.',
      'Watch customer satisfaction or complaint rates so speed doesn’t cost quality.',
    ],
    evidence: 'In an independent study of 5,179 customer support agents, access to a generative AI assistant raised issues resolved per hour by 14% on average, with the biggest gains for newer staff (NBER Working Paper 31161). Your results will depend on your own volumes and content.',
    prompt: `You are a customer support assistant for [BUSINESS NAME].
Tone: friendly, plain British English, no jargon, no more than 150 words.

Use ONLY the policy and help text below. If the answer is not covered, say so and suggest the customer is passed to a human. Never invent prices, dates or promises.

POLICY AND HELP TEXT:
"""
[paste your returns policy, FAQs, opening hours, etc.]
"""

CUSTOMER MESSAGE:
"""
[paste the email]
"""

Write: 1) a one-line summary of what the customer wants, 2) a draft reply, 3) anything a human should double-check before sending.`,
    sources: ['nber', 'zendesk', 'fin', 'icoAI'],
  },
  {
    slug: 'website-faq-assistant', cat: 'customer-support',
    title: 'Put an AI assistant on your website for common questions',
    summary: 'An AI chat assistant answers routine questions from your help content around the clock and hands anything tricky to a person.',
    job: 'Customers ask simple questions out of hours, and you either miss the sale or answer it the next morning.',
    whatAIDoes: [
      'Answers questions in a chat window using only the content you give it.',
      'Collects details (order number, email) before passing a conversation to a person.',
      'Logs the questions it could not answer, which shows you what to write next.',
    ],
    tools: ['Help-desk AI agents such as Intercom Fin or Zendesk AI agents', 'Website chat tools with an AI add-on'],
    needFirst: [
      'Clear help content and a short list of topics the assistant must never handle (refunds above a limit, complaints, anything legal).',
      'A visible “talk to a person” option.',
      'An understanding of the pricing model: some vendors charge per conversation or per resolution, so costs grow with volume. Check current pricing on the vendor’s site.',
    ],
    roi: [
      'Count conversations fully resolved without a human, and check a sample each week to confirm they really were resolved.',
      'Compare cost per resolved conversation with your current cost per ticket.',
      'Track out-of-hours enquiries that turn into sales or bookings.',
    ],
    evidence: 'Vendors publish their own resolution-rate figures; treat these as vendor claims and test on your own traffic before committing.',
    prompt: `You are the website assistant for [BUSINESS NAME].
Answer only from the KNOWLEDGE below. Keep answers under 80 words.
If the question is about refunds over £[X], complaints, legal matters, or is not covered, reply:
"I'll pass this to the team. Could you share your name and email?"

KNOWLEDGE:
"""
[paste FAQs, delivery info, opening hours, pricing]
"""

At the end of each conversation, output a one-line log: topic | resolved yes/no | reason if not.`,
    sources: ['fin', 'zendesk', 'icoAI'],
  },
  {
    slug: 'repurpose-content-into-social-posts', cat: 'marketing',
    title: 'Turn one update into a week of social posts',
    summary: 'Write one solid piece (a blog post, a product update, a newsletter) and let AI cut it into platform-ready posts for you to review and schedule.',
    job: 'You know you should post regularly, but writing something new every day never happens.',
    whatAIDoes: [
      'Pulls the key points, quotes and tips out of a longer piece.',
      'Rewrites them to suit each platform’s length and style.',
      'Suggests hooks and a posting order, which you edit before scheduling.',
    ],
    tools: ['Scheduling tools with AI writing built in, such as Buffer’s AI Assistant', 'Design tools with AI features (for example Canva) for images', 'A general assistant (ChatGPT, Claude, Gemini)'],
    needFirst: [
      'One genuinely useful source piece: AI repurposes, it doesn’t create expertise.',
      'A short brand voice note (three adjectives, words you never use).',
      'A human check for accuracy and anything that could be read as a promise or claim.',
    ],
    roi: [
      'Hours spent on social each week, before and after.',
      'Posts published per week.',
      'Engagement and clicks per post, so you know the volume isn’t diluting quality.',
    ],
    evidence: 'No independent figures are cited here. Measure your own before-and-after time.',
    prompt: `Here is an article I wrote:
"""
[paste article]
"""

My audience: [who they are]. Brand voice: [3 adjectives]. Never use: [words].

Create 7 social posts from it:
- 3 for LinkedIn (max 120 words, one clear takeaway each)
- 3 for X (max 260 characters)
- 1 for Instagram caption with a suggested image idea
Each must stand alone, use British English, and contain no claims that aren't in the article. Number them and suggest the order to post them.`,
    sources: ['buffer'],
  },
  {
    slug: 'write-helpful-website-content', cat: 'marketing',
    title: 'Plan and draft helpful website content',
    summary: 'Use AI to build content briefs, outlines and first drafts, while you add the real experience that makes a page worth ranking.',
    job: 'You need pages that answer what customers search for, but writing them from scratch takes days.',
    whatAIDoes: [
      'Turns a topic into a list of the questions people are likely to ask.',
      'Builds an outline and a first draft for you to correct and enrich.',
      'Drafts titles, meta descriptions and FAQs.',
    ],
    tools: ['General assistants (ChatGPT, Claude, Gemini)', 'Your website builder’s AI writing features'],
    needFirst: [
      'Your own expertise, examples and photos. Google says it rewards helpful, original content however it is produced, and that using automation mainly to manipulate rankings breaks its spam policies.',
      'A fact-check step for every number, name and claim.',
    ],
    roi: [
      'Time to publish a page, before and after.',
      'Organic visits and enquiries per page after three months.',
      'Pages that needed major rewrites (a sign the drafts aren’t saving time).',
    ],
    evidence: 'Google’s published guidance is that appropriate use of AI is not against its guidelines, but content made mainly to manipulate rankings is.',
    prompt: `I run [BUSINESS] for [AUDIENCE] in [LOCATION].
Topic: [TOPIC].

1. List the 10 questions a real customer would ask about this topic.
2. Propose a page outline (H2/H3) that answers them in a logical order.
3. Mark with [ADD YOUR EXPERIENCE] the places where I should add a real example, photo, price or opinion.
4. Write a title (max 60 characters) and meta description (max 155 characters).
Do not invent statistics, prices or quotes. British English.`,
    sources: ['googleAIContent'],
  },
  {
    slug: 'meeting-notes-and-actions', cat: 'admin',
    title: 'Get meeting notes and action lists automatically',
    summary: 'An AI note-taker records or listens to a meeting and produces a summary, decisions and actions with owners.',
    job: 'Someone spends half the meeting typing notes, and the actions still get lost.',
    whatAIDoes: [
      'Transcribes the call.',
      'Summarises decisions, open questions and actions with owners and dates.',
      'Lets you search across past meetings.',
    ],
    tools: ['Built-in features such as Google Meet’s “Take notes for me” or Microsoft Teams with Copilot', 'Stand-alone note-takers such as Otter or Fireflies'],
    needFirst: [
      'Tell participants a meeting is being recorded or transcribed, and respect anyone who objects.',
      'Decide where transcripts are stored and for how long. Personal data rules apply (see ICO guidance).',
      'Don’t use them for confidential client or HR meetings unless your organisation has approved the tool.',
    ],
    roi: [
      'Minutes spent writing up notes per meeting, multiplied by meetings per week.',
      'Percentage of actions completed by their due date, before and after.',
      'Spot-check the accuracy of a few summaries each month.',
    ],
    evidence: 'No independent figures are cited here. Most savings come from removing the write-up step.',
    prompt: `Here is a meeting transcript:
"""
[paste transcript]
"""

Produce:
1. A 5-bullet summary.
2. Decisions made (who decided, what).
3. Actions as a table: action | owner | due date (write "not agreed" if none was said).
4. Open questions nobody answered.
Only include what was actually said. Flag anything ambiguous.`,
    sources: ['meet', 'otter', 'fireflies', 'icoAI'],
  },
  {
    slug: 'automate-repetitive-workflows', cat: 'admin',
    title: 'Automate repetitive work between your apps',
    summary: 'Connect your forms, inbox, spreadsheet and CRM so routine steps happen on their own, with AI handling the reading and sorting.',
    job: 'Every new enquiry means copying details from an email into a spreadsheet, then into your CRM, then sending a reply.',
    whatAIDoes: [
      'Reads unstructured text (an email, a form answer) and pulls out names, dates and requests.',
      'Sorts items into categories and routes them to the right place or person.',
      'Drafts the follow-up message for approval.',
    ],
    tools: ['No-code automation platforms with AI steps: Zapier, Make, n8n', 'This is where “agents” often start: a workflow with a few AI decision points'],
    needFirst: [
      'A written description of the process as it works today, step by step.',
      'A human approval step before anything is sent to a customer or money moves.',
      'An error alert, so a broken automation doesn’t fail silently.',
    ],
    roi: [
      'Time per item multiplied by items per week, before and after.',
      'Errors or missed enquiries per month.',
      'Running costs: automation platforms usually charge by task or run volume.',
    ],
    evidence: 'Anthropic’s guidance on building agents recommends starting with the simplest workflow that works and adding autonomy only when it is needed.',
    prompt: `Act as an automation designer.
Here is a process I do by hand:
"""
[describe each step, the apps involved, and how often it happens]
"""

1. Rewrite it as numbered trigger → steps → output.
2. Mark which steps are simple rules and which need AI (reading or judging text).
3. Mark where a human must approve.
4. List what could go wrong and how I'd get alerted.
5. Suggest whether Zapier, Make or n8n fits best, and why, in two sentences each.`,
    sources: ['zapier', 'make', 'n8n', 'anthropicAgents'],
  },
  {
    slug: 'capture-receipts-and-invoices', cat: 'finance',
    title: 'Capture receipts and supplier invoices automatically',
    summary: 'Photograph or forward receipts and bills; software extracts the details and posts them to your accounting system for you to approve.',
    job: 'A shoebox (or inbox) of receipts gets keyed in by hand at month end or the night before the VAT return.',
    whatAIDoes: [
      'Reads supplier, date, amount and VAT from images and PDFs.',
      'Suggests the expense category based on past choices.',
      'Matches documents to bank transactions in your accounting software.',
    ],
    tools: ['Receipt and bill capture tools such as Dext', 'Accounting software with built-in capture, such as Xero'],
    needFirst: [
      'A tidy chart of accounts and clear rules for categories.',
      'A weekly review step, especially for VAT treatment.',
      'Agreement from your accountant or bookkeeper on the workflow.',
    ],
    roi: [
      'Hours per month spent on data entry, before and after.',
      'Number of corrections your bookkeeper makes per month.',
      'Days to close the month.',
    ],
    evidence: 'No independent figures are cited here. Vendors publish their own accuracy claims; check them on your own documents during a free trial.',
    prompt: `I'm a UK small business on [cash/accrual] accounting, VAT registered: [yes/no].
Here is a list of transactions exported from my bank:
"""
[paste rows: date, description, amount]
"""

For each row, suggest: category | likely VAT treatment | confidence (high/medium/low) | question to ask my accountant if unsure.
Do not guess when unsure. Mark it low and ask.`,
    sources: ['dext', 'xero'],
  },
  {
    slug: 'research-and-summarise-documents', cat: 'admin',
    title: 'Research and summarise long documents',
    summary: 'Load reports, contracts or tender documents into an AI research tool and ask questions, with answers linked back to the source text.',
    job: 'You have a 60-page report or tender pack and need the five things that matter by this afternoon.',
    whatAIDoes: [
      'Summarises long documents and compares several at once.',
      'Answers questions with citations to the passage it used.',
      'Builds checklists, timelines and comparison tables.',
    ],
    tools: ['Source-grounded tools such as Google NotebookLM', 'General assistants with file upload (ChatGPT, Claude, Gemini)'],
    needFirst: [
      'Permission to upload the documents: never upload confidential or client data to a tool your organisation hasn’t approved.',
      'A habit of clicking the citation and checking the original wording, especially for legal or financial points.',
    ],
    roi: [
      'Time to first useful summary, before and after.',
      'Errors found on checking (a measure of how much you can rely on it).',
    ],
    evidence: 'No independent figures are cited here.',
    prompt: `You are a careful analyst. Using ONLY the attached documents:
1. Summarise each in 5 bullets.
2. List every deadline, obligation, fee or penalty, with page or section references.
3. List anything that is unclear or contradictory between documents.
4. Give me the 5 questions I should ask before deciding.
If something isn't in the documents, say "not stated".`,
    sources: ['notebooklm', 'icoAI'],
  },
  {
    slug: 'vibe-code-an-internal-tool', cat: 'software',
    title: 'Vibe-code a small internal tool',
    summary: 'Describe the tool you want in plain English and let an AI app builder generate a working first version you can test and refine.',
    job: 'You need a simple booking form, tracker or dashboard and can’t justify hiring a developer.',
    whatAIDoes: [
      'Generates a working app from a written description.',
      'Edits it as you describe changes (“add a status column”, “email me when…”).',
      'Explains the code it wrote if you ask.',
    ],
    tools: ['Prompt-to-app builders: Lovable, v0, Replit', 'AI code editors for more control: Cursor'],
    needFirst: [
      'A one-page spec: who uses it, what they enter, what they see.',
      'Care with logins and personal data. AI-generated code can contain security mistakes; the NCSC’s secure AI development guidelines are a useful checklist.',
      'Somewhere to keep the code (for example a Git repository) so you can undo changes.',
    ],
    roi: [
      'Build cost and time versus quotes for a developer or an off-the-shelf subscription.',
      'Hours saved per week by the people using the tool.',
      'Ongoing cost: hosting, the builder subscription and your maintenance time.',
    ],
    evidence: 'In a controlled experiment run by GitHub (vendor research), developers using Copilot completed a set coding task 55% faster than those without it. That was a single task with professional developers, so don’t assume the same for your project.',
    prompt: `Build a simple web app.

Purpose: [one sentence]
Users: [who, roughly how many]
Screens:
1. [screen]: shows [fields]
2. [screen]: lets user [action]
Data to store: [fields and types]
Rules: [e.g. only admins can delete]

Constraints: mobile friendly, plain British English labels, no personal data beyond [X], include a README explaining how to run it.
Before writing code, list your assumptions and ask me up to 5 questions.`,
    sources: ['lovable', 'v0', 'replit', 'cursor', 'ncsc', 'ghCopilot'],
  },
  {
    slug: 'explain-and-fix-code-errors', cat: 'software',
    title: 'Explain and fix a cryptic error',
    summary: 'Paste an error and the code around it; AI explains what went wrong in plain English and proposes a fix you can test.',
    job: 'Your AI-generated project broke, the error message means nothing to you, and you’re going round in circles.',
    whatAIDoes: [
      'Translates the error into plain English.',
      'Identifies the likely cause and proposes the smallest fix.',
      'Suggests how to test that it’s really fixed.',
    ],
    tools: ['AI code editors and assistants: Cursor, GitHub Copilot', 'General assistants (ChatGPT, Claude, Gemini)'],
    needFirst: [
      'Remove passwords, API keys and customer data before pasting anything.',
      'Use version control so you can roll back a bad fix.',
    ],
    roi: [
      'Time stuck per bug, before and after.',
      'Bugs that come back (a sign of patching symptoms rather than causes).',
    ],
    evidence: 'GitHub’s own research reports faster task completion with Copilot (vendor research). Debugging gains vary widely.',
    prompt: `I'm not an experienced developer. Here is an error and the relevant code.

ERROR:
"""
[paste full error]
"""

CODE (file name and contents):
"""
[paste]
"""

What I was trying to do: [one sentence]
What changed just before it broke: [if known]

1. Explain the error in plain English.
2. Give the most likely cause.
3. Show the smallest change that fixes it.
4. Tell me how to check it worked.
Don't rewrite unrelated code.`,
    sources: ['cursor', 'ghCopilot'],
  },
  {
    slug: 'job-ads-and-application-admin', cat: 'hr',
    title: 'Write job adverts and organise applications responsibly',
    summary: 'Use AI to draft clear, inclusive job adverts and interview questions, while keeping hiring decisions with people.',
    job: 'Hiring eats your week: writing the advert, answering candidates, organising CVs and interviews.',
    whatAIDoes: [
      'Drafts job adverts and checks them for jargon and exclusionary wording.',
      'Creates structured interview questions and scoring guides tied to the role.',
      'Drafts candidate emails such as acknowledgements and interview invitations.',
    ],
    tools: ['General assistants (ChatGPT, Claude, Gemini)', 'Applicant tracking systems with AI features. Check them against the ICO’s recommendations before buying.'],
    needFirst: [
      'The ICO’s 2024 audit of AI recruitment tools found problems including tools that let recruiters filter out people with protected characteristics, and collected more personal data than needed. Read its recommendations first.',
      'A data protection impact assessment if AI will process candidates’ personal data.',
      'Candidates told clearly if and how AI is used.',
    ],
    roi: [
      'Hours per hire spent on admin.',
      'Time from advert to shortlist.',
      'Diversity of applicants and candidate feedback, so efficiency doesn’t cost fairness.',
    ],
    evidence: 'The ICO made 296 recommendations to AI recruitment tool providers in its audit outcomes report (November 2024).',
    prompt: `Write a job advert for a [ROLE] at [BUSINESS], a [type of business] in [LOCATION].
Key responsibilities: [list]
Must-have skills: [max 5]
Salary: [£ range]  Hours/location: [details]

Use plain British English, avoid jargon and gendered or age-coded language, and keep "must-haves" genuinely essential.
Then give 6 structured interview questions linked to the must-haves, each with what a strong answer looks like.`,
    sources: ['icoRec', 'icoAI'],
  },
  {
    slug: 'game-jam-concepts-and-quest-text', cat: 'gaming',
    title: 'Brainstorm game concepts, quests and item lists',
    summary: 'Use AI as a fast brainstorming partner for game-jam concepts, lore, quest text and item tables, then make it your own.',
    job: 'The game jam starts in an hour, or your RPG needs 200 item descriptions, and your creativity has run dry.',
    whatAIDoes: [
      'Generates many concepts quickly from a theme and constraints.',
      'Drafts quest text, dialogue and item descriptions in a consistent style.',
      'Produces structured data (CSV or JSON) you can import into your engine.',
    ],
    tools: ['General assistants (ChatGPT, Claude, Gemini)', 'Engine-integrated AI tools such as Unity AI'],
    needFirst: [
      'If you publish on Steam: Valve requires developers to disclose how AI-generated content is used in their game (announced January 2024).',
      'Check the jam’s own rules: some ban or restrict AI-generated assets.',
      'Your own creative direction: AI output tends towards the generic until you push it.',
    ],
    roi: [
      'Hours spent on writing and data entry per content batch.',
      'Share of AI drafts kept after editing.',
      'For jams: did it get you to a playable build sooner?',
    ],
    evidence: 'No independent figures are cited here.',
    prompt: `Game jam theme: "[THEME]". Engine: [ENGINE]. Time: [48h]. Team: [size/skills].

1. Give 10 game concepts that fit the theme in an unexpected way, each in 2 sentences, with the core mechanic named.
2. Rate each for scope risk (low/medium/high) given our time and skills.
3. For the top 2, list the minimum features for a playable build.
Avoid concepts that depend on lots of art or voice acting.`,
    sources: ['steam', 'unity'],
  },
  {
    slug: 'reconciliation-break-investigation', cat: 'investment-operations',
    title: 'Investigate reconciliation breaks faster',
    summary: 'Use matching platforms for the matching, and AI to group breaks, suggest likely causes and draft commentary, with an analyst signing off.',
    job: 'Cash, position and transaction reconciliations throw up breaks every day. Analysts spend hours working out why and writing it up.',
    whatAIDoes: [
      'Matching platforms use rules and, increasingly, machine learning to suggest matches (vendor claims vary).',
      'AI can group similar breaks and suggest likely root causes (timing, FX, corporate action, static data) from the break pattern.',
      'Drafts break commentary and escalation notes for an analyst to approve.',
    ],
    tools: ['Reconciliation platforms such as Duco, SmartStream and Gresham (check each vendor’s current AI features and claims)', 'Firm-approved AI assistants for drafting commentary'],
    needFirst: [
      'Clean, consistently formatted source data and agreed break categories.',
      'Clear controls: AI suggests, an analyst decides. Keep an audit trail of who accepted what.',
      'Firm approval for any tool that touches client or position data. Never paste live data into an unapproved public chatbot.',
    ],
    roi: [
      'Average age of open breaks and time to resolve, before and after.',
      'Analyst hours per day on investigation and write-up.',
      'Accuracy: percentage of AI-suggested causes accepted on review.',
      'Time saved only counts if it is redeployed (to backlog, controls or growth) or avoids hiring.',
    ],
    evidence: 'The Bank of England and FCA’s 2024 survey found operations and IT is the business area with the largest share of AI use cases in UK financial services (around 22%). Vendor efficiency figures should be treated as claims until tested on your own data.',
    prompt: `You are assisting a reconciliations analyst. The data below is ANONYMISED test data.

BREAKS:
"""
[paste: break id | account | asset | our value | their value | difference | age in days | any notes]
"""

KNOWN CAUSE CATEGORIES: timing, FX rate, corporate action, fees/commission, static data mismatch, missing trade, duplicate, other.

For each break: suggested category | reasoning in one line | confidence (high/medium/low) | next check the analyst should make.
Then group the breaks by suspected common root cause.
Never state a cause as fact. These are suggestions for human review.`,
    sources: ['boe', 'duco', 'smartstream', 'gresham'],
  },
  {
    slug: 'trade-exception-triage', cat: 'investment-operations',
    title: 'Triage trade breaks and settlement exceptions',
    summary: 'Use AI to read exception queues, classify the issue, pull together the facts and draft the counterparty chaser, ahead of tighter settlement deadlines.',
    job: 'Unmatched trades, SSI mismatches and settlement fails pile up in queues and emails. With UK T+1 coming, there is less time to fix them.',
    whatAIDoes: [
      'Reads exception messages and emails and classifies the issue (for example missing SSI, quantity or price mismatch, insufficient securities or cash).',
      'Prioritises by value, settlement date and counterparty.',
      'Drafts chasers and internal escalation notes for an operator to send.',
    ],
    tools: ['Post-trade and exception management platforms (check current AI capability with vendors)', 'Workflow automation with AI classification steps', 'Firm-approved AI assistants for drafting'],
    needFirst: [
      'Awareness of the timeline: the UK government has committed to move to T+1 settlement on 11 October 2027 (GOV.UK, FCA).',
      'Structured access to exception data, plus agreed exception categories.',
      'Human approval before anything is sent to counterparties, and full audit logs.',
    ],
    roi: [
      'Time from exception raised to resolved.',
      'Settlement fail rate and the costs of fails (funding, claims, buy-in risk).',
      'Operator hours per day spent reading and chasing.',
      'Time saved only counts if it’s redeployed or avoids extra headcount for T+1.',
    ],
    evidence: 'UK move to T+1 on 11 October 2027 confirmed by HM Treasury; the FCA says firms should be changing systems and processes in 2026.',
    prompt: `You are assisting a settlements operator. Data below is ANONYMISED.

EXCEPTIONS:
"""
[paste: ref | trade date | settle date | counterparty | ISIN | qty | amount | status message]
"""

CATEGORIES: SSI mismatch, quantity mismatch, price/amount mismatch, unmatched/missing instruction, insufficient securities, insufficient cash, other.

1. Classify each exception with a one-line reason and confidence.
2. Rank them by urgency (settle date, then value).
3. For the top 5, draft a short, polite chaser email to the counterparty asking for the specific missing or mismatched detail.
Do not invent any data. Flag gaps.`,
    sources: ['t1gov', 't1fca', 'boe'],
  },
  {
    slug: 'kyc-onboarding-document-checks', cat: 'investment-operations',
    title: 'Speed up KYC and client onboarding reviews',
    summary: 'Use AI to extract details from onboarding documents, check completeness against your checklist and summarise files for the reviewer.',
    job: 'Onboarding packs arrive incomplete, analysts re-key data from PDFs, and periodic reviews pile up.',
    whatAIDoes: [
      'Extracts entity details, directors, owners and addresses from documents.',
      'Checks the pack against your firm’s checklist and lists what’s missing.',
      'Summarises the file and highlights inconsistencies for the analyst.',
    ],
    tools: ['Client lifecycle and KYC platforms such as Fenergo (check current AI features)', 'Document extraction (OCR plus AI) within firm-approved systems'],
    needFirst: [
      'Your firm’s documented AML/KYC policy. The decision and accountability stay with people (see the FCA’s financial crime pages).',
      'A data protection assessment: this is personal data (see ICO guidance).',
      'A test set of past files with known correct outcomes, to measure accuracy before go-live.',
    ],
    roi: [
      'Days from first contact to account opened.',
      'Analyst hours per file, and the backlog of periodic reviews.',
      'Rework rate: files sent back by quality assurance.',
      'Time saved only counts if it’s redeployed or avoids extra hiring.',
    ],
    evidence: 'In the Bank of England and FCA 2024 survey, firms rated anti-money laundering and combating fraud among the areas with the highest current perceived benefit from AI.',
    prompt: `You are assisting a KYC analyst. The documents are TEST or ANONYMISED.

CHECKLIST (from our policy):
"""
[paste required items for this client type]
"""

DOCUMENT TEXT:
"""
[paste extracted text]
"""

1. For each checklist item: present / missing / unclear, with the quote and document it came from.
2. List any inconsistencies (names, dates, addresses, ownership percentages).
3. Write a 5-line file summary for the reviewer.
You are not making a risk decision. Never fill gaps with assumptions.`,
    sources: ['fcaFinCrime', 'boe', 'fenergo', 'icoAI'],
  },
];

export const guides = [
  {
    slug: 'what-is-an-ai-agent',
    title: 'What is an AI agent? A plain-English guide',
    summary: 'The difference between a chatbot, a workflow and an agent, and how to tell which one your problem actually needs.',
    body: `
<p>“Agent” is used loosely. In practice there are three levels, and most real business value today sits in the first two.</p>
<h2>1. An assistant (chat)</h2>
<p>You ask, it answers. ChatGPT, Claude, Gemini and Copilot are assistants. They are brilliant for drafting, summarising and explaining, but they only act when you ask and only do what you then copy and paste.</p>
<h2>2. A workflow with AI steps</h2>
<p>A fixed sequence of steps, such as “when an email arrives, extract the details, add them to the CRM, draft a reply”, where AI handles the reading or writing. The path is decided in advance by you. Tools like Zapier, Make and n8n build these. They are predictable and easy to test.</p>
<h2>3. An agent</h2>
<p>The AI decides which steps to take, uses tools (search, a spreadsheet, your calendar) and keeps going until the task is done. Anthropic’s guidance describes agents as systems where the model “dynamically directs” its own process and tool use, compared with workflows that follow predefined paths. Agents are more flexible but also less predictable, slower and more costly, so they need tighter limits and checks.</p>
<h2>Which do you need?</h2>
<ul>
<li><strong>The steps are the same every time:</strong> build a workflow.</li>
<li><strong>The steps change depending on what it finds, and mistakes are cheap to fix:</strong> an agent may be worth trying.</li>
<li><strong>Mistakes are costly (money, customers, regulation):</strong> keep a person approving each action, whatever you build.</li>
</ul>
<p>Anthropic’s own advice is to start with the simplest solution and only add complexity when it clearly improves results. Gartner predicted in June 2025 that over 40% of agentic AI projects will be cancelled by the end of 2027 because of costs, unclear business value or weak risk controls. That’s why every entry in our library includes a way to measure return.</p>
`,
    sources: ['anthropicAgents', 'gartner', 'zapier'],
  },
  {
    slug: 'prompting-basics',
    title: 'Prompting basics: how to ask AI for what you actually want',
    summary: 'Five habits that turn vague AI answers into useful ones, with a template you can copy.',
    body: `
<p>A prompt is just the instruction you give an AI tool. Most disappointing results come from prompts that leave the AI guessing. The major AI providers publish prompting guides, and they agree on a handful of habits.</p>
<h2>1. Give it a role and an audience</h2>
<p>“You are a bookkeeper explaining to a sole trader” gets a very different answer from a bare question.</p>
<h2>2. Give it the material</h2>
<p>Paste the policy, the email, the data. Ask it to use <em>only</em> that material and to say when something isn’t covered. This is the single biggest fix for made-up answers.</p>
<h2>3. Be specific about the output</h2>
<p>Length, format (table, bullets, email), tone, British English. If you want a table with certain columns, name the columns.</p>
<h2>4. Show an example</h2>
<p>One example of a good answer is worth a paragraph of description.</p>
<h2>5. Ask it to check itself</h2>
<p>“List anything you were unsure about” or “ask me questions before you start” surfaces gaps before they become mistakes.</p>
<h2>A template to copy</h2>
<pre class="prompt"><code>You are [ROLE] helping [AUDIENCE].
Task: [WHAT YOU WANT DONE].
Use only the material below. If something isn't covered, say so.
"""
[PASTE MATERIAL]
"""
Output: [FORMAT, LENGTH, TONE]. British English.
Finally, list anything you were unsure about.</code></pre>
<p>Every use case in our library comes with a ready-to-use prompt built on this pattern.</p>
`,
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'measuring-ai-roi',
    title: 'How to tell whether an AI use case actually pays back',
    summary: 'A simple, honest method for measuring the return on an AI tool or agent before and after you roll it out.',
    body: `
<p>Lots of organisations are using AI; far fewer can say what it’s worth. The Bank of England and FCA’s 2024 survey found 75% of UK financial services firms already use AI. UK government research on AI adoption points to skills and understanding as common barriers. The question is no longer “should we try AI?” but “which uses are worth keeping?”</p>
<h2>Step 1: Measure the baseline first</h2>
<p>Before switching anything on, record for two weeks: how long the task takes, how often it happens, how many people do it, and the error or rework rate. Without a baseline, any ROI number is a guess.</p>
<h2>Step 2: Count all the costs</h2>
<ul>
<li>Subscriptions and usage fees (many tools charge per seat, per task or per resolution).</li>
<li>Set-up time: configuration, testing, writing prompts and training people.</li>
<li>Ongoing review time. If a person checks every output, that time is a cost.</li>
</ul>
<h2>Step 3: Be strict about what counts as a saving</h2>
<p>Time saved is only a financial return if it is <strong>redeployed</strong> (to revenue-generating work, backlog or quality) or <strong>avoids a cost</strong> (overtime, a new hire, a contractor). Twenty minutes saved per person scattered across a week often disappears.</p>
<h2>Step 4: Watch quality, not just speed</h2>
<p>Track errors, complaints, rework and customer satisfaction alongside time. A faster process that creates more rework hasn’t paid back.</p>
<h2>Step 5: Decide at a fixed date</h2>
<p>Set a review date (say 60 or 90 days) and a threshold in advance: keep, change or stop. This is how you avoid pilots that never end.</p>
<p><a class="btn" href="/roi-calculator">Try the free ROI calculator →</a></p>
`,
    sources: ['boe', 'govAdoption', 'gartner'],
  },
];
