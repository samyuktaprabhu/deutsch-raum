import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true); setMessage('')
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { display_name: name }, emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        setMessage(data.session ? 'Account created. Welcome to Deutschraum!' : 'Check your email to confirm your account, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }

  async function resetPassword() {
    if (!email) { setMessage('Enter your email address first.'); return }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    setMessage(error ? error.message : 'If the email is registered, a password reset link will arrive shortly.')
    setBusy(false)
  }

  return <main className="auth-wrap">
    <section className="auth-card">
      <a className="brand" href="/">deutsch<span>raum</span></a>
      <p className="eyebrow">YOUR GERMAN CLASSROOM</p>
      <h1>{mode === 'signup' ? 'Create your account.' : 'Welcome back.'}</h1>
      <p className="muted">A little German, consistently. Your learning progress stays with your account.</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Your name<input value={name} onChange={e=>setName(e.target.value)} required autoComplete="name" /></label>}
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} /></label>
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
      </form>
      {mode === 'signin' && <button className="text-button" onClick={resetPassword} disabled={busy}>Forgot password?</button>}
      <p className="switch">{mode === 'signup' ? 'Already registered?' : 'New to Deutschraum?'} <button className="text-button" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setMessage('')}}>{mode==='signup'?'Sign in':'Create an account'}</button></p>
      {message && <p className="notice" role="status">{message}</p>}
      <p className="fineprint">By continuing, you agree to use Deutschraum as an independent learning companion.</p>
    </section>
  </main>
}

