// Job pages for people who search "AI for [my job]".
// Facts in `note` are only what we read on the linked pages on 1 Nov 2026.
// Wording is country-neutral: no named country, agency-as-law, currency or local slang.
// Prompts ask for simple language and must not give electrical, gas, medical or legal advice.

export const OCCUPATION_ADDED = '2026-11-01T18:00:00Z';

export const occupationSources = {
  iloConstruction: {
    title: 'ILO, Safety and health in construction (code of practice, revised edition 2022)',
    url: 'https://www.ilo.org/media/267361/download',
    kind: 'International labour standard',
  },
  iloConstructionPage: {
    title: 'ILO, Safety and Health in Construction',
    url: 'https://www.ilo.org/resource/safety-and-health-construction',
    kind: 'International labour body',
  },
  whoPlumbing: {
    title: 'WHO and World Plumbing Council, Health aspects of plumbing (2006)',
    url: 'https://iris.who.int/handle/10665/43423',
    kind: 'International health guidance',
  },
  wpcPublications: {
    title: 'World Plumbing Council, Publications (Health aspects of plumbing)',
    url: 'https://www.worldplumbing.org/publications/',
    kind: 'Trade association',
  },
  whoAiHealth: {
    title: 'WHO, "WHO calls for safe and ethical AI for health" (16 May 2023)',
    url: 'https://www.who.int/news/item/16-05-2023-who-calls-for-safe-and-ethical-ai-for-health',
    kind: 'International health body',
  },
  whoLmm: {
    title: 'WHO, Ethics and governance of artificial intelligence for health: guidance on large multi-modal models (2024)',
    url: 'https://www.who.int/publications/i/item/9789240084759',
    kind: 'International health guidance',
  },
  unescoGenAi: {
    title: 'UNESCO, Guidance for generative AI in education and research (2023)',
    url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research',
    kind: 'International education body',
  },
  codexHygiene: {
    title: 'FAO and WHO, Codex Alimentarius, General principles of food hygiene (CXC 1-1969, 2023)',
    url: 'https://openknowledge.fao.org/handle/20.500.14283/cc6125en',
    kind: 'International food standard',
  },
  iccCode: {
    title: 'International Chamber of Commerce, Advertising and Marketing Communications Code (2024)',
    url: 'https://iccwbo.org/business-solutions/the-icc-advertising-and-marketing-communications-code/',
    kind: 'International business code',
  },
};

const LEVELS = ['Novice', 'Intermediate', 'Professional'];

const tradeSafety = [
  'AI cannot replace local regulations or a qualified professional.',
  'Never rely on it for a wiring decision, or for a gas or plumbing safety decision. Follow the rules where you work.',
  'Use it for admin, quotes, customer messages, explaining a job to a customer, planning, and learning terms. Do not use it to certify work.',
];

