import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPasswort] = useState('')
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
        setMessage(data.session ? 'Dein Konto wurde erstellt. Willkommen bei Deutschraum!' : 'Bitte bestätige dein Konto über die E-Mail und melde dich danach an.')
      } else {
        const { error } = await supabase.auth.signInWithPasswort({ email, password })
        if (error) throw error
      }
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }

  async function resetPasswort() {
    if (!email) { setMessage('Gib zuerst deine E-Mail-Adresse ein.'); return }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswortForEmail(email, {
      redirectTo: window.location.origin
    })
    setMessage(error ? error.message : 'Falls diese E-Mail-Adresse registriert ist, erhältst du in Kürze einen Link zum Zurücksetzen deines Passworts.')
    setBusy(false)
  }

  return <main className="auth-wrap">
    <section className="auth-card">
      <a className="brand" href="/">deutsch<span>raum</span></a>
      <p className="eyebrow">DEIN DEUTSCHKURS</p>
      <h1>{mode === 'signup' ? 'Konto erstellen.' : 'Willkommen zurück.'}</h1>
      <p className="muted">Lerne regelmäßig Deutsch. Dein Lernfortschritt wird in deinem Konto gespeichert.</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Dein Name<input value={name} onChange={e=>setName(e.target.value)} required autoComplete="name" /></label>}
        <label>E-Mail-Adresse<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>Passwort<input type="password" value={password} onChange={e=>setPasswort(e.target.value)} required minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} /></label>
        <button className="primary" disabled={busy}>{busy ? 'Einen Moment bitte …' : mode === 'signup' ? 'Konto erstellen' : 'Anmelden'}</button>
      </form>
      {mode === 'signin' && <button className="text-button" onClick={resetPasswort} disabled={busy}>Passwort vergessen?</button>}
      <p className="switch">{mode === 'signup' ? 'Du hast bereits ein Konto?' : 'Neu bei Deutschraum?'} <button className="text-button" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setMessage('')}}>{mode==='signup'?'Anmelden':'Create an account'}</button></p>
      {message && <p className="notice" role="status">{message}</p>}
      <p className="fineprint">Mit deiner Anmeldung nutzt du Deutschraum als unabhängige Lernplattform.</p>
    </section>
  </main>
}