function LessonWorkspace({ lesson, onBack, onComplete, completed }) {
  const [tab, setTab] = useState('Listening')
  const [answers, setAnswers] = useState({})
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState('')
  const [checked, setChecked] = useState(false)
  const [transcript, setTranscript] = useState(false)
  const sections = ['Listening','Reading','Writing','Speaking','Grammar & vocabulary']
  const listening = 'Hallo, ich bin neu in der Stadt und kenne hier noch nicht viele Leute. Am Wochenende möchte ich gern etwas unternehmen. Hast du einen Tipp? — Ja, wir treffen uns am Samstag mit Freunden im Park. Wenn du möchtest, kannst du mitkommen. — Das klingt toll! Soll ich etwas mitbringen? — Vielleicht einen kleinen Kuchen. Wir machen ein Picknick.'
  const reading = 'Als ich vor einem Jahr nach Freiburg gezogen bin, kannte ich dort niemanden. Am Anfang war es nicht leicht, neue Kontakte zu knüpfen. Deshalb habe ich mich in einem Sportverein angemeldet. Schon nach wenigen Wochen kannte ich viele Menschen. Besonders schön finde ich, dass wir nicht nur zusammen trainieren, sondern auch am Wochenende etwas unternehmen. Eine gute Freundschaft braucht meiner Meinung nach Zeit und gegenseitiges Vertrauen.'
  const sets = {
    Listening: [{q:'What does the new person want to do?',o:['Stay at home','Do something with others','Go shopping'],a:1,e:'They say: Am Wochenende möchte ich gern etwas unternehmen.'},{q:'Where will they meet?',o:['At a café','In the park','At the station'],a:1,e:'They meet im Park.'},{q:'What might the guest bring?',o:['A cake','Books','A football'],a:0,e:'The suggestion is einen kleinen Kuchen.'}],
    Reading: [{q:'Why did the writer join a sports club?',o:['To find a job','To meet people','To study grammar'],a:1,e:'The writer wanted to make new contacts.'},{q:'What do members do besides training?',o:['Meet at weekends','Travel every day','Study together'],a:0,e:'They also do activities at weekends.'},{q:'What does friendship need?',o:['Money','Time and trust','The same hobbies'],a:1,e:'The text says time and gegenseitiges Vertrauen.'}],
    'Grammar & vocabulary': [{q:'Ich freue mich ___ das Treffen.',o:['auf','an','mit'],a:0,e:'sich freuen auf + Akkusativ.'},{q:'Choose the correct word order.',o:['Weil ich bin neu …','Weil ich neu bin …','Weil neu ich bin …'],a:1,e:'The conjugated verb goes to the end of a weil-clause.'},{q:'Which phrase introduces an opinion?',o:['Meiner Meinung nach …','Seit zwei Jahre …','Zum Beispiel gestern …'],a:0,e:'Meiner Meinung nach is a useful B1 opinion phrase.'},{q:'Wir treffen ___ am Samstag.',o:['uns','sich','euch'],a:0,e:'The reflexive pronoun for wir is uns.'}]
  }
  function play() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(listening); u.lang = 'de-DE'; u.rate = 0.88
    window.speechSynthesis.speak(u)
  }
  const qs = sets[tab] || []
  const score = qs.filter((q,i)=>answers[tab+i]===String(q.a)).length
  const done = qs.every((q,i)=>answers[tab+i]!==undefined)
  return <div className="app-shell lesson-page">
    <header className="topbar"><a className="brand" href="/">deutsch<span>raum</span></a><span>{lesson.level} · Session {lesson.sequence_no}</span></header>
    <main className="dashboard lesson-page-content">
      <button className="text-button back-link" onClick={onBack}>← Back to course roadmap</button>
      <section className="lesson-hero"><p className="eyebrow">DEUTSCHRAUM · {lesson.level} · SESSION {lesson.sequence_no}</p><h1>{lesson.sequence_no===1?'Sentence structure':lesson.title}</h1><p>{lesson.summary}</p><div className="lesson-meta"><span>90-minute learning plan</span><span>4 language skills + language focus</span></div></section>
      <nav className="skill-nav">{sections.map(x=><button key={x} className={tab===x?'active':''} onClick={()=>{setTab(x);setChecked(false)}}>{x}</button>)}</nav>
      <section className="skill-card"><div className="skill-heading"><div><p className="eyebrow">YOUR PRACTICE</p><h2>{tab}</h2></div><span className="time-chip">{tab==='Writing'?'25 min':tab==='Speaking'?'20 min':'15 min'}</span></div>
        {tab==='Listening' && <><p>Listen once for the main idea, then again for details. This original dialogue practises invitations and making social plans.</p><div className="audio-card"><b>German conversation · Listen carefully</b><button className="primary" onClick={play}>▶ Play German audio</button><small>Audio is spoken by your browser's German text-to-speech voice.</small></div><button className="text-button" onClick={()=>setTranscript(!transcript)}>{transcript?'Hide transcript':'Reveal transcript after listening'}</button>{transcript&&<blockquote className="transcript">{listening}</blockquote>}</>}
        {tab==='Reading' && <><p>Read the text once for the main idea. Read again and look for reasons and details.</p><article className="reading-passage">{reading}</article><small>Original Deutschraum reading text · B1</small></>}
        {tab==='Writing' && <><div className="task-box"><b>Writing task · 80–100 words</b><p>You have recently moved to a new city. Write an email to a colleague. Explain how you are settling in, describe one way you are meeting new people, and suggest doing something together.</p></div><div className="phrase-list"><b>Useful expressions</b><p>Seit Kurzem wohne ich … · Am Anfang war es … · Inzwischen habe ich … · Hättest du Lust, …? · Ich freue mich auf deine Antwort.</p></div><label className="answer-label">Your email<textarea rows={9} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Liebe/r …"/></label><p className="word-count">{draft.trim()?draft.trim().split(/\s+/).length:0} words · Target: 80–100</p><button className="check-button" onClick={()=>setChecked(true)} disabled={!draft.trim()}>Show self-review checklist</button>{checked&&<div className="feedback-panel"><b>Review your writing</b><ul><li>Did you answer all three parts?</li><li>Did you use a greeting and polite ending?</li><li>Did you connect ideas with weil, deshalb, aber or außerdem?</li><li>Did you check verb position and noun capitalisation?</li></ul><p>Automated correction is not connected yet; use this checklist to review your draft.</p></div>}</>}
        {tab==='Speaking' && <><p>Speak for 1–2 minutes per prompt. Give reasons and examples, not just short answers.</p><div className="task-box"><ol><li>Wie lernt man in einer neuen Stadt am besten Leute kennen?</li><li>Was ist dir bei einer Freundschaft besonders wichtig?</li><li>Erzähl von einer Situation, in der du jemanden neu kennengelernt hast.</li></ol></div><div className="phrase-list"><b>Useful speaking phrases</b><p>Meiner Meinung nach … · Ein gutes Beispiel dafür ist … · Einerseits …, andererseits … · Ich habe die Erfahrung gemacht, dass …</p></div><label className="answer-label">Speaking notes or speech-to-text<textarea rows={6} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Write or dictate what you said …"/></label><small>Use your device's dictation to capture your spoken response.</small></>}
        {qs.map((q,i)=><div className="question-card" key={q.q}><b>{i+1}. {q.q}</b><div className="quiz-options">{q.o.map((o,j)=><button key={o} className={answers[tab+i]===String(j)?'selected':''} onClick={()=>setAnswers(old=>({...old,[tab+i]:String(j)}))}>{String.fromCharCode(65+j)}. {o}</button>)}</div>{checked&&<p className={answers[tab+i]===String(q.a)?'feedback-correct':'feedback-wrong'}>{answers[tab+i]===String(q.a)?'Correct. ':'Review: '}{q.e}</p>}</div>)}
        {qs.length>0&&<div className="skill-footer"><span>{done?score+' / '+qs.length+' correct':'Answer all questions to check your result'}</span><button className="primary" disabled={!done} onClick={()=>setChecked(true)}>Check answers</button></div>}
      </section>
      <section className="lesson-completion"><div><b>Lesson progress</b><p>Complete all four skills and the language focus, then mark this session complete.</p></div><button className="primary" onClick={onComplete}>{completed?'Mark in progress':'Mark lesson complete'}</button></section>
      <p className="footer">Original Deutschraum learning material · Independent learning companion.</p>
    </main>
  </div>
}

function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [openLesson, setOpenLesson] = useState(null)
  const [routePath, setRoutePath] = useState(window.location.pathname)
  const [quizChoice, setQuizChoice] = useState('')
  const user = session.user

  useEffect(() => { load() }, [user.id])

  useEffect(() => {
    const handlePopState = () => setRoutePath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const match = routePath.match(/^\/lesson\/([^/]+)\/?$/)
    if (match && lessons.length) {
      const found = lessons.find(item => item.id === match[1])
      if (found) setOpenLesson(found)
    } else if (routePath === '/') {
      setOpenLesson(null)
    }
  }, [routePath, lessons])

  function openLessonPage(lesson) {
    window.history.pushState({}, '', '/lesson/' + lesson.id)
    setRoutePath(window.location.pathname)
    setOpenLesson(lesson)
    setQuizChoice('')
    window.scrollTo(0, 0)
  }

  function closeLessonPage() {
    window.history.pushState({}, '', '/')
    setRoutePath('/')
    setOpenLesson(null)
    window.scrollTo(0, 0)
  }

  async function load() {
    setLoading(true); setError('')
    const [profileResult, courseResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('courses').select('*').eq('slug','a2-to-b1-telc').eq('is_published',true).maybeSingle()
    ])
    if (profileResult.error) setError(profileResult.error.message)
    setProfile(profileResult.data)
    if (courseResult.error) setError(courseResult.error.message)
    const selectedCourse = courseResult.data
    setCourse(selectedCourse)
    if (selectedCourse) {
      const [lessonResult, progressResult] = await Promise.all([
        supabase.from('lessons').select('*').eq('course_id',selectedCourse.id).eq('is_published',true).order('sequence_no'),
        supabase.from('lesson_progress').select('*').eq('user_id',user.id)
      ])
      if (lessonResult.error) setError(lessonResult.error.message)
      if (progressResult.error) setError(progressResult.error.message)
      setLessons(lessonResult.data || [])
      setProgress(progressResult.data || [])
      await supabase.from('enrollments').upsert({ user_id:user.id, course_id:selectedCourse.id }, { onConflict:'user_id,course_id', ignoreDuplicates:true })
    }
    setLoading(false)
  }

  const completedIds = useMemo(() => new Set(progress.filter(p=>p.status==='completed').map(p=>p.lesson_id)), [progress])
  const percent = lessons.length ? Math.round(completedIds.size / lessons.length * 100) : 0

  async function toggle(lesson) {
    const done = completedIds.has(lesson.id)
    const next = { user_id:user.id, lesson_id:lesson.id, status:done?'in_progress':'completed', completed_at:done?null:new Date().toISOString(), updated_at:new Date().toISOString() }
    const { error } = await supabase.from('lesson_progress').upsert(next,{onConflict:'user_id,lesson_id'})
    if (error) setError(error.message)
    else setProgress(old => [...old.filter(p=>p.lesson_id!==lesson.id), next])
  }

  async function signOut() { await supabase.auth.signOut() }
  const visible = lessons.filter(l => filter==='all' || (filter==='completed' ? completedIds.has(l.id) : l.level===filter))

  if (openLesson) return <LessonWorkspace lesson={openLesson} onBack={closeLessonPage} onComplete={()=>toggle(openLesson)} completed={completedIds.has(openLesson.id)} />

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/">deutsch<span>raum</span></a><div className="user-area"><span>{profile?.display_name || user.email}</span><button className="text-button" onClick={signOut}>Sign out</button></div></header>
    <main className="dashboard">
      <section className="welcome"><div><p className="eyebrow">DEIN LERNRAUM · YOUR LEARNING SPACE</p><h1>Make room for <em>German.</em></h1><p className="muted">Your path from A2 revision to B1 confidence and telc preparation.</p></div>
        <div className="progress-card"><span className="eyebrow">COURSE PROGRESS</span><strong>{percent}%</strong><div className="progress-track"><i style={{width:percent+'%'}} /></div><small>{completedIds.size} of {lessons.length} lessons completed</small></div>
      </section>
      <section className="course-heading"><div><p className="eyebrow">YOUR COURSE</p><h2>{course?.title || 'A2 Refresh to B1 · telc Preparation'}</h2><p className="muted">Weekday evenings · 19:00–20:30 CET · Menschen B1</p></div></section>
      {error && <p className="notice">{error}</p>}
      {loading ? <p className="muted">Loading your classroom…</p> : lessons.length===0 ? <section className="empty-card"><h3>Your classroom is being prepared.</h3><p>The account and course database are connected. Lesson sessions will appear here once the course content has been added.</p></section> :
        <section className="lesson-panel"><div className="panel-head"><h3>Course roadmap</h3><div className="filters">{['all','A2','B1','completed'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f==='all'?'All':f==='completed'?'Completed':f}</button>)}</div></div>
          {false && openLesson && <section className="lesson-detail"><button className="text-button" onClick={()=>setOpenLesson(null)}>← Back to roadmap</button><p className="eyebrow">A2 REFRESH · LESSON 1</p><h2>{openLesson.sequence_no===1?'Sentence Structure':openLesson.title}</h2>{openLesson.sequence_no===1 ? <><h3>Learning goals</h3><ul><li>Recognise the finite verb in a German main clause.</li><li>Keep the conjugated verb in position 2 in a statement.</li><li>Use the time–manner–place order as a helpful starting point.</li></ul><h3>1. The verb is in position 2</h3><p>In a normal German statement, the conjugated verb occupies the second sentence element. The first element can be the subject, a time phrase or another piece of information.</p><div className="example-box"><b>Ich lerne heute Deutsch.</b><span>I am learning German today.</span><b>Heute lerne ich Deutsch.</b><span>Today I am learning German.</span><b>Am Abend lernt Rohan Deutsch.</b><span>In the evening, Rohan studies German.</span></div><p>Notice: when <i>Heute</i> or <i>Am Abend</i> comes first, the subject moves after the verb. The verb stays in position 2.</p><h3>2. Try it</h3><p>Choose the correct sentence for “Today I work at home.”</p><div className="quiz-options">{['Heute ich arbeite zu Hause.','Heute arbeite ich zu Hause.','Heute zu Hause ich arbeite.'].map(option=><button key={option} className={quizChoice===option?'selected':''} onClick={()=>setQuizChoice(option)}>{option}</button>)}</div>{quizChoice && <p className={quizChoice==='Heute arbeite ich zu Hause.'?'feedback-correct':'feedback-wrong'}>{quizChoice==='Heute arbeite ich zu Hause.'?'Correct! The conjugated verb arbeite is in position 2.':'Not quite. Remember: the conjugated verb must be the second sentence element.'}</p>}<h3>3. Your turn</h3><p>Write three sentences: one beginning with <i>Ich</i>, one with <i>Heute</i>, and one with <i>Am Wochenende</i>. Keep the conjugated verb in position 2.</p><div className="callout">This is the first original Deutschraum lesson prototype. More examples, practice types and the remaining lessons will be added progressively.</div></> : <><p>{openLesson.summary}</p><p>Full teaching content for this session is being developed. We'll add original explanations, examples, vocabulary and interactive practice before treating it as a complete lesson.</p></>}</section>}
                    {visible.map(lesson=><article className="lesson-row" key={lesson.id}><div className="lesson-date">{lesson.scheduled_date ? new Date(lesson.scheduled_date+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—'}</div><div className="lesson-copy"><b>{lesson.title}</b><p>{lesson.summary || lesson.level+' lesson'}</p><small>{lesson.level} · Session {lesson.sequence_no}</small><div className="lesson-actions"><button className="check-button" onClick={()=>openLessonPage(lesson)}>Open lesson</button><button className={completedIds.has(lesson.id)?'done-button':'check-button'} onClick={()=>toggle(lesson)}>{completedIds.has(lesson.id)?'Completed ✓':'Mark done'}</button></div></div></article>)}
        </section>}
      <footer className="footer">Deutschraum · Independent learning companion · Progress syncs to your account.</footer>
    </main>
  </div>
}

export default function App() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    if (!isSupabaseConfigured) { setChecking(false); return }
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setChecking(false)})
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return () => subscription.unsubscribe()
  }, [])
  if (!isSupabaseConfigured) return <main className="setup-screen"><h1>Deutschraum setup</h1><p>Add your Supabase project URL and publishable key to the environment variables to connect the classroom.</p></main>
  if (checking) return <main className="setup-screen">Opening your classroom…</main>
  return session ? <Dashboard session={session}/> : <AuthScreen/>
}
