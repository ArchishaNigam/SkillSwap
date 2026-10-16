import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { respondRequest } from "../actions";

type Req = Awaited<ReturnType<typeof load>>["received"][number];

async function load(userId: string) {
  const include = { from: true, to: true, offeredSkill: true, wantedSkill: true };
  const [received, sent] = await Promise.all([
    prisma.swapRequest.findMany({ where: { toUserId: userId }, include, orderBy: { createdAt: "desc" } }),
    prisma.swapRequest.findMany({ where: { fromUserId: userId }, include, orderBy: { createdAt: "desc" } }),
  ]);
  return { received, sent };
}

function describe(r: Req) {
  const give = r.offeredSkill?.name;
  const get = r.wantedSkill?.name;
  if (give && get) return `Teach ${give}, learn ${get}`;
  if (get) return `Wants to learn ${get}`;
  if (give) return `Offers to teach ${give}`;
  return "Open swap";
}

export default async function Inbox() {
  const user = await requireUser();
  const { received, sent } = await load(user.id);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-extrabold">Requests for you</h1>
        {received.length === 0 && <p className="mt-4">Nothing yet. Fill out your skill lists to show up in more matches.</p>}
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {received.map((r) => (
            <article key={r.id} className="flyer p-5">
              <h2 className="text-xl font-bold">{r.from.name}</h2>
              <p className="text-sm font-semibold">{describe(r)}</p>
              {r.message && <p className="mt-2">&ldquo;{r.message}&rdquo;</p>}
              <div className="tear">
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <form action={respondRequest.bind(null, r.id, "accepted")}><button className="btn">Accept</button></form>
                    <form action={respondRequest.bind(null, r.id, "declined")}><button className="btn-ghost">Decline</button></form>
                  </div>
                )}
                {r.status === "accepted" && <p className="font-semibold">Accepted. Email {r.from.name.split(" ")[0]} at <a className="underline" href={`mailto:${r.from.email}`}>{r.from.email}</a> to plan your swap.</p>}
                {r.status === "declined" && <p className="text-sm">Declined.</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold">Requests you sent</h2>
        {sent.length === 0 && <p className="mt-4">You haven&apos;t sent any. Head to Matches to start a swap.</p>}
        <ul className="mt-4 space-y-3">
          {sent.map((r) => (
            <li key={r.id} className="rounded-md border-2 border-ink bg-white p-3">
              <span className="font-semibold">{r.to.name}</span>: {describe(r)}.{" "}
              {r.status === "pending" && <span>Waiting for a reply.</span>}
              {r.status === "declined" && <span>Declined.</span>}
              {r.status === "accepted" && <span>Accepted. Email <a className="underline" href={`mailto:${r.to.email}`}>{r.to.email}</a>.</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
