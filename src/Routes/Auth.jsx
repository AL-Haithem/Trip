import {useState, useEffect} from "react"
import {useNavigate, useSearchParams, Link} from "react-router"

import "../styles/auth.css"
import Button from "../components/ui/Button.jsx"
import {Input} from "../components/ui/Input.jsx"
import {login, register, requestPasswordReset, confirmPasswordReset} from "../services/mockApi.js"
import {auth as authContent} from "../content/siteContent.js"
import Icon from "../components/ui/Icon.jsx"

function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialView = searchParams.get("view") || "login"
  const [view, setView] = useState(initialView === "register" ? "register" : "login")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({text: "", isError: false})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const v = searchParams.get("view")
    if (v === "register" || v === "login") setView(v)
  }, [searchParams])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  const showMsg = (text, isError = false) => setMessage({text, isError})

  const switchView = (next) => {
    setView(next)
    showMsg("")
    setSearchParams({view: next === "register" ? "register" : "login"})
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    showMsg("")
    try {
      await login(email.trim().toLowerCase(), password)
      showMsg("Login successful! Redirecting...", false)
      setTimeout(() => navigate("/map", {replace: true}), 900)
    } catch (err) {
      showMsg(err.message || "Invalid email or password.", true)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    showMsg("")
    if (password.length < 6) {
      showMsg("Password must be at least 6 characters.", true)
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      showMsg("Passwords do not match.", true)
      setLoading(false)
      return
    }
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        phone: phone.trim(),
      })
      showMsg("Account created! Please sign in.", false)
      setTimeout(() => switchView("login"), 1400)
    } catch (err) {
      showMsg(err.message || "Registration failed.", true)
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (!email) return showMsg("Please enter your email first.", true)
    setLoading(true)
    showMsg("")
    try {
      const {code} = await requestPasswordReset(email.trim().toLowerCase())
      setCodeSent(true)
      showMsg(`Reset code sent (dev): ${code}`, false)
    } catch (err) {
      showMsg(err.message || "Failed to send code.", true)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return showMsg("Passwords do not match.", true)
    }
    setLoading(true)
    showMsg("")
    try {
      await confirmPasswordReset(email.trim().toLowerCase(), resetCode, newPassword)
      showMsg("Password reset! Please sign in.", false)
      setTimeout(() => {
        switchView("login")
        setResetCode("")
        setNewPassword("")
        setConfirmPassword("")
        setCodeSent(false)
      }, 1500)
    } catch (err) {
      showMsg(err.message || "Failed to reset password.", true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo"><Icon name="earth-americas" /></div>
          <h2>{view === "forgot" ? "Reset Password" : "GEO · Trips"}</h2>
          <p>
            {view === "login" && "Welcome back, traveler!"}
            {view === "register" && "Join as an agency or a traveler."}
            {view === "forgot" && "Securely reset your password."}
          </p>
        </div>

        {view !== "forgot" && (
          <div className="auth-tabs">
            <button className={`auth-tab ${view === "login" ? "active" : ""}`} onClick={() => switchView("login")}>Sign In</button>
            <button className={`auth-tab ${view === "register" ? "active" : ""}`} onClick={() => switchView("register")}>Create Account</button>
          </div>
        )}

        {message.text && (
          <div className={`auth-message ${message.isError ? "error" : "success"}`}>{message.text}</div>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin}>
            <Input id="login-email" label="Email Address" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="login-password" label="Password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="auth-forgot-link" onClick={() => { setView("forgot"); showMsg("") }}>Forgot Password?</span>
            <Button type="submit" variant="primary" block loading={loading}>Login Now</Button>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister}>
            <Input id="reg-name" label="Full name" type="text" placeholder="Your FullName" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="reg-email" label="Email Address" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="reg-phone" label="Phone" type="tel" placeholder="+123 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input id="reg-password" label="Password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input id="reg-confirm" label="Confirm Password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <span className="auth-forgot-link" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide password" : "Show password"}</span>
            <Button type="submit" variant="primary" block loading={loading}>Create Account</Button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleReset}>
            <button type="button" className="auth-back-btn" onClick={() => { setView("login"); showMsg("") }}><Icon name="arrow-left" /> {authContent.backToLogin}</button>

            <Input id="forgot-email" label="Email Address" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />

            {!codeSent ? (
              <Button type="button" variant="info" block loading={loading} onClick={handleSendCode}>Send Reset Code</Button>
            ) : (
              <>
                <Input id="forgot-code" label="Reset Code" type="text" placeholder="6-digit code" required value={resetCode} onChange={(e) => setResetCode(e.target.value)} />
                <Input id="forgot-new" label="New Password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Input id="forgot-confirm" label="Confirm Password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <span className="auth-forgot-link" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide password" : "Show password"}</span>
                <Button type="submit" variant="primary" block loading={loading}>Reset Password</Button>
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
