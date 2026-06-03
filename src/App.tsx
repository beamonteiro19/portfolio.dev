import { useEffect, useMemo, useRef, useState } from "react";
import { type Repo } from "./models/Repo";

type SpaceNode = {
  // Coordenadas normalizadas em um espaco virtual.
  // Aq o eixo z cria a sensacao de profundidade.
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  phase: number;
};

/**
 * fundo visual.
 *
 * to usando o Canvas 2D para manter o projeto leve, pra n ter dependencias extras.
 * O efeito combina starfield, arco orbital e uma rede plexus.
 */
function StarfieldPlexusCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Guarda o mouse fora do estado do React para animar sem re-renderizar
  // o componente em todo movimento do cursor.
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nodes: SpaceNode[] = [];
    let width = 0;
    let height = 0;
    let animationId = 0;

    // Reposiciona um ponto no "fundo" da cena. Na inicializacao,
    // espalha os pontos por toda a profundidade para o primeiro frame
    // ja nascer preenchido.
    const resetNode = (node: SpaceNode, initial = false) => {
      node.x = (Math.random() - 0.5) * 2;
      node.y = (Math.random() - 0.5) * 1.4;
      node.z = initial ? Math.random() * 1 : 1;
      node.speed = 0.0012 + Math.random() * 0.002;
      node.size = 0.7 + Math.random() * 1.8;
      node.phase = Math.random() * Math.PI * 2;
    };

    // Ajusta o canvas ao viewport e ao devicePixelRatio.
    // O limite em 2x mantem nitidez sem pesar demais em telas muito densas.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // A quantidade de pontos acompanha a largura:
      // desktop ganha mais densidade, mobile fica mais leve.
      const targetCount = Math.min(130, Math.max(72, Math.floor(width / 14)));
      nodes.length = 0;
      for (let i = 0; i < targetCount; i += 1) {
        const node = {} as SpaceNode;
        resetNode(node, true);
        nodes.push(node);
      }
    };

    const updateMouse = (event: MouseEvent) => {
      mouseRef.current = {
        x: event.clientX / Math.max(width, 1),
        y: event.clientY / Math.max(height, 1),
        active: true,
      };
    };

    const leaveMouse = () => {
      mouseRef.current.active = false;
    };

    // Transforma coordenadas virtuais em pixels reais do canvas.
    // Quanto maior o depth, mais proximo o ponto parece estar:
    // ele fica maior, curva mais e sofre mais influencia do mouse.
    const projectNode = (node: SpaceNode, time: number) => {
      const depth = 1 - node.z;
      const curve = Math.sin(node.x * Math.PI + time * 0.00018 + node.phase);
      const mousePull = mouseRef.current.active
        ? (mouseRef.current.x - 0.5) * 48 * depth
        : 0;

      return {
        x: width / 2 + node.x * width * (0.44 + depth * 0.1) + mousePull,
        y:
          height * 0.42 +
          node.y * height * (0.36 + depth * 0.09) +
          curve * 52 * depth,
        radius: node.size * (0.55 + depth * 1.7),
        depth,
      };
    };

    // Desenha o arco orbital: elipses translucidas e pequenos marcadores.
    // O movimento lento deixa o fundo vivo sem competir com o conteudo.
    const drawArc = (time: number) => {
      const centerX =
        width *
        (0.5 + (mouseRef.current.active ? mouseRef.current.x - 0.5 : 0) * 0.04);
      const centerY = height * 0.48;
      const radiusX = width * 0.39;
      const radiusY = Math.max(130, height * 0.22);

      context.save();
      context.translate(centerX, centerY);
      context.rotate(Math.sin(time * 0.00016) * 0.08);

      for (let ring = 0; ring < 3; ring += 1) {
        context.beginPath();
        context.ellipse(
          0,
          ring * 10,
          radiusX - ring * 42,
          radiusY - ring * 18,
          -0.24,
          Math.PI * 1.05,
          Math.PI * 1.95,
        );
        context.strokeStyle = `rgba(143, 57, 133, ${0.2 - ring * 0.045})`;
        context.lineWidth = 1;
        context.stroke();
      }

      for (let i = 0; i < 34; i += 1) {
        const angle = Math.PI * 1.05 + i * 0.084 + time * 0.00009;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY - 6;
        context.beginPath();
        context.arc(x, y, i % 7 === 0 ? 2.2 : 1.2, 0, Math.PI * 2);
        context.fillStyle =
          i % 7 === 0 ? "rgba(204, 255, 0, 0.72)" : "rgba(255,255,255,0.5)";
        context.fill();
      }

      context.restore();
    };

    // Loop principal:
    // 1. limpa o frame;
    // 2. redesenha o arco;
    // 3. atualiza e projeta os pontos;
    // 4. conecta pontos proximos;
    // 5. desenha as estrelas acima das linhas.
    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      drawArc(time);

      const projected = nodes.map((node) => {
        // Respeita usuarios que preferem menos movimento: o canvas fica
        // estatico, mas ainda preserva a composicao visual.
        if (!reduceMotion) {
          node.z -= node.speed;
          if (node.z <= 0.02) resetNode(node);
        }
        return projectNode(node, time);
      });

      for (let i = 0; i < projected.length; i += 1) {
        for (let j = i + 1; j < projected.length; j += 1) {
          const first = projected[i];
          const second = projected[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < 118) {
            // Quanto menor a distancia, mais forte a linha da rede plexus.
            const opacity = (1 - distance / 118) * 0.22;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.strokeStyle = `rgba(143, 57, 133, ${opacity})`;
            context.lineWidth = 0.8;
            context.stroke();
          }
        }
      }

      projected.forEach((point, index) => {
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        // Alguns pontos recebem o verde neon da identidade visual
        // para criar pequenas ancoras de contraste no fundo.
        context.fillStyle =
          index % 11 === 0
            ? "rgba(204, 255, 0, 0.78)"
            : `rgba(255, 255, 255, ${0.2 + point.depth * 0.65})`;
        context.fill();
      });

      if (!reduceMotion) {
        animationId = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", updateMouse);
    window.addEventListener("mouseleave", leaveMouse);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("mouseleave", leaveMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-80 mix-blend-screen"
    />
  );
}

