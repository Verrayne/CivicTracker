import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/auth";
import { signInAdmin } from "../../services/admin";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && isAdmin) return <Navigate to="/admin" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInAdmin(email, password);
      navigate("/admin", { replace: true });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="paper-grid grid min-h-[calc(100vh-180px)] place-items-center px-5 py-16">
      <Card className="w-full max-w-md p-7 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-civic-50 text-civic-800"><LockKeyhole className="h-6 w-6" /></span>
        <h1 className="mt-6 font-display text-3xl font-bold text-civic-950">Administrator login</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">Manage wards, issue records and municipal email delivery.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <Input label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <Button type="submit" loading={submitting} className="w-full">Sign in</Button>
        </form>
      </Card>
    </div>
  );
}