function LessonWorkspace({ lesson, onBack, onComplete, completed }) {
  const [tab, setTab] = useState('Hören')
  const [answers, setAnswers] = useState({})
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState('')
  const [checked, setChecked] = useState(false)
  const [transcript, setTranscript] = useState(false)
  const [translations, setTranslations] = useState({})
  const [audioState, setAudioState] = useState('stopped')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const sections = ['Hören','Lesen','Schreiben','Sprechen','Grammatik & Wortschatz']
  const listening = [
    'Hallo, ich bin neu in der Stadt und kenne hier noch nicht viele Leute.',
    'Am Wochenende möchte ich gern etwas unternehmen. Hast du einen Tipp?',
    'Ja, wir treffen uns am Samstag mit Freunden im Park.',
    'Wenn du möchtest, kannst du mitkommen.',
    'Das klingt toll! Soll ich etwas mitbringen?',
    'Vielleicht einen kleinen Kuchen. Wir machen ein Picknick.'
  ]
  const reading = 'Als ich vor einem Jahr nach Freiburg gezogen bin, kannte ich dort niemanden. Am Anfang war es nicht leicht, neue Kontakte zu knüpfen. Deshalb habe ich mich in einem Sportverein angemeldet. Schon nach wenigen Wochen kannte ich viele Menschen. Besonders schön finde ich, dass wir nicht nur zusammen trainieren, sondern auch am Wochenende etwas unternehmen. Eine gute Freundschaft braucht meiner Meinung nach Zeit und gegenseitiges Vertrauen.'
  const sets = {
    Hören: [
      {q:'Was möchte die neue Person am Wochenende machen?',o:['Zu Hause bleiben.','Etwas mit anderen unternehmen.','Einkaufen gehen.'],a:1,e:'Die Person sagt: „Am Wochenende möchte ich gern etwas unternehmen.“',en:'The person wants to do something with other people.'},
      {q:'Wo treffen sich die Freunde?',o:['In einem Café.','Im Park.','Am Bahnhof.'],a:1,e:'Sie treffen sich im Park.',en:'They are meeting in the park.'},
      {q:'Was soll der Gast vielleicht mitbringen?',o:['Einen Kuchen.','Bücher.','Einen Fußball.'],a:0,e:'Vorgeschlagen wird ein kleiner Kuchen.',en:'The suggested item is a small cake.'}
    ],
    Lesen: [
      {q:'Warum ist die Person einem Sportverein beigetreten?',o:['Um eine Arbeit zu finden.','Um neue Menschen kennenzulernen.','Um Grammatik zu lernen.'],a:1,e:'Die Person wollte neue Kontakte knüpfen.',en:'The writer wanted to meet people and make new connections.'},
      {q:'Was machen die Mitglieder außer dem Training?',o:['Sie unternehmen am Wochenende etwas.','Sie reisen jeden Tag.','Sie lernen zusammen.',],a:0,e:'Sie unternehmen auch am Wochenende etwas zusammen.',en:'They also do activities together at weekends.'},
      {q:'Was braucht eine gute Freundschaft?',o:['Geld.','Zeit und gegenseitiges Vertrauen.','Die gleichen Hobbys.'],a:1,e:'Im Text stehen Zeit und gegenseitiges Vertrauen.',en:'The text says friendship needs time and mutual trust.'}
    ],
    'Grammatik & Wortschatz': [
      {q:'Ich freue mich ___ das Treffen.',o:['auf','an','mit'],a:0,e:'„Sich freuen auf“ steht mit dem Akkusativ.',en:'The expression „sich freuen auf“ takes the accusative.'},
      {q:'Welche Satzstellung ist richtig?',o:['Weil ich bin neu, suche ich Kontakte.','Weil ich neu bin, suche ich Kontakte.','Weil neu ich bin, suche ich Kontakte.'],a:1,e:'Im weil-Satz steht das konjugierte Verb am Ende.',en:'In a weil-clause, the conjugated verb goes at the end.'},
      {q:'Welche Formulierung leitet eine Meinung ein?',o:['Meiner Meinung nach …','Seit zwei Jahre …','Zum Beispiel gestern …'],a:0,e:'„Meiner Meinung nach“ ist eine nützliche Redewendung auf B1-Niveau.',en:'„Meiner Meinung nach“ is a useful way to introduce an opinion at B1 level.'},
      {q:'Wir treffen ___ am Samstag.',o:['uns','sich','euch'],a:0,e:'Das Reflexivpronomen zu „wir“ lautet „uns“.',en:'The reflexive pronoun used with „wir“ is „uns“.'}
    ]
  }
  const english = {
    Hören: {intro:'Höre zuerst auf die Hauptaussage und danach noch einmal auf Einzelheiten. Der Dialog übt Einladungen und Verabredungen.',task:'Höre dir den Dialog an. Beantworte anschließend die Fragen.',audio:'Deutscher Dialog · Hör genau zu',play:'Abspielen',pause:'Pause',resume:'Fortsetzen',stop:'Stopp',transcript:'Transkript anzeigen',hide:'Transkript ausblenden'},
    Lesen: {intro:'Lies den Text zuerst, um die Hauptaussage zu verstehen. Lies ihn danach noch einmal und achte auf Gründe und Einzelheiten.',task:'Lies den Text und beantworte anschließend die Fragen.'},
    Schreiben: {task:'Du bist vor Kurzem in eine neue Stadt gezogen. Schreibe eine E-Mail an eine Kollegin oder einen Kollegen. Berichte, wie du dich eingelebt hast. Beschreibe, wie du neue Menschen kennenlernst, und schlage ein gemeinsames Treffen vor. Schreibe 80–100 Wörter.',label:'Deine E-Mail',review:'Überprüfe deinen Text',checklist:['Hast du alle drei Aufgabenpunkte beantwortet?','Hast du eine passende Anrede und einen höflichen Schluss verwendet?','Hast du deine Ideen mit weil, deshalb, aber oder außerdem verbunden?','Hast du die Verbposition und die Großschreibung der Nomen überprüft?']},
    Sprechen: {intro:'Sprich 1–2 Minuten zu jeder Frage. Begründe deine Meinung und nenne Beispiele, statt nur kurz zu antworten.',task:'Beantworte die Fragen laut.'},
    'Grammatik & Wortschatz': {intro:'Wähle die richtige Antwort. Lies danach die Erklärung und versuche, einen eigenen Beispielsatz zu bilden.'}
  }
  const [showEnglish, setShowEnglish] = useState({})
  function translationButton(key, text) {
    return <div className="translation-control"><button type="button" className="text-button" onClick={()=>setShowEnglish(old=>({...old,[key]:!old[key]}))}>{showEnglish[key]?'Englische Übersetzung ausblenden':'Auf Englisch übersetzen'}</button>{showEnglish[key]&&<p className="translation-text">{text}</p>}</div>
  }
  function speakFrom(index) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(listening[index])
    utterance.lang = 'de-DE'; utterance.rate = 0.88
    utterance.onend = () => {
      if (index < listening.length - 1) speakFrom(index + 1)
      else setAudioState('stopped')
    }
    utterance.onerror = () => setAudioState('stopped')
    setSentenceIndex(index)
    setAudioState('playing')
    window.speechSynthesis.speak(utterance)
  }
  function pauseAudio() { if (window.speechSynthesis?.speaking) { window.speechSynthesis.pause(); setAudioState('paused') } }
  function resumeAudio() { if (window.speechSynthesis?.paused) { window.speechSynthesis.resume(); setAudioState('playing') } }
  function stopAudio() { window.speechSynthesis?.cancel(); setAudioState('stopped') }
  function seekAudio(value) { const index=Number(value); speakFrom(index) }
  useEffect(()=>()=>window.speechSynthesis?.cancel(),[])
  const qs = sets[tab] || []
  const score = qs.filter((q,i)=>answers[tab+i]===String(q.a)).length
  const done = qs.every((q,i)=>answers[tab+i]!==undefined)
  return <div className="app-shell lesson-page">
    <header className="topbar"><a className="brand" href="/">deutsch<span>raum</span></a><span>{lesson.level} · Einheit {lesson.sequence_no}</span></header>
    <main className="dashboard lesson-page-content">
      <button className="text-button back-link" onClick={onBack}>← Zurück zum Kursplan</button>
      <section className="lesson-hero"><p className="eyebrow">DEUTSCHRAUM · {lesson.level} · EINHEIT {lesson.sequence_no}</p><h1>{lesson.sequence_no===1?'Satzbau':lesson.title}</h1><p>{lesson.summary}</p><div className="lesson-meta"><span>90-Minuten-Lerneinheit</span><span>Vier Fertigkeiten + Sprachtraining</span></div></section>
      <nav className="skill-nav">{sections.map(x=><button key={x} className={tab===x?'active':''} onClick={()=>{setTab(x);setChecked(false)}}>{x}</button>)}</nav>
      <section className="skill-card"><div className="skill-heading"><div><p className="eyebrow">DEINE ÜBUNGEN</p><h2>{tab}</h2></div><span className="time-chip">{tab==='Schreiben'?'25 Min.':tab==='Sprechen'?'20 Min.':'15 Min.'}</span></div>
        {tab==='Hören' && <><p>{english.Hören.intro}</p>{translationButton('listen-intro',english.Hören.task)}<div className="audio-card"><b>{english.Hören.audio}</b><div className="audio-controls"><button className="primary" onClick={()=>speakFrom(0)} disabled={audioState==='playing'}>▶ {english.Hören.play}</button><button className="check-button" onClick={pauseAudio} disabled={audioState!=='playing'}>Ⅱ {english.Hören.pause}</button><button className="check-button" onClick={resumeAudio} disabled={audioState!=='paused'}>↻ {english.Hören.resume}</button><button className="check-button" onClick={stopAudio}>■ {english.Hören.stop}</button></div><label className="seek-control">Satz auswählen und abspielen <input type="range" min="0" max={listening.length-1} value={sentenceIndex} onChange={e=>seekAudio(e.target.value)} /><small>Satz {sentenceIndex+1} von {listening.length} · Du kannst direkt zu einem Satz springen.</small></label><small>Die Wiedergabe nutzt die deutsche Sprachsynthese deines Browsers. Du kannst pausieren, fortsetzen, stoppen oder ab einem beliebigen Satz starten.</small></div><button className="text-button" onClick={()=>setTranscript(!transcript)}>{transcript?'Transkript ausblenden':'Transkript nach dem Hören anzeigen'}</button>{transcript&&<blockquote className="transcript">{listening.join(' ')}</blockquote>}</>}
        {tab==='Lesen' && <><p>{english.Lesen.intro}</p>{translationButton('reading-intro',english.Lesen.task)}<div className="reading-passage">{reading}</div>{translationButton('reading-passage', 'When I moved to Freiburg a year ago, I did not know anyone there. At first, it was not easy to make new contacts. So I joined a sports club. After just a few weeks, I knew many people. I especially like that we not only train together but also do things at weekends. In my opinion, a good friendship needs time and mutual trust.') }<small>Originaler Lesetext von Deutschraum · B1</small></>}
        {tab==='Schreiben' && <><div className="task-box"><b>Schreibaufgabe · 80–100 Wörter</b><p>Du bist vor Kurzem in eine neue Stadt gezogen. Schreibe eine E-Mail an eine Kollegin oder einen Kollegen. Berichte, wie du dich eingelebt hast. Beschreibe, wie du neue Menschen kennenlernst, und schlage ein gemeinsames Treffen vor. Schreibe 80–100 Wörter.</p>{translationButton('writing-task',english.Schreiben.task)}</div><div className="phrase-list"><b>Nützliche Redemittel</b><p>Seit Kurzem wohne ich … · Am Anfang war es … · Inzwischen habe ich … · Hättest du Lust, …? · Ich freue mich auf deine Antwort.</p></div><label className="answer-label">Deine E-Mail<textarea rows={9} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Liebe/r …"/></label><p className="word-count">{draft.trim()?draft.trim().split(/\s+/).length:0} Wörter · Ziel: 80–100</p><button className="check-button" onClick={()=>setChecked(true)} disabled={!draft.trim()}>Checkliste zur Selbstkontrolle anzeigen</button>{checked&&<div className="feedback-panel"><b>Überprüfe deinen Text</b><ul>{english.Schreiben.checklist.map(item=><li key={item}>{item}</li>)}</ul><p>Eine automatische Textkorrektur ist noch nicht verfügbar. Nutze diese Checkliste zur Überarbeitung.</p></div>}</>}
        {tab==='Sprechen' && <><p>{english.Sprechen.intro}</p>{translationButton('speaking-intro',english.Sprechen.task)}<div className="task-box"><ol><li>Wie lernt man in einer neuen Stadt am besten Leute kennen?</li><li>Was ist dir bei einer Freundschaft besonders wichtig?</li><li>Erzähl von einer Situation, in der du jemanden neu kennengelernt hast.</li></ol></div><div className="phrase-list"><b>Nützliche Redemittel</b><p>Meiner Meinung nach … · Ein gutes Beispiel dafür ist … · Einerseits …, andererseits … · Ich habe die Erfahrung gemacht, dass …</p></div><label className="answer-label">Notizen oder Spracheingabe<textarea rows={6} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Schreibe oder diktiere deine Antwort …"/></label><small>Du kannst die Diktierfunktion deines Geräts verwenden, um deine Antwort festzuhalten.</small></>}
        {tab==='Grammatik & Wortschatz' && <p>{english[tab].intro}</p>}
        {qs.map((q,i)=><div className="question-card" key={q.q}><b>{i+1}. {q.q}</b>{translationButton('q-'+tab+i,q.en)}<div className="quiz-options">{q.o.map((o,j)=><button key={o} className={answers[tab+i]===String(j)?'selected':''} onClick={()=>setAnswers(old=>({...old,[tab+i]:String(j)}))}>{String.fromCharCode(65+j)}. {o}</button>)}</div>{checked&&<p className={answers[tab+i]===String(q.a)?'feedback-correct':'feedback-wrong'}>{answers[tab+i]===String(q.a)?'Richtig! ':'Noch einmal ansehen: '}{q.e}</p>}</div>)}
        {qs.length>0&&<div className="skill-footer"><span>{done?score+' / '+qs.length+' richtig':'Beantworte alle Fragen, um dein Ergebnis zu sehen'}</span><button className="primary" disabled={!done} onClick={()=>setChecked(true)}>Antworten überprüfen</button></div>}
      </section>
      <section className="lesson-completion"><div><b>Dein Lernfortschritt</b><p>Bearbeite alle vier Fertigkeiten und den Sprachfokus. Markiere danach die Einheit als abgeschlossen.</p></div><button className="primary" onClick={onComplete}>{completed?'Als offen markieren':'Einheit abschließen'}</button></section>
      <p className="footer">Originales Lernmaterial von Deutschraum · Unabhängige Lernplattform.</p>
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
    <header className="topbar"><a className="brand" href="/">deutsch<span>raum</span></a><div className="user-area"><span>{profile?.display_name || user.email}</span><button className="text-button" onClick={signOut}>Abmelden</button></div></header>
    <main className="dashboard">
      <section className="welcome"><div><p className="eyebrow">DEIN LERNRAUM · YOUR LEARNING SPACE</p><h1>Schaffe Platz für <em>Deutsch.</em></h1><p className="muted">Dein Weg von der A2-Wiederholung zu mehr Sicherheit auf B1-Niveau und zur telc-Prüfung.</p></div>
        <div className="progress-card"><span className="eyebrow">KURSFORTSCHRITT</span><strong>{percent}%</strong><div className="progress-track"><i style={{width:percent+'%'}} /></div><small>{completedIds.size} von {lessons.length} Einheiten abgeschlossen</small></div>
      </section>
      <section className="course-heading"><div><p className="eyebrow">DEIN KURS</p><h2>{course?.title || 'A2 Refresh to B1 · telc Preparation'}</h2><p className="muted">Werktags abends · 19:00–20:30 Uhr · Menschen B1</p></div></section>
      {error && <p className="notice">{error}</p>}
      {loading ? <p className="muted">Dein Kursraum wird geladen …</p> : lessons.length===0 ? <section className="empty-card"><h3>Dein Kursraum wird vorbereitet.</h3><p>Dein Konto und die Kursdatenbank sind verbunden. Die Einheiten erscheinen hier, sobald die Kursinhalte bereitstehen.</p></section> :
        <section className="lesson-panel"><div className="panel-head"><h3>Kursplan</h3><div className="filters">{['all','A2','B1','completed'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f==='all'?'Allee':f==='completed'?'Abgeschlossen':f}</button>)}</div></div>
          {false && openLesson && <section className="lesson-detail"><button className="text-button" onClick={()=>setOpenLesson(null)}>← Back to roadmap</button><p className="eyebrow">A2 REFRESH · LESSON 1</p><h2>{openLesson.sequence_no===1?'Sentence Structure':openLesson.title}</h2>{openLesson.sequence_no===1 ? <><h3>Learning goals</h3><ul><li>Recognise the finite verb in a German main clause.</li><li>Keep the conjugated verb in position 2 in a statement.</li><li>Use the time–manner–place order as a helpful starting point.</li></ul><h3>1. The verb is in position 2</h3><p>In a normal German statement, the conjugated verb occupies the second sentence element. The first element can be the subject, a time phrase or another piece von information.</p><div className="example-box"><b>Ich lerne heute Deutsch.</b><span>I am learning German today.</span><b>Heute lerne ich Deutsch.</b><span>Today I am learning German.</span><b>Am Abend lernt Rohan Deutsch.</b><span>In the evening, Rohan studies German.</span></div><p>Notice: when <i>Heute</i> or <i>Am Abend</i> comes first, the subject moves after the verb. The verb stays in position 2.</p><h3>2. Try it</h3><p>Choose the correct sentence for “Today I work at home.”</p><div className="quiz-options">{['Heute ich arbeite zu Hause.','Heute arbeite ich zu Hause.','Heute zu Hause ich arbeite.'].map(option=><button key={option} className={quizChoice===option?'selected':''} onClick={()=>setQuizChoice(option)}>{option}</button>)}</div>{quizChoice && <p className={quizChoice==='Heute arbeite ich zu Hause.'?'feedback-correct':'feedback-wrong'}>{quizChoice==='Heute arbeite ich zu Hause.'?'Correct! The conjugated verb arbeite is in position 2.':'Not quite. Remember: the conjugated verb must be the second sentence element.'}</p>}<h3>3. Your turn</h3><p>Write three sentences: one beginning with <i>Ich</i>, one with <i>Heute</i>, and one with <i>Am Wochenende</i>. Keep the conjugated verb in position 2.</p><div className="callout">This is the first original Deutschraum lesson prototype. More examples, practice types and the remaining lessons will be added progressively.</div></> : <><p>{openLesson.summary}</p><p>Full teaching content for this session is being developed. We'll add original explanations, examples, vocabulary and interactive practice before treating it as a complete lesson.</p></>}</section>}
                    {visible.map(lesson=><article className="lesson-row" key={lesson.id}><div className="lesson-date">{lesson.scheduled_date ? new Date(lesson.scheduled_date+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'short'}) : '—'}</div><div className="lesson-copy"><b>{lesson.title}</b><p>{lesson.summary || lesson.level+' lesson'}</p><small>{lesson.level} · Session {lesson.sequence_no}</small><div className="lesson-actions"><button className="check-button" onClick={()=>openLessonPage(lesson)}>Einheit öffnen</button><button className={completedIds.has(lesson.id)?'done-button':'check-button'} onClick={()=>toggle(lesson)}>{completedIds.has(lesson.id)?'Abgeschlossen ✓':'Als erledigt markieren'}</button></div></div></article>)}
        </section>}
      <footer className="footer">Deutschraum · Unabhängige Lernplattform · Dein Lernfortschritt wird gespeichert.</footer>
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
