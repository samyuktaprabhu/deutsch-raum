-- Deutschraum original B1 lesson titles and summaries.
-- Run in Supabase SQL Editor after schema.sql and seed-lessons.sql.
-- The lesson names and descriptions below are independently written for Deutschraum.
update public.lessons l
set title = v.title,
    summary = v.summary,
    level = 'B1',
    is_published = true
from public.courses c
cross join (values
  (5, 'Connecting with People', 'Build friendships, describe relationships and handle everyday social situations.'),
  (6, 'Working Together', 'Talk about responsibilities, teamwork, routines and workplace experiences.'),
  (7, 'Finding a Place to Live', 'Describe homes, compare living arrangements and discuss housing needs.'),
  (8, 'Helping Customers', 'Handle questions, complaints and service situations politely.'),
  (9, 'Technology in Everyday Life', 'Discuss digital habits, future technology and its impact on daily routines.'),
  (10, 'Welcoming Guests', 'Invite people, respond to invitations and make guests feel comfortable.'),
  (11, 'Giving Advice and Support', 'Ask for help, offer suggestions and respond tactfully.'),
  (12, 'Choosing a Career Path', 'Talk about strengths, career choices and professional goals.'),
  (13, 'Healthy Habits', 'Describe well-being, exercise and ways to maintain a healthy lifestyle.'),
  (14, 'Learning from the Past', 'Talk about missed chances, regrets and alternative past situations.'),
  (15, 'Positive Turning Points', 'Narrate fortunate events, unexpected changes and personal experiences.'),
  (16, 'Events at Work', 'Plan team activities, workplace celebrations and shared events.'),
  (17, 'When Communication Goes Wrong', 'Explain misunderstandings and clarify what you meant.'),
  (18, 'Learning Throughout Life', 'Discuss courses, qualifications, training and learning opportunities.'),
  (19, 'Applying for Opportunities', 'Present your experience and communicate confidently in application situations.'),
  (20, 'Growing Up and Looking Back', 'Describe childhood routines, memories and changes over time.'),
  (21, 'Stories Behind People', 'Talk about life stories, personal milestones and memorable experiences.'),
  (22, 'Taking Part in Society', 'Express opinions, agree and disagree respectfully about social issues.'),
  (23, 'Travel Experiences', 'Describe journeys, compare destinations and discuss travel preferences.'),
  (24, 'Rules and Responsibilities', 'Explain rules, consequences, expectations and shared responsibilities.'),
  (25, 'Enjoying Live Events', 'Talk about concerts, performances, preparation and cultural activities.'),
  (26, 'How Society Has Changed', 'Describe historical developments and discuss their effects on everyday life.'),
  (27, 'Protecting Our Environment', 'Discuss climate, sustainable choices and practical environmental action.'),
  (28, 'Imagining Better Futures', 'Suggest solutions, evaluate possibilities and discuss future scenarios.')
) as v(sequence_no, title, summary)
where l.course_id = c.id
  and c.slug = 'a2-to-b1-telc'
  and l.sequence_no = v.sequence_no;
