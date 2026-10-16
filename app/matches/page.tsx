import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getMatches } from "@/lib/matching";
import { sendRequest } from "../actions";

export default async function Matches({ searchParams }: { searchParams: { nearby?: string } }) {
  const user = await requireUser();
  const nearby = searchParams.nearby === "1";
  const { me, matches } = await getMatches(user.id, nearby);
  const pending = await prisma.swapRequest.findMany({
    where: { fromUserId: user.id, status: "pending" },
    select: { toUserId: true },
  });
  const requested = new Set(pending.map((p) => p.toUserId));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-extrabold">Your matches</h1>
        <div className="flex gap-2">
          <Link href="/matches" className={nearby ? "btn-ghost" : "btn"}>Everyone</Link>
          <Link href="/matches?nearby=1" className={nearby ? "btn" : "btn-ghost"}>
            {me.neighborhood ? `Only ${me.neighborhood}` : "My neighborhood"}
          </Link>
        </div>
      </div>

      {matches.length === 0 && (
        <p className="mt-8 max-w-md">
          No matches yet. {nearby ? "Try Everyone, or " : ""}
          <Link href="/profile" className="font-semibold underline">add skills to your profile</Link> so we have something to match.
        </p>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {matches.map((m, i) => (
          <article key={m.user.id} className={`flyer p-5 ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold">{m.user.name}</h2>
                <p className="text-sm">{m.user.neighborhood || "No neighborhood listed"}</p>
              </div>
              {m.mutual && <span className="rounded-md border-2 border-ink bg-hot px-2 py-0.5 text-sm font-bold">Mutual match</span>}
            </div>
            {m.theyTeach.length > 0 && (
              <p className="mt-4 text-sm font-semibold">
                Can teach you <span className="ml-1 inline-flex flex-wrap gap-1">{m.theyTeach.map((s) => <span key={s.id} className="chip">{s.name}</span>)}</span>
              </p>
            )}
            {m.theyWant.length > 0 && (
              <p className="mt-3 text-sm font-semibold">
                Wants to learn <span className="ml-1 inline-flex flex-wrap gap-1">{m.theyWant.map((s) => <span key={s.id} className="chip">{s.name}</span>)}</span>
              </p>
            )}
            <div className="tear">
              {requested.has(m.user.id) ? (
                <p className="text-sm font-semibold">Request sent. Check your inbox for a reply.</p>
              ) : (
                <form action={sendRequest} className="space-y-2">
                  <input type="hidden" name="toUserId" value={m.user.id} />
                  {m.theyWant.length > 0 && <input type="hidden" name="offeredSkillId" value={m.theyWant[0].id} />}
                  {m.theyTeach.length > 0 && <input type="hidden" name="wantedSkillId" value={m.theyTeach[0].id} />}
                  <input name="message" maxLength={500} placeholder={`Say hi to ${m.user.name.split(" ")[0]}…`} className="field" aria-label="Message" />
                  <button className="btn">
                    {m.mutual
                      ? `Swap ${m.theyWant[0].name} for ${m.theyTeach[0].name}`
                      : m.theyTeach.length
                        ? `Ask to learn ${m.theyTeach[0].name}`
                        : `Offer to teach ${m.theyWant[0].name}`}
                  </button>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
