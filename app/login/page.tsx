import Link from "next/link";
import { login } from "../actions";

export default function Login({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flyer mx-auto mt-6 max-w-sm p-6">
      <h1 className="text-3xl font-extrabold">Sign in</h1>
      {searchParams.error && (
        <p role="alert" className="mt-3 rounded-md border-2 border-ink bg-hot/30 p-2 text-sm">
          That email and password don&apos;t match. Check both and try again.
        </p>
      )}
      <form action={login} className="mt-4 space-y-3">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required className="field" /></div>
        <button className="btn w-full">Sign in</button>
      </form>
      <p className="tear text-sm">New here? <Link href="/register" className="font-semibold underline">Create a profile</Link></p>
    </div>
  );
}
