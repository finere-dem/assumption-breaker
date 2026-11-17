# Cadrage : agent de validation d'idée (HETIC AI Agents for Founders 2026)

Nom de travail : **Assumption Breaker** (à changer si vous trouvez mieux).
Équipe : Ismail + binôme, élèves ingénieurs 2A, école d'ingénieurs d'Université Paris Cité.
Rendu : **jeudi 18/12 à 17h (Paris)**. Objectif interne : tout soumis le **mercredi 17/12**.

## 1. Le problème

Un fondateur passe des semaines, parfois des mois, sur une idée sans avoir vérifié que le besoin existe. Vérifier à la main prend du temps : lister ses hypothèses, fouiller forums et avis, préparer des entretiens clients sans questions orientées, relire ses notes honnêtement. La plupart sautent cette étape. L'absence de besoin réel est la première cause d'échec des startups.

## 2. Ce que fait l'agent (une phrase)

Il met l'idée du fondateur à l'épreuve des preuves réelles, **sans jamais décider à sa place** : il cherche, il cite, il questionne ; le fondateur classe, juge et tranche.

## 3. Parcours utilisateur (5 écrans)

1. **Idée** : le fondateur décrit son idée en quelques lignes (cible, problème, solution). Un exemple est pré-rempli pour le jury.
2. **Hypothèses** : l'agent propose 5 à 7 hypothèses risquées (désirabilité, faisabilité, viabilité), chacune avec la raison du risque.
   **Contrôle humain n°1** : le fondateur modifie, supprime, ajoute, puis classe les 3 plus risquées. Rien ne continue sans ce classement.
3. **Preuves** : pour chaque hypothèse retenue, l'agent montre les requêtes qu'il lance, puis des preuves **pour** et **contre**, chacune avec citation courte + lien + niveau de confiance. S'il ne trouve rien de solide, il écrit "preuves insuffisantes" au lieu d'inventer. Le fondateur peut écarter une source jugée non pertinente.
4. **Entretiens** : l'agent génère un guide d'entretien façon *Mom Test* (questions sur le passé et les comportements réels, jamais "est-ce que tu achèterais ?"). Après les entretiens, le fondateur colle ses notes ; le **détecteur de biais** surligne les questions orientées, les compliments pris pour des preuves, les hypothétiques, et ce qui contredit ses hypothèses.
5. **Verdict** : synthèse des preuves par hypothèse. **Contrôle humain n°2** : le fondateur choisit continuer / pivoter / abandonner et doit écrire pourquoi (champ obligatoire). Export du rapport en Markdown/PDF.

Sur tous les écrans : **compteur de tokens et de coût** ("cette analyse : 14 200 tokens, 0 EUR").

## 4. Hors périmètre (on ne le fait PAS)

- Comptes utilisateurs, login, base de données (tout reste dans le navigateur, export du rapport).
- Paiement, abonnement.
- Génération de business plan, de pitch deck ou de landing page : l'agent ne fait pas le travail de réflexion à la place du fondateur.
- Prise de contact automatique avec des prospects (données personnelles de tiers interdites sans base légale).

## 5. Stack (100 % gratuite à l'exécution)

| Rôle | Choix | À vérifier le jour 1 |
|---|---|---|
| Appli | Next.js + TypeScript, déployée sur Vercel (offre gratuite) | |
| Modèle principal | Llama (open-weight) via Groq, offre gratuite | limites de requêtes/min et /jour |
| Modèle de secours | Gemini via Google AI Studio, offre gratuite | conditions d'usage des données de l'offre gratuite (à citer dans Responsible AI) |
| Option 100 % locale | Ollama (même prompts), pour "tout le monde peut le réutiliser" | |
| Recherche de preuves | API gratuite de recherche web (ex. Tavily, offre gratuite) + Hacker News (API Algolia) + Reddit (JSON public) | quotas gratuits réels |
| Stockage | navigateur (localStorage) + export du rapport | |

Garde-fous : cache de l'exemple du jury, limite d'analyses par session, bascule automatique Groq vers Gemini si quota atteint, message clair en cas d'échec.

## 6. Ce qui fait gagner (grille du jury)

| Critère | Poids | Notre réponse |
|---|---|---|
| Valeur et temps gagné | 25 % | Chronométrage réel : méthode manuelle vs agent, sur 3 porteurs de projet |
| Jugement humain | 20 % | 2 contrôles bloquants + détecteur de biais : l'agent fait réfléchir, il ne décide pas |
| Design et fiabilité | 20 % | Sources citées partout, "preuves insuffisantes" plutôt qu'inventer, bascule de modèle, gestion d'erreurs |
| Frugalité | 15 % | Modèles gratuits, compteur de tokens visible, option Ollama locale |
| Expérience utilisateur | 10 % | Lien en ligne, sans inscription, exemple pré-rempli, testable en 30 s |
| Documentation et IA responsable | 10 % | Toutes les sections exigées, limites et biais assumés |

## 7. Répartition (à ajuster ensemble)

- **Ismail** : pipeline de l'agent (prompts, appels modèles, recherche de preuves, bascule, compteur de tokens), déploiement.
- **Binôme** : interface des 5 écrans, détecteur de biais, export du rapport.
- **Les deux** : tests avec 3 porteurs de projet + chronométrage, vidéo, page Devpost en anglais.

## 8. Planning

| Semaine | Objectif | Fin de semaine, on doit avoir |
|---|---|---|
| S1 : 17 au 23/11 | Socle | Repo public créé, clés gratuites obtenues, quotas vérifiés, pipeline Idée vers Hypothèses vers Preuves qui marche en ligne de commande. Chronométrage de la méthode manuelle avec 1 porteur de projet |
| S2 : 24 au 30/11 | Produit de bout en bout | Les 5 écrans, les 2 contrôles humains, le compteur de tokens, déployé sur Vercel |
| S3 : 1 au 7/12 | Effet waouh + preuves terrain | Détecteur de biais, export du rapport, tests avec 3 porteurs de projet, **vidéo brouillon le 5/12** |
| S4 : 8 au 14/12 | Solidité + docs | Gestion des erreurs et des quotas, finitions UX, schéma d'architecture, AI Disclosure, Time-Saved Report, sections Human Judgment et Responsible AI |
| 15 au 17/12 | Rendu | Vidéo finale (3 min max, run complet avec contrôle humain), page Devpost en anglais, **soumission le 17/12** |

## 9. Livrables Devpost (checklist)

- [ ] Page projet en anglais
- [ ] Vidéo 3 min max sur YouTube, run complet avec contrôle humain
- [ ] Lien testable gratuitement par le jury
- [ ] Repo public + instructions d'installation (et sans aucune clé API)
- [ ] Schéma d'architecture
- [ ] AI Disclosure : chaque modèle, fournisseur, rôle, offre gratuite, tokens par exécution ; déclarer aussi les outils d'IA utilisés pour coder (Claude Code)
- [ ] Time-Saved Report : avant / après, mesuré
- [ ] Human Judgment : ce que fait l'agent, ce que décide l'humain, pourquoi
- [ ] Responsible AI : données, vie privée, limites, biais, cas d'échec
- [ ] Certificats de scolarité des deux membres (demandés avant le prix)
