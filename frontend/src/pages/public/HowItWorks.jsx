
import { Link } from 'react-router-dom'
import {
  Camera,
  BrainCircuit,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ClipboardList,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Identify a Problem',
    description:
      'Notice a community problem such as a pothole, broken streetlight, garbage or blocked drainage.',
    detail: 'Start by identifying an issue that needs attention in your neighbourhood.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    number: '02',
    icon: MapPin,
    title: 'Submit a Report',
    description:
      'Describe the problem, select its category and provide the location so administrators can understand the issue.',
    detail: 'Your report helps communicate what happened and where assistance is needed.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    number: '03',
    icon: BrainCircuit,
    title: 'AI Assistance',
    description:
      'AI-powered classification, severity suggestions and duplicate detection are planned for a future MtaaFix upgrade.',
    detail: 'This capability is planned and is not yet active.',
    color: 'bg-violet-50 text-violet-700',
    planned: true,
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Report Verification',
    description:
      'Administrators review submitted reports, verify valid issues and coordinate the appropriate response.',
    detail: 'This helps ensure reports follow an organised review process.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    number: '05',
    icon: Wrench,
    title: 'Problem Resolution',
    description:
      'Technicians receive assignments, accept jobs, carry out the work and submit completion notes.',
    detail: 'Progress is updated through the technician workflow.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    number: '06',
    icon: CheckCircle2,
    title: 'Community Confirmation',
    description:
      'Citizens can follow the report status and confirm whether a reported problem has been resolved.',
    detail: 'The aim is to close the loop between reporting and resolution.',
    color: 'bg-green-50 text-green-700',
  },
]

const participants = [
  {
    icon: Users,
    title: 'Citizens',
    description:
      'Identify local challenges, submit reports and follow their progress.',
  },
  {
    icon: ShieldCheck,
    title: 'Administrators',
    description:
      'Review reports, verify issues and coordinate technician assignments.',
  },
  {
    icon: Wrench,
    title: 'Technicians',
    description:
      'Accept assigned jobs, carry out repairs and update completion details.',
  },
]

export default function HowItWorks() {
  return (
    <div className="overflow-hidden bg-[#F4F7F5] text-[#123B35]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#123B35] px-6 py-24 text-white md:py-32">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#16A085]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <Sparkles size={16} />
            SIMPLE. TRANSPARENT. ACCOUNTABLE.
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            How MtaaFix
            <span className="block text-emerald-300">
              Works.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75">
            From identifying a neighbourhood problem to tracking its
            resolution, MtaaFix connects the people and processes
            that help communities move forward.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#16A085] px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#123B35]"
            >
              Report a Problem
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-4 font-bold transition hover:bg-white/10"
            >
              About MtaaFix
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS INTRO */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 md:justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList size={25} className="text-[#16A085]" />
            <span className="font-bold">Report an Issue</span>
          </div>

          <ArrowRight className="hidden text-gray-300 md:block" />

          <div className="flex items-center gap-3">
            <ShieldCheck size={25} className="text-[#16A085]" />
            <span className="font-bold">Review and Assign</span>
          </div>

          <ArrowRight className="hidden text-gray-300 md:block" />

          <div className="flex items-center gap-3">
            <Wrench size={25} className="text-[#16A085]" />
            <span className="font-bold">Work Towards Resolution</span>
          </div>
        </div>
      </section>

      {/* SIX STEPS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              The Process
            </span>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              Six Steps Towards Change
            </h2>

            <p className="mt-5 leading-7 text-gray-500">
              Every stage has a purpose, helping community concerns
              move through an organised reporting and response process.
            </p>
          </div>

          <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <div
                  key={step.number}
                  className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}>
                      <Icon size={30} />
                    </div>

                    <span className="text-4xl font-extrabold text-gray-100 transition group-hover:text-emerald-100">
                      {step.number}
                    </span>
                  </div>

                  {step.planned && (
                    <span className="mt-6 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                      Planned feature
                    </span>
                  )}

                  <h3 className="mt-6 text-xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-500">
                    {step.description}
                  </p>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <p className="text-sm leading-6 text-gray-400">
                      {step.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PEOPLE INVOLVED */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              Working Together
            </span>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              Three Roles. One Shared Goal.
            </h2>

            <p className="mt-5 leading-7 text-gray-500">
              MtaaFix brings together the people involved in identifying,
              reviewing and addressing community problems.
            </p>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {participants.map((person) => {
              const Icon = person.icon

              return (
                <div
                  key={person.title}
                  className="rounded-3xl border border-gray-100 bg-[#F4F7F5] p-8 text-center transition hover:-translate-y-2 hover:shadow-lg"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-[#16A085]">
                    <Icon size={30} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {person.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-500">
                    {person.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl bg-[#E5F2EC] p-8 md:grid-cols-2 md:p-12">

          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#16A085]">
              <Clock size={28} />
            </div>

            <h2 className="mt-7 text-3xl font-extrabold md:text-4xl">
              Stay Informed at Every Stage.
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              MtaaFix gives citizens a way to follow their submitted
              reports while administrators and technicians manage
              the work required to address them.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm">
            {[
              { label: 'Report Submitted', done: true },
              { label: 'Under Review', done: true },
              { label: 'Assigned to Technician', done: true },
              { label: 'Work in Progress', done: false },
              { label: 'Resolved', done: false },
            ].map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 py-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-emerald-100 text-[#16A085]' : 'bg-gray-100 text-gray-400'}`}>
                  {item.done ? <CheckCircle2 size={20} /> : <span className="text-sm font-bold">{index + 1}</span>}
                </div>

                <div className="flex-1">
                  <p className={`font-semibold ${item.done ? 'text-[#123B35]' : 'text-gray-400'}`}>
                    {item.label}
                  </p>
                </div>

                {item.done && (
                  <span className="text-xs font-bold text-[#16A085]">
                    Example
                  </span>
                )}
              </div>
            ))}
            <p className="mt-3 text-xs text-gray-400">
              Illustrative workflow, not a live report.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#123B35] px-6 py-24 text-center text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#16A085]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
            <Users size={32} />
          </div>

          <h2 className="mt-7 text-3xl font-extrabold md:text-5xl">
            Your Community Needs Your Voice.
          </h2>

          <p className="mt-6 text-lg leading-8 text-emerald-50/75">
            Take the first step. Report a problem, follow its progress
            and help build a better community.
          </p>

          <Link
            to="/register"
            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#16A085] px-8 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#123B35]"
          >
            Get Started Today
            <ArrowRight size={19} />
          </Link>

          <p className="mt-6 text-sm text-emerald-100/60">
            Together, We Fix Our Communities.
          </p>
        </div>
      </section>

    </div>
  )
}