export const occupations = [
  {
    slug: 'electrician',
    name: 'Electrician',
    title: 'AI for electricians',
    h1: 'AI for electricians',
    description: 'Where a chat tool can help an electrician with messages, quotes and planning, and why it must not make wiring or safety decisions.',
    card: 'Messages, quotes and a day plan. Not wiring, and not a sign-off.',
    keywords: ['electrician', 'electricians', 'electrical', 'wiring', 'wire'],
    lede: 'The useful part is the writing around the job. A customer message, a quote that uses figures you already worked out, a plan for the day, or a term you want in everyday words. The tool has not seen the installation.',
    safetyTitle: 'Safety, before any prompt',
    safety: tradeSafety,
    note: 'The International Labour Organization’s code of practice on safety and health in construction is not a law. It says the code is not a legally binding instrument, and that its provisions are not intended to replace national laws, regulations, or other standards already in use. On electrical installations, it says equipment should be constructed, installed and maintained by a competent person, in line with those laws, and used so as to guard against danger such as electric shock, fire and explosion. A chat tool is not that person. This page does not tell you how to wire anything.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'Deciding if a circuit, a cable, a protective device or a repair is safe.',
      'Certifying work, or telling a customer the job meets the local rules.',
      'Choosing how to isolate, test or energise anything.',
      'A price, a product or a method you did not already decide.',
    ],
    check: 'If the question is whether something is safe to touch, leave live, or sign off, stop and use a qualified person and the rules where you work. The links at the bottom are the sources for the note above, not a wiring guide.',
    tasks: [
      {
        slug: 'explain-the-job',
        level: 'Novice',
        title: 'Explain a finished job to the customer',
        why: 'Customers remember a short explanation. You already know what you did. The tool only turns your notes into a few plain sentences. It must not add a safety claim.',
        prompt: `Turn my notes into a short message for the customer. Use simple language an everyday person would understand.

Customer: [first name, or "the customer"]
What I actually did: """[your notes. No claim that anything is safe or compliant]"""
What I still need from them: [or "nothing"]

Write one short message.
Do not add work I did not list. Do not say the installation is safe, legal or certified.
Do not recommend a product, a cable or a method.
If a detail is missing, write [NOT STATED].`,
      },
      {
        slug: 'learn-a-term',
        level: 'Novice',
        title: 'Learn a term, then check it',
        why: 'A definition is a starting point when a word on a drawing or a form is new to you. It is not training, and it is not the rule book where you work.',
        prompt: `Explain a work term to me. Use simple language an everyday person would understand.

Term: [the word]
Where I saw it: [a sentence, or "I only have the word"]

1. A short meaning in everyday words.
2. One example of how an electrician might use the word in a sentence.
3. What this explanation might get wrong, and what I should check in my own training or the rules where I work.

Do not tell me how to wire, test or repair anything.
If the term is about safety, say that a qualified person and the local rules decide, and stop.`,
      },
      {
        slug: 'appointment-message',
        level: 'Intermediate',
        title: 'A message about an appointment',
        why: 'Running late, confirming a time, or asking someone to be home is ordinary admin. Write the facts yourself. The draft should not promise a repair.',
        prompt: `Draft a short message I can send. Use simple language an everyday person would understand.

Who: [customer first name, or "the customer"]
Purpose: [confirm / running late / please be home / ask for access]
Time I am offering: [time, or "I will fill this in"]
What I will and will not do on this visit: [your words]

Under 80 words. Do not invent a time, a price or a diagnosis of the fault.
Do not say I will make it safe. Do not give electrical advice.`,
      },
      {
        slug: 'day-plan',
        level: 'Intermediate',
        title: 'Order the jobs you already have',
        why: 'A list of visits is easier to face once it is in an order. You know which customer cannot move. The tool does not know the roads, and it must not tell you how to do the work.',
        prompt: `Order my working day. Use simple language an everyday person would understand. Do not tell me how to do any job.

Fixed times I cannot move: [or "none"]
How I travel: [van, public transport, or "not sure"]
Jobs, one per line:
"""
[area, and any time the customer asked for. Skip full street addresses if you prefer]
"""

Give me an order, one reason for that order, and a "might not fit" list.
Do not invent travel times. Write "check the journey" instead of a number of minutes.
Do not suggest how to wire, isolate or repair anything.`,
      },
      {
        slug: 'site-notes',
        level: 'Intermediate',
        title: 'Turn site notes into a job summary',
        why: 'Notes taken in a hurry are hard to read the next week. Sorting them is useful. Inventing a test result is not.',
        prompt: `Sort these site notes into a summary I can file. Use simple language an everyday person would understand. Only use what I wrote.

NOTES:
"""
[paste notes. Remove names and full addresses if this is not your work tool]
"""

Give me:
1. What the notes say was found.
2. What the notes say was done.
3. Parts or materials the notes name. If none, write "none named".
4. Open questions.
Do not add test results, cable sizes or a statement that the work is safe.
Mark any line that would be a guess with "not in the notes".`,
      },
      {
        slug: 'quote-email',
        level: 'Professional',
        title: 'A quote email from figures you calculated',
        why: 'The numbers have to be yours. A chat tool is good at laying them out so a customer can read them. It is bad at pricing a job it has not seen, and it will invent a figure if you let it.',
        prompt: `Write a quote email I can edit. Use simple language an everyday person would understand.

Who it is to: [first name, or "the customer"]
What they asked for, in my words: [the job. Do not describe it as safe or unsafe]
Figures I have already calculated: [labour, materials, and the total, or leave a blank I will fill]
Included: [list]
Not included: [list]
How long I will hold this price: [or "not stated"]

Use only the figures I wrote. If a figure is missing, write [NOT STATED]. Do not invent one.
Do not say the work will be safe, legal or certified.
Do not recommend a cable, a breaker, a method or a product.
End with a line that I will confirm the work on site before it is treated as final.`,
      },
      {
        slug: 'extra-work',
        level: 'Professional',
        title: 'A note when the job changed',
        why: 'Extra work causes arguments when it lives only in your head. A short note of what changed, in your words, is something you can send before you do it. The tool must not decide the change was necessary.',
        prompt: `Draft a note I can send before I do extra work. Use simple language an everyday person would understand.

Original job: [what was agreed]
What I found, in my words: [facts only]
Extra work I am proposing: [what you would do]
Extra cost I have already calculated: [a figure, or "I will fill this in"]
I need a yes before I start: [yes]

Do not say the extra work is required for safety. Do not invent a cost.
Do not give electrical advice or a method.
If I have not given a cost, write [PRICE NOT STATED] and do not guess.`,
      },
    ],
    sources: ['iloConstruction', 'iloConstructionPage'],
  },
  {
    slug: 'plumber',
    name: 'Plumber',
    title: 'AI for plumbers',
    h1: 'AI for plumbers',
    description: 'Where a chat tool can help a plumber with messages, quotes and planning, and why gas and plumbing safety stay with a qualified person.',
    card: 'Customer words and quotes you already priced. Not gas, and not a sign-off.',
    keywords: ['plumber', 'plumbers', 'plumbing', 'gas', 'pipe', 'pipes', 'drain', 'heating'],
    lede: 'Same idea as any trade that visits people at home. The chat tool can help you explain what you did, write a message, or set out a quote from numbers you calculated. It cannot see the pipes, and it must not decide what is safe.',
    safetyTitle: 'Safety, before any prompt',
    safety: tradeSafety,
    note: 'The World Health Organization and the World Plumbing Council published Health aspects of plumbing together. It says good plumbing design has to be based on the technical requirements and the regulatory restrictions that apply, and that plumbing carries microbiological, chemical and physical risks. The World Plumbing Council’s own page on that book makes the same point: safe design depends on those requirements and restrictions. A chat tool has not seen the job. Do not use it to decide whether water, waste or gas is safe.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'Any decision about gas, flues, combustion, or whether an appliance is safe to use.',
      'Whether drinking water, waste water or a drain is safe.',
      'Certifying work, or telling a customer it meets the local rules.',
      'A price or a repair method you did not already decide.',
    ],
    check: 'If the question is whether gas, water or waste is safe, stop. Use a qualified person and the rules where you work. This page will not tell you how to do the work.',
    tasks: [
      {
        slug: 'explain-the-job',
        level: 'Novice',
        title: 'Explain a finished job to the customer',
        why: 'People want to know what you did, in words they would use. Start from your notes. Do not let the draft add "this is safe now".',
        prompt: `Turn my notes into a short message for the customer. Use simple language an everyday person would understand.

Customer: [first name, or "the customer"]
What I actually did: """[your notes]"""
What I still need from them: [or "nothing"]

Write one short message.
Do not add work I did not list.
Do not say the water, waste, gas or appliance is safe, legal or certified.
Do not recommend a part or a method.
If a detail is missing, write [NOT STATED].`,
      },
      {
        slug: 'learn-a-term',
        level: 'Novice',
        title: 'Learn a term, then check it',
        why: 'Looking up a word on a fitting or a form is fine. Treating the answer as permission to do the work is not.',
        prompt: `Explain a work term to me. Use simple language an everyday person would understand.

Term: [the word]
Where I saw it: [a sentence, or "I only have the word"]

1. A short meaning in everyday words.
2. One example of how a plumber might use the word.
3. What this explanation might get wrong, and what I should check in my training or the rules where I work.

Do not tell me how to install, test or repair anything.
If the term is about gas, water safety or waste, say that a qualified person and the local rules decide, and stop.`,
      },
      {
        slug: 'questions-before-a-price',
        level: 'Intermediate',
        title: 'Questions to ask before you price a job',
        why: 'A price goes wrong when you never asked about access, the age of the fitting, or who else is involved. A list of questions is not a diagnosis.',
        prompt: `I am about to visit a job and I want questions to ask, not a diagnosis. Use simple language an everyday person would understand.

What the customer said: """[their words]"""
What I already know: [or "nothing yet"]

Give me up to eight questions I could ask on site.
Mark any question that is about safety with "ask, then decide yourself or with a qualified person".
Do not tell me the cause of the problem.
Do not tell me how to repair gas, water or waste.
Do not suggest a price.`,
      },
      {
        slug: 'appointment-message',
        level: 'Intermediate',
        title: 'A message about an appointment',
        why: 'A clear time, and what you need when you arrive, saves a wasted trip. Do not promise a fix in the same message.',
        prompt: `Draft a short message I can send. Use simple language an everyday person would understand.

Who: [customer first name, or "the customer"]
Purpose: [confirm / running late / please be home / ask them to clear access]
Time I am offering: [time, or "I will fill this in"]
What I need at the visit: [for example, the stop valve location, if you know it]

Under 80 words.
Do not invent a time or a price.
Do not say I will make it safe, and do not give plumbing or gas advice.`,
      },
      {
        slug: 'day-plan',
        level: 'Intermediate',
        title: 'Order the jobs you already have',
        why: 'You already know which job has a fixed time. The tool can only shuffle the list you give it. It should not guess how long a repair takes.',
        prompt: `Order my working day. Use simple language an everyday person would understand. Do not tell me how to do any job.

Fixed times I cannot move: [or "none"]
How I travel: [van, or "not sure"]
Jobs, one per line:
"""
[area, and any time the customer asked for. Skip full street addresses if you prefer]
"""

Give me an order, one reason for that order, and a "might not fit" list.
Do not invent travel times or repair times.
Do not suggest how to work on gas, water or waste.`,
      },
      {
        slug: 'quote-email',
        level: 'Professional',
        title: 'A quote email from figures you calculated',
        why: 'You priced it. The draft only makes the included and excluded work easy to read. If the tool adds a number, delete it.',
        prompt: `Write a quote email I can edit. Use simple language an everyday person would understand.

Who it is to: [first name, or "the customer"]
What they asked for, in my words: [the job]
Figures I have already calculated: [labour, materials, and the total, or a blank I will fill]
Included: [list]
Not included: [list]
How long I will hold this price: [or "not stated"]

Use only the figures I wrote. If a figure is missing, write [NOT STATED].
Do not say the work will be safe, legal or certified.
Do not recommend a part, a product or a method.
Do not give gas or plumbing advice.
End with a line that I will confirm the work on site before it is treated as final.`,
      },
      {
        slug: 'what-i-found',
        level: 'Professional',
        title: 'A file note of what you found',
        why: 'Future you, or the next person on the job, needs what you saw, not a story the tool prefers. If the notes do not say it, it stays out.',
        prompt: `Turn these notes into a file note. Use simple language an everyday person would understand. Only use what I wrote.

NOTES:
"""
[what you saw and what you did. Remove the customer's full name and address if you need to]
"""

Produce:
1. What was seen.
2. What was done.
3. What was left undone, and why, if the notes say why.
4. Anything a reader might mistake for a safety approval. List it under "Do not file this as a sign-off".
Do not add causes, test results or a statement that gas, water or waste is safe.`,
      },
    ],
    sources: ['whoPlumbing', 'wpcPublications'],
  },
  {
    slug: 'teacher',
    name: 'Teacher',
    title: 'AI for teachers',
    h1: 'AI for teachers',
    description: 'Prompts for teachers: explanations, parent messages, quizzes and lesson ideas you still check. Not for grades, a learner’s safety, or medical decisions.',
    card: 'Explanations, messages and quizzes you still check yourself.',
    keywords: ['teacher', 'teachers', 'teaching', 'school', 'classroom', 'lesson', 'tutor'],
    lede: 'A chat tool can draft an explanation, a note to a parent, or a few questions from a text you already trust. You still decide what is accurate, what your school allows, and what a learner actually needs.',
    safety: null,
    note: 'UNESCO’s guidance on generative AI in education says these tools can help teachers produce text, and that the result is not automatically right. It says teachers and learners should not take the output at face value, because the tool can be wrong. It also says the tool, on its own, is unlikely to solve the hard problems in education, and that people still do that work. Check what you might teach or send. Follow what your school allows, including what you may paste about a learner.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'A grade, a score, or a decision about a qualification.',
      'A decision about a learner’s safety or welfare.',
      'A medical, psychological or learning-needs diagnosis.',
      'What the curriculum or the law requires, unless you are checking the tool against the official document yourself.',
      'A learner’s name, contact details, or private records, unless the tool is the one your school has approved for that.',
    ],
    check: 'If a draft would go to a parent, a learner or a file, read every fact against your own notes. If the topic is a child’s safety or health, do not use the chat tool as the decision.',
    tasks: [
      {
        slug: 'simpler-explanation',
        level: 'Novice',
        title: 'A simpler explanation of something you teach',
        why: 'You already know the idea. The draft is a plainer version for a given age. You put back any step it dropped, and you take out anything you would not say in the room.',
        prompt: `Rewrite my explanation so a learner can follow it. Use simple language an everyday person would understand.

Age or stage: [for example, about 11 years old]
My explanation:
"""
[paste what you would have said]
"""

Keep my meaning. Short sentences.
Do not add facts, dates, names or examples that are not in my text.
At the end, list anything you were tempted to add, under "I left this out".
Do not set a grade. Do not give medical, psychological or legal advice.`,
      },
      {
        slug: 'parent-message',
        level: 'Novice',
        title: 'A message to a parent or carer',
        why: 'The hard part is tone. You bring the facts, including what you are actually asking them to do. The draft should not invent a concern.',
        prompt: `Draft a message to a parent or carer. Use simple language an everyday person would understand.

About: [a trip, homework, a class event, or a piece of work. No diagnosis]
Facts I am willing to say: """[your facts. Do not paste a full name if you do not need to]"""
What I need from them: [or "just for information"]
Tone: calm and respectful

Under 150 words.
Do not add worries, claims about how they behaved, or test scores I did not write.
Do not give medical or legal advice, and do not advise on a learner's safety.
If a fact is missing, write [NOT STATED].`,
      },
      {
        slug: 'lesson-ideas',
        level: 'Intermediate',
        title: 'Starter ideas for a topic you already teach',
        why: 'A few ways into a topic can unstick planning. They are ideas, not a scheme of work, and they are useless if they ignore what you are supposed to teach.',
        prompt: `Suggest four short starter activities for a lesson I already teach. Use simple language an everyday person would understand.

Topic: [topic]
Age or stage: [stage]
Time for the starter: [minutes]
What learners already know: [or "not sure"]
What they must not need: [equipment you do not have, or "nothing special"]

For each idea: what learners do, what I do, and what could go wrong.
Label every idea as "check this against what I am supposed to teach".
Do not write a full lesson.
Do not claim this matches a named curriculum.
Do not include a test score or a medical suggestion.`,
      },
      {
        slug: 'quiz-from-my-text',
        level: 'Intermediate',
        title: 'Questions from a text you provide',
        why: 'Questions are only as good as the text you paste. Ask for an answer key you can check with the book closed, then open the book.',
        prompt: `Write six questions from the text below, and an answer for each. Use simple language an everyday person would understand.

Who it is for: [age or stage]
TEXT:
"""
[paste a passage you are allowed to use. A short extract, not a whole book]
"""

Mix: three short-answer questions and three that have one clearly correct answer.
The answer must be supported by the text. Quote the few words you used.
If the text does not support a question, do not write it.
Do not add facts from outside the text.
Do not grade anyone.`,
      },
      {
        slug: 'feedback-lines',
        level: 'Intermediate',
        title: 'Feedback lines from your own notes',
        why: 'You saw the work. A chat tool can turn "messy ending, good example in paragraph two" into a sentence a learner can use. It must not invent a mark.',
        prompt: `Turn my notes into feedback a learner can read. Use simple language an everyday person would understand.

What the task was: [one line]
What I noticed: """[your notes. No full name if you can avoid it]"""
One thing I want them to try next: [or "not decided"]

Write five sentences I could edit.
Do not give a grade, a score or a rank.
Do not add praise or criticism I did not hint at.
Do not mention health, how they behave, or home life.
End with the one next step, or "next step not stated" if I did not give one.`,
      },
      {
        slug: 'shorter-worksheet',
        level: 'Professional',
        title: 'A shorter version of a worksheet you wrote',
        why: 'Shortening your own sheet is a real job. You know which question carries the point. The tool does not, unless you say so. You check the short version still asks that question.',
        prompt: `Make a shorter version of my worksheet. Use simple language an everyday person would understand.

Who the shorter version is for: [for example, a learner who needs fewer questions, not a diagnosis]
The question they must still answer: [the one that matters]
WORKSHEET:
"""
[paste the sheet you wrote]
"""

Keep my facts. Cut repetition. Aim for about half the length.
Do not add new topics.
Do not say this is suitable for a medical or learning diagnosis.
At the end, list what you cut, so I can put back anything that mattered.`,
      },
      {
        slug: 'meeting-actions',
        level: 'Intermediate',
        title: 'Actions from a staff meeting note',
        why: 'A meeting note fails when nobody can see who does what. If the note never named an owner, the draft should leave the cell blank.',
        prompt: `Sort these meeting notes. Use simple language an everyday person would understand. Only use what is written.

NOTES:
"""
[paste notes. Remove anything about a learner that you should not put in a chat tool]
"""

Produce:
1. Decisions the notes say were agreed.
2. A table: task, owner, when. If the notes do not say, write "not named".
3. Open questions.
Do not add tasks. Do not give legal or medical advice, and do not advise on a learner's safety.`,
      },
    ],
    sources: ['unescoGenAi'],
  },
  {
    slug: 'nurse',
    name: 'Nurse and healthcare worker',
    title: 'AI for nurses and healthcare workers',
    h1: 'AI for nurses and healthcare workers',
    description: 'Prompts for nurses and healthcare workers to tidy notes and messages. Not for diagnosis, medicines or decisions about care.',
    card: 'Wording for notes and messages. Care decisions stay with you.',
    keywords: ['nurse', 'nurses', 'nursing', 'healthcare', 'health care', 'healthcare worker', 'hospital', 'clinic', 'carer', 'caregiver'],
    lede: 'The chat tool can help with words: a shorter leaflet you already use, a handover laid out from notes you wrote, a message about a shift. It must not decide care, and it must not see a patient’s record unless your workplace has approved that tool for that use.',
    safetyTitle: 'Not for care decisions',
    safety: [
      'Do not use a chat tool to diagnose, prescribe, triage, or decide whether someone is safe to go home.',
      'Do not paste names, record numbers, or health details into a tool your workplace has not approved.',
      'A fluent answer can still be wrong. You remain the person who checks it.',
    ],
    note: 'In May 2023 the World Health Organization called for caution with large language model tools in health. It said the replies can look authoritative and still be completely wrong, especially on health, and that these tools may not protect health information a person pastes in. It said rushing to use an untested system could lead health workers into errors that harm patients. WHO’s later guidance on these models says humans should remain in control of medical decisions. Use the prompts below for wording and admin only.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'Diagnosis, medicines, doses, or a change to a care plan.',
      'Triage, or any decision about how urgent something is.',
      'Observations, symptoms or results you did not write down yourself.',
      'A message to a patient or a family that adds advice you did not decide.',
      'Anything your workplace classes as a health record, unless you are in the approved tool.',
    ],
    check: 'If you would not say it without a clinician checking, do not let the draft say it. This page is not medical advice.',
    tasks: [
      {
        slug: 'shorter-leaflet',
        level: 'Novice',
        title: 'A shorter version of a leaflet you already use',
        why: 'Patients often get a leaflet written for the service, not for a tired reader. Shortening a text your workplace already approved is different from inventing new advice.',
        prompt: `Shorten this leaflet. Use simple language an everyday person would understand. This is not medical advice, and you must not add any.

LEAFLET:
"""
[paste a leaflet your workplace already uses. Remove names and record numbers]
"""

Keep every instruction that is in the leaflet. If you are unsure an instruction matters, keep it and mark it "check with me".
Do not add medicines, doses, symptoms or what the person should do.
Do not say this replaces the clinician.
At the end, list anything you cut.`,
      },
      {
        slug: 'policy-in-everyday-words',
        level: 'Novice',
        title: 'A workplace policy in everyday words',
        why: 'A policy is easier to follow when you can say it back. The summary is for you. It is not a new rule, and it is not clinical guidance.',
        prompt: `Explain this workplace policy in everyday words. Use simple language an everyday person would understand.

POLICY:
"""
[paste the section you are allowed to use]
"""

1. What it is asking staff to do, in three sentences.
2. Any deadline, form or person it names. Quote the short phrase.
3. Words I should ask a manager about.
Do not turn this into medical advice.
Do not add steps that are not in the policy.
If the policy does not say something, write "not stated".`,
      },
      {
        slug: 'handover-from-notes',
        level: 'Intermediate',
        title: 'A handover from notes you wrote',
        why: 'A handover is a list of what you already know, in an order the next person can scan. If you did not record an observation, it must not appear.',
        prompt: `Lay out a handover from my notes. Use simple language an everyday person would understand. Only use what I wrote. This is not medical advice.

MY NOTES:
"""
[notes you wrote. Use a room or a first name only if your workplace allows this tool to see it. Otherwise say "Patient A"]
"""

For each person: what I said is outstanding, and what I said the next person should know.
Do not add observations, medicines, doses, risks or a plan I did not write.
If a line would sound like a new clinical decision, put it under "I did not write this. Do not hand it over."`,
      },
      {
        slug: 'shift-message',
        level: 'Intermediate',
        title: 'A message about a shift or training',
        why: 'Swapping a shift or confirming training is admin. Keep clinical detail out of it.',
        prompt: `Draft a short message to a colleague. Use simple language an everyday person would understand.

About: [shift swap, training time, or who covers a break]
Facts: [dates and times I am willing to state]
What I am asking: [one sentence]

Under 100 words.
Do not mention a patient, a diagnosis or a medicine.
Do not invent a time.
If I left a blank, write [NOT STATED].`,
      },
      {
        slug: 'questions-before-training',
        level: 'Intermediate',
        title: 'Questions before a training session',
        why: 'Walking into training with three questions is more useful than a summary of a topic the tool may get wrong. You are not asking it to teach you the clinical skill.',
        prompt: `Help me prepare questions for a training session. Use simple language an everyday person would understand. Do not teach me the clinical skill.

Session title: [title]
What I already do in that part of the job: [one or two lines]
What I want to be able to do afterwards: [one line]

Give me six questions I could ask the trainer.
Do not answer them with clinical instructions.
Do not give doses, procedures or a diagnosis.
Say which questions I should only ask the trainer, not a chat tool.`,
      },
      {
        slug: 'family-update',
        level: 'Professional',
        title: 'Wording for an update you are allowed to give',
        why: 'Families want plain words. You decide the facts, and you decide you are allowed to share them. The draft must not add a prognosis or a next step you did not choose.',
        prompt: `Help me word an update I am allowed to give. Use simple language an everyday person would understand. This is not medical advice.

Who I am speaking to: [family member, without a full name]
Facts I have decided to share: """[only those facts]"""
What I will not say: [or "nothing extra"]
What I want them to do: [or "no action"]

Write one short update.
Do not add symptoms, medicines, chances, or what will happen next.
Do not tell them the person is safe, improving, or ready to leave.
If I did not provide a fact, do not invent it. Write [NOT STATED].`,
      },
    ],
    sources: ['whoAiHealth', 'whoLmm'],
  },
  {
    slug: 'salesperson',
    name: 'Salesperson',
    title: 'AI for salespeople',
    h1: 'AI for salespeople',
    description: 'Prompts for salespeople to draft follow-ups and meeting questions from notes you already have. No invented prices or product claims.',
    card: 'Follow-ups and questions from the conversation you actually had.',
    keywords: ['salesperson', 'salespeople', 'sales', 'selling', 'account executive', 'sales rep'],
    lede: 'After a call, the useful draft is a follow-up that matches what was said, or a list of questions you still need to ask. It is not a new price, a new promise, or a feature the product does not have.',
    safety: null,
    note: 'The International Chamber of Commerce’s Advertising and Marketing Communications Code is a self-regulatory standard used as a base in many countries. It is not itself the law where you work. It says marketing should be legal, decent, honest and truthful. The 2024 edition covers advertising, digital messages, sales promotion and social media, and it covers AI. A claim should not mislead, including by leaving something out or by exaggerating, and a picture that misleads because it was altered or generated should not be used. Your own rules may be stricter. Check a price, a comparison and a photo before you send them.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'A price, a discount, a delivery date or a contract term you have not already agreed.',
      'A product fact, a comparison or a result you cannot point to in your own material.',
      'Legal, medical or financial advice to the buyer.',
      'A photo or a mock-up that makes the product look like something it is not.',
    ],
    check: 'Read the draft against your notes and your product sheet. If a sentence would be awkward to defend, take it out.',
    tasks: [
      {
        slug: 'follow-up',
        level: 'Novice',
        title: 'A follow-up from the call you had',
        why: 'The follow-up should sound like the conversation, not like a brochure. Paste what you remember. Take out anything the draft added.',
        prompt: `Draft a follow-up email I can edit. Use simple language an everyday person would understand.

Who they are: [role, not a full personal history]
What they said they need: """[your notes]"""
What I offered: [only what you actually offered]
What I will do next: [or "wait for them"]
What I will not promise: [or "nothing extra"]

Under 150 words.
Do not invent a price, a discount, a date or a product feature.
Do not claim a result.
If my notes are missing a fact, write [NOT STATED].`,
      },
      {
        slug: 'questions-before-a-meeting',
        level: 'Intermediate',
        title: 'Questions before the next meeting',
        why: 'You already know the gaps. A short list stops the meeting wandering. It is a cue card, not a script.',
        prompt: `Make a cue card for a sales meeting. Use simple language an everyday person would understand. Do not write a script.

What I know so far: """[notes from the last conversation]"""
What I still need to learn: [or "not sure"]
What I am not allowed to promise: [price, dates, or "I will decide that"]

Give me:
1. The aim of the meeting, in one line, so I can check you understood.
2. Up to six questions, in the order I should ask them.
3. Three facts I should have in front of me.
Do not invent facts about the buyer or the product.
Do not suggest a price.`,
      },
      {
        slug: 'product-sheet',
        level: 'Intermediate',
        title: 'A short version of a product sheet you paste',
        why: 'Buyers do not read the long sheet. A short version is safe only when every line is in the sheet. If it is not, it does not go in.',
        prompt: `Summarise this product sheet for a buyer. Use simple language an everyday person would understand.

Who the buyer is: [their situation, in one line]
SHEET:
"""
[paste the sheet you are allowed to share]
"""

Five bullets a buyer could use.
Every bullet must come from the sheet. After each bullet, quote the few words you used.
Do not add a benefit, a number or a comparison that is not in the sheet.
Do not set a price.
If the sheet is silent on something a buyer would ask, list it under "Not in the sheet".`,
      },
      {
        slug: 'proposal-draft',
        level: 'Professional',
        title: 'A proposal from an offer you already decided',
        why: 'You chose the scope and the price. The draft puts them in an order. It must not "improve" the offer by adding a discount or a feature.',
        prompt: `Draft a one-page proposal I can edit. Use simple language an everyday person would understand.

Buyer: [company or role]
Problem they described: """[their words]"""
What I will do: [your scope]
What I will not do: [your exclusions]
Price I have already set: [the figure, or "I will type the number myself"]
How long the price stands: [or "not stated"]

Use only what I wrote.
Do not invent a price, a saving, a timeline or a result.
Do not give legal or financial advice.
Mark any gap as [I NEED TO CONFIRM].`,
      },
      {
        slug: 'practice-a-hard-question',
        level: 'Intermediate',
        title: 'Rehearse a hard question',
        why: 'Saying an answer out loud once is useful. The answer is practice. You do not read it to the buyer, and you do not let it invent a fact.',
        prompt: `Help me rehearse an answer. Use simple language an everyday person would understand. This is practice, not a script to read out.

The question I dread: [the question]
What is true: [facts you can stand behind]
What I must not claim: [or "no extra claims"]

Give me two short answers:
1. A direct one.
2. A version that asks a question back.
Then list any phrase that would be a claim I did not give you.
Do not invent product facts, prices or results.`,
      },
      {
        slug: 'colleague-recap',
        level: 'Novice',
        title: 'A recap a colleague can read',
        why: 'Someone else may pick up the buyer. They need what was said, not a hopeful version. Leave blanks where your note was blank.',
        prompt: `Write a recap for a colleague. Use simple language an everyday person would understand.

NOTES:
"""
[what happened. Remove personal phone numbers]
"""

Include: what the buyer wants, what I promised, what I did not promise, and the next step.
If the notes do not say it, write "not stated".
Do not add a chance of winning the work, a price or a product claim.
Do not give legal advice.`,
      },
    ],
    sources: ['iccCode'],
  },
  {
    slug: 'retail-worker',
    name: 'Retail worker',
    title: 'AI for retail workers',
    h1: 'AI for retail workers',
    description: 'Prompts for retail workers: product words from the label, customer replies and shift notes. No invented prices, stock or legal rights.',
    card: 'Label facts, customer replies and a note for the next shift.',
    keywords: ['retail', 'retail worker', 'shop', 'store', 'cashier', 'sales floor', 'shop assistant', 'store associate'],
    lede: 'On a shop floor the useful drafts are small. A product description that sticks to the label, a reply that uses the hours you typed, a note for the person on the next shift. The tool does not know your stock, your prices, or the customer’s rights where you work.',
    safety: null,
    note: 'The International Chamber of Commerce’s Advertising and Marketing Communications Code says marketing should be legal, decent, honest and truthful. It is a self-regulatory code used in many countries, not a substitute for the rules where you work. The 2024 edition covers AI. A claim should not mislead by leaving something out or by exaggerating, and that includes price, what a product is made of, and the terms for return or repair. If you did not read it on the label or in your shop’s own note, do not let a draft say it.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'A price, a discount, or whether something is in stock.',
      'Ingredients, allergens or health claims that are not on the label in front of you.',
      'What a customer is entitled to under the law where you work.',
      'A promise your manager has not agreed.',
    ],
    check: 'If a customer might act on it, read it against the label or the shop’s own note. This page is not legal advice.',
    tasks: [
      {
        slug: 'from-the-label',
        level: 'Novice',
        title: 'Product words from the label',
        why: 'A description helps when it says what the packet says, in a readable order. The moment it adds a benefit, it is a claim you may not be able to stand behind.',
        prompt: `Write a short product description from the label facts below. Use simple language an everyday person would understand.

Where it will be read: [shelf label, website, or a reply to a customer]
FACTS FROM THE LABEL:
"""
[type only what you can see on the packet or the tag]
"""

Four sentences at most.
Do not add a benefit, a price, a comparison or a health claim.
Do not say it is suitable for a diet or an allergy.
If a fact a shopper would expect is missing, list it under "Not on the label".`,
      },
      {
        slug: 'hours-reply',
        level: 'Novice',
        title: 'A reply about hours or where to find something',
        why: 'People ask the same three things. You know the answer. The draft should use your answer, not a guessed one.',
        prompt: `Draft a reply to a customer. Use simple language an everyday person would understand.

Their question: """[paste it, without their phone number]"""
The correct hours: [or "we have not set this"]
Where the item is: [or "I do not know"]
Anything we are out of: [or "not sure"]

Under 80 words.
Do not invent hours, stock or a price.
Do not tell them they have a legal right to anything.
If I did not give a fact, write [NOT STATED] in the draft so I can see the hole.`,
      },
      {
        slug: 'returns-note',
        level: 'Intermediate',
        title: 'Explain the returns note your shop already uses',
        why: 'Customers glaze over at a returns note. A plainer version is fine if it does not add a right. You check it against the note before you send it.',
        prompt: `Explain our returns note in everyday words. Use simple language an everyday person would understand. Do not add rights.

NOTE:
"""
[paste the note your shop uses]
"""

1. What the customer can do, according to the note.
2. Any deadline or condition. Quote the short phrase.
3. What the note does not say.
Do not say what the law requires.
Do not promise a refund, a repair or a replacement unless the note says it.
If the note is silent, write "not stated".`,
      },
      {
        slug: 'shift-note',
        level: 'Intermediate',
        title: 'A note for the next shift',
        why: 'The next person needs what changed: a delivery, a spill, a product in the wrong place. They do not need a story.',
        prompt: `Turn my notes into a handover for the next shift. Use simple language an everyday person would understand.

NOTES:
"""
[what happened. No customer account numbers]
"""

Give me three short sections: done, still open, watch out for.
Only use what I wrote.
Do not invent stock counts or prices.
Do not include a customer's full name or payment details.
If something looks like gossip rather than a fact the next person needs, put it under "Leave this out".`,
      },
      {
        slug: 'show-a-new-starter',
        level: 'Novice',
        title: 'A checklist for a task you already do',
        why: 'Showing a new starter is easier with the steps written down. You know the task. The tool just lists the steps you describe, so you can correct them.',
        prompt: `Turn my description into a checklist for a new starter. Use simple language an everyday person would understand.

The task: [for example, opening the register, or straightening a shelf]
How I do it:
"""
[your steps, even if they are messy]
"""
What they must ask a manager about: [or "I will add this"]

A checklist of short lines.
Do not add steps I did not mention.
Do not include passwords, alarm codes or payment steps that show card numbers.
Mark any step you are unsure about with "check with me".`,
      },
      {
        slug: 'busy-day-brief',
        level: 'Professional',
        title: 'A briefing for a busy day',
        why: 'You know what matters on a busy day: who is on, what arrived, what to say if you run out. A one-page brief is for the team. The facts have to be yours.',
        prompt: `Draft a one-page briefing for the team. Use simple language an everyday person would understand.

Day: [which day]
Who is in, if I want it included: [or "leave names out"]
Deliveries or changes: """[your notes]"""
What to say if we sell out of something: [your words, or "ask a manager"]
What not to promise: [or "no extra promises"]

Use only my notes.
Do not invent prices, stock or a promotion.
Do not tell the team what the law says about refunds.
Keep it to one page.`,
      },
    ],
    sources: ['iccCode'],
  },
  {
    slug: 'hospitality-manager',
    name: 'Restaurant and hospitality manager',
    title: 'AI for restaurant and hospitality managers',
    h1: 'AI for restaurant and hospitality managers',
    description: 'Prompts for restaurant and hospitality managers: guest messages, shift briefings and menu words. Not for food safety or allergen decisions.',
    card: 'Guest messages, a shift brief, and menu words from the dish you cook.',
    keywords: ['restaurant', 'hospitality', 'hotel', 'cafe', 'café', 'manager', 'kitchen', 'front of house', 'guest'],
    lede: 'Guests and teams both need short, true messages. A reply to a review, a briefing for one shift, a description of a dish you already cook. Food safety, allergens and permits are not drafting jobs. You keep those.',
    safetyTitle: 'Food safety stays with you',
    safety: [
      'Do not ask a chat tool whether food is safe, how long to keep it, or what temperature to use.',
      'Do not let it invent an allergen list. Allergens of concern are not the same everywhere.',
      'A menu description is advertising. If you did not cook it that way, do not say it.',
    ],
    note: 'The Codex Alimentarius General Principles of Food Hygiene, from the UN Food and Agriculture Organization and the World Health Organization, say a food business is responsible for safe food. They point to five keys: keep clean, separate raw and cooked, cook thoroughly, keep food at safe temperatures, and use safe water and raw materials. They also say people who handle food need the knowledge and skill to do it safely, and that customers need clear information so they can identify allergens. The list of allergens that matter is not the same in every place. A chat tool must not make those decisions.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'Whether food is safe to serve, store or reheat.',
      'An allergen list, a "free from" claim, or a promise that a dish is safe for someone.',
      'Hygiene temperatures, cleaning chemicals, or what to do after a complaint about illness.',
      'Permits, staffing rules, or pay rules.',
      'A photo of a dish that is not the dish you serve.',
    ],
    check: 'If a guest could get ill from a wrong sentence, do not use the draft. Check allergens and safety with your own process and the rules where you work. This page is not food safety advice.',
    tasks: [
      {
        slug: 'review-reply',
        level: 'Novice',
        title: 'A reply to a review',
        why: 'A review reply is public. It should mention what the guest mentioned, thank them or apologise for the specific thing, and not invent a policy.',
        prompt: `Draft a public reply to this review. Use simple language an everyday person would understand.

THE REVIEW:
"""
[paste it]
"""
What actually happened, if I know: [or "I was not there"]
What I am willing to offer: [or "no offer"]
What I will not say: [or "nothing extra"]

Under 90 words. Calm, not defensive.
Do not invent a cause, a refund or a free meal.
Do not say the food was safe.
Do not ask them to post health details in public.
If I do not know what happened, say we will look into the visit, and do not guess.`,
      },
      {
        slug: 'booking-change',
        level: 'Novice',
        title: 'A message when a booking changes',
        why: 'Time, party size, and what you need from them. That is the whole message. Do not let it add a menu promise.',
        prompt: `Draft a message to a guest. Use simple language an everyday person would understand.

What changed: [time, party size, or a table we cannot do]
New details I have decided: [the facts]
What I need them to confirm: [or "nothing"]

Under 80 words.
Do not invent a time or a price.
Do not describe dishes or allergens.
Do not promise a particular table unless I wrote it.`,
      },
      {
        slug: 'shift-brief',
        level: 'Intermediate',
        title: 'A briefing for one shift',
        why: 'A shift brief is who is in, what you cannot serve, and what to say. You know those things this morning. The tool only lines them up.',
        prompt: `Draft a shift briefing. Use simple language an everyday person would understand.

Meal or shift: [which one]
Who is in: [or "I will fill names in"]
Items we cannot serve: [or "none"]
What I want the team to say if asked: [your words]
Anything else true today: """[notes]"""

Short lines the team can read in two minutes.
Do not invent dishes, prices or stock.
Do not give food safety instructions or temperatures.
Do not add an allergen claim.
If I did not state a fact, write [NOT STATED].`,
      },
      {
        slug: 'event-enquiry',
        level: 'Intermediate',
        title: 'Questions back to an event enquiry',
        why: 'A messy enquiry is not a booking. The useful reply asks for the date, the number of people, the budget they have in mind, and what they want to eat, and it does not quote a package you have not priced.',
        prompt: `Turn this enquiry into a reply that asks the missing questions. Use simple language an everyday person would understand. Do not quote a price.

ENQUIRY:
"""
[paste it. Remove phone numbers if you want]
"""
What I already know we can do: [or "not checked yet"]
What we cannot do: [or "not sure"]

1. A short reply that thanks them and asks only the questions I still need.
2. A list of those questions.
Do not invent a price, a menu or a date we are free.
Do not make an allergen or food safety claim.
Do not promise we can host them.`,
      },
      {
        slug: 'menu-words',
        level: 'Professional',
        title: 'Menu words for a dish you already cook',
        why: 'Menu words are a claim about what is on the plate. You list the ingredients. The tool may make them readable. It may not add "seasonal", "local" or "free from" unless you wrote it.',
        prompt: `Write a menu description for a dish I already cook. Use simple language an everyday person would understand.

Dish name: [name]
What is in it, as I serve it: [ingredients you actually use]
How it is cooked, in my words: [or "not needed"]
Words I refuse: [for example, I will not say "homemade" unless it is]
Allergens I have already identified: [or "I am not asking you to list allergens"]

Two sentences, plus the ingredient list I gave you.
Do not add ingredients.
Do not add "free from", "healthy", "safe" or a place of origin unless I wrote it.
Do not invent an allergen list. If I did not list allergens, write "Allergens: not provided. Do not guess."`,
      },
      {
        slug: 'week-from-bookings',
        level: 'Intermediate',
        title: 'A week outline from bookings you paste',
        why: 'A week looks calmer as a list: which service is full, which one is quiet, what is already promised. You still move the staff. The tool must not invent party sizes.',
        prompt: `Turn this booking list into a week outline for me. Use simple language an everyday person would understand.

LIST:
"""
[day, service, and party size if you have it. Messy is fine]
"""
Events already promised: [or "none"]
Days I already know are short of people: [or "not sure"]

For each day: what is already booked, and what I should decide.
Do not invent party sizes or free tables.
Do not produce a staff schedule as if it were agreed.
Do not give advice on pay, permits or food safety.`,
      },
      {
        slug: 'new-server',
        level: 'Intermediate',
        title: 'Steps for a new server, from steps you write',
        why: 'A new person needs the order of service you actually use. Describe it in your own messy way. Correct the checklist before you hand it over.',
        prompt: `Turn my description into a checklist for someone new on the floor. Use simple language an everyday person would understand.

What they are learning: [for example, greeting, taking a table, closing]
How we do it:
"""
[your steps]
"""
What they must ask a manager before doing: [or "I will add this"]

Short lines, in order.
Do not add steps I did not describe.
Do not include card numbers, register codes or safe codes.
Do not add food safety rules or allergen advice.
Mark anything unclear with "check with me".`,
      },
    ],
    sources: ['codexHygiene', 'iccCode'],
  },
  {
    slug: 'property-agent',
    name: 'Property and estate agent',
    title: 'AI for property and estate agents',
    h1: 'AI for property and estate agents',
    description: 'Prompts for property agents and estate agents: listing words from facts you supply, viewing follow-ups and questions. Not legal or valuation advice.',
    card: 'Listing words and viewing notes from facts you already have.',
    keywords: ['property', 'estate agent', 'real estate', 'realtor', 'letting', 'rental', 'housing', 'broker'],
    lede: 'People search for this job under more than one name: property agent, estate agent, real estate agent. The work here is the same. Describe a place from facts you measured or were given. Follow up after a viewing. Do not let a draft become legal advice, a valuation, or a claim about schools, crime or who the home is for.',
    safety: null,
    note: 'The International Chamber of Commerce’s Advertising and Marketing Communications Code says marketing should be legal, decent, honest and truthful. It is widely used as a self-regulatory base, and it is not a substitute for the rules where you work. The 2024 edition covers AI. A claim should not mislead, including by omission or exaggeration, and a picture that misleads because it was altered or generated should not be used. A listing is marketing. Room sizes, the condition, and who a home is said to suit are claims. If you did not check them, leave them out.',
    limitsTitle: 'What not to use AI for',
    limits: [
      'Legal advice, including what you must disclose, and what a contract means.',
      'A valuation, a recommended offer, or whether a client should accept.',
      'Who you may sell or rent to. Do not let a draft describe an ideal buyer or tenant in a way that excludes people.',
      'Client money, deposits, or identity documents.',
      'A photo that makes the place look larger, newer or different from the visit.',
    ],
    check: 'Read every figure and every claim against your notes before you publish. If a sentence is legal advice or a value, take it out and ask a qualified person. This page is not legal or valuation advice.',
    tasks: [
      {
        slug: 'listing-from-facts',
        level: 'Novice',
        title: 'A listing from facts you supply',
        why: 'The listing should sound like the visit, not like every other listing. You type the facts. The draft is not allowed to fill gaps with a sunny guess.',
        prompt: `Write a property listing I can edit. Use simple language an everyday person would understand.

FACTS I CHECKED:
"""
[type of home, rooms you are willing to name, condition in your words, anything the owner asked you to include that you have checked]
"""
I have not checked: [or "nothing else"]
Words I will not use: [or "no extra adjectives"]

Two short paragraphs.
Do not invent a size, a year, a view, a school, a transport time or a price.
Do not say who the home is suitable for.
Do not say it is quiet, safe, or a bargain unless I wrote that and I can stand behind it.
If a usual fact is missing, list it under "Not provided. Do not guess."`,
      },
      {
        slug: 'questions-before-a-viewing',
        level: 'Intermediate',
        title: 'Questions before a viewing',
        why: 'A viewing goes better when you know what the person wants and what you still need to confirm about the place. The list is questions, not advice on whether they should buy or rent.',
        prompt: `Give me questions for a viewing. Use simple language an everyday person would understand.

The place, in facts I have: [a few lines]
What the person said they want: [or "they have not said"]
What I still need to confirm about the place: [or "not sure"]

1. Up to five questions to ask the person.
2. Up to five things I should confirm about the place before I describe it.
Do not tell me whether they should take it.
Do not suggest a price.
Do not give legal advice.
Do not describe an ideal buyer or tenant.`,
      },
      {
        slug: 'after-a-viewing',
        level: 'Intermediate',
        title: 'A follow-up after a viewing',
        why: 'People forget which place was which. A follow-up that repeats what they liked, in their words, is enough. Do not push an offer they did not ask for.',
        prompt: `Draft a follow-up after a viewing. Use simple language an everyday person would understand.

Which place: [a short name, not a full private address if you can avoid it]
What they said: """[your notes]"""
What I said I would do: [or "nothing yet"]
What I will not do: [or "I will not chase"]

Under 120 words.
Do not invent their opinion.
Do not suggest an offer, a price or that they should decide quickly.
Do not give legal advice.
If a next step was not agreed, write "Next step: not agreed".`,
      },
      {
        slug: 'steps-in-general',
        level: 'Novice',
        title: 'The usual steps, with the local bits left blank',
        why: 'Someone new to buying or renting often wants the shape of the process. You can ask for a general outline. You cannot ask the tool to say what the law is where you are.',
        prompt: `Explain the usual steps in a home sale or a rental, in general terms. Use simple language an everyday person would understand. This is not legal advice.

Which one: [sale or rental]
Who I am explaining it to: [a first-time buyer, a landlord, or a tenant]
What I already know is true where I work: [or "nothing I want to rely on"]

Give me a short sequence of steps.
Mark every step that depends on local rules with "check locally".
Do not name a country.
Do not say what must be disclosed, what a deposit must be, or how long anything takes.
Do not tell the reader what to sign.`,
      },
      {
        slug: 'wish-list',
        level: 'Intermediate',
        title: 'A wish list from what the person said',
        why: 'A messy conversation becomes a list you can search against. Must-haves and nice-to-haves get separated. You do not add a requirement they never mentioned.',
        prompt: `Turn these notes into a wish list. Use simple language an everyday person would understand.

NOTES:
"""
[what they said. No full name or financial account numbers]
"""

Two lists: must-have, and nice-to-have.
Only use what they said. If it is unclear which list, put it under "ask them".
Do not add requirements.
Do not comment on what they can afford.
Do not describe them, or who else should live there.`,
      },
      {
        slug: 'offer-enquiry',
        level: 'Professional',
        title: 'A reply to an offer enquiry, without advising',
        why: 'Someone asks "is this a good offer?" That is not a question for a chat tool. You can draft a reply that sets out the facts you were given and says the decision is the client’s, with a qualified person if they need advice.',
        prompt: `Draft a reply I can send. Use simple language an everyday person would understand. Do not advise them to accept or reject.

What they asked: """[their message]"""
Facts I am allowed to pass on: [the offer figure if you want it included, and any condition they stated]
What I will not advise on: [legal terms, value, or "all of it"]

The reply should:
1. Restate the facts I provided.
2. Say the decision is theirs.
3. Suggest they take legal or valuation advice from a qualified person if the question is about the law or the value.
Do not say whether the offer is good, fair or low.
Do not invent conditions.
Do not give legal or valuation advice.`,
      },
      {
        slug: 'photo-captions',
        level: 'Intermediate',
        title: 'Captions that match the photos',
        why: 'A caption should say which room it is. It should not sell a kitchen you photographed on a different day, or a view that is not in the frame.',
        prompt: `Write captions for photos I describe. Use simple language an everyday person would understand.

PHOTOS, in order:
"""
[for each photo: what is actually in the frame, in your words]
"""

One caption per photo. Neutral and specific.
Do not claim a size, a renovation, a view or a feature I did not describe.
Do not suggest editing a photo to add light, space or furniture.
At the end, add this line, unchanged: "Do not use a generated or altered photo that makes the place look different from the visit."`,
      },
    ],
    sources: ['iccCode'],
  },
];

