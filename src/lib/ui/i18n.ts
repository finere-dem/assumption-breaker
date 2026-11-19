import type { BiasType } from "../agent/interviews";
import type { EvidenceSignal, Lang } from "../agent/schemas";

const en = {
  tagline: "Stress-test your startup idea against real evidence. The agent searches; you decide.",
  steps: ["Idea", "Assumptions", "Evidence", "Interviews", "Verdict"],
  tokens: "tokens",
  calls: "AI calls",
  cost: "cost",
  restart: "Start over",
  restartConfirm: "Erase this analysis and start over?",
  back: "Back",
  retry: "Retry",
  busy: "The free AI models are busy right now. Wait a minute, then retry.",

  ideaTitle: "Describe your idea",
  ideaHelp: "Who has the problem, what the problem is, what you sell and at what price. 3 to 5 sentences are enough.",
  ideaPlaceholder: "Example: a weekly meal-prep subscription for international students in Paris...",
  useExample: "Use an example",
  language: "Language",
  findAssumptions: "Find my riskiest assumptions",
  thinking: "The agent is listing what must be true for your idea to work...",

  assumptionsTitle: "Which assumptions are the riskiest?",
  checkpoint1: "Your call. The agent proposes, you decide. Pick up to 3 assumptions to test, in order of risk (1 = the one that would kill the idea first). Edit any wording that does not fit.",
  whyRisky: "Why it is uncertain",
  ifWrong: "If it is wrong",
  test: "Test this",
  untest: "Remove",
  rank: "Risk rank",
  addOwn: "Add my own assumption",
  ownPlaceholder: "Write an assumption your idea depends on",
  add: "Add",
  testSelected: (n: number) => `Search evidence for my ${n} assumption${n > 1 ? "s" : ""}`,
  pickAtLeastOne: "Pick at least one assumption to test.",

  evidenceTitle: "What the evidence says",
  checkpointEvidence: "The agent shows evidence, not conclusions. Open the sources, and dismiss anything that does not really apply to your idea: the signal updates.",
  searching: "Searching and reading sources...",
  queries: "Searches run",
  supports: "Supports",
  contradicts: "Contradicts",
  noEvidence: "No solid evidence found. That is a result too: this assumption still needs to be tested in the field.",
  dismiss: "Not relevant",
  original: "Original",
  restore: "Restore",
  scanned: (n: number) => `${n} sources read`,
  rejected: (n: number) => `${n} quote${n > 1 ? "s" : ""} the AI could not back up with the source text ${n > 1 ? "were" : "was"} removed`,
  toVerdict: "I have reviewed the evidence",
  privacy:
    "Where your idea goes: it stays in your browser (no account, no database). To analyse it, its text is sent to Groq (open-weight model), and to Google Gemini only if Groq is busy; on Gemini's free tier Google may use it to improve its products. Searches send only keywords. Do not paste confidential information.",
  waitAll: "Wait until every assumption has been searched.",

  verdictTitle: "Your verdict",
  checkpoint2: "The agent never decides. Based on the evidence, what do you do with this idea, and why?",
  decisions: { continue: "Continue", pivot: "Pivot", stop: "Stop" },
  reasonLabel: "Why? (required)",
  reasonPlaceholder: "Which evidence weighed most in your decision, and what are you still unsure about?",
  reasonTooShort: (n: number) => `${n} more characters`,
  nextLabel: "Next real-world test (optional)",
  nextPlaceholder: "Example: interview 5 international students this week about what they ate yesterday",
  download: "Download my report (.md)",
  summary: "Summary",
  duration: (min: number) => `Time spent on this analysis: ${min} min`,
  interviewsTitle: "Now talk to real people",
  checkpointInterviews:
    "No agent can do this step for you. Interview 3 to 5 people from your target this week with the guide below, then paste your notes: the agent checks them for the traps that make founders hear what they want to hear.",
  makeGuide: "Prepare my interview guide",
  makingGuide: "Writing questions about past behaviour, not opinions...",
  guideTitle: "Questions to ask",
  reveals: "What it tells you",
  avoidTitle: "Tempting questions to avoid",
  instead: "Ask instead",
  notesTitle: "Your interview notes",
  notesHelp: "Write down the questions as you asked them and the answers as they were said. Remove names and personal details first.",
  notesPlaceholder: "Me: ...\nThem: ...",
  useExampleNotes: "Use example notes",
  analyze: "Check my notes for bias",
  analyzing: "Looking for leading questions, compliments and wishful thinking...",
  flagsTitle: "Traps in this interview",
  noFlags: "No bias spotted in these notes. Good interviewing.",
  learningsTitle: "What you actually learned",
  noLearnings: "No concrete fact about past behaviour in these notes yet: ask for the last time it happened.",
  bias: {
    "leading-question": "Leading question",
    hypothetical: "Hypothetical",
    pitching: "Pitching",
    compliment: "Compliment, not evidence",
    "vague-answer": "Vague answer",
    "selective-listening": "Selective listening",
  } satisfies Record<BiasType, string>,
  skipInterviews: "Skip for now, I will interview later",
  toVerdictFromInterviews: "Continue to my verdict",
  field: "Field",

  signal: {
    insufficient: "Insufficient evidence",
    "leans-supported": "Leans supported",
    "leans-contradicted": "Leans contradicted",
    mixed: "Mixed evidence",
  } satisfies Record<EvidenceSignal, string>,
  category: { desirability: "Desirability", feasibility: "Feasibility", viability: "Viability" },
};

