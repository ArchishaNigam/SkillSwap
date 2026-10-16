import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { addSkill, removeSkill, updateProfile } from "../actions";

type Item = { skillId: string; note: string | null; skill: { name: string } };

function Column({ kind, title, hint, items }: { kind: "offer" | "want"; title: string; hint: string; items: Item[] }) {
  return (
    <section className="flyer p-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm">{hint}</p>
      <ul className="mt-3 space-y-2">
        {items.length === 0 && <li className="text-sm italic">Nothing here yet. Add your first skill below.</li>}
        {items.map((i) => (
          <li key={i.skillId} className="flex items-center justify-between gap-2">
            <span><span className="chip">{i.skill.name}</span>{i.note && <span className="ml-2 text-sm">{i.note}</span>}</span>
            <form action={removeSkill.bind(null, kind, i.skillId)}>
              <button className="text-sm underline" aria-label={`Remove ${i.skill.name}`}>Remove</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={addSkill.bind(null, kind)} className="tear flex flex-col gap-2">
        <input name="name" list="skills" required placeholder="Skill, e.g. guitar" className="field" aria-label="Skill name" />
        <input name="note" placeholder="Note (optional): beginner friendly, weekends only…" className="field" aria-label="Note" />
        <button className="btn">{kind === "offer" ? "Add to teach list" : "Add to learn list"}</button>
      </form>
    </section>
  );
}

export default async function Profile() {
  const user = await requireUser();
  const [me, skills] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { offers: { include: { skill: true } }, wants: { include: { skill: true } } },
    }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <datalist id="skills">{skills.map((s) => <option key={s.id} value={s.name} />)}</datalist>
      <form action={updateProfile} className="grid max-w-2xl gap-3 sm:grid-cols-2">
        <h1 className="text-4xl font-extrabold sm:col-span-2">Your profile</h1>
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" defaultValue={me.name} className="field" /></div>
        <div><label className="label" htmlFor="neighborhood">Neighborhood</label><input id="neighborhood" name="neighborhood" defaultValue={me.neighborhood} className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="bio">Bio</label><textarea id="bio" name="bio" rows={2} defaultValue={me.bio} className="field" /></div>
        <div className="sm:col-span-2"><button className="btn-ghost">Save profile</button></div>
      </form>
      <div className="grid gap-8 md:grid-cols-2">
        <Column kind="offer" title="I can teach" hint="Anything you could show someone in an hour." items={me.offers} />
        <Column kind="want" title="I want to learn" hint="Be specific. Matches get better the more you list." items={me.wants} />
      </div>
    </div>
  );
}
