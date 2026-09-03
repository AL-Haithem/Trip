import {useState, useEffect} from "react"
import {useNavigate, useSearchParams, Link, useLocation} from "react-router"

import "../styles/auth.css"
import Button from "../components/ui/Button.jsx"
import {Input} from "../components/ui/Input.jsx"
import {auth as authContent, brand} from "../content/siteContent.js"
import Icon from "../components/ui/Icon.jsx"

function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const initialView = searchParams.get("view") || (location.pathname === "/register" ? "register" : "login")
  const [view, setView] = useState(initialView === "register" ? "register" : "login")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const isSignup = view === "register"
    document.title = isSignup ? `Sign Up - ${brand.name}` : `Login - ${brand.name}`
  }, [view])

  useEffect(() => {
    const v = searchParams.get("view")
    if (v === "register" || v === "login") {
      setView(v)
      return
    }

    if (location.pathname === "/register") {
      setView("register")
      return
    }

    setView("login")
  }, [searchParams, location.pathname])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  const switchView = (next) => {
    const normalized = next === "register" ? "register" : "login"
    const target = normalized === "register" ? "/register" : "/login"

    setView(normalized)
    setSearchParams({view: normalized}, {replace: true})
    navigate(target, {replace: true})
  }

  const handleLogin = (e) => e.preventDefault()
  const handleRegister = (e) => e.preventDefault()
  const handleSendCode = () => setCodeSent(true)
  const handleReset = (e) => e.preventDefault()

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo"><Icon name="earth-americas" /></div>
          <h2>{view === "forgot" ? <><Icon name="key" /> Reset Password</> : <><Icon name="map" /> GEO · Trips</>}</h2>
          <p>
            {view === "login" && "Welcome back, traveler!"}
            {view === "register" && "Join as an agency or a traveler."}
            {view === "forgot" && "Securely reset your password."}
          </p>
        </div>

        {view !== "forgot" && (
          <div className="auth-tabs">
            <button className={`auth-tab ${view === "login" ? "active" : ""}`} onClick={() => switchView("login")}>
              <Icon name="right-to-bracket" /> Sign In
            </button>
            <button className={`auth-tab ${view === "register" ? "active" : ""}`} onClick={() => switchView("register")}>
              <Icon name="user-plus" /> Create Account
            </button>
          </div>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin}>
            <Input id="login-email" label="Email Address" type="text" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="login-password" label="Password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="auth-forgot-link" onClick={() => setView("forgot")}>Forgot Password?</span>
            <Button type="submit" variant="primary" block><Icon name="arrow-right-to-bracket" /> Login Now</Button>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister}>
            <Input id="reg-name" label="Full name" type="text" placeholder="Your FullName" value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="reg-email" label="Email Address" type="text" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="reg-phone" label="Phone" type="tel" placeholder="+123 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input id="reg-password" label="Password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input id="reg-confirm" label="Confirm Password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <span className="auth-forgot-link" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide password" : "Show password"}</span>
            <Button type="submit" variant="primary" block><Icon name="user-plus" /> Create Account</Button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleReset}>
            <button type="button" className="auth-back-btn" onClick={() => setView("login")}><Icon name="arrow-left" /> {authContent.backToLogin}</button>

            <Input id="forgot-email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

            {!codeSent ? (
              <Button type="button" variant="info" block onClick={handleSendCode}><Icon name="paper-plane" /> Send Reset Code</Button>
            ) : (
              <>
                <Input id="forgot-code" label="Reset Code" type="text" placeholder="6-digit code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} />
                <Input id="forgot-new" label="New Password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Input id="forgot-confirm" label="Confirm Password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <span className="auth-forgot-link" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide password" : "Show password"}</span>
                <Button type="submit" variant="primary" block><Icon name="key" /> Reset Password</Button>
              </>
            )}
          </form>
        )}

        <p className="auth-back-home">
          <Link to="/" className="auth-back-home-link">{authContent.backToHome}</Link>
        </p>
      </div>
    </div>
  )
}

export default Auth
