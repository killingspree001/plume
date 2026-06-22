import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Features />
      <Realtime />
      <Closing />
      <Footer />
    </div>
  );
}

function Wordmark() {
  return (
    <span className="font-display text-xl font-semibold tracking-tight text-ink">
      Plume
    </span>
  );
}

function Nav() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <Feather />
        <Wordmark />
      </div>
      <div className="flex items-center gap-5 text-sm">
        <Link href="/login" className="text-ink/70 hover:text-ink">
          Sign in
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-clay-500 px-5 py-2 font-semibold text-paper shadow-sm transition hover:bg-clay-600"
        >
          Start writing
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-12 px-6 pb-10 pt-12 lg:grid-cols-2 lg:pt-20">
      <div>
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-clay-200 bg-clay-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-clay-700">
          Live &amp; shared
        </p>
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          A calm place for your{" "}
          <span className="italic text-clay-600">notes</span> and{" "}
          <span className="italic text-clay-600">to-dos</span>.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
          Jot it down on your laptop and it&apos;s already on your phone. Share a
          board and watch a teammate&apos;s edits land as they type. No saving,
          no refreshing.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-clay-500 px-6 py-3 text-center font-semibold text-paper shadow-sm transition hover:bg-clay-600"
          >
            Start writing — free
          </Link>
          <a
            href="#how"
            className="rounded-full border border-ink/15 px-6 py-3 text-center font-semibold text-ink transition hover:bg-ink/5"
          >
            See it in motion
          </a>
        </div>
      </div>

      <NoteCollage />
    </section>
  );
}

function NoteCollage() {
  return (
    <div className="relative h-80 select-none sm:h-96">
      <Note
        className="left-2 top-4 -rotate-3 bg-paper"
        title="Groceries"
        lines={["Sourdough", "Olive oil", "Figs & honey"]}
      />
      <Note
        className="right-3 top-0 rotate-2 bg-honey-100"
        title="Today"
        lines={["Call the framer", "Ship the draft", "Water the plants"]}
        checks
      />
      <Note
        className="bottom-2 left-10 rotate-1 bg-clay-50"
        title="Ideas"
        lines={["A slower notebook", "Warmer colors", "Less, but better"]}
      />
      <div className="absolute bottom-6 right-6 flex items-center gap-1 rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs font-semibold text-ink/70 shadow-sm">
        <Avatar letter="A" className="bg-clay-500" />
        <Avatar letter="M" className="-ml-2 bg-honey-400" />
        <span className="ml-1">2 here now</span>
      </div>
    </div>
  );
}

function Note({
  className,
  title,
  lines,
  checks,
}: {
  className: string;
  title: string;
  lines: string[];
  checks?: boolean;
}) {
  return (
    <div
      className={`absolute w-44 rounded-2xl border border-ink/10 p-4 shadow-[0_10px_30px_-12px_rgba(44,38,34,0.35)] sm:w-52 ${className}`}
    >
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/75">
        {lines.map((line) => (
          <li key={line} className="flex items-center gap-2">
            {checks ? (
              <span className="flex h-4 w-4 items-center justify-center rounded border border-clay-300 text-[10px] text-clay-500">
                ✓
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-clay-400" />
            )}
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Features() {
  const items = [
    {
      title: "Notes and tasks together",
      body: "Keep loose thoughts and a tickable to-do list side by side on the same board.",
    },
    {
      title: "Boards for everything",
      body: "Work, home, a trip, a side project — spin up a board in a tap and color it your way.",
    },
    {
      title: "Yours, kept safe",
      body: "Sign in and your boards follow you to any device. Share only the ones you choose.",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-ink/10 bg-paper p-7"
          >
            <h3 className="font-display text-xl font-semibold text-ink">
              {item.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink/70">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Realtime() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-6 py-16">
      <div className="overflow-hidden rounded-3xl border border-ink/10 bg-ink px-8 py-14 text-cream">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-honey-300">
            The good part
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Everything updates the instant it changes
          </h2>
          <p className="mt-4 text-cream/70">
            Open Plume on two screens and type. The words appear in both places
            at once — that&apos;s real-time sync doing its quiet work.
          </p>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-center">
      <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">
        Start your first board
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-ink/70">
        It takes about ten seconds and costs nothing.
      </p>
      <Link
        href="/login"
        className="mt-7 inline-block rounded-full bg-clay-500 px-7 py-3 font-semibold text-paper shadow-sm transition hover:bg-clay-600"
      >
        Start writing
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-8 text-sm text-ink/50 sm:flex-row">
        <div className="flex items-center gap-2">
          <Feather />
          <Wordmark />
        </div>
        <p>Notes &amp; tasks that stay in sync.</p>
      </div>
    </footer>
  );
}

function Avatar({ letter, className }: { letter: string; className: string }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-paper ring-2 ring-paper ${className}`}
    >
      {letter}
    </span>
  );
}

function Feather() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay-500 font-display text-lg font-semibold text-paper">
      P
    </span>
  );
}