export function requireOccupations(sources) {
  const slugs = new Set();
  const titles = new Set();
  const descriptions = new Set();
  for (const job of occupations) {
    if (slugs.has(job.slug)) throw new Error(`Duplicate occupation slug: ${job.slug}`);
    slugs.add(job.slug);
    if (titles.has(job.title)) throw new Error(`Duplicate occupation title: ${job.title}`);
    titles.add(job.title);
    if (descriptions.has(job.description)) throw new Error(`Duplicate occupation description: ${job.slug}`);
    descriptions.add(job.description);
    const branded = job.title.length + 'AIForThisJob'.length + 3 <= 60 ? `${job.title} | AIForThisJob` : job.title;
    if (branded.length > 60) throw new Error(`Occupation title too long (${branded.length}): ${job.slug}`);
    if (job.description.length > 158) throw new Error(`Occupation description too long (${job.description.length}): ${job.slug}`);
    if (!job.lede || !job.note || !job.check) throw new Error(`Occupation ${job.slug} is missing copy`);
    if (job.tasks.length < 5 || job.tasks.length > 8) throw new Error(`${job.slug} has ${job.tasks.length} tasks`);
    const taskSlugs = new Set();
    for (const task of job.tasks) {
      if (taskSlugs.has(task.slug)) throw new Error(`Duplicate task ${job.slug}/${task.slug}`);
      taskSlugs.add(task.slug);
      if (!LEVELS.includes(task.level)) throw new Error(`Bad level ${job.slug}/${task.slug}`);
      if (!task.prompt.includes('simple language an everyday person would understand')) throw new Error(`Missing phrase ${job.slug}/${task.slug}`);
      if (/british(?:[-\s]+)english|plain(?:[-\s]+)english/i.test(task.prompt)) throw new Error(`Banned phrase in prompt ${job.slug}/${task.slug}`);
    }
    for (const key of job.sources) if (!sources[key]) throw new Error(`Occupation ${job.slug} missing source ${key}`);
    if ((job.slug === 'electrician' || job.slug === 'plumber') && !(job.safety || []).some((line) => /qualified professional/i.test(line))) {
      throw new Error(`${job.slug} is missing the trade safety note`);
    }
  }
}
