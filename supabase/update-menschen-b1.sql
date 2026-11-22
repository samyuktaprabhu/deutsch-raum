-- Align the 24 B1 lesson titles with the uploaded Menschen B1 table of contents.
-- Run once in Supabase SQL Editor after the initial schema and lesson seed.
update public.lessons l
set title = v.title,
    summary = v.summary,
    level = 'B1',
    is_published = true
from public.courses c
cross join (values
  (5, 'Freundschaft', 'Ihr seid einfach die Besten!'),
  (6, 'Beruf und Arbeit', 'Er erledigte seine Aufgaben zuverlässig.'),
  (7, 'Wohnen', 'Mein Beruf ist meine Leidenschaft.'),
  (8, 'Kundenservice', 'Obwohl ich Ihnen das erklärt habe, ...'),
  (9, 'Zukunft', 'Bald wird in fast jedem Haushalt ein PC stehen.'),
  (10, 'Einladungen', 'Fühlen Sie sich wie zu Hause.'),
  (11, 'Beratung', 'Kann ich Ihnen helfen?'),
  (12, 'Berufsfindung', 'Während andere lange nachdenken, ...'),
  (13, 'Gesundheit', 'Sport trägt zu einem größeren Wohlbefinden bei.'),
  (14, 'Verpasste Gelegenheiten', 'Hätte ich das bloß anders gemacht!'),
  (15, 'Glücksmomente', 'Nachdem wir jahrelang Pech gehabt hatten, ...'),
  (16, 'Feiern im Betrieb', 'Ausflug des Jahres'),
  (17, 'Sprache', 'Aus diesem Grund gab es ein Missverständnis.'),
  (18, 'Weiterbildung', 'Die Teilnahme ist auf eigene Gefahr.'),
  (19, 'Bewerbungen', 'Schön, dass Sie da sind.'),
  (20, 'Jugend und Erinnerungen', 'Wir brauchten uns um nichts zu kümmern.'),
  (21, 'Biografien', 'Guck mal! Das ist schön!'),
  (22, 'Politik und Gesellschaft', 'Davon halte ich nicht viel.'),
  (23, 'Tourismus', 'Je älter ich wurde, desto ...'),
  (24, 'Regeln', 'Die anderen werden es dir danken!'),
  (25, 'Konzerte und Veranstaltungen', 'Vorher muss natürlich fleißig geübt werden.'),
  (26, 'Geschichte', 'In der BRD wurde die Demokratie eingeführt.'),
  (27, 'Umwelt und Klima', 'Fahrradfahren ist in.'),
  (28, 'Zukunftsvisionen', 'Das löst mehrere Probleme auf einmal.')
) as v(sequence_no, title, summary)
where l.course_id = c.id
  and c.slug = 'a2-to-b1-telc'
  and l.sequence_no = v.sequence_no;
