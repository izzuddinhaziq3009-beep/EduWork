const BENEFITS = [
  { title: 'Industry Expert Instructors', desc: 'Learn directly from mentors and professionals working in the field.', icon: '🎓' },
  { title: 'Certificate of Completion',   desc: 'Showcase verified skills with a certificate for every completed module.', icon: '📜' },
  { title: 'Learn at Your Pace',          desc: 'Structured paths and flexible modules that fit around your schedule.', icon: '⏱️' },
  { title: 'Mentorship Available',        desc: 'Get paired with a mentor for 1:1 guidance and project reviews.', icon: '🤝' },
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 px-6 lg:px-8 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white tracking-tight">Why learn with EduWork</h2>
          <p className="text-slate-400 mt-2">Everything you need to go from learner to industry-ready.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(b => (
            <div key={b.title}
              className="bg-gray-800 border border-white/10 rounded-2xl p-6 text-center hover:border-indigo-500/40 transition-colors duration-300">
              <div className="text-3xl mb-3" aria-hidden>{b.icon}</div>
              <h3 className="text-white font-semibold text-[15px] mb-2">{b.title}</h3>
              <p className="text-slate-400 text-[13px] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