export type Dict = typeof en;

const fr: Dict = {
  tagline: "Confronte ton idée de startup à de vraies preuves. L'agent cherche, tu décides.",
  steps: ["Idée", "Hypothèses", "Preuves", "Entretiens", "Verdict"],
  tokens: "tokens",
  calls: "appels IA",
  cost: "coût",
  restart: "Recommencer",
  restartConfirm: "Effacer cette analyse et recommencer ?",
  back: "Retour",
  retry: "Réessayer",
  busy: "Les modèles d'IA gratuits sont saturés en ce moment. Attends une minute puis réessaie.",

  ideaTitle: "Décris ton idée",
  ideaHelp: "Qui a le problème, quel est le problème, ce que tu vends et à quel prix. 3 à 5 phrases suffisent.",
  ideaPlaceholder: "Exemple : un abonnement hebdomadaire de plats pour étudiants étrangers à Paris...",
  useExample: "Prendre un exemple",
  language: "Langue",
  findAssumptions: "Trouver mes hypothèses les plus risquées",
  thinking: "L'agent liste ce qui doit être vrai pour que ton idée marche...",

  assumptionsTitle: "Quelles hypothèses sont les plus risquées ?",
  checkpoint1: "C'est toi qui décides. L'agent propose, tu choisis. Garde jusqu'à 3 hypothèses à tester, par ordre de risque (1 = celle qui tuerait l'idée en premier). Corrige la formulation si besoin.",
  whyRisky: "Pourquoi c'est incertain",
  ifWrong: "Si c'est faux",
  test: "Tester",
  untest: "Retirer",
  rank: "Rang de risque",
  addOwn: "Ajouter ma propre hypothèse",
  ownPlaceholder: "Écris une hypothèse dont dépend ton idée",
  add: "Ajouter",
  testSelected: (n: number) => `Chercher des preuves pour mes ${n} hypothèse${n > 1 ? "s" : ""}`,
  pickAtLeastOne: "Choisis au moins une hypothèse à tester.",

  evidenceTitle: "Ce que disent les preuves",
  checkpointEvidence: "L'agent montre des preuves, pas des conclusions. Ouvre les sources et écarte ce qui ne s'applique pas vraiment à ton idée : le signal se met à jour.",
  searching: "Recherche et lecture des sources...",
  queries: "Recherches lancées",
  supports: "Pour",
  contradicts: "Contre",
  noEvidence: "Aucune preuve solide trouvée. C'est aussi un résultat : cette hypothèse reste à tester sur le terrain.",
  dismiss: "Pas pertinent",
  original: "Original",
  restore: "Remettre",
  scanned: (n: number) => `${n} sources lues`,
  rejected: (n: number) => `${n} citation${n > 1 ? "s" : ""} que l'IA ne pouvait pas justifier par le texte de la source ${n > 1 ? "ont été retirées" : "a été retirée"}`,
  toVerdict: "J'ai examiné les preuves",
  privacy:
    "Ce que devient ton idée : elle reste dans ton navigateur (pas de compte, pas de base de données). Pour l'analyser, son texte est envoyé à Groq (modèle open-weight), et à Google Gemini seulement si Groq est saturé ; sur l'offre gratuite de Gemini, Google peut s'en servir pour améliorer ses produits. Les recherches n'envoient que des mots-clés. Ne colle pas d'informations confidentielles.",
  waitAll: "Attends que chaque hypothèse ait été recherchée.",

  verdictTitle: "Ton verdict",
  checkpoint2: "L'agent ne décide jamais. Au vu des preuves, que fais-tu de cette idée, et pourquoi ?",
  decisions: { continue: "Continuer", pivot: "Pivoter", stop: "Arrêter" },
  reasonLabel: "Pourquoi ? (obligatoire)",
  reasonPlaceholder: "Quelles preuves ont le plus pesé dans ta décision, et de quoi doutes-tu encore ?",
  reasonTooShort: (n: number) => `encore ${n} caractères`,
  nextLabel: "Prochain test sur le terrain (facultatif)",
  nextPlaceholder: "Exemple : interroger 5 étudiants étrangers cette semaine sur ce qu'ils ont mangé hier",
  download: "Télécharger mon rapport (.md)",
  summary: "Synthèse",
  duration: (min: number) => `Temps passé sur cette analyse : ${min} min`,
  interviewsTitle: "Maintenant, parle à de vraies personnes",
  checkpointInterviews:
    "Aucun agent ne peut faire cette étape à ta place. Interroge 3 à 5 personnes de ta cible cette semaine avec le guide ci-dessous, puis colle tes notes : l'agent y cherche les pièges qui font entendre au fondateur ce qu'il veut entendre.",
  makeGuide: "Préparer mon guide d'entretien",
  makingGuide: "Rédaction de questions sur les comportements passés, pas sur les opinions...",
  guideTitle: "Questions à poser",
  reveals: "Ce que ça t'apprend",
  avoidTitle: "Questions tentantes à éviter",
  instead: "Demande plutôt",
  notesTitle: "Tes notes d'entretien",
  notesHelp: "Note les questions telles que tu les as posées et les réponses telles qu'elles ont été dites. Retire d'abord les noms et les informations personnelles.",
  notesPlaceholder: "Moi : ...\nLui/Elle : ...",
  useExampleNotes: "Prendre des notes d'exemple",
  analyze: "Vérifier les biais de mes notes",
  analyzing: "Recherche des questions orientées, des compliments et des conclusions trop rapides...",
  flagsTitle: "Pièges dans cet entretien",
  noFlags: "Aucun biais repéré dans ces notes. Bel entretien.",
  learningsTitle: "Ce que tu as vraiment appris",
  noLearnings: "Aucun fait concret sur un comportement passé dans ces notes : demande la dernière fois que c'est arrivé.",
  bias: {
    "leading-question": "Question orientée",
    hypothetical: "Question hypothétique",
    pitching: "Présentation de ta solution",
    compliment: "Compliment, pas une preuve",
    "vague-answer": "Réponse vague",
    "selective-listening": "Écoute sélective",
  },
  skipInterviews: "Passer pour l'instant, je ferai les entretiens plus tard",
  toVerdictFromInterviews: "Passer à mon verdict",
  field: "Terrain",

  signal: {
    insufficient: "Preuves insuffisantes",
    "leans-supported": "Plutôt confirmée",
    "leans-contradicted": "Plutôt contredite",
    mixed: "Preuves mitigées",
  },
  category: { desirability: "Désirabilité", feasibility: "Faisabilité", viability: "Viabilité" },
};

