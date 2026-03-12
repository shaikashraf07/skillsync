import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import api from "@/api/axios";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

// ── Password rules ──────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  { id: "digit", label: "One number (0-9)", test: (p: string) => /\d/.test(p) },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (p: string) => /[^a-zA-Z0-9]/.test(p),
  },
];

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes

const Signup = () => {
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Steps: 1 = role select, 2 = signup form, 3 = OTP verification
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userType, setUserType] = useState<"candidate" | "recruiter" | null>(
    null,
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const dashPath =
      user.userType === "admin"
        ? "/dashboard/admin"
        : user.userType === "recruiter"
          ? "/dashboard/recruiter"
          : "/dashboard/candidate";
    return <Navigate to={dashPath} replace />;
  }

  const handleRoleSelect = (role: "candidate" | "recruiter") => {
    setUserType(role);
    setStep(2);
  };

  const passwordPassesAll = PASSWORD_RULES.every((r) => r.test(password));

  // ── Start countdown timer ──
  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Start resend cooldown (60s) ──
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Send OTP ──
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userType) return;

    if (!passwordPassesAll) {
      toast.error("Password does not meet the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      toast.success("Verification code sent to your email!");
      setStep(3);
      startCountdown(OTP_EXPIRY_SECONDS);
      startResendCooldown();
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Failed to send OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      toast.success("New verification code sent!");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      startCountdown(OTP_EXPIRY_SECONDS);
      startResendCooldown();
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Failed to resend OTP. Please try again.";
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Handle OTP input ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // take last char
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    const newDigits = [...otpDigits];
    for (let i = 0; i < OTP_LENGTH && i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    // Focus on the last filled input or the next empty one
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  // ── Verify OTP & Signup ──
  const handleVerifyAndSignup = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    if (!userType) return;

    setOtpLoading(true);
    try {
      // Step 1: Verify OTP
      const { data: verifyData } = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      // Step 2: Signup with verified token
      await signup(fullName, email, password, userType, verifyData.verifiedToken);
      toast.success("Account created!");

      if (userType === "candidate") {
        navigate("/onboarding/candidate");
      } else {
        navigate("/onboarding/recruiter");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "Verification failed. Please try again.";
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Format countdown ──
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Back button logic ──
  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else navigate("/");
  };

  return (
    <>
      <button
        onClick={handleBack}
        className="fixed top-5 left-5 z-50 flex items-center gap-1.5 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors bg-retro-beige/80 backdrop-blur-sm px-3 py-1.5 rounded-lg"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 1 ? "Back to Home" : "Back"}
      </button>

      <div className="min-h-screen bg-retro-beige paper-texture flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold font-heading text-retro-charcoal">
              {step === 3 ? "Verify Your Email" : "Create an Account"}
            </h1>
            <p className="text-retro-brown text-sm mt-1">
              {step === 3
                ? `We sent a code to ${email}`
                : "Join SkillSync today"}
            </p>
          </div>

          {/* ── Step 1: Role Selection ── */}
          {step === 1 && (
            <div className="polished-card-static p-8 space-y-6">
              <p className="text-center text-sm text-retro-charcoal font-medium">
                I am a…
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect("candidate")}
                  className="polished-card p-6 text-center cursor-pointer hover:border-retro-olive transition-colors group"
                >
                  <div className="text-3xl mb-2">🎓</div>
                  <h3 className="font-heading font-bold text-retro-charcoal group-hover:text-retro-olive transition-colors">
                    Candidate
                  </h3>
                  <p className="text-xs text-retro-brown mt-1">
                    Looking for internships & projects
                  </p>
                </button>
                <button
                  onClick={() => handleRoleSelect("recruiter")}
                  className="polished-card p-6 text-center cursor-pointer hover:border-retro-olive transition-colors group"
                >
                  <div className="text-3xl mb-2">🏢</div>
                  <h3 className="font-heading font-bold text-retro-charcoal group-hover:text-retro-olive transition-colors">
                    Recruiter
                  </h3>
                  <p className="text-xs text-retro-brown mt-1">
                    Posting opportunities & finding talent
                  </p>
                </button>
              </div>
              <p className="text-center text-sm text-retro-brown">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-retro-olive font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Signup Form ── */}
          {step === 2 && userType && (
            <form
              onSubmit={handleSendOtp}
              className="polished-card-static p-8 space-y-5"
            >
              {/* Role badge */}
              <div className="flex items-center gap-2 text-sm text-retro-brown mb-2">
                <span>Signing up as:</span>
                <span className="capitalize font-semibold text-retro-charcoal">
                  {userType}
                </span>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Full Name
                </label>
                <Input
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password with strength checklist */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                {(passwordFocused || password.length > 0) && (
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={rule.id}
                          className={`flex items-center gap-2 transition-colors ${
                            passed ? "text-green-600" : "text-retro-brown"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 shrink-0 text-retro-brown/50" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword.length > 0 && (
                  <p
                    className={`text-xs flex items-center gap-1.5 ${
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> Passwords do not
                        match
                      </>
                    )}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-gold rounded-xl"
                size="lg"
                disabled={loading || !passwordPassesAll}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending
                    Code…
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" /> Send Verification Code
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-retro-brown">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-retro-olive font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* ── Step 3: OTP Verification ── */}
          {step === 3 && (
            <div className="polished-card-static p-8 space-y-6">
              {/* Email icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-retro-olive/10 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-retro-olive" />
                </div>
              </div>

              <p className="text-center text-sm text-retro-brown">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-retro-charcoal">
                  {email}
                </span>
              </p>

              {/* OTP digit inputs */}
              <div
                className="flex justify-center gap-2"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-retro-brown/20 bg-white text-retro-charcoal focus:border-retro-olive focus:ring-2 focus:ring-retro-olive/20 outline-none transition-all"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Countdown timer */}
              {countdown > 0 && (
                <p className="text-center text-xs text-retro-brown">
                  Code expires in{" "}
                  <span className="font-semibold text-retro-charcoal">
                    {formatTime(countdown)}
                  </span>
                </p>
              )}
              {countdown === 0 && step === 3 && (
                <p className="text-center text-xs text-red-500 font-medium">
                  Code expired — please resend
                </p>
              )}

              {/* Verify button */}
              <Button
                onClick={handleVerifyAndSignup}
                className="w-full btn-gold rounded-xl"
                size="lg"
                disabled={
                  otpLoading ||
                  otpDigits.join("").length !== OTP_LENGTH ||
                  countdown === 0
                }
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Verify & Create
                    Account
                  </>
                )}
              </Button>

              {/* Resend link */}
              <p className="text-center text-sm text-retro-brown">
                Didn't receive the code?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-retro-brown/50">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="text-retro-olive font-semibold hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Signup;
