
import { Link } from 'react-router-dom'
import {
  Target,
  Eye,
  HeartHandshake,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Building2,
  MapPin,
  Handshake,
  Sparkles,
} from 'lucide-react'

const values = [
  {
    icon: HeartHandshake,
    title: 'Community First',
    description:
      'We believe meaningful change begins when residents have a voice in the issues affecting their neighbourhoods.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: ShieldCheck,
    title: 'Accountability',
    description:
      'We encourage transparent reporting and progress tracking so community concerns can be followed through.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'We bring citizens, administrators and technicians together around a shared goal: better communities.',
    color: 'bg-amber-50 text-amber-700',
  },
]

const focusAreas = [
  'Damaged roads and potholes',
  'Broken streetlights',
  'Blocked drainage systems',
  'Garbage and waste concerns',
  'Water leaks and exposed electrical wires',
]

export default function About() {
  return (
    <div className="overflow-hidden bg-[#F4F7F5] text-[#123B35]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#123B35] px-6 py-24 text-white md:py-32">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#16A085]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <Sparkles size={16} />
            ABOUT MTAAFIX
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Building Better Communities
            <span className="block text-emerald-300">
              Together.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-emerald-50/75">
            MtaaFix is a community problem reporting and accountability
            platform designed to connect citizens, administrators and
            technicians through a more transparent way of addressing
            neighbourhood challenges.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#16A085] px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#123B35]"
            >
              Join MtaaFix
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-4 font-bold transition hover:bg-white/10"
            >
              Explore How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">

          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              Who We Are
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
              Technology With a Community Purpose.
            </h2>

            <p className="mt-7 leading-8 text-gray-600">
              Every neighbourhood faces challenges that affect people's
              everyday lives. Damaged roads, broken streetlights, blocked
              drainage and poor waste management can make communities
              less safe and less comfortable.
            </p>

            <p className="mt-5 leading-8 text-gray-600">
              MtaaFix provides a structured digital platform where residents
              can report these issues, administrators can review and coordinate
              responses, and technicians can update the progress of assigned work.
            </p>

            <p className="mt-5 leading-8 text-gray-600">
              Our goal is simple: make community reporting easier, improve
              visibility into the response process and encourage shared
              responsibility for local improvement.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'A simple way to report local problems',
                'A clear process for reviewing and assigning reports',
                'Progress updates through the resolution journey',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={21}
                    className="mt-0.5 shrink-0 text-[#16A085]"
                  />
                  <p className="font-medium text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PURPOSE CARD */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-emerald-100/70 blur-2xl" />

            <div className="relative rounded-3xl bg-[#123B35] p-8 text-white shadow-2xl md:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <Building2 size={32} />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
                Our Purpose
              </p>

              <h3 className="mt-4 text-3xl font-extrabold leading-snug">
                Small Actions Can Create Lasting Community Change.
              </h3>

              <p className="mt-5 leading-8 text-emerald-50/75">
                When residents speak up, administrators respond and
                technicians take action, communities have a better way
                to move from identifying problems towards solutions.
              </p>

              <div className="mt-9 border-t border-white/15 pt-7">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#16A085]/20 p-3 text-emerald-300">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="font-bold">Local Issues. Shared Solutions.</p>
                    <p className="mt-1 text-sm text-emerald-50/60">
                      Together, We Fix Our Communities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              Our Direction
            </span>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              What Drives Us
            </h2>

            <p className="mt-5 leading-7 text-gray-500">
              Our mission and vision guide how we build technology
              that serves communities.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">

            <div className="rounded-3xl border border-emerald-100 bg-[#F4F7F5] p-9 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-[#16A085]">
                <Target size={32} />
              </div>

              <h3 className="mt-7 text-2xl font-extrabold">
                Our Mission
              </h3>

              <p className="mt-5 leading-8 text-gray-600">
                To make community problem reporting easier and more
                transparent by connecting residents, administrators
                and technicians through an accessible digital platform.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-[#F4F7F5] p-9 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-[#16A085]">
                <Eye size={32} />
              </div>

              <h3 className="mt-7 text-2xl font-extrabold">
                Our Vision
              </h3>

              <p className="mt-5 leading-8 text-gray-600">
                To contribute to communities where local challenges
                are visible, residents are heard and issues receive
                attention through responsible collaboration.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              Our Core Values
            </span>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              What Makes MtaaFix Different?
            </h2>

            <p className="mt-5 leading-7 text-gray-500">
              The principles behind our approach to community problem reporting.
            </p>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}>
                    <Icon size={30} />
                  </div>

                  <h3 className="mt-7 text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-500">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AREAS OF FOCUS */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">

          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              Areas of Focus
            </span>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              Issues That Affect Everyday Life
            </h2>

            <p className="mt-5 leading-8 text-gray-500">
              MtaaFix is designed to support reporting of common
              neighbourhood infrastructure and public-space concerns.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {focusAreas.map((area) => (
              <div
                key={area}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-[#F4F7F5] p-5"
              >
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-[#16A085]"
                />
                <span className="font-semibold text-gray-700">{area}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#123B35] px-6 py-24 text-center text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#16A085]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
            <Handshake size={32} />
          </div>

          <h2 className="mt-7 text-3xl font-extrabold md:text-5xl">
            Be Part of the Change.
          </h2>

          <p className="mt-6 text-lg leading-8 text-emerald-50/75">
            Every report is an opportunity to make a difference.
            Join a community that believes in taking action.
          </p>

          <Link
            to="/register"
            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#16A085] px-8 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#123B35]"
          >
            Become a Member
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>

    </div>
  )
}