export const DICTS: Record<Lang, Dict> = { en, fr };

export const EXAMPLES: Record<Lang, string> = {
  en: "A weekly meal-prep subscription for international students in Paris, delivering home-style dishes from their country of origin (West African, North African, Asian), cooked by diaspora home cooks. Students pay 35 EUR per week for 5 meals. Target: the 100,000+ international students in Île-de-France who miss home food and lack time or skills to cook it.",
  fr: "Un abonnement hebdomadaire de plats pour les étudiants étrangers à Paris : des plats « comme à la maison » de leur pays d'origine (Afrique de l'Ouest, Maghreb, Asie), cuisinés par des cuisiniers de la diaspora. Les étudiants paient 35 EUR par semaine pour 5 repas. Cible : les plus de 100 000 étudiants internationaux d'Île-de-France à qui la cuisine de chez eux manque et qui n'ont pas le temps ou le savoir-faire pour la préparer.",
};

// Synthetic interview (no real person), written with the usual founder traps
// so the bias detector has something to catch in the demo.
export const EXAMPLE_NOTES: Record<Lang, string> = {
  en: `Interview with A., 22, master's student in Paris (arrived from Dakar a year ago).

Me: Do you miss food from home?
A.: Yes, a lot, especially my mother's thieboudienne.
Me: Would you pay 35 euros a week to get home-made Senegalese dishes?
A.: Yes, honestly that would be amazing, it's a great idea!
Me: What did you eat yesterday for lunch?
A.: A sandwich at the CROUS university cafeteria, it's 3.30 euros, I eat there almost every day.
Me: When was the last time you ate Senegalese food in Paris?
A.: Two months ago, at a restaurant in Château Rouge. It was expensive, 18 euros, so I rarely go.
Me: Our service would deliver 5 meals a week to your place, cooked by diaspora moms, would you like that?
A.: Yes yes, sounds good.
Me: Do you cook yourself?
A.: I cook all the time.

My conclusions: A. loves the idea and would pay 35 euros. Hypothesis validated.`,
  fr: `Entretien avec A., 22 ans, étudiante en master à Paris (arrivée de Dakar il y a 1 an).

Moi : Est-ce que la cuisine de chez toi te manque ?
A. : Oui, énormément, surtout le thiéboudienne de ma mère.
Moi : Tu serais prête à payer 35 euros par semaine pour recevoir des plats sénégalais faits maison ?
A. : Oui, franchement ce serait génial, c'est une super idée !
Moi : Qu'est-ce que tu as mangé hier midi ?
A. : Un sandwich au resto U du CROUS, c'est 3,30 euros, je mange là presque tous les jours.
Moi : La dernière fois que tu as mangé sénégalais à Paris, c'était quand ?
A. : Il y a deux mois, dans un restaurant à Château Rouge. C'était cher, 18 euros, donc j'y vais rarement.
Moi : Notre service livrerait chez toi 5 repas par semaine, cuisinés par des mamans de la diaspora, ça te plairait ?
A. : Oui oui, ça a l'air bien.
Moi : Tu cuisines toi-même ?
A. : Je cuisine tout le temps.

Mes conclusions : A. adore l'idée et paierait 35 euros. Hypothèse validée.`,
};
