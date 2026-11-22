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
  ideaPlaceholder: "Example: a platform that houses students at seniors who live alone...",
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
  download: "Download my report (PDF)",
  downloadMd: "Text version (.md)",
  pdfFooter: "Assumption Breaker · The agent searches, you decide · assumption-breaker.vercel.app",
  summary: "Summary",
  feedbackTitle: "Testing the tool?",
  feedbackText: "Your feedback takes 2 minutes and helps a lot (form in French).",
  feedbackCta: "Give my feedback",
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
  ideaPlaceholder: "Exemple : une plateforme qui loge des étudiants chez des seniors qui vivent seuls...",
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
  download: "Télécharger mon rapport (PDF)",
  downloadMd: "Version texte (.md)",
  pdfFooter: "Assumption Breaker · L'agent cherche, tu décides · assumption-breaker.vercel.app",
  summary: "Synthèse",
  feedbackTitle: "Tu testes l'outil ?",
  feedbackText: "Ton avis prend 2 minutes et m'aide énormément.",
  feedbackCta: "Donner mon avis",
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
  en: "A platform that matches students looking for housing in Paris with seniors who live alone in a home that has become too big for them. The student pays a reduced rent (200 to 300 EUR a month) in exchange for being present in the evening and helping with small tasks. The platform checks both profiles, provides the contract, and charges each party a 150 EUR yearly membership fee.",
  fr: "Une plateforme qui met en relation des étudiants qui cherchent un logement à Paris avec des seniors qui vivent seuls dans un logement devenu trop grand. L'étudiant paie un loyer réduit (200 à 300 EUR par mois) en échange d'une présence le soir et de petits services. La plateforme vérifie les profils, fournit le contrat et se rémunère avec 150 EUR de frais d'adhésion par an, payés par chaque partie.",
};

// Synthetic interview (no real person), written with the usual founder traps
// so the bias detector has something to catch in the demo.
export const EXAMPLE_NOTES: Record<Lang, string> = {
  en: `Interview with Mrs D., 79, widow, lives alone in a 4-room flat in Paris 15th.

Me: Don't you feel lonely in the evening?
Mrs D.: Yes, the evenings are long since my husband passed away.
Me: Wouldn't it be reassuring to have a nice student living with you?
Mrs D.: Oh yes, that would be wonderful, it's a lovely idea!
Me: When was the last time someone stayed at your place for more than a few days?
Mrs D.: My grandson, last summer, for a week. By the end I was exhausted, I like my habits.
Me: Has anyone ever suggested getting help at home?
Mrs D.: My daughter wanted to hire a home helper two years ago. I said no, I don't like strangers in my kitchen.
Me: Our platform checks every student and provides the contract, for 150 euros a year. Would you sign up?
Mrs D.: Why not, if my daughter agrees.
Me: Do you have a free room?
Mrs D.: There is my husband's study, but I haven't touched it.
Me: Do you see your neighbours?
Mrs D.: I'm always on my own.

My conclusions: Mrs D. loves the idea, seniors want a student at home. Hypothesis validated, she will pay the 150 euros.`,
  fr: `Entretien avec Mme D., 79 ans, veuve, vit seule dans un 4 pièces à Paris 15e.

Moi : Vous ne vous sentez pas seule le soir ?
Mme D. : Si, les soirées sont longues depuis que mon mari est parti.
Moi : Ce serait rassurant d'avoir un gentil étudiant chez vous, non ?
Mme D. : Oh oui, ce serait formidable, c'est une très belle idée !
Moi : La dernière fois que quelqu'un a dormi chez vous plus de quelques jours, c'était quand ?
Mme D. : Mon petit-fils, l'été dernier, une semaine. À la fin j'étais épuisée, j'ai mes habitudes.
Moi : On vous a déjà proposé de l'aide à domicile ?
Mme D. : Ma fille voulait prendre une auxiliaire de vie il y a deux ans. J'ai refusé, je n'aime pas avoir des inconnus dans ma cuisine.
Moi : Notre plateforme vérifie chaque étudiant et fournit le contrat, pour 150 euros par an. Vous vous inscririez ?
Mme D. : Pourquoi pas, si ma fille est d'accord.
Moi : Vous avez une chambre libre ?
Mme D. : Il y a le bureau de mon mari, mais je n'y ai pas touché.
Moi : Vous voyez vos voisins ?
Mme D. : Je suis toujours toute seule.

Mes conclusions : Mme D. adore l'idée, les seniors veulent un étudiant chez eux. Hypothèse validée, elle paiera les 150 euros.`,
};
