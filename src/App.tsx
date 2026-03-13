import { useEffect, useMemo, useState } from "react";
import { type Repo } from "./models/Repo";

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
        Interessado em desenvolver um projeto ou apenas bater um papo sobre
        tecnologia?
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
  const logoText = "B.MV";
  const [logoDisplay, setLogoDisplay] = useState("");
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    if (logoIndex < logoText.length) {
      const timeout = setTimeout(() => {
        setLogoDisplay((prev) => prev + logoText[logoIndex]);
        setLogoIndex((prev) => prev + 1);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [logoIndex]);

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
    <div className="min-h-screen text-slate-100 selection:bg-[#8F3985] font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 -z-20 bg-[#0e0f18]" />
      <div className="fixed inset-0 -z-10 opacity-30 topography-pattern" />
      <div
        className="pointer-events-none fixed inset-0 z-30 lg:block hidden"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(143, 57, 133, 0.15), transparent 80%)`,
        }}
      />

      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-[100] flex justify-between items-center px-8 py-5 backdrop-blur-md border-b border-white/5">
        <div className="text-base font-black tracking-tighter italic">
          {logoDisplay}
          <span className="text-[#8F3985] animate-pulse">_</span>
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
          <div className="mb-6 inline-flex items-center gap-2 border border-[#8F3985]/50 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8F3985] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8F3985]"></span>
            </span>
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
                  e garantindo a performance de dashboards internos.
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

                {/* --- BOTÃO BAIXAR CURRÍCULO --- */}
                <div className="pt-10 flex justify-start">
                  <a
                    href="public\CV - Beatriz M. Vieira.pdf"
                    download="CV - Beatriz M. Vieira.pdf"
                    className="group relative inline-flex items-center gap-4 px-8 py-4 border border-[#8F3985] bg-[#8F3985]/5 overflow-hidden transition-all duration-500 hover:bg-[#8F3985]"
                  >
                    <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full" />

                    <span className="relative text-[10px] font-black tracking-[0.4em] uppercase text-[#8F3985] group-hover:text-black transition-colors duration-300">
                      Baixar Currículo
                    </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="relative text-[#8F3985] group-hover:text-black group-hover:translate-y-1 transition-all duration-300"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* O restante do código (Stack e Experiências) permanece igual... */}

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
                    title: "T&T Equipamentos Médicos",
                    role: "Técnica em Equipamentos Biomédicos",
                    date: "05/2021 — 08/2021",
                  },
                  {
                    title: "PicPay",
                    role: "Engenharia de Software (Jovem Aprendiz)",
                    date: "10/2021 — 03/2023",
                  },
                  {
                    title: "Generation Brasil",
                    role: "Full Stack Java/JS Bootcamp",
                    date: "10/2025 — 02/2026",
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

        {/* PROJETOS */}
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
                  {/* PROJETO 01: Rent a Cycle (Customizado para mostrar o que importa) */}
                  <div className="md:col-span-8 group relative overflow-hidden bg-white/[0.02] aspect-video border border-white/10 p-8 flex flex-col justify-end hover:border-[#8F3985]/50 transition-all">
                    <span className="absolute top-6 right-6 text-[8px] font-black text-[#8F3985] uppercase tracking-widest bg-[#8F3985]/10 px-2 py-1">
                      © Repo privado
                    </span>
                    <h3 className="text-3xl font-black italic uppercase group-hover:text-[#8F3985] transition-colors">
                      Rent a Cycle (SaaS)
                    </h3>
                    <p className="text-white/40 mt-2 max-w-md text-xs">
                      O Rent a Cycle é uma plataforma para operação de aluguel
                      de bikes com foco em agilidade no atendimento, controle
                      financeiro e rastreabilidade das operações. A solução
                      cobre o ciclo completo do aluguel: identificação/cadastro
                      de cliente, seleção de itens, confirmação da locação,
                      controle de devolução, fechamento com cobrança/ desconto/
                      cancelamento com motivo e acompanhamento de clientes
                      ativos em tempo real.
                    </p>
                    <p className="text-white/40 mt-2 max-w-md text-xs">
                      Sistema Fullstack com Electron, NestJS e PostgreSQL. Foco
                      em segurança: Cookies httpOnly, Helmet e motor de
                      auditoria de cobrança.
                    </p>
                    <div className="mt-6 flex gap-2">
                      {["NestJS", "React", "PostgreSQL", "Electron"].map(
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
                        href="https://drive.google.com/file/d/12NlEfRMZqe2tAGI61WkG40s7Yec_-X6d/view?usp=drive_links"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black tracking-[.3em] border border-[#8F3985] text-[#8F3985] px-4 py-2 rounded hover:bg-[#8F3985] hover:text-black transition-all uppercase"
                      >
                        Video de demonstração
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

                {/* VER MAIS */}
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
                        className="group relative border border-white/10 p-6 flex flex-col justify-between bg-[#8F3985] transition-all duration-500 min-h-[180px] overflow-hidden"
                      >
                        {/* Camada da Imagem (Invisível por padrão, surge no hover) */}
                        <div
                          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-cover bg-center scale-110 group-hover:scale-100"
                          style={{
                            backgroundImage: `url(https://opengraph.githubassets.com/1/beamonteiro19/${repo.name})`,
                          }}
                        />

                        {/* Overlay escuro opcional (para garantir que se o repo não tiver imagem, o card não fique vazio ou estranho) */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]" />

                        {/* Conteúdo do Card (Texto que some no hover) */}
                        <div className="relative z-10 transition-all duration-500 group-hover:opacity-0 group-hover:scale-95 group-hover:blur-sm">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[8px] font-black text-black/60 uppercase tracking-widest">
                              {repo.language}
                            </span>
                            <span className="text-[9px] font-bold text-black italic">
                              ★ {repo.stargazers_count}
                            </span>
                          </div>
                          <h4 className="text-lg font-black italic uppercase text-black leading-tight mb-2">
                            {repo.name.replace(/-/g, " ")}
                          </h4>
                          <p className="text-[10px] text-black/50 line-clamp-2 leading-relaxed font-bold">
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
            © Beatriz Monteiro Vieira — 2026
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
