import Reveal from "./Reveal";
import { ShieldCheck, Lock, HomeIcon, Concierge } from "./icons";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified hosts",
    body: "Each home is inspected in person and the host identity confirmed.",
    tint: "bg-teal-mist text-teal-soft",
  },
  {
    icon: Lock,
    title: "Secure payments",
    body: "Pay safely online. Funds are released to hosts only after check-in.",
    tint: "bg-terracotta-soft text-terracotta",
  },
  {
    icon: HomeIcon,
    title: "Handpicked homes",
    body: "A curated collection — only the most characterful homes across Kenya.",
    tint: "bg-[#efe6d6] text-gold",
  },
  {
    icon: Concierge,
    title: "24/7 concierge",
    body: "Private chefs, transfers, excursions — arranged before you arrive.",
    tint: "bg-teal-mist text-teal",
  },
];

export default function WhyCityStays() {
  return (
    <Reveal as="section" id="why" className="bg-sand px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="reveal mx-auto max-w-7xl rounded-[28px] bg-sand-light p-7 shadow-[0_30px_80px_-40px_rgba(38,37,33,0.3)] sm:p-12 lg:p-16">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="reveal">
            <p className="eyebrow text-terracotta">Why City Stays</p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] text-ink-deep">
              A higher standard of stay — without the friction
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
              Every home is visited and verified by our team. Every booking is
              protected. Every guest gets a dedicated concierge. That&apos;s the
              City Stays promise.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="reveal">
                <span
                  className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${f.tint}`}
                >
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-ink-deep">{f.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
