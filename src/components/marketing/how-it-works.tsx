const STEPS = [
  {
    number: '01',
    title: 'Type the topic',
    body: 'Anything from "sourdough baking" to "grief journaling for widowers". No keyword research, no setup, no spreadsheet.',
  },
  {
    number: '02',
    title: 'Read the score',
    body: 'Demand, competition and profit potential, each scored 0-100 and each opening up to show the raw inputs and the arithmetic that produced it.',
  },
  {
    number: '03',
    title: 'Get the verdict',
    body: 'GO, MAYBE or SKIP, with recommended prices per format, a monthly revenue range, and — when the shelf is crowded — the narrower angles worth taking instead.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section scroll-mt-16 border-b">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="h2 mt-3">Three steps. No spreadsheet.</h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <div className="tnum text-5xl font-semibold text-primary/20">{step.number}</div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
