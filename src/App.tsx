import { useEffect, useMemo, useState } from "react";

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
}

function ContactSection() {
  const fullText = "VAMOS CONVERSAR?_";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    } else {
      const restartTimeout = setTimeout(() => {
        setDisplayText("");
        setIndex(0);
      }, 5000);
      return () => clearTimeout(restartTimeout);
    }
  }, [index]);

  return (
    <section id="contact" className="py-32 px-6 text-center">
      <p className="text-[9px] font-black tracking-[0.5em] text-[#8F3985] mb-6 uppercase">
        Interessado em desenvolver um projeto ou apenas bater um papo sobre tecnologia?
      </p>
      <a
        href="mailto:beatrizmonteirovieira@outlook.com"
        className="text-4xl md:text-5xl font-black italic hover:text-[#8F3985] transition-all tracking-tighter uppercase leading-none inline-block min-h-[1.2em]"
      >
        {displayText}
        <span className="animate-pulse ml-1 text-[#8F3985]">|</span>
      </a>
    </section>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/beamonteiro19/repos?sort=updated&per_page=100",
        );
        const data = await response.json();
        const starred = data.filter((repo: Repo) => repo.stargazers_count >= 0);
        setRepos(starred);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const workStatusLabel = useMemo(() => {
    const hour = now.getHours();
    return hour >= 9 && hour < 18
      ? "DISPONÍVEL PARA NOVOS PROJETOS"
      : "Olá, sou a Beatriz";
  }, [now]);

  const featuredRepos = useMemo(() => repos.slice(0, 3), [repos]);
  const otherRepos = useMemo(() => repos.slice(3), [repos]);

  return (
    <div className="min-h-screen text-slate-100 bg-[#0e0f18] selection:bg-[#8F3985] font-sans overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,_#10201a_0%,_#050d0a_100%)]" />
      <div
        className="pointer-events-none fixed inset-0 z-30 lg:block hidden"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(143, 57, 133, 0.12), transparent 80%)`,
        }}
      />
      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-[100] flex justify-between items-center px-8 py-5 backdrop-blur-md border-b border-white/5">
        <div className="text-base font-black tracking-tighter italic">
          B.MV<span className="text-[#8F3985]">_</span>
        </div>
        <div className="flex gap-6 text-[9px] font-bold tracking-[0.3em] uppercase">
          <a href="#about" className="hover:text-[#8F3985] transition-all">
            Sobre
          </a>
          <a href="#work" className="hover:text-[#8F3985] transition-all">
            Trabalhos
          </a>
          <a href="#contact" className="hover:text-[#8F3985] transition-all">
            Contato
          </a>
        </div>
        <div className="text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] hidden sm:block">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —
          SÃO PAULO
        </div>
      </nav>

      <main className="pt-24">
        {/* HERO */}
        <section className="px-6 flex flex-col items-center text-center py-20">
          <div className="mb-6 inline-block border border-[#8F3985]/50 px-3 py-1 rounded-full">
            <p className="text-[8px] font-black tracking-[.4em] text-[#8F3985] uppercase leading-none">
              {workStatusLabel}
            </p>
          </div>
          <h1 className="text-[8vw] sm:text-[7vw] font-black italic leading-[0.9] tracking-tighter uppercase">
            Fullstack <br />{" "}
            <span className="text-[#8F3985] text-gradient">Developer</span>
          </h1>
 
        </section>

        {/* SECTION: ABOUT */}
        <section
          id="about"
          className="py-32 px-6 border-t border-white/5 bg-white/[0.01]"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-[#8F3985] font-black text-[9px] tracking-[.5em] mb-4 uppercase">
                / minha trajetória
              </p>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight mb-8">
                Código com rigor <br /> técnico e foco em{" "}
                <span className="text-[#8F3985]">segurança</span>.
              </h2>
              <div className="space-y-6 text-white/50 text-sm leading-relaxed max-w-md text-justify">
                <p>
                  Minha jornada começou na área de{" "}
                  <span className="text-white italic">
                    Equipamentos Biomédicos (SENAI)
                  </span>
                  , onde aprendi que a precisão técnica não é negociável. Essa
                  base analítica me permitiu migrar para a tecnologia com uma
                  visão focada em soluções críticas e escaláveis.
                </p>
                <p>
                  No <span className="text-white italic">PicPay</span>, atuei
                  como desenvolvedora em times ágeis, refinando interfaces com{" "}
                  <span className="text-white underline decoration-[#8F3985]">
                    Angular
                  </span>{" "}
                  e garantindo a performance de dashboards internos. Hoje,
                  combino essa vivência corporativa com certificações em{" "}
                  <span className="text-white">AWS e Google Cloud</span> para
                  entregar aplicações Fullstack completas.
                </p>
                <p>
                  Atualmente finalizando a graduação na{" "}
                  <span className="text-white italic">FATEC</span>, foco no
                  ecossistema{" "}
                  <span className="text-[#8F3985] font-bold">
                    JavaScript (NestJS/React)
                  </span>
                  , sempre priorizando Clean Code e segurança da informação.
                </p>
              </div>
            </div>

            <div className="space-y-12">
              {/* SKILLS TAGS */}
              <div>
                <span className="text-[8px] font-black text-[#8F3985] tracking-[.4em] uppercase mb-6 block ">
                  Stack
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "NestJS",
                    "Angular",
                    "Node.js",
                    "PostgreSQL",
                    "AWS",
                    "Google Cloud",
                    "TypeScript",
                    "Spring Boot",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 border border-white/10 text-[10px] font-bold hover:border-[#8F3985] transition-colors uppercase"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* EXPERIENCES BOX */}
              <div className="grid grid-cols-1 gap-6">
                {[
                  {
                    title: "PicPay",
                    role: "Engenharia de Software (Jovem Aprendiz)",
                    date: "2021 — 2023",
                  },
                  {
                    title: "Generation Brasil",
                    role: "Full Stack Java/JS Bootcamp",
                    date: "2025 — 2026",
                  },
                  {
                    title: "FATEC Itaquera",
                    role: "D.S. Multiplataforma",
                    date: "Previsão 2027",
                  },
                ].map((exp, i) => (
                  <div
                    key={i}
                    className="group p-4 bg-white/[0.02] border-l-2 border-[#8F3985]/30 hover:border-[#8F3985] transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-black italic uppercase tracking-tight">
                        {exp.title}
                      </h3>
                      <span className="text-[8px] font-bold opacity-30">
                        {exp.date}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors uppercase font-bold tracking-widest">
                      {exp.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WORK SECTION */}
        <section id="work" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 flex justify-between items-end">
              <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                Meus
                <br />
                <span className="text-[#8F3985] text-gradient">Projetos</span>
              </h2>
              <p className="text-[9px] text-white/20 tracking-[.3em] uppercase hidden md:block">
                GitHub Sincronizado
              </p>
            </div>

            {loading ? (
              <div className="py-20 text-center opacity-20 animate-pulse font-black italic uppercase">
                Buscando Repositórios...
              </div>
            ) : (
              <div className="space-y-8">
                {/* PROJETOS DESTAQUE (LÓGICA HÍBRIDA) */}
                <div className="grid md:grid-cols-12 gap-6">
                  {/* PROJETO 01: Bike.com (Customizado para mostrar o que importa) */}
                  <div className="md:col-span-8 group relative overflow-hidden bg-white/[0.02] aspect-video border border-white/10 p-8 flex flex-col justify-end hover:border-[#8F3985]/50 transition-all">
                    <span className="absolute top-6 right-6 text-[8px] font-black text-[#8F3985] uppercase tracking-widest bg-[#8F3985]/10 px-2 py-1">
                      Featured Project
                    </span>
                    <h3 className="text-3xl font-black italic uppercase group-hover:text-[#8F3985] transition-colors">
                      Bike.com (Landing Page)
                    </h3>
                    <p className="text-white/40 mt-2 max-w-md text-xs">
                      Esta é a landing page oficial da BIKE.COM, uma empresa de aluguel de bicicletas localizada em frente ao Parque do Carmo, em São Paulo.
                    </p>
                    <div className="mt-6 flex gap-2">
                      {["React","Vite", "TailwindCSS", "GitHub API"].map(
                        (t) => (
                          <span
                            key={t}
                            className="text-[8px] border border-white/20 px-2 py-1 rounded-full uppercase font-bold"
                          >
                            {t}
                          </span>
                        ),
                      )}
                    </div>
                    <div className="mt-6 flex gap-4">
                      <a
                        href="https://bike-com2-cdvcxewm1-beatrizs-projects-1a08e7f2.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black tracking-[.3em] border border-[#8F3985] text-[#8F3985] px-4 py-2 rounded hover:bg-[#8F3985] hover:text-black transition-all uppercase"
                      >
                        Deploy
                      </a>
                      <a
                        href="https://github.com/beamonteiro19/bike.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black tracking-[.3em] border border-white/20 px-4 py-2 rounded hover:bg-white/10 transition-all uppercase"
                      >
                        Repositório
                      </a>
                    </div>
                  </div>

                  {/* PROJETOS DO GITHUB (2 e 3) */}
                  {featuredRepos[1] && (
                    <a
                      href={featuredRepos[1].html_url}
                      target="_blank"
                      className="md:col-span-4 bg-[#8F3985] p-8 flex flex-col justify-between group hover:scale-[0.98] transition-transform"
                    >
                      <h3 className="text-black text-xl font-black italic uppercase leading-tight">
                        {featuredRepos[1].name.replace(/-/g, " ")}
                      </h3>
                      <p className="text-black/60 text-[11px] font-bold mt-4 mb-8 line-clamp-4">
                        {featuredRepos[1].description}
                      </p>
                      <span className="text-black text-[9px] font-black tracking-widest underline uppercase italic">
                        Ver Repositório
                      </span>
                    </a>
                  )}

                  {featuredRepos[2] && (
                    <a
                      href={featuredRepos[2].html_url}
                      target="_blank"
                      className="md:col-span-12 border border-white/10 p-8 flex flex-col md:flex-row justify-between items-center group hover:bg-white/[0.05] transition-all"
                    >
                      <h3 className="text-2xl font-black italic uppercase group-hover:text-[#8F3985] transition-colors">
                        {featuredRepos[2].name.replace(/-/g, " ")}
                      </h3>
                      <span className="text-white/20 font-bold italic tracking-widest text-[10px] uppercase">
                        {featuredRepos[2].language || "Fullstack"} // ★{" "}
                        {featuredRepos[2].stargazers_count}
                      </span>
                    </a>
                  )}
                </div>

                {/* BOTÃO VER MAIS */}
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-[10px] font-black tracking-[.4em] border border-white/10 px-10 py-4 hover:bg-[#8F3985] hover:text-black transition-all uppercase italic"
                  >
                    {showAll ? "[ RECOLHER ]" : "[ EXPLORAR TODOS OS REPOS ]"}
                  </button>
                </div>

                {showAll && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {otherRepos.map((repo) => (
                      <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        className="group border border-white/10 p-6 flex flex-col justify-between hover:bg-[#8F3985] transition-all duration-500 min-h-[180px]"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[8px] font-black opacity-40 group-hover:text-black uppercase tracking-widest">
                              {repo.language}
                            </span>
                            <span className="text-[9px] font-bold group-hover:text-black italic">
                              ★ {repo.stargazers_count}
                            </span>
                          </div>
                          <h4 className="text-lg font-black italic uppercase group-hover:text-black leading-tight mb-2">
                            {repo.name.replace(/-/g, " ")}
                          </h4>
                          <p className="text-[10px] text-white/40 group-hover:text-black/60 line-clamp-2 leading-relaxed">
                            {repo.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <ContactSection />
      </main>

      <footer className="border-t border-white/5 py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[9px] font-bold opacity-30 tracking-[.2em] uppercase">
            Beatriz Monteiro Vieira — 2026
          </div>
          <div className="flex gap-6">
            <a
              href="https://github.com/beamonteiro19"
              target="_blank"
              className="text-[9px] font-black hover:text-[#8F3985] transition-colors uppercase tracking-widest"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/beatriz-mv"
              target="_blank"
              className="text-[9px] font-black hover:text-[#8F3985] transition-colors uppercase tracking-widest"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
