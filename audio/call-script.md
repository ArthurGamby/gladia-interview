# Texte à enregistrer : le call bilingue

Une seule voix, deux interlocuteurs qui ne répondent jamais : Paul (collègue,
francophone) est à côté de toi, John (client, anglophone) vient de se connecter.
Tu préviens Paul, tu parles à John, tu poses une question à Paul, tu reviens à John.

Pour la prise vidéo : tourne la tête vers Paul à chaque passage en français.
Enregistre-la sous `audio/call.mov` (ou `audio/call.m4a` pour une prise audio seule).

1. **FR, à Paul** — Attends Paul, John vient de se connecter. Je lui fais le point et je reviens vers toi.
2. **EN, à John** — Hello John, thank you for joining the call. Good news about the login bug: we solved it this morning. Actually, let me ask Paul, he just arrived at the office. Maybe he has some news about that.
3. **FR, à Paul** — Dis-moi Paul, tu peux vérifier les logs de la prod ? Je suis en call avec John, là. Est-ce qu'on a quelque chose à lui indiquer, ou est-ce qu'on attend après le meeting ?
4. **EN, à John** — Okay John, I just asked Paul to check the logs. He's on it, and I'll send you the report right after this call. All right?

## Conseils

- Rythme normal, comme dans un vrai call.
- Une vraie pause (une bonne demi-seconde) à chaque changement de langue.
- Dis « Dis-moi Paul » d'une traite, sans pause après le prénom.
- Évite d'ajouter des petits mots isolés (« Ah ok, merci », « Nice », « Okay ») :
  les phrases très courtes sont celles que la détection de langue rate le plus.
- Environ 40 secondes au total.

## Pourquoi ce texte a changé (prise 1, `call.aifc`)

Sur la première prise, les phrases anglaises du tout début (« Hi John, thanks
for joining… we shipped the fix this morning ») ont été prises pour du français
en mode code-switching. Deux ajustements : le call commence par une phrase en
français, et « Hi John » / « we shipped the fix » deviennent « Hello John » /
« we solved it », plus faciles à distinguer avec un accent français.
