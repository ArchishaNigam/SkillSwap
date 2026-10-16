import Link from "next/link";
import { register } from "../actions";

const errors: Record<string, string> = {
  invalid: "Add your name and email, and use a password of at least 8 characters.",
  taken: "That email already has a profile. Sign in instead.",
};

export default function Register({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams.error && errors[searchParams.error];
  return (
    <div className="flyer mx-auto mt-6 max-w-sm p-6">
      <h1 className="text-3xl font-extrabold">Join your neighborhood</h1>
      {error && <p role="alert" className="mt-3 rounded-md border-2 border-ink bg-hot/30 p-2 text-sm">{error}</p>}
      <form action={register} className="mt-4 space-y-3">
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required className="field" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" /></div>
        <div><label className="label" htmlFor="password">Password (8+ characters)</label><input id="password" name="password" type="password" minLength={8} required className="field" /></div>
        <div><label className="label" htmlFor="neighborhood">Neighborhood</label><input id="neighborhood" name="neighborhood" placeholder="e.g. Riverside" className="field" /></div>
        <button className="btn w-full">Create profile</button>
      </form>
      <p className="tear text-sm">Already have one? <Link href="/login" className="font-semibold underline">Sign in</Link></p>
    </div>
  );
}
