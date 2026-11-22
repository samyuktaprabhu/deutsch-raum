-- Deutschraum course roadmap (32 weekday sessions)
-- Run after schema.sql in Supabase SQL Editor. Safe to re-run.
insert into public.lessons (course_id, sequence_no, scheduled_date, level, title, summary, is_published)
select c.id, v.sequence_no, v.scheduled_date::date, v.level, v.title, v.summary, true
from public.courses c
cross join (values
  (1, '2026-12-01', 'A2', 'A2.1 · Sentence structure', 'Main clauses, verb position and word order'),
  (2, '2026-12-02', 'A2', 'A2.2 · Cases and prepositions', 'Nominativ, Akkusativ, Dativ and common prepositions'),
  (3, '2026-12-03', 'A2', 'A2.3 · Tenses and modal verbs', 'Perfekt, Präteritum and modal verb revision'),
  (4, '2026-12-04', 'A2', 'A2.4 · A2 checkpoint', 'Review, short writing and speaking assessment'),
  (5, '2026-12-07', 'B1', 'Kapitel 1 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (6, '2026-12-08', 'B1', 'Kapitel 1 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (7, '2026-12-09', 'B1', 'Kapitel 2 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (8, '2026-12-10', 'B1', 'Kapitel 2 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (9, '2026-12-11', 'B1', 'Kapitel 3 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (10, '2026-12-14', 'B1', 'Kapitel 3 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (11, '2026-12-15', 'B1', 'Kapitel 4 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (12, '2026-12-16', 'B1', 'Kapitel 4 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (13, '2026-12-17', 'B1', 'Kapitel 5 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (14, '2026-12-18', 'B1', 'Kapitel 5 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (15, '2026-12-21', 'B1', 'Kapitel 6 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (16, '2026-12-22', 'B1', 'Kapitel 6 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (17, '2026-12-23', 'B1', 'Kapitel 7 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (18, '2026-12-24', 'B1', 'Kapitel 7 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (19, '2026-12-28', 'B1', 'Kapitel 8 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (20, '2026-12-29', 'B1', 'Kapitel 8 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (21, '2026-12-30', 'B1', 'Kapitel 9 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (22, '2026-12-31', 'B1', 'Kapitel 9 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (23, '2027-01-04', 'B1', 'Kapitel 10 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (24, '2027-01-05', 'B1', 'Kapitel 10 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (25, '2027-01-06', 'B1', 'Kapitel 11 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (26, '2027-01-07', 'B1', 'Kapitel 11 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (27, '2027-01-08', 'B1', 'Kapitel 12 · Explore', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (28, '2027-01-11', 'B1', 'Kapitel 12 · Practise & apply', 'Follow the matching chapter in Netzwerk neu B1; focus on vocabulary, grammar and communication'),
  (29, '2027-01-12', 'B1', 'Grammar clinic', 'Review recurring errors and high-value B1 structures'),
  (30, '2027-01-13', 'B1', 'Reading & listening strategies', 'Timed practice and identifying key information'),
  (31, '2027-01-14', 'B1', 'Writing & speaking workshop', 'Email or opinion text; paired discussion and planning'),
  (32, '2027-01-15', 'B1', 'telc B1 mock examination', 'Complete a timed mock and review your next steps')
) as v(sequence_no, scheduled_date, level, title, summary)
where c.slug = 'a2-to-b1-telc'
on conflict (course_id, sequence_no) do update
set scheduled_date = excluded.scheduled_date,
    level = excluded.level,
    title = excluded.title,
    summary = excluded.summary,
    is_published = true;
