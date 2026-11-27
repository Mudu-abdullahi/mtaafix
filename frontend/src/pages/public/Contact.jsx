
import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react'

const contactDetails = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'For questions and general enquiries.',
    value: 'Contact details coming soon',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'For assistance and enquiries.',
    value: 'Contact details coming soon',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: MapPin,
    title: 'Our Location',
    description: 'Serving community-focused initiatives.',
    value: 'Kenya',
    color: 'bg-amber-50 text-amber-700',
  },
]

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSubmitted(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    try {
      // Save each enquiry in this browser so it remains available after refresh.
      const storageKey = 'mtaafix_contact_messages'
      const existingMessages = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      )

      const newMessage = {
        id: `MSG-${Date.now()}`,
        ...form,
        submittedAt: new Date().toISOString(),
      }

      const messages = Array.isArray(existingMessages)
        ? existingMessages
        : []

      localStorage.setItem(
        storageKey,
        JSON.stringify([...messages, newMessage])
      )

      setSubmitted(true)
      setForm(initialForm)
    } catch (error) {
      console.error('Unable to save contact message:', error)
      setSubmitted(false)
      window.alert(
        'Your message could not be saved. Please check your browser storage and try again.'
      )
    }
  }

  return (
    <div className="overflow-hidden bg-[#F4F7F5] text-[#123B35]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#123B35] px-6 py-24 text-white md:py-28">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#16A085]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <MessageCircle size={16} />
            WE WOULD LOVE TO HEAR FROM YOU
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-tight md:text-6xl">
            Let's Start a
            <span className="block text-emerald-300">
              Conversation.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75">
            Have a question, suggestion or feedback about MtaaFix?
            Get in touch with us. Your ideas can help us build a better
            community reporting experience.
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">

          {/* LEFT SIDE */}
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
              Contact Information
            </span>

            <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
              We're Here to Listen.
            </h2>

            <p className="mt-5 leading-8 text-gray-500">
              Whether you need information about the platform, want to
              share feedback or have an idea for improvement, we'd like
              to hear from you.
            </p>

            <div className="mt-10 space-y-5">
              {contactDetails.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                      <Icon size={25} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                      <p className="mt-2 break-words text-sm font-semibold text-[#16A085]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* SUPPORT CARD */}
            <div className="mt-8 rounded-3xl bg-[#123B35] p-7 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 text-emerald-300">
                  <Headphones size={25} />
                </div>
                <h3 className="text-lg font-bold">We're Building for You</h3>
              </div>

              <p className="mt-4 leading-7 text-emerald-50/75">
                MtaaFix is designed to make community reporting easier
                and more transparent. Your feedback matters as the
                platform continues to grow.
              </p>

              <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-sm font-medium text-emerald-200">
                <ShieldCheck size={18} />
                Together, We Fix Our Communities.
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: CONTACT FORM */}
          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-emerald-950/5 md:p-10">

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#16A085]">
                Send an Enquiry
              </span>

              <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
                Send Us a Message
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Fill in the details below to prepare your message.
              </p>
            </div>

            {submitted && (
              <div
                role="status"
                className="mt-7 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
              >
                <CheckCircle2 size={21} className="shrink-0" />
                <p>
                  <span className="font-bold">Message saved successfully!</span>
                  {' '}Your enquiry has been stored in this browser. The MtaaFix
                  support team will not receive it until a backend service is connected.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full Name
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-200 bg-[#F9FBFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16A085] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-[#F9FBFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16A085] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="What would you like to discuss?"
                  className="w-full rounded-xl border border-gray-200 bg-[#F9FBFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16A085] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F9FBFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16A085] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#123B35] px-7 py-4 font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-1 hover:bg-[#16A085]"
              >
                Send Message
                <Send size={18} />
              </button>

              <p className="text-center text-xs leading-5 text-gray-400">
                Your message is saved in this browser using local storage.
                It is not sent to a support team or email address.
              </p>
            </form>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 rounded-3xl bg-[#E5F2EC] p-8 md:flex-row md:p-12">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Together, We Can Make a Difference.
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-gray-600">
              Become part of the MtaaFix community and help make
              neighbourhood problems more visible.
            </p>
          </div>

          <a
            href="/register"
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-[#123B35] px-7 py-4 font-bold text-white transition hover:bg-[#16A085]"
          >
            Join MtaaFix
            <ArrowRight size={19} />
          </a>
        </div>
      </section>

    </div>
  )
}
