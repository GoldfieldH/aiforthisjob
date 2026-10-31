// Guided paths and small free prompts. British English. No invented statistics.
// Sources are public pages already used on the site, plus the NHS Eatwell Guide (checked 31 Oct 2026).
// Nothing here is investment-operations content. Packs are never required.

export const ADDED = '2026-10-31T12:00:00Z';

export const pathSources = {
  nhsEatwell: {
    title: 'NHS, The Eatwell Guide',
    url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
    kind: 'NHS guidance',
  },
  geminiHome: {
    title: 'Google Gemini',
    url: 'https://gemini.google.com/',
    kind: 'Vendor page',
  },
  copilotHome: {
    title: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com/',
    kind: 'Vendor page',
  },
};

export const littleThings = [
  {
    slug: 'three-line-email',
    audience: 'work',
    title: 'Turn a rambling email into three lines',
    why: 'A long email often hides the one thing you need. Asking for three lines (what happened, what you need, by when) forces that ask into the open. The draft is for you to edit. It does not know your relationship with the reader.',
    prompt: `Rewrite the email below as three short lines I can edit:
1. What happened, in one line.
2. What I need from the reader, in one line.
3. By when, or "no deadline" if I didn't give one.

Keep my meaning. Take out apologies, backstory and softener phrases. British English. If the email is cross, make this version calm and factual. Do not add promises, dates or facts that are not in the email.

EMAIL:
"""
[paste the email you would have sent, with names and account numbers removed]
"""`,
    good: [
      'You can see the ask in one glance.',
      'Nothing new was invented: no extra deadlines, refunds or blame.',
      'It still sounds like something you would send, after you change a few words.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'week-from-a-list',
    audience: 'both',
    title: 'A week plan from a messy to-do list',
    why: 'Sorting a list is a job chat tools are actually good at, because you already wrote the raw material. They are poor at knowing which meeting is immovable or which day you are tired, unless you say so. The useful part is the grouping, not a fantasy of a perfect week.',
    prompt: `Turn this messy list into a one-week plan. I will edit it.

Fixed things I cannot move: [meetings, school run, shifts, or "none"]
Days I have less energy or less time: [e.g. Thursday afternoon]
Roughly how long I can spend on this list each weekday: [e.g. 45 minutes]

LIST:
"""
[paste the brain dump. One task per line if you can, but messy is fine]
"""

Give me Monday to Sunday. Each day: at most three tasks, the smallest first.
Put anything that does not fit under "Later or drop".
If two tasks need the same person or the same place, group them.
Do not invent deadlines. Mark anything vague as a question for me.`,
    good: [
      'Each day has a short list you could actually start.',
      'Overflow is named, not silently deleted.',
      'Questions show where your note was too vague to plan.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'ask-about-my-job',
    audience: 'work',
    title: 'What should I ask AI about my job?',
    why: 'People freeze because they think they need a grand project. A useful first step is a list of questions about one task you already do. The tool should not invent time saved. You still decide what your employer allows you to paste.',
    prompt: `I do this job: [job title in plain words, e.g. "office administrator at a small clinic"].
A task that eats time: [one real task].
Tools I'm allowed to use at work: [name them, or "I don't know yet"].

Suggest five questions I could ask a chat tool about that task.
For each question, say what I must not paste (customer details, staff details, passwords, health information, anything confidential).
Then write the first prompt I should try, with [BRACKETS] for the parts only I know.
Do not estimate hours saved or money saved. Do not suggest buying software.`,
    good: [
      'The five questions are about your task, not a generic list of "AI use cases".',
      'Each one says what to leave out.',
      'The first prompt still has blanks, because it cannot know your files.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'decision-helper',
    audience: 'both',
    title: 'A decision helper that does not decide for you',
    why: 'Choosing feels stuck when the options are still a muddle in your head. A chat tool can lay out what you already know, side by side, and show what is missing. It should not pick the winner. You know constraints it does not, and it will sound confident anyway.',
    prompt: `Help me think about a decision. Do not tell me what to choose.

Decision: [what you're deciding, in one sentence]
Option A: [first option]
Option B: [second option]
What matters to me, in order: [e.g. cost, time, other people affected]
What I've already ruled out: [or "nothing yet"]

1. A table with one row per thing that matters, and a cell for each option, using only what I wrote. Write "not stated" if I didn't say.
2. The single biggest unknown that would change the choice.
3. Three questions I could answer this week to shrink that unknown.
4. A one-line reminder of what this choice does not need to settle forever.
If I have only given you one option, say so and ask what the alternative is.`,
    good: [
      'Empty cells stay empty. They are not filled with guesses.',
      'You get a next question, not a verdict.',
      'You could show the table to someone else and they would follow it.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'tidy-notes',
    audience: 'work',
    title: 'Tidy rambling notes into decisions and actions',
    why: 'Notes fail when decisions and jobs are mixed in with chatter. Asking for three piles (decided, to do, still open) matches how people actually use notes afterwards. If the notes never said who owns a job, the draft should leave that blank.',
    prompt: `Sort these notes. Only use what is written. British English.

NOTES:
"""
[paste notes from a meeting, a call or a notebook. Remove names if you need to]
"""

Produce:
1. Decisions: only things the notes say were agreed. Quote the short phrase you relied on.
2. Actions: a table with task | owner | when. If the notes don't say, write "not named".
3. Open questions.
4. Anything that looks like a guess I might later treat as a fact. List it under "Don't file this as agreed".
Do not add tasks I did not write.`,
    good: [
      'Owners are blank when the notes were blank.',
      'A "don\'t file this" line stops a fuzzy comment becoming a decision.',
      'You can paste the result into the notes you already keep.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'check-a-formula',
    audience: 'work',
    title: 'Explain a spreadsheet formula before you trust it',
    why: 'A formula that runs is not a formula that means what you think. A reading in everyday words, including what a blank cell does, takes about a minute. Check the function name on the vendor’s own list. Test it on a copy.',
    prompt: `Explain this spreadsheet formula in plain British English. The app is [Excel or Google Sheets].

FORMULA:
"""
[paste the formula]
"""

What I think it does: [one sentence, or "I don't know"]

1. Say what it calculates, naming what each part does.
2. Say what it does if a referenced cell is blank or text.
3. Give me one tiny test table (a few cells of fake numbers) and what I should see.
4. If the formula looks wrong for what I think it does, say why, and show a corrected version I can test on a copy.
Do not tell me to run it on the only copy of the file.`,
    good: [
      'You could explain the formula back to a colleague.',
      'The blank-cell case is mentioned, not skipped.',
      'Any replacement formula is labelled as something to test, not as already correct.',
    ],
    sources: ['msFormulas', 'googleSheetsFns', 'openaiPrompt'],
  },
  {
    slug: 'skim-version',
    audience: 'work',
    title: 'The version someone can read in a lift',
    why: 'Busy people read the first lines and stop. A short version is not a dumber version: it is the decision, the ask and the risk, with the story left behind. You add back anything that must not be cut.',
    prompt: `Rewrite the update below so a busy person can read it in under a minute.

UPDATE:
"""
[paste the long update. Remove confidential figures if you are not allowed to share them]
"""

Use this shape:
- Decision or status, in one sentence.
- What I need from the reader, in one sentence. If nothing, say "For information".
- The one risk or blocker, or "None in the note".
- Three bullets of the minimum background.

Cut throat-clearing and repeated points. Do not soften a real problem into "all fine". Do not add numbers that are not in the update.`,
    good: [
      'The ask is in the first two lines.',
      'A problem in the original is still visible.',
      'You did not have to hunt the long version to see what was dropped.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'explain-this-letter',
    audience: 'home',
    title: 'Explain this letter without the jargon',
    why: 'Official letters are written for the sender’s process, not for you. A plain restatement shows what it is asking and by when. It is not advice. If money, tax, benefits or a court is involved, act on the letter and a proper source, not on the summary. Take your personal details out before you paste.',
    prompt: `Explain this letter in plain British English. I have removed my name, address and reference numbers. This is to help me understand the words, not legal, tax or financial advice.

LETTER:
"""
[paste the letter]
"""

1. In three sentences: who it says it is from, what it is about, and whether it asks me to do anything.
2. List every action, date, amount and reference it mentions. Quote the wording.
3. Explain jargon in a few words each.
4. Questions I should ask the sender, and what to have ready.
5. Anything that is a reason to check it is genuine before I pay or reply (rush to pay, odd payment method, contact details that don't match the organisation's own website).
If the letter does not say something, write "not stated". Do not guess.`,
    good: [
      'You can say, in your own words, what the letter wants.',
      'Dates and amounts match the letter, because they are quoted.',
      'You still know you need the sender or Citizens Advice if you are unsure, not the chat tool.',
    ],
    sources: ['hmrcGenuine', 'hmrcPhishing', 'caHome'],
  },
  {
    slug: 'meals-from-the-fridge',
    audience: 'home',
    title: 'Meals from what is actually in the fridge',
    why: 'Meal planning stalls when the plan ignores the food you already have. A short list of meals from those ingredients is more useful than a new recipe hobby. This is not a diet and not medical advice. If you have a condition with a prescribed diet, follow that. The NHS Eatwell Guide is general healthy-eating guidance for most people, not a meal plan for you.',
    prompt: `Suggest four simple meals I can cook from what I already have. British English. This is not medical or diet advice.

What I have: [list food in the fridge, freezer and cupboard that you are willing to use]
People eating: [how many, and ages only if it changes the meal, e.g. young children]
Avoid: [allergies, foods you won't eat, or "none"]
Time I have on a weeknight: [e.g. 30 minutes]
Cooker and kit: [e.g. hob and oven, no blender]

For each meal: a name, the ingredients from my list it uses, and the steps in short lines.
Then list a few cheap staples that would make another meal possible, marked as "I may not have these".
Do not set calorie targets. Do not tell me to cut out a food group.
If my list is too thin to make four meals, say so and suggest fewer.`,
    good: [
      'The meals use food you named, not a surprise shopping list dressed up as a plan.',
      'Missing items are labelled as missing.',
      'You could start cooking the first one without another search.',
    ],
    sources: ['nhsEatwell', 'openaiPrompt'],
  },
  {
    slug: 'simple-trip',
    audience: 'home',
    title: 'A trip outline you can check, not a booking',
    why: 'A chat tool will happily invent opening times and prices. The useful version refuses to. It gives you a shape for the days and a list of things you still have to confirm. For the money side, a budget is categories you fill in yourself. MoneyHelper’s budget planner is built for that. This prompt does not book anything.',
    prompt: `Draft a simple outline for a trip. Do not invent prices, opening times, visa rules or train times. If you don't know, write "check".

Where: [place]
Dates: [dates or number of days]
Who: [who is coming, no full names needed]
Budget I have already decided: [a figure, or "not set"]
Already booked: [or "nothing"]
Pace: [quiet, or out all day]
Must-do and won't-do: [e.g. one museum, no long hikes]

Give me:
1. A day-by-day skeleton with morning / afternoon / evening, in the place I named. Mark each item "idea" unless I already booked it.
2. A "check before you trust this" list: travel time, tickets, accessibility, weather, closures.
3. Budget headings only (travel, stay, food, tickets, buffer), with a blank for the amount. Do not fill the blanks.
4. What I should sort first, and what can wait.`,
    good: [
      'Ideas are labelled as ideas.',
      'The budget headings are empty, so you are not looking at made-up prices.',
      'The check-list is specific enough to work through.',
    ],
    sources: ['moneyHelperBudget', 'openaiPrompt'],
  },
  {
    slug: 'learn-the-basics',
    audience: 'both',
    title: 'Teach me this, then check I followed',
    why: 'A wall of explanation is hard to trust and hard to remember. A short explanation, one example, and three questions gives you something to push back on. Ask it what it might be wrong about. For health, money or the law, use a proper source rather than a lesson from a chat tool.',
    prompt: `Explain [TOPIC] to me. I am new to it. British English, short sentences.

Then:
1. Five bullets I could reread tomorrow.
2. One concrete example.
3. Three questions to check I followed, with the answers underneath so I can try first and then look.
4. Two things you might be wrong or out of date about, and the kind of source I should check (official site, textbook, a person qualified in this).

Do not give medical, legal or financial advice. If this topic needs a qualified person, say that in the first lines.`,
    good: [
      'You can cover the answer with your hand and try the three questions.',
      'The first lines say if this is the wrong tool for the topic.',
      'The example is specific enough to repeat in your own words.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'calm-message',
    audience: 'both',
    title: 'Rewrite it so you do not sound cross',
    why: 'The cross version is often the honest first draft. Sending it makes a second problem. A calm rewrite keeps the facts and the ask, and drops the heat. You choose whether the softer one still says the thing that matters. For a consumer complaint, check your rights with Citizens Advice before you rely on a letter.',
    prompt: `Here is a message I am too cross to send as it is. Rewrite it so it is calm, short and factual. Keep the ask.

MESSAGE:
"""
[paste your draft]
"""

What I want them to do: [one sentence]
Tone: firm and polite, not friendly and not angry.

Give me two versions:
1. The one I could send.
2. A slightly firmer one, still without insults or threats.
List any fact in my draft that a stranger could not prove, so I can take it out or back it up.
Do not add legal claims. Do not tell me I am entitled to money.`,
    good: [
      'The ask survived the rewrite.',
      'Insults and sarcasm are gone.',
      'Shaky facts are pointed out instead of polished into certainty.',
    ],
    sources: ['openaiPrompt', 'caTemplates', 'caFaulty'],
  },
  {
    slug: 'questions-before-a-call',
    audience: 'both',
    title: 'Questions to ask before a call you are dreading',
    why: 'The useful work happens before you dial. A short list of questions, plus the one outcome you want, stops the call wandering. The tool has not met the other person. Treat the list as a cue card, and leave room to listen.',
    prompt: `I have to speak to someone and I want a cue card, not a script to read out.

Who they are to me: [e.g. my landlord, my manager, a clinic, a supplier]
What the call is about: [one or two sentences]
What I want by the end: [one outcome]
What I already know: [facts, dates, reference numbers with personal details removed]
What I'm worried they will say: [or "not sure"]

Give me:
1. The outcome, restated in one line, so I can check you understood.
2. Up to six questions, in the order I should ask them.
3. Three facts I should have in front of me.
4. A polite line to use if I need to stop and say I'll reply later.
Do not write a pretend dialogue. Do not tell me to record the call.`,
    good: [
      'The questions are ones you could ask out loud.',
      'The outcome is one line, so you notice if the call drifts.',
      'There is a way to end without agreeing on the spot.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'stuck-reply',
    audience: 'both',
    title: 'A reply when you have been staring at the message',
    why: 'Being stuck is usually about tone or about not knowing what you are willing to commit to. Splitting "what I can say now" from "what I will not promise yet" gets a reply out without inventing a yes. You still press send.',
    prompt: `Draft a reply I can edit. I have been stuck on this message.

THEIR MESSAGE:
"""
[paste it, with personal details removed if this is not your own private tool]
"""

What is true: [the facts you are willing to say]
What I can offer: [or "I can't offer anything yet"]
What I will not promise: [or "nothing specific"]
Relationship: [e.g. a customer, my sister, a colleague I don't know well]
Length: under 120 words. British English.

Write one reply. After it, list any place you had to guess, so I can fix those words.
Do not apologise on my behalf for things I did not mention.`,
    good: [
      'The reply is short enough to send today.',
      'Guesses are listed underneath, not buried in the paragraph.',
      'It does not promise something you ruled out.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'what-did-i-miss',
    audience: 'work',
    title: 'What did I miss in this plan?',
    why: 'Writers go blind to gaps in their own plan. A chat tool has no stake in it, so it is useful as a nitpicker: missing owners, missing dates, steps that depend on someone who has not agreed. It is not a sign-off. You still own the plan.',
    prompt: `Read this plan as a careful colleague. Find gaps. Do not praise it and do not rewrite it unless I ask.

PLAN:
"""
[paste the plan]
"""

List:
1. Steps with no owner.
2. Steps with no timing.
3. Things that assume someone else has agreed, where the plan does not say they have.
4. What happens if the risky step slips.
5. Up to five questions you would ask before calling this ready.
If the plan is already tight, say "no gap I can see" for that item. Do not invent risks that the plan's subject could not have.`,
    good: [
      'The notes are gaps, not a new plan you did not ask for.',
      'You can answer the questions in the document you already have.',
      'It is willing to say when it cannot see a gap.',
    ],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
];

const thingBy = Object.fromEntries(littleThings.map((t) => [t.slug, t]));

export const goals = [
  {
    slug: 'save-time-on-email',
    audience: 'work',
    title: 'Save time on email',
    card: 'Turn one awkward email into three clear lines, then decide whether a bigger inbox routine is worth it.',
    lede: 'Start with a single email you are allowed to use. A shorter draft is the win. Sending it is still your job.',
    thought: 'You do not need an inbox system on day one. Take one email you keep rewriting, remove anything confidential, and ask for three lines: what happened, what you need, and by when. If that draft is useful, you have learned the habit. If it is nonsense, you have lost two minutes.',
    thing: 'three-line-email',
    next: [{ href: '/use-cases/daily-inbox-triage', label: 'Next: a ten-minute daily pass at the inbox' }],
    also: ['stuck-reply', 'skim-version', 'calm-message'],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'tidy-my-notes',
    audience: 'work',
    title: 'Tidy my notes',
    card: 'Turn rambling notes into decisions, actions and open questions, with blanks where the notes were blank.',
    lede: 'A tidy note is one you can act on next week. The chat tool only sorts words you paste. It cannot remember the meeting.',
    thought: 'Paste the messy version, not a cleaned-up one. Ask it to separate what was decided, what someone needs to do, and what nobody answered. If it names an owner the notes never named, delete that line. That check is the whole point.',
    thing: 'tidy-notes',
    next: [{ href: '/use-cases/meeting-notes-and-actions', label: 'Next: meeting notes and an action list' }],
    also: ['what-did-i-miss', 'skim-version', 'week-from-a-list'],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'plan-something',
    audience: 'work',
    title: 'Plan something',
    card: 'Make a one-week plan from a messy list, then look for the gaps before you treat it as agreed.',
    lede: 'A plan made of tasks you already wrote down. Fixed commitments stay fixed because you said so, not because a tool guessed.',
    thought: 'Dump the list as it is, including the vague lines. Tell it what you cannot move and how much time you really have. A good plan leaves leftovers in a "later or drop" pile. A bad one pretends it all fits.',
    thing: 'week-from-a-list',
    next: [{ href: '/little-things#thing-what-did-i-miss', label: 'Next: ask what the plan is missing' }],
    also: ['decision-helper', 'questions-before-a-call', 'tidy-notes'],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'learn-for-work',
    audience: 'work',
    title: 'Learn something for work',
    card: 'Find one task in your real job worth trying, with a prompt that keeps customer and staff details out.',
    lede: 'The first lesson is not a course. It is five questions about a task you already do, and a clear line on what you must not paste.',
    thought: 'If work has only just switched a tool on, the useful question is "where does this help the job I have?" Name one slow task. Ask for questions, not a transformation. Then read what it tells you to leave out before you paste a real file.',
    thing: 'ask-about-my-job',
    next: [
      { href: '/at-work', label: 'Read the at-work page: what your employer allows' },
      { href: '/guides/protecting-data-when-using-ai', label: 'What not to paste into an AI tool' },
    ],
    also: ['check-a-formula', 'learn-the-basics', 'what-did-i-miss'],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
  {
    slug: 'explain-a-letter',
    audience: 'home',
    title: 'Explain a letter or message',
    card: 'Get a confusing letter explained in words you’d use yourself. Take your name and reference numbers out first.',
    lede: 'Use this to understand the words. For tax, benefits, debt or anything you might pay, check the sender through their official website or Citizens Advice.',
    thought: 'Cover your name, address and any reference number with a pen or delete them from the text. Paste what is left. You want: who it says it is from, what it wants, and by when. You do not want a guess about your rights.',
    thing: 'explain-this-letter',
    next: [{ href: '/use-cases/understand-an-official-letter', label: 'Next: the fuller guide to official letters' }],
    also: ['calm-message', 'stuck-reply', 'questions-before-a-call'],
    sources: ['hmrcGenuine', 'hmrcPhishing', 'caHome'],
  },
  {
    slug: 'plan-meals-or-a-trip',
    audience: 'home',
    title: 'Plan meals or a trip',
    card: 'A first prompt that asks whether you are planning food or a trip, then points you at a planner that will not invent prices.',
    lede: 'Say which one you mean. Meals should come from food you have. A trip outline should leave prices and opening times blank until you check them.',
    thought: 'Pick one. If you paste both a fridge list and a holiday, you will get a muddle. Tell it your limits (time, budget, people, foods you avoid) and expect questions back if you were vague. That is a good result.',
    prompt: `I want help planning. First say whether I have given you enough to plan meals or a trip. If not, ask me at most five questions and then stop.

Which one: [MEALS or a TRIP]
Limits: [budget, dates, who is coming, foods to avoid, or "not sure yet"]
What I already have: [what's in the fridge, or bookings already made, or "nothing"]

If I have given you enough:
- For meals, suggest three simple meals from the food I named. This is not medical or diet advice. Do not set calorie targets.
- For a trip, give a day-by-day skeleton and mark every idea as "check". Do not invent prices, opening times or travel times.
End with what I should confirm myself.`,
    good: [
      'It asks you questions when the note is too thin, and then stops.',
      'Meals use food you listed. Trip ideas are marked as things to check.',
      'You are not given a fake price or a medical diet.',
    ],
    next: [
      { href: '/little-things#thing-meals-from-the-fridge', label: 'Meals from what is in the fridge' },
      { href: '/little-things#thing-simple-trip', label: 'A trip outline with the prices left blank' },
    ],
    also: ['week-from-a-list', 'decision-helper'],
    sources: ['nhsEatwell', 'moneyHelperBudget', 'openaiPrompt'],
  },
  {
    slug: 'learn-something',
    audience: 'home',
    title: 'Learn something new',
    card: 'A short explanation, one example, and three questions to see if you followed. Not a course, and not advice on health or money.',
    lede: 'Pick a topic you can check afterwards. Ask for the lesson and the test in the same go, and ask where it might be wrong.',
    thought: 'Name the topic in ordinary words, and say you are new to it. Read the example before the bullets. Try the three questions with the answers covered. If the topic is your health, your tax or a legal problem, stop and use a proper source. A chat tool is a patient explainer, and a confident one, which is not the same as a correct one.',
    thing: 'learn-the-basics',
    next: [{ href: '/guides/prompting-basics', label: 'Next: five habits that make answers less vague' }],
    also: ['explain-this-letter', 'decision-helper', 'questions-before-a-call'],
    sources: ['openaiPrompt', 'anthropicPrompt'],
  },
  {
    slug: 'no-idea',
    audience: 'either',
    title: 'I have no idea where to start',
    card: 'No project needed. Describe an ordinary week and get one low-risk thing to try, at home or at work.',
    lede: 'You do not need a use case. You need one annoyance from this week that would be fine to get wrong.',
    thought: 'Skip the catalogue. Write a few lines about a normal week and ask for one small try where a mistake is cheap: a draft you will edit, a list you will check, an explanation of something you can compare with the original. If this is for work, find out what you are allowed to paste before you use a real customer or staff example.',
    prompt: `I don't know what to use a chat tool for. Help me find one small thing to try this week.

About my week: [a few lines on work or home. No names, no account numbers, no medical details.]
Where this is for: [home, work, or both]
What I'm allowed to paste if this is work: [or "this is just for me at home"]

Rules for your answer:
- Suggest three tasks, ranked by how little can go wrong if the draft is bad.
- Do not suggest a business, a side income, or new software to buy.
- Do not estimate time or money saved.
- For the top task, write the prompt I should paste next, with [BRACKETS] for anything only I know.
- Say what I should check before I trust the answer.
If my note is too vague, ask me up to three questions and then stop.`,
    good: [
      'The suggestion is a draft or a list, not a new project.',
      'The prompt it writes still has blanks for you.',
      'Work and home are not given the same "paste anything" advice.',
    ],
    next: [
      { href: '/start', label: 'I’m at home and I have never used one of these tools' },
      { href: '/at-work', label: 'Work has just given me an AI tool' },
    ],
    also: ['ask-about-my-job', 'week-from-a-list', 'decision-helper'],
    sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI'],
  },
];

export const startGuide = {
  title: 'New to AI? Start here',
  description: 'What a free chat tool is, how to open one, a first prompt to copy, and three safety rules.',
  lede: 'You don’t need a course. A chat tool is a box. You type what you want, and it writes a draft back. This page gets you to a first useful draft.',
  steps: [
    {
      title: 'What these tools are',
      paras: [
        'ChatGPT, Google Gemini, Microsoft Copilot and Claude are chat tools. You type in ordinary sentences. They reply with text. They don’t know your life, your files, or what’s true unless you give them something to read and then check them.',
        'Free ways to try them exist. What the free version includes changes, and some screens will offer a paid upgrade. You can close that and keep going, or try a different tool. Read the screen before you pay anyone.',
      ],
    },
    {
      title: 'Open one and get to an empty box',
      paras: [
        'If someone at work has given you a tool, use that one and read the at-work page before you paste anything from the job. For home, pick a single tool and ignore the others for today.',
        'On a computer, open the tool’s website and look for Sign up, Try, or a chat box. On a phone, the website or the app store both work. Use an email address you are happy to receive mail at. When you can type into an empty box, you are ready. You don’t need to learn the settings.',
      ],
      links: [
        { href: 'https://gemini.google.com/', label: 'Google Gemini' },
        { href: 'https://copilot.microsoft.com/', label: 'Microsoft Copilot' },
        { href: '/at-work', label: 'Work gave me the tool' },
      ],
    },
    {
      title: 'Try one prompt',
      paras: [
        'Copy the prompt below. Replace the highlighted brackets with a letter or message you want explained, after you have removed your name, address and any reference numbers. Paste it into the box and send it.',
        'If a letter feels too serious for a first go, plan a few meals from what is in the fridge instead. Same idea: you bring the facts, it drafts, you check.',
      ],
      links: [{ href: '/little-things#thing-meals-from-the-fridge', label: 'Meals from what is in the fridge' }],
    },
  ],
  safetyTitle: 'Three safety rules',
  safety: [
    {
      title: 'Leave private details out',
      body: 'Don’t paste passwords, bank card numbers, medical records, or photos of identity documents. For a letter, cover your name, address and account numbers first. At work, don’t paste customer or staff information into a tool your employer hasn’t approved.',
    },
    {
      title: 'Check anything that matters',
      body: 'These tools can be wrong and still sound sure. If you might pay money, reply to an official body, or rely on a fact, compare the answer with the original document or with a proper source such as the organisation’s own website or Citizens Advice.',
    },
    {
      title: 'You still send it',
      body: 'A draft is not a decision. Read it before it goes to another person. If it added a promise, a date or a fact you did not provide, take that sentence out.',
    },
  ],
  promptThing: 'explain-this-letter',
  more: [
    { href: '/jobs/everyday-admin', label: 'Money and everyday admin' },
    { href: '/use-cases/understand-an-official-letter', label: 'Understand an official letter' },
    { href: '/use-cases/review-spending-and-subscriptions', label: 'Review spending and subscriptions' },
    { href: '/use-cases/write-a-complaint-letter', label: 'Write a complaint' },
    { href: '/use-cases/spot-ai-scams', label: 'Spot a suspicious message' },
    { href: '/jobs/careers', label: 'Careers and job hunting' },
    { href: '/use-cases/tailor-your-cv-to-a-job', label: 'Tailor a CV honestly' },
    { href: '/use-cases/interview-practice-with-ai', label: 'Practise interview answers' },
  ],
  sources: ['openaiPrompt', 'anthropicPrompt', 'icoAI', 'caHome', 'geminiHome', 'copilotHome', 'hmrcGenuine'],
};

export const atWorkGuide = {
  title: 'Just been given AI at work',
  description: 'What to check with your employer, what not to paste, five quick wins, and a 30-minute way to test one idea.',
  lede: 'You already know the job. The new part is a tool on your account, often Copilot, ChatGPT or Gemini. Start by finding the edges: what you are allowed to use, and what must not go into the box.',
  checks: [
    'Which tool are you supposed to use? Prefer the work account over a personal one. Personal and work plans often keep data on different terms.',
    'What are you allowed to paste? If nobody has written it down, ask your manager before you paste customer, staff, financial or confidential material. Use a made-up example until you have an answer.',
    'What must a person still approve? Anything that is sent to a customer, paid, deleted or published should wait for a person, including you, to say yes.',
  ],
  avoid: [
    'Passwords, API keys, card numbers and copies of identity documents.',
    'Health information, and other details your organisation treats as sensitive.',
    'A whole customer list, a staff file, or a contract, unless that tool is the one your employer has approved for it.',
    'Instructions that arrived inside an email or document you don’t trust. A chat tool may follow them. Read the data guide if a tool is reading mail on its own.',
  ],
  wins: [
    { href: '/use-cases/draft-customer-email-replies', title: 'Email replies', text: 'A first draft from your own policy or a past answer, which you check and send.' },
    { href: '/use-cases/meeting-notes-and-actions', title: 'Meeting notes', text: 'A summary, the decisions and the actions, from notes you are allowed to use.' },
    { href: '/use-cases/spreadsheet-formulas-with-ai', title: 'Spreadsheet formulas', text: 'Describe the calculation you want, or paste a formula and get it explained. Test it on a copy.' },
    { href: '/use-cases/write-a-handover-document', title: 'A handover', text: 'Open work, deadlines and where files live, written down before leave or a new starter.' },
    { href: '/use-cases/research-and-summarise-documents', title: 'A long document', text: 'Questions against a report or pack, with the answer tied back to the text. You still read what matters.' },
  ],
  thirty: [
    'Write the job in one sentence: who it is for, and what “done” looks like.',
    'Pick one real example you are allowed to use. If you are not sure, invent obviously fake details and label them as fake.',
    'Run one prompt. The three-line email below is enough if your idea is “make this easier to read”.',
    'Compare the answer with the original. Mark what is useful and what is wrong.',
    'Write four lines: minutes it took, what you would keep, what you had to fix, what you still do yourself.',
    'If the idea would send, pay, delete or publish anything, stop. Read the permissions guide before you connect it to a real system.',
    'If a manager wants a number, use the calculator and read how we think about payback. Time saved counts when it is used for other work or avoids a real cost. A feeling of speed is not a saving.',
  ],
  promptThing: 'three-line-email',
  guides: [
    { href: '/guides/protecting-data-when-using-ai', label: 'Keeping data safe when you use AI tools' },
    { href: '/guides/agent-permissions-and-approvals', label: 'What an AI tool may do, and what a person approves' },
    { href: '/guides/measuring-ai-roi', label: 'How to tell whether it pays back' },
    { href: '/roi-calculator', label: 'The payback calculator' },
  ],
  sources: ['icoAI', 'ncsc', 'openaiPrompt', 'anthropicPrompt'],
};

export function goalPrompt(goal) {
  if (goal.prompt) return goal.prompt;
  const thing = thingBy[goal.thing];
  if (!thing) throw new Error(`Goal ${goal.slug} is missing a prompt`);
  return thing.prompt;
}

export function goalGood(goal) {
  if (goal.good) return goal.good;
  const thing = thingBy[goal.thing];
  if (!thing) throw new Error(`Goal ${goal.slug} is missing a result description`);
  return thing.good;
}

export function requirePaths(sources) {
  const missing = [];
  for (const t of littleThings) for (const k of t.sources) if (!sources[k]) missing.push(`${t.slug}:${k}`);
  for (const g of goals) {
    for (const k of g.sources) if (!sources[k]) missing.push(`${g.slug}:${k}`);
    if (g.thing && !thingBy[g.thing]) missing.push(`${g.slug}:thing:${g.thing}`);
    for (const slug of g.also || []) if (!thingBy[slug]) missing.push(`${g.slug}:also:${slug}`);
  }
  for (const key of [startGuide.promptThing, atWorkGuide.promptThing]) if (!thingBy[key]) missing.push(`promptThing:${key}`);
  for (const k of [...startGuide.sources, ...atWorkGuide.sources]) if (!sources[k]) missing.push(`guide:${k}`);
  if (missing.length) throw new Error(`Path content has missing links: ${missing.join(', ')}`);
}
