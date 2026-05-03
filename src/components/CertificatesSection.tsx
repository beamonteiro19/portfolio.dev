import { type Certificate } from "../models/Certificate";
import certificates from "../data/certificates.json";

const categoryColors: Record<string, string> = {
  Security: "bg-red-500/10 border-red-500/20 text-red-400",
  React: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  Backend: "bg-green-500/10 border-green-500/20 text-green-400",
  TypeScript: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  Database: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  JavaScript: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export function CertificatesSection() {
  const certs = certificates as Certificate[];

  return (
    <section id="certificates" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16">
          <p className="text-[8px] sm:text-[9px] font-black text-[#8F3985] tracking-[.4em] sm:tracking-[.5em] uppercase mb-4">
            Formação Contínua
          </p>
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase leading-none">
            Certificações
            <br />
            <span className="text-[#8F3985] text-gradient">Alura</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {certs.map((cert) => (
            <a
              key={cert.id}
              href={cert.verificationUrl}
              className="group relative overflow-hidden bg-white/[0.02] border border-white/10 p-5 sm:p-6 flex flex-col justify-between hover:border-[#8F3985]/50 transition-all duration-300 min-h-[280px] sm:min-h-[300px]"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8F3985]/0 to-[#8F3985]/0 group-hover:from-[#8F3985]/5 group-hover:to-[#8F3985]/10 transition-all duration-300 z-0" />

              {/* Content */}
              <div className="relative z-10">
                {/* Category Badge */}
                <div className="mb-4 inline-block">
                  <span
                    className={`text-[10px] font-black tracking-[.3em] uppercase px-3 py-1 rounded-full border ${
                      categoryColors[cert.category] || "bg-white/5 border-white/10 text-white/60"
                    }`}
                  >
                    {cert.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black italic uppercase mb-3 leading-tight group-hover:text-[#8F3985] transition-colors duration-300">
                  {cert.title}
                </h3>

                {/* Description */}
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                  {cert.description}
                </p>
              </div>

              {/* Footer */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {cert.institution}
                  </p>
                  <p className="text-[12px] font-bold text-[#8F3985] italic">
                    {cert.date}
                  </p>
                </div>

                {/* Arrow icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#8F3985] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-white/40 text-sm mb-4">
            Sempre aprendendo e me desenvolvendo
          </p>
          <a
            href="https://www.alura.com.br/user/beamonteiro19"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[10px] font-black tracking-[.3em] border border-[#8F3985] text-[#8F3985] px-6 py-3 rounded hover:bg-[#8F3985] hover:text-black transition-all uppercase"
          >
            Ver Perfil Completo na Alura
          </a>
        </div>
      </div>
    </section>
  );
}
