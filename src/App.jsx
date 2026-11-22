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

function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const user = session.user

  useEffect(() => { load() }, [user.id])

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
          {visible.map(lesson=><article className="lesson-row" key={lesson.id}><div className="lesson-date">{lesson.scheduled_date ? new Date(lesson.scheduled_date+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—'}</div><div className="lesson-copy"><b>{lesson.title}</b><p>{lesson.summary || lesson.level+' lesson'}</p><small>{lesson.level} · Session {lesson.sequence_no}</small></div><button className={completedIds.has(lesson.id)?'done-button':'check-button'} onClick={()=>toggle(lesson)}>{completedIds.has(lesson.id)?'Completed ✓':'Mark done'}</button></article>)}
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