function ContactSection() {
  const fullText = "VAMOS CONVERSAR?_";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  // Efeito de maquina de escrever no CTA de contato.
  // Quando termina a frase, espera alguns segundos e reinicia.
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
        Interessado em desenvolver um projeto?
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

  // Anima a assinatura "B.MV" na navegacao inicial.
  useEffect(() => {
    if (logoIndex < logoText.length) {
      const timeout = setTimeout(() => {
        setLogoDisplay((prev) => prev + logoText[logoIndex]);
        setLogoIndex((prev) => prev + 1);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [logoIndex]);

  // Alimenta o spotlight radial que acompanha o cursor no desktop.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sincroniza projetos publicos do GitHub e atualiza o relogio da nav.
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

  const featuredRepos = useMemo(() => repos.slice(0, 3), [repos]);
  const otherRepos = useMemo(() => repos.slice(3), [repos]);

  return (
    <div className="min-h-screen text-slate-100 selection:bg-[#8F3985] font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 -z-30 bg-[#0e0f18]" />
      <StarfieldPlexusCanvas />
      <div className="fixed inset-0 -z-10 opacity-20 topography-pattern" />
      <div
        className="pointer-events-none fixed inset-0 z-30 lg:block hidden"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(143, 57, 133, 0.15), transparent 80%)`,
        }}
      />

      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-[100] flex justify-between items-center px-8 py-5 backdrop-blur-md border-b border-white/5">
        <div className="text-lg font-black tracking-tighter italic">
          {logoDisplay}
          <span className="text-[#8F3985] animate-pulse">_</span>
        </div>
        <div className="flex gap-6 text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.3em] uppercase">
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
        <div className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] hidden sm:block">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —
          SÃO PAULO
        </div>
      </nav>

      <main className="pt-24">
        {/* HERO */}
        <section className="px-6 flex flex-col items-center text-center py-20">
          {/* workStatusLabel removido */}
          <h1 className="overflow-visible text-[8vw] sm:text-[7vw] font-black italic leading-[1] tracking-tighter uppercase pb-3">
            Fullstack <br />{" "}
            <span className="inline-block overflow-visible text-[#8F3985] text-gradient px-[0.08em] pb-2">
              Developer
            </span>
          </h1>
        </section>

        {/* SECTION: ABOUT */}
        <section
          id="about"
          className="py-24 md:py-28 px-6 border-t border-white/5 bg-white/[0.01]"
        >
          <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
            <div className="lg:col-span-7">
              <p className="text-[#8F3985] font-black text-[9px] tracking-[.5em] mb-4 uppercase">
                um pouco sobre mim...
              </p>
              <div className="mb-10 flex justify-between items-end">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                  Minha
                  <br />
                  <span className="text-[#8F3985] text-gradient">
                    Trajetória
                  </span>
                </h2>
              </div>
              <div className="space-y-6 text-white/50 text-base leading-relaxed max-w-2xl text-justify">
                <p>
                  Minha trajetória começou na área de{" "}
                  <span className="text-white italic">
                    Equipamentos Biomédicos (SENAI)
                  </span>
                  , onde aprendi a importância da organização, da atenção aos
                  detalhes e da busca por soluções práticas para os problemas do
                  dia a dia.
                </p>

                <p>
                  A partir dessa experiência, descobri meu interesse pela
                  tecnologia e decidi seguir carreira em desenvolvimento de
                  software. Durante minha passagem pelo{" "}
                  <span className="text-white italic">PicPay</span>, tive
                  contato com metodologias ágeis, desenvolvimento de interfaces
                  com{" "}
                  <span className="text-white underline decoration-[#8F3985]">
                    Angular
                  </span>{" "}
                  e trabalho colaborativo em equipe, experiências que
                  fortaleceram minha base profissional.
                </p>

                <p>
                  Atualmente, estou concluindo a graduação na{" "}
                  <span className="text-white italic">FATEC</span> e atuo como{" "}
                  <span className="text-white italic">
                    Analista de Desenvolvimento I
                  </span>{" "}
                  na{" "}
                  <span className="text-white italic">
                    Cadmus Soluções em TI
                  </span>
                  . Tenho me dedicado principalmente ao ecossistema{" "}
                  <span className="text-[#8F3985] font-bold">
                    JavaScript (React, TypeScript e NestJS)
                  </span>
                  , desenvolvendo projetos e aprimorando continuamente minhas
                  habilidades.
                </p>

                <p>
                  Sou uma pessoa observadora, curiosa e que gosta de compreender
                  como as coisas funcionam. Acredito que pequenas melhorias e
                  atenção aos detalhes podem gerar grandes resultados, e busco
                  evoluir continuamente, tanto no aspecto técnico quanto no
                  profissional. Sinto que trabalho bem sob pressão e é daí que grandes produtos e ideias surgem.
                </p>

                {/* --- BOTÃO BAIXAR CURRÍCULO --- */}
                <div className="pt-10 flex justify-start">
                  <a
                    href="/CV%20-%20Beatriz%20M.%20Vieira.pdf"
                    download="CV - Beatriz M. Vieira.pdf"
                    className="group relative inline-flex items-center gap-4 px-8 py-4 border border-[#8F3985] bg-[#8F3985]/5 overflow-hidden transition-all duration-500 hover:bg-[#8F3985]"
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        console.log("Iniciando download mobile...");
                      }
                    }}
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

            <div className="space-y-12 lg:col-span-5 lg:pt-3">
              {/* SKILLS TAGS */}
              <div>
                <span className="text-[#8F3985] font-black text-[9px] tracking-[.5em] uppercase mb-5 block ">
                  Stack principal
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
                    "JavaScript",
                    "Java",
                    "HTML",
                    "CSS",
                    "Tailwind CSS",
                    "Git",
                    "GitHub",
                    "Docker",
                    "MySQL",
                    "MongoDB",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 border border-white/10 bg-white/[0.02] text-[10px] font-bold hover:border-[#8F3985] hover:bg-[#8F3985]/10 transition-colors uppercase"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* EXPERIENCES BOX */}
              <div>
                <span className="text-[#8F3985] font-black text-[9px] tracking-[.5em] uppercase mb-5 block">
                  Experiência
                </span>
                <div className="grid grid-cols-1 gap-5">
                {[
                  {
                    title: "Cadmus Soluções em TI",
                    role: "Estágio",
                    date: "04/2026 — Presente",
                  },
                  {
                    title: "FATEC Itaquera",
                    role: "D.S. Multiplataforma",
                    date: "Previsão 2027",
                  },
                  {
                    title: "Generation Brasil",
                    role: "Full Stack Java/JS Bootcamp",
                    date: "10/2025 — 02/2026",
                  },
                  {
                    title: "PicPay",
                    role: "Engenharia de Software (Jovem Aprendiz)",
                    date: "10/2021 — 03/2023",
                  },
                  {
                    title: "T&T Equipamentos Médicos",
                    role: "Técnica em Equipamentos Biomédicos",
                    date: "05/2021 — 08/2021",
                  },
                ].map((exp, i) => (
                  <div
                    key={i}
                    className="group py-1 pl-5 border-l-2 border-[#8F3985]/30 hover:border-[#8F3985] transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-black italic uppercase tracking-tight">
                        {exp.title}
                      </h3>
                      <span className="text-xs font-bold opacity-30">
                        {exp.date}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors uppercase font-bold tracking-widest">
                      {exp.role}
                    </p>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CLIENTES mockado pq ainda n tenho kkkk*/}
        <section className="py-24 px-6 border-t border-white/5 bg-black/10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
              <div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                  Meus
                  <br />
                  <span className="text-[#8F3985] text-gradient">clientes</span>
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "SaaS", value: "Operações" },
                { label: "Fintech", value: "Dashboards" },
                { label: "Healthtech", value: "Sistemas" },
                { label: "Educação", value: "Web Apps" },
              ].map((client) => (
                <div
                  key={client.label}
                  className="group min-h-[150px] border border-white/10 bg-white/[0.025] p-5 transition-all hover:border-[#8F3985]/70 hover:bg-[#8F3985]/10"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="text-[9px] font-black tracking-[0.35em] text-white/30 uppercase">
                      {client.label}
                    </span>
                    <div>
                      <p className="text-2xl font-black italic uppercase tracking-tight group-hover:text-[#8F3985] transition-colors">
                        {client.value}
                      </p>
                      <div className="mt-4 h-px w-full bg-gradient-to-r from-[#8F3985] via-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  metric: "04",
                  title: "Produtos digitais",
                  text: "Fluxos completos de cadastro, gestão, auditoria e acompanhamento operacional.",
                },
                {
                  metric: "12+",
                  title: "Interfaces internas",
                  text: "Telas focadas em leitura rápida, produtividade e consistência de dados.",
                },
                {
                  metric: "100%",
                  title: "Entrega técnica",
                  text: "React, NestJS, TypeScript, bancos relacionais e boas práticas de segurança.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="border-l-2 border-[#8F3985]/40 bg-white/[0.02] p-6"
                >
                  <span className="text-4xl font-black italic text-[#8F3985]">
                    {item.metric}
                  </span>
                  <h3 className="mt-4 text-lg font-black italic uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/40">
                    {item.text}
                  </p>
                </div>
              ))}
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
            </div>

            {loading ? (
              <div className="py-20 text-center opacity-20 animate-pulse font-black italic uppercase">
                Buscando Repositórios...
              </div>
            ) : (
              <div className="space-y-8">
                {/* PROJETOS DESTAQUE (LÓGICA HÍBRIDA) */}
                <div className="grid md:grid-cols-12 gap-6">
                  <div className="md:col-span-8 group relative overflow-hidden bg-white/[0.02] border border-white/10 p-6 md:p-8 flex flex-col justify-end hover:border-[#8F3985]/50 transition-all min-h-[450px] md:min-h-[500px]">
                    <span className="absolute top-4 right-4 md:top-6 md:right-6 text-[8px] font-black text-[#8F3985] uppercase tracking-widest bg-[#8F3985]/10 px-2 py-1 z-20">
                      © Repo privado
                    </span>

                    {/* O conteúdo agora respira melhor */}
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black italic uppercase group-hover:text-[#8F3985] transition-colors mb-4">
                        Rent a Cycle (SaaS)
                      </h3>

                      <div className="space-y-4">
                        <p className="text-white/40 max-w-2xl text-xs leading-relaxed text-justify">
                          O Rent a Cycle é uma plataforma para operação de
                          aluguel de bikes com foco em agilidade no atendimento,
                          controle financeiro e rastreabilidade das operações. A
                          solução cobre o ciclo completo do aluguel:
                          identificação/cadastro de cliente, seleção de itens,
                          confirmação da locação, controle de devolução,
                          fechamento com cobrança/ desconto/ cancelamento com
                          motivo e acompanhamento de clientes ativos em tempo
                          real.
                        </p>

                        <p className="text-white/40 max-w-2xl text-xs leading-relaxed">
                          Sistema Fullstack com Electron, NestJS e PostgreSQL.
                          Foco em segurança: Cookies httpOnly, Helmet e motor de
                          auditoria de cobrança.
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {["NestJS", "React", "PostgreSQL", "Electron"].map(
                          (t) => (
                            <span
                              key={t}
                              className="text-[8px] border border-white/20 px-3 py-1 rounded-full uppercase font-bold"
                            >
                              {t}
                            </span>
                          ),
                        )}
                      </div>

                      <div className="mt-8">
                        <a
                          href="https://drive.google.com/file/d/12NlEfRMZqe2tAGI61WkG40s7Yec_-X6d/view?usp=drive_links"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-[10px] font-black tracking-[.3em] border border-[#8F3985] text-[#8F3985] px-6 py-3 rounded hover:bg-[#8F3985] hover:text-black transition-all uppercase"
                        >
                          Vídeo de demonstração
                        </a>
                      </div>
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
                          <h4 className="text-xl font-black italic uppercase text-black leading-tight mb-2">
                            {repo.name.replace(/-/g, " ")}
                          </h4>
                          <p className="text-sm text-black/50 line-clamp-2 leading-relaxed font-bold">
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
              className="flex items-center gap-1 text-[9px] font-black hover:text-[#8F3985] transition-colors uppercase tracking-widest"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline align-middle"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 21.13V25" />
              </svg>
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/beatriz-mv"
              target="_blank"
              className="flex items-center gap-1 text-[9px] font-black hover:text-[#8F3985] transition-colors uppercase tracking-widest"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline align-middle"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
                <line x1="16" y1="11" x2="16" y2="16" />
                <line x1="8" y1="11" x2="8" y2="16" />
                <line x1="8" y1="8" x2="8" y2="8" />
                <line x1="12" y1="16" x2="12" y2="11" />
                <path d="M16 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
