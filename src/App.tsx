/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Printer,
  Download,
  Loader2,
  FileCheck2,
  QrCode,
  RotateCw,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import {
  BANCO_CERTIFICADOS,
  CAPITULOS_MINI_EBOOK,
  RADAR_MITO_EVIDENCIA,
  CANAIS_OFICIAIS_IMUNIZACAO,
  CertificadoExtensao,
} from './data/certificadosData';
import {
  LogoEditoraMenteSaude,
  LogoCentroProfissionalizante,
  QrCodeDinamico,
  obterEnderecoPortalVerificacao,
  obterUrlCompletaVerificacao,
} from './components/InstitutionalAssets';
import { CertificadoPdfViewer } from './components/CertificadoPdfViewer';
import { MiniEbookModal } from './components/MiniEbookModal';
import { baixarCertificadoPdfA4, baixarMiniEbookPdf } from './utils/pdfGenerator';

type AbaPilar = 'todos' | 'pilar-a' | 'pilar-b' | 'pilar-c';

export default function App() {
  // Estado dos contadores animados de impacto (Módulo 3)
  const [contadorEbooks, setContadorEbooks] = useState(0);
  const [contadorQuizzes, setContadorQuizzes] = useState(0);
  const [contadorMitos, setContadorMitos] = useState(0);

  // Estado dos 3 Pilares Interativos
  const [abaPilarAtiva, setAbaPilarAtiva] = useState<AbaPilar>('todos');
  const [capituloPreviaIdx, setCapituloPreviaIdx] = useState<number>(0);
  const [modalEbookAberto, setModalEbookAberto] = useState<boolean>(false);

  // Estado dos 4 Flip Cards "Mito vs. Evidência Científica" (Pilar B)
  const [mitosRevelados, setMitosRevelados] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // Estado do Sistema de Autenticação e QR Code Dinâmico (Módulo 5)
  const [termoBusca, setTermoBusca] = useState<string>('EMS-EXT-2023-0418');
  const [certificadoVerificado, setCertificadoVerificado] = useState<CertificadoExtensao | null>(
    BANCO_CERTIFICADOS[0]
  );
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [verificadoViaQrBanner, setVerificadoViaQrBanner] = useState<boolean>(false);
  const [hashCopiado, setHashCopiado] = useState<boolean>(false);
  const [baixandoCertificado, setBaixandoCertificado] = useState<boolean>(false);
  const [baixandoEbook, setBaixandoEbook] = useState<boolean>(false);

  const certificadoSectionRef = useRef<HTMLElement>(null);
  const validadorSectionRef = useRef<HTMLElement>(null);

  // Animação suave dos contadores de impacto na Hero Section
  useEffect(() => {
    const duration = 1100;
    const steps = 32;
    const intervalTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(1, currentStep / steps);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setContadorEbooks(Math.round(2400 * easeOut));
      setContadorQuizzes(Math.round(1850 * easeOut));
      setContadorMitos(Math.round(15 * easeOut));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Função central de busca no BANCO_CERTIFICADOS por Código, CPF, Chave de Controle ou Hash SHA-256
  const buscarCertificado = (entrada: string): CertificadoExtensao | null => {
    const limpo = entrada.trim().toUpperCase();
    const apenasDigitos = entrada.replace(/\D/g, '');
    const semSeparadores = limpo.replace(/[^A-Z0-9]/g, '');

    return (
      BANCO_CERTIFICADOS.find((item) => {
        const codigoMatch = item.codigoAutenticidade.toUpperCase() === limpo;
        const codigoSemTracoMatch =
          item.codigoAutenticidade.toUpperCase().replace(/[^A-Z0-9]/g, '') === semSeparadores;
        const chaveMatch = item.chaveControleVerificacao.toUpperCase() === limpo;
        const chaveSemTracoMatch =
          item.chaveControleVerificacao.toUpperCase().replace(/[^A-Z0-9]/g, '') ===
          semSeparadores;
        const cpfExatoMatch = item.cpf === entrada.trim();
        const cpfDigitosMatch =
          apenasDigitos.length === 11 && item.cpf.replace(/\D/g, '') === apenasDigitos;
        const hashMatch = item.hashSha256.toUpperCase() === limpo;
        return (
          codigoMatch ||
          codigoSemTracoMatch ||
          chaveMatch ||
          chaveSemTracoMatch ||
          cpfExatoMatch ||
          cpfDigitosMatch ||
          hashMatch
        );
      }) || null
    );
  };

  // MÓDULO 5: Detecção automática de leitura do QR Code via URLSearchParams (?codigo=EMS-EXT-2023-0418)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigoUrl = params.get('codigo');

    if (codigoUrl) {
      const encontrado = buscarCertificado(codigoUrl);
      if (encontrado) {
        setTermoBusca(encontrado.codigoAutenticidade);
        setCertificadoVerificado(encontrado);
        setErroBusca(null);
        setVerificadoViaQrBanner(true);

        setTimeout(() => {
          certificadoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
      }
    }
  }, []);

  // Acionador oficial de validação digital do registro no portal
  const handleConfirmarVerificacaoQr = (codigo: string) => {
    const encontrado = buscarCertificado(codigo);
    if (encontrado) {
      const novaUrl = `${window.location.pathname}?codigo=${encodeURIComponent(
        encontrado.codigoAutenticidade
      )}#validador`;
      window.history.replaceState({}, '', novaUrl);
      setTermoBusca(encontrado.codigoAutenticidade);
      setCertificadoVerificado(encontrado);
      setErroBusca(null);
      setVerificadoViaQrBanner(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExecutarValidacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termoBusca.trim()) {
      setErroBusca(
        'Digite o Código de Autenticidade (EMS-EXT-2023-0418), a Chave de Controle (0418-7027-9457-8F4B) ou o CPF do titular.'
      );
      setCertificadoVerificado(null);
      return;
    }

    const encontrado = buscarCertificado(termoBusca);
    if (encontrado) {
      setCertificadoVerificado(encontrado);
      setErroBusca(null);
    } else {
      setCertificadoVerificado(null);
      setErroBusca(
        `Nenhum certificado localizado para "${termoBusca}". Verifique o código EMS-EXT-2023-0418, a chave 0418-7027-9457-8F4B ou o CPF 702.794.941-57.`
      );
    }
  };

  const toggleMitoCard = (id: number) => {
    setMitosRevelados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const revelarTodosMitos = () => {
    const todosAbertos = Object.values(mitosRevelados).every(Boolean);
    setMitosRevelados({
      1: !todosAbertos,
      2: !todosAbertos,
      3: !todosAbertos,
      4: !todosAbertos,
    });
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setHashCopiado(true);
    setTimeout(() => setHashCopiado(false), 2000);
  };

  const handlePrintMiniEbook = () => {
    document.body.classList.add('printing-ebook');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-ebook');
    }, 500);
  };

  const handleBaixarCertificadoDireto = async (cert: CertificadoExtensao) => {
    if (baixandoCertificado) return;
    setBaixandoCertificado(true);
    try {
      await baixarCertificadoPdfA4(cert);
    } finally {
      setBaixandoCertificado(false);
    }
  };

  const handleBaixarEbookDireto = async () => {
    if (baixandoEbook) return;
    setBaixandoEbook(true);
    try {
      await baixarMiniEbookPdf();
    } finally {
      setBaixandoEbook(false);
    }
  };

  const certificadoPrincipal = certificadoVerificado || BANCO_CERTIFICADOS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* ==========================================================================
          MÓDULO 5: BANNER AUTOMÁTICO DE CONFIRMAÇÃO VERDE VIA QR CODE
          ========================================================================== */}
      {verificadoViaQrBanner && certificadoVerificado && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#064E3B] text-white border-b-2 border-[#D97706] px-4 py-3.5 shadow-lg no-print"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center md:text-left">
              <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-bold tracking-wide text-white">
                  ✅ CERTIFICADO AUTÊNTICO VERIFICADO VIA QR CODE — Titular: Dr.{' '}
                  {certificadoVerificado.titular === 'LUCAS GONÇALVES SILVEIRA'
                    ? 'Lucas Gonçalves Silveira'
                    : certificadoVerificado.titular}{' '}
                  (CPF: {certificadoVerificado.cpfMascarado})
                </p>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Registro confirmado no {certificadoVerificado.livroRegistro},{' '}
                  {certificadoVerificado.folhaRegistro} · Código:{' '}
                  <span className="font-code-mono font-semibold text-amber-300">
                    {certificadoVerificado.codigoAutenticidade}
                  </span>{' '}
                  · Carga Horária: {certificadoVerificado.cargaHorariaTotal} horas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="#certificado-pdf"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0"
              >
                Inspecionar Certificado A4
              </a>
              <button
                type="button"
                onClick={() => setVerificadoViaQrBanner(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Ocultar Aviso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          TOP BAR CONTRACT (3 ZONAS LIMPAS COM GAP-8)
          ========================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zona 1: Brand Wordmark em linha única */}
          <a
            href="#topo"
            className="text-base sm:text-lg font-bold tracking-tight text-[#064E3B] whitespace-nowrap shrink-0"
          >
            Portal de Extensão Mente e Saúde · Dalva de Araújo
          </a>

          {/* Zona 2: 4 Links de navegação concisos em linha única */}
          <nav
            aria-label="Navegação Principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#campanha"
              className="hover:text-[#064E3B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Campanha Educativa
            </a>
            <a
              href="#pilares"
              className="hover:text-[#064E3B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Os 3 Pilares
            </a>
            <a
              href="#certificado-pdf"
              className="hover:text-[#064E3B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Certificado PDF
            </a>
            <a
              href="#validador"
              className="hover:text-[#064E3B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Validador Público
            </a>
          </nav>

          {/* Zona 3: 1 Ação Primária */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#validador"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#0D9488] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Validar Certificado
            </a>
          </div>
        </div>
      </header>

      {/* ==========================================================================
          MÓDULO 3: HERO SECTION INSTITUCIONAL E CONTADORES DE IMPACTO
          ========================================================================== */}
      <section
        id="campanha"
        className="relative overflow-hidden bg-gradient-to-b from-[#ECFDF5]/70 via-[#F8FAFC] to-[#F8FAFC] border-b border-slate-200 pt-10 pb-14 px-6 no-print"
      >
        <div className="max-w-7xl mx-auto">
          {/* Linha de Identificação Interinstitucional */}
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-slate-200/90">
            <div className="flex items-center gap-4">
              <LogoEditoraMenteSaude size="md" variant="shield" />
              <div>
                <p className="text-sm font-bold text-[#064E3B]">Editora Mente e Saúde</p>
                <p className="text-xs text-slate-600 font-code-mono">
                  CNPJ: 51.372.335/0001-71 · Extensão Editorial e Científica
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold text-[#92400E] tracking-wide uppercase">
              Programa Interinstitucional de Extensão Comunitária e Comunicação Científica (Registro 2023–2026)
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0A1D56]">
                  Centro Profissionalizante Maria Dalva de Araújo
                </p>
                <p className="text-xs text-slate-600 font-code-mono">
                  CNPJ: 51.269.112/0001-83 · Ensino e Projetos Educativos
                </p>
              </div>
              <LogoCentroProfissionalizante size="md" />
            </div>
          </div>

          {/* Grid Principal da Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch pt-10">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0D9488]">
                  <span>Saúde Pública Baseada em Evidências</span>
                  <span aria-hidden="true">·</span>
                  <span>Educação Comunitária</span>
                  <span aria-hidden="true">·</span>
                  <span>Fé Pública Acadêmica</span>
                </div>

                <h1 className="font-cert-serif text-4xl sm:text-5xl font-bold text-[#0F172A] leading-[1.12] tracking-tight text-balance">
                  Campanha Educativa de Conscientização sobre Vacinação e Validação Pública de Extensão
                </h1>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                  Distribuição gratuita de Mini E-books para as famílias, enfrentamento qualificado à
                  desinformação (<em>fake news</em>) e divulgação ativa dos canais oficiais de
                  imunização do Sistema Único de Saúde (SUS).
                </p>
              </div>

              {/* Explicação da Metodologia Extensionista */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
                  Metodologia Extensionista Interinstitucional
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Como uma <strong>Editora Científica</strong> e um <strong>Centro de Ensino Profissionalizante</strong>{' '}
                  atuam na linha de frente da Saúde Pública? Nossa metodologia une a curadoria editorial de
                  artigos médicos, consensos da SBIm/OMS e diretrizes do PNI à pedagogia comunitária,
                  capacitando médicos e profissionais de saúde para traduzirem evidências imunológicas
                  complexas em guias práticos, acolhimento de hesitação vacinal e cidadania digital para
                  a população.
                </p>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <a
                  href="#certificado-pdf"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-[#064E3B] hover:bg-[#0D9488] shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Visualizar Certificado Nº 01 (PDF A4)</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setCapituloPreviaIdx(0);
                    setModalEbookAberto(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-[#0A1D56] bg-[#EFF6FF] hover:bg-blue-100 border border-[#1D4ED8]/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Ler Mini E-book &ldquo;Vacinar é Proteger&rdquo;</span>
                </button>
              </div>
            </div>

            {/* Card Lateral de Destaque do Registro Nº 01 */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] block">
                      Certificação em Destaque
                    </span>
                    <h2 className="font-cert-serif text-2xl font-bold text-[#0A1D56]">
                      Certificado de Extensão Nº 01
                    </h2>
                  </div>
                  <QrCodeDinamico
                    codigo={certificadoPrincipal.codigoAutenticidade}
                    size={64}
                    showCaption={false}
                    onSelectVerification={() =>
                      handleConfirmarVerificacaoQr(certificadoPrincipal.codigoAutenticidade)
                    }
                  />
                </div>

                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Profissional Certificado:</dt>
                    <dd className="font-bold text-[#0F172A]">{certificadoPrincipal.titular}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Qualificação / Origem:</dt>
                    <dd className="font-semibold text-[#0A1D56] text-right">
                      {certificadoPrincipal.profissao} · UNIFAN
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">CPF do Titular:</dt>
                    <dd className="font-code-mono font-semibold text-slate-800">
                      {certificadoPrincipal.cpf}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Código de Autenticidade:</dt>
                    <dd className="font-code-mono font-bold text-[#064E3B]">
                      {certificadoPrincipal.codigoAutenticidade}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-slate-500">Chave de Controle / Dígito:</dt>
                    <dd className="font-code-mono font-bold text-[#D97706]">
                      {certificadoPrincipal.chaveControleVerificacao}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleConfirmarVerificacaoQr(certificadoPrincipal.codigoAutenticidade)
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E3B] hover:text-[#0D9488] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Emitir Confirmação de Fé Pública</span>
                </button>
                <a
                  href="#certificado-pdf"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4ED8] hover:underline whitespace-nowrap shrink-0"
                >
                  <span>Abrir Leitor PDF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Faixa Completa de Contadores Animados de Impacto (Módulo 3) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="font-code-mono text-3xl sm:text-4xl font-bold text-[#064E3B]">
                  +{contadorEbooks.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm font-semibold text-[#0F172A] mt-1">
                  Mini E-books e Folhetos Distribuídos
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acesso comunitário gratuito em formato impresso e digital para famílias
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="font-code-mono text-3xl sm:text-4xl font-bold text-[#0A1D56]">
                  +{contadorQuizzes.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm font-semibold text-[#0F172A] mt-1">
                  Participações em Quizzes Populacionais
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mapeamento diagnóstico de dúvidas e fatores de hesitação vacinal
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="font-code-mono text-3xl sm:text-4xl font-bold text-[#D97706]">
                  {contadorMitos}
                </p>
                <p className="text-sm font-semibold text-[#0F172A] mt-1">
                  Mitos Antivacina Desmentidos com Base em Evidências
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pareceres médico-científicos fundamentados no PNI/MS, ANVISA e OMS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          MÓDULO 3: SEÇÃO INTERATIVA 1 — OS 3 PILARES DA CAMPANHA
          ========================================================================== */}
      <section id="pilares" className="py-16 px-6 max-w-7xl mx-auto w-full space-y-12 no-print">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0D9488]">
              Arquitetura Pedagógica e Científica da Ação Extensionista
            </p>
            <h2 className="font-cert-serif text-3xl sm:text-4xl font-bold text-[#0F172A] mt-1">
              Os 3 Pilares da Campanha Educativa de Imunização
            </h2>
          </div>

          {/* Controle Segmentado de Filtragem dos Pilares */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/75 rounded-xl">
            <button
              type="button"
              onClick={() => setAbaPilarAtiva('todos')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                abaPilarAtiva === 'todos'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Visão Integrada (3 Pilares)
            </button>
            <button
              type="button"
              onClick={() => setAbaPilarAtiva('pilar-a')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                abaPilarAtiva === 'pilar-a'
                  ? 'bg-[#064E3B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Pilar A: Mini E-book
            </button>
            <button
              type="button"
              onClick={() => setAbaPilarAtiva('pilar-b')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                abaPilarAtiva === 'pilar-b'
                  ? 'bg-[#0A1D56] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Pilar B: Mito vs. Evidência
            </button>
            <button
              type="button"
              onClick={() => setAbaPilarAtiva('pilar-c')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                abaPilarAtiva === 'pilar-c'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Pilar C: Canais Oficiais SUS
            </button>
          </div>
        </div>

        {/* PILAR A: DISTRIBUIÇÃO DE MINI E-BOOKS E FOLHETOS COMUNITÁRIOS */}
        {(abaPilarAtiva === 'todos' || abaPilarAtiva === 'pilar-a') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B] uppercase tracking-wider">
                  <span>Pilar A</span>
                  <span aria-hidden="true">·</span>
                  <span>Produção Editorial e Educação Popular</span>
                </div>
                <h3 className="font-cert-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
                  Mini E-book Gratuito: &ldquo;Vacinar é Proteger: Guia Prático para a Família&rdquo;
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                  Explore a prévia interativa dos 4 capítulos estruturados durante a campanha ou abra
                  o leitor completo com opção de impressão gratuita para distribuição comunitária.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalEbookAberto(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#064E3B] hover:bg-[#0D9488] text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Abrir Leitor Completo (4 Capítulos)</span>
                </button>
                <button
                  type="button"
                  disabled={baixandoEbook}
                  onClick={handleBaixarEbookDireto}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {baixandoEbook ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Baixando E-book...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Baixar Mini E-book (PDF)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrintMiniEbook}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Seletor de Capítulos + Prévia Interativa */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-2.5">
                {CAPITULOS_MINI_EBOOK.map((cap, idx) => {
                  const ativo = idx === capituloPreviaIdx;
                  return (
                    <button
                      key={cap.numero}
                      type="button"
                      onClick={() => setCapituloPreviaIdx(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        ativo
                          ? 'bg-[#ECFDF5] border-[#064E3B] shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#0D9488]">
                        <span>{cap.numero}</span>
                        <span>{cap.tempoLeitura}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#0F172A] mt-1">{cap.titulo}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{cap.subtitulo}</p>
                    </button>
                  );
                })}
              </div>

              {/* Painel de Prévia do Capítulo Ativo */}
              <div className="lg:col-span-7 bg-[#FFFDF9] border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#064E3B]">
                    <span>{CAPITULOS_MINI_EBOOK[capituloPreviaIdx].numero}</span>
                    <span aria-hidden="true">·</span>
                    <span>Prévia Editorial Interativa</span>
                  </div>
                  <h4 className="font-cert-serif text-2xl font-bold text-[#0A1D56] mt-1">
                    {CAPITULOS_MINI_EBOOK[capituloPreviaIdx].titulo}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {CAPITULOS_MINI_EBOOK[capituloPreviaIdx].subtitulo}
                  </p>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {CAPITULOS_MINI_EBOOK[capituloPreviaIdx].resumoExecutivo}
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tópicos Abordados neste Capítulo:
                  </p>
                  <ul className="space-y-2">
                    {CAPITULOS_MINI_EBOOK[capituloPreviaIdx].topicosChave.map((topico, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                        <span>{topico}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    {CAPITULOS_MINI_EBOOK[capituloPreviaIdx].conteudoIntegral.referenciaOficial}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalEbookAberto(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] hover:text-[#0D9488] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Ler este capítulo na íntegra</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PILAR B: RADAR INTERATIVO "MITO VS. EVIDÊNCIA CIENTÍFICA" (COMBATE A FAKE NEWS) */}
        {(abaPilarAtiva === 'todos' || abaPilarAtiva === 'pilar-b') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1D56] uppercase tracking-wider">
                  <span>Pilar B</span>
                  <span aria-hidden="true">·</span>
                  <span>Infodemiologia e Combate à Desinformação</span>
                </div>
                <h3 className="font-cert-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
                  Radar Interativo &ldquo;Mito vs. Evidência Científica&rdquo;
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Clique em cada cartão de dúvida ou <em>fake news</em> recorrente para virar e
                  consultar o parecer médico baseado em evidências elaborado pela equipe extensionista.
                </p>
              </div>

              <button
                type="button"
                onClick={revelarTodosMitos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFF6FF] hover:bg-blue-100 text-[#0A1D56] border border-[#1D4ED8]/20 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>
                  {Object.values(mitosRevelados).every(Boolean)
                    ? 'Voltar Todos para a Pergunta'
                    : 'Revelar Todas as Evidências'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RADAR_MITO_EVIDENCIA.map((card) => {
                const virado = !!mitosRevelados[card.id];
                return (
                  <div
                    key={card.id}
                    onClick={() => toggleMitoCard(card.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleMitoCard(card.id);
                      }
                    }}
                    className={`rounded-xl border p-6 transition-all cursor-pointer flex flex-col justify-between min-h-[270px] ${
                      virado
                        ? 'bg-[#ECFDF5]/85 border-[#064E3B] shadow-sm'
                        : 'bg-[#F8FAFC] border-slate-200 hover:border-[#0A1D56]/50 hover:bg-white'
                    }`}
                  >
                    {!virado ? (
                      /* FRENTE DO FLIP CARD: FAKE NEWS / DÚVIDA COMUM */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#92400E] uppercase tracking-wider">
                            Mito / Dúvida Comunitária #{card.id} · {card.categoria}
                          </span>
                          <span className="text-xs font-semibold text-[#1D4ED8] flex items-center gap-1">
                            <RotateCw className="w-3.5 h-3.5" />
                            Clique para ver a evidência
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-[#D97706] shrink-0 mt-1" />
                          <h4 className="font-cert-serif text-2xl font-bold text-[#0F172A] leading-snug">
                            &ldquo;{card.mitoPergunta}&rdquo;
                          </h4>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                          {card.alertaDesinformacao}
                        </p>
                      </div>
                    ) : (
                      /* VERSO DO FLIP CARD: RESPOSTA MÉDICA BASEADA EM EVIDÊNCIAS */
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#064E3B] uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                            {card.vereditoCientifico}
                          </span>
                          <span className="text-slate-500 underline">Voltar à pergunta</span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0A1D56]">{card.mitoPergunta}</h4>

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          {card.explicacaoMedica}
                        </p>

                        <div className="bg-white/90 border border-[#064E3B]/20 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-[#064E3B]">
                            Evidência Epidemiológica: {card.dadoComprovado}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Referência: {card.fonteCientifica}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold">
                      <span className={virado ? 'text-[#064E3B]' : 'text-slate-500'}>
                        {virado
                          ? 'Parecer Técnico Validado pela Equipe Extensionista'
                          : 'Toque no card para consultar o parecer científico'}
                      </span>
                      <span className="text-[#0D9488] font-bold">
                        {virado ? 'Evidência Ativa' : 'Verificar Evidência →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PILAR C: HUB DE DIVULGAÇÃO DOS CANAIS OFICIAIS DE IMUNIZAÇÃO */}
        {(abaPilarAtiva === 'todos' || abaPilarAtiva === 'pilar-c') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D97706] uppercase tracking-wider">
                <span>Pilar C</span>
                <span aria-hidden="true">·</span>
                <span>Utilidade Pública e Cidadania Digital no SUS</span>
              </div>
              <h3 className="font-cert-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
                Hub de Divulgação dos Canais Oficiais de Imunização
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Instruções passo a passo utilizadas nas ações comunitárias para ensinar a população a
                consultar sua Caderneta Digital de Vacinação, o Calendário Nacional do PNI e a checagem
                oficial do Governo Federal.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {CANAIS_OFICIAIS_IMUNIZACAO.map((canal) => (
                <div
                  key={canal.id}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500 font-medium">
                      {canal.orgaoResponsavel}
                    </div>
                    <h4 className="font-cert-serif text-2xl font-bold text-[#0A1D56]">
                      {canal.nomeOficial}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {canal.finalidadePublica}
                    </p>

                    <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                        Passo a Passo Ensinado na Campanha:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                        {canal.passoAPassoComunidade.map((passo, idx) => (
                          <li key={idx}>{passo}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-[#064E3B]">
                      {canal.destaqueUtilidade}
                    </p>
                    <a
                      href={canal.urlOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0A1D56] hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Acessar Canal Oficial ({canal.nomeOficial.split(' ')[0]})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ==========================================================================
          MÓDULO 4: VISUALIZADOR DE CERTIFICADO ESTILO PDF NATIVO DENTRO DO SITE
          ========================================================================== */}
      <section
        id="certificado-pdf"
        ref={certificadoSectionRef}
        className="py-14 px-4 sm:px-6 bg-slate-900/5 border-y border-slate-200 print-only-container"
      >
        <div className="max-w-7xl mx-auto space-y-6 print-only-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#064E3B]">
                <span>Visualizador Oficial de Documento Acadêmico</span>
                <span aria-hidden="true">·</span>
                <span>A4 Paisagem (297mm × 210mm)</span>
              </div>
              <h2 className="font-cert-serif text-3xl sm:text-4xl font-bold text-[#0F172A] mt-1">
                Certificado de Extensão Nº {certificadoPrincipal.numeroCertificado} (Frente e Verso)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Inspecione abaixo a Frente (Lauda 1) e o Memorial Descritivo no Verso (Lauda 2) ou
                utilize o botão de impressão para exportar as duas folhas em formato PDF A4 Paisagem.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-code-mono text-slate-600">
              <span>Arquivo:</span>
              <strong className="text-[#0A1D56]">{certificadoPrincipal.nomeArquivoPdf}</strong>
            </div>
          </div>

          {/* Componente Leitor PDF Nativo */}
          <CertificadoPdfViewer
            certificado={certificadoPrincipal}
            onSelectVerification={handleConfirmarVerificacaoQr}
          />
        </div>
      </section>

      {/* ==========================================================================
          MÓDULO 5: PORTAL DE VERIFICAÇÃO DE AUTENTICIDADE (CÓDIGO, CHAVE OU CPF)
          ========================================================================== */}
      <section
        id="validador"
        ref={validadorSectionRef}
        className="py-16 px-6 max-w-7xl mx-auto w-full space-y-8 no-print"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0D9488]">
                <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                <span>Sistema Público de Autenticação e Fé Pública</span>
              </div>
              <h2 className="font-cert-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                Portal de Verificação de Autenticidade
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Informe o Código de Autenticidade (<span className="font-code-mono font-semibold">EMS-EXT-2023-0418</span>),
                a Chave de Controle Numérica (<span className="font-code-mono font-semibold">0418-7027-9457-8F4B</span>)
                ou o CPF do titular (<span className="font-code-mono font-semibold">702.794.941-57</span>)
                para consultar a validade jurídica e o assentamento em livro.
              </p>
            </div>

            {/* Seletores Rápidos de Consulta por Código, Chave ou CPF */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTermoBusca('EMS-EXT-2023-0418');
                  setCertificadoVerificado(BANCO_CERTIFICADOS[0]);
                  setErroBusca(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-code-mono font-semibold bg-[#ECFDF5] text-[#064E3B] border border-[#064E3B]/25 hover:bg-emerald-100 cursor-pointer whitespace-nowrap shrink-0"
              >
                Código: EMS-EXT-2023-0418
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermoBusca('0418-7027-9457-8F4B');
                  setCertificadoVerificado(BANCO_CERTIFICADOS[0]);
                  setErroBusca(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-code-mono font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/40 hover:bg-amber-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                Chave: 0418-7027-9457-8F4B
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermoBusca('702.794.941-57');
                  setCertificadoVerificado(BANCO_CERTIFICADOS[0]);
                  setErroBusca(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-code-mono font-semibold bg-[#EFF6FF] text-[#0A1D56] border border-[#0A1D56]/25 hover:bg-blue-100 cursor-pointer whitespace-nowrap shrink-0"
              >
                CPF: 702.794.941-57
              </button>
            </div>
          </div>

          {/* Formulário de Consulta */}
          <form onSubmit={handleExecutarValidacao} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Digite o Código EMS-EXT-2023-0418, a Chave 0418-7027-9457-8F4B ou o CPF 702.794.941-57..."
                aria-label="Código de Autenticidade, Chave de Controle ou CPF"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-code-mono text-sm text-[#0F172A]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#064E3B] hover:bg-[#0D9488] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Verificar Autenticidade
            </button>
          </form>

          {/* Exibição de Erro caso código/CPF não exista */}
          {erroBusca && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-sm text-red-800"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{erroBusca}</span>
            </div>
          )}

          {/* Dossiê Completo de Certificação Validada */}
          {certificadoVerificado && (
            <div className="bg-[#ECFDF5]/60 border border-[#064E3B]/30 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#064E3B]/15 pb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#064E3B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                      Certidão Positiva de Autenticidade Acadêmica · Status: {certificadoVerificado.statusRegistro}
                    </span>
                    <h3 className="font-cert-serif text-2xl font-bold text-[#0F172A]">
                      {certificadoVerificado.titular} — {certificadoVerificado.profissao}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-code-mono text-xs">
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-[#064E3B]/25 text-[#064E3B] font-bold">
                    Cód.: {certificadoVerificado.codigoAutenticidade}
                  </span>
                  <span className="bg-[#FEF3C7] px-3 py-1.5 rounded-lg border border-[#D97706]/35 text-[#92400E] font-bold">
                    Chave: {certificadoVerificado.chaveControleVerificacao}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">
                    Titular e Documento
                  </span>
                  <p className="font-bold text-sm text-[#0F172A]">{certificadoVerificado.titular}</p>
                  <p className="font-code-mono text-slate-700">
                    CPF: {certificadoVerificado.cpf} ({certificadoVerificado.cpfMascarado})
                  </p>
                  <p className="text-slate-600">{certificadoVerificado.instituicaoEnsino}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">
                    Enquadramento e Carga Horária
                  </span>
                  <p className="font-bold text-sm text-[#0A1D56]">
                    {certificadoVerificado.cargaHorariaExtenso} ({certificadoVerificado.periodoRealizacao})
                  </p>
                  <p className="text-slate-700 leading-snug">
                    {certificadoVerificado.enquadramentoCurricular}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">
                    Assentamento em Livro Oficial
                  </span>
                  <p className="font-bold text-sm text-[#064E3B]">
                    Certificado Nº {certificadoVerificado.numeroCertificado} · {certificadoVerificado.livroRegistro}
                  </p>
                  <p className="text-slate-700">
                    {certificadoVerificado.folhaRegistro} · Emitido em {certificadoVerificado.localDataEmissao}
                  </p>
                  <p className="font-code-mono text-[11px] text-slate-500">
                    Editora Mente e Saúde & Centro Maria Dalva de Araújo
                  </p>
                </div>
              </div>

              {/* Endereço Direto de Verificação Manual e Hash SHA-256 */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#0A1D56]">
                      Endereço Direto de Autenticação Pública (Acesso via QR Code ou Navegador)
                    </p>
                    <p className="font-code-mono text-xs font-semibold text-[#064E3B] break-all select-all">
                      {obterUrlCompletaVerificacao(certificadoVerificado.codigoAutenticidade)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Assinatura Digital / Hash Criptográfico SHA-256 do Registro
                    </p>
                    <p className="font-code-mono text-xs text-[#0F172A] break-all select-all">
                      {certificadoVerificado.hashSha256}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyHash(certificadoVerificado.hashSha256)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {hashCopiado ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hash Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Hash SHA-256</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={baixandoCertificado}
                    onClick={() => handleBaixarCertificadoDireto(certificadoVerificado)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {baixandoCertificado ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Gerando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Certificado A4 (PDF)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================================================
          VERSÃO IMPRESSA DEDICADA DO MINI E-BOOK (Visível apenas quando printing-ebook)
          ========================================================================== */}
      <section className="hidden ebook-print-sheet p-8 space-y-6 bg-white text-slate-900">
        <div className="border-b-2 border-[#064E3B] pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-cert-serif text-3xl font-bold text-[#064E3B]">
              Vacinar é Proteger: Guia Prático para a Família
            </h1>
            <p className="text-xs text-slate-600">
              Editora Mente e Saúde (CNPJ: 51.372.335/0001-71) & Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83)
            </p>
          </div>
          <span className="font-code-mono text-xs font-bold text-[#0A1D56]">
            Material Educativo Gratuito · PNI/SUS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {CAPITULOS_MINI_EBOOK.map((cap) => (
            <div key={cap.numero} className="border border-slate-300 rounded-lg p-4 space-y-2">
              <p className="text-xs font-bold text-[#0D9488] uppercase">{cap.numero}</p>
              <h2 className="font-cert-serif text-xl font-bold text-[#0A1D56]">{cap.titulo}</h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                {cap.conteudoIntegral.introducao}
              </p>
              <p className="text-xs font-semibold text-[#064E3B]">
                Orientação: {cap.conteudoIntegral.orientacaoPraticaFamilia}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          RODAPÉ INSTITUCIONAL
          ========================================================================== */}
      <footer className="mt-auto bg-[#0F172A] text-slate-300 py-12 px-6 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <LogoEditoraMenteSaude size="sm" variant="shield" />
              <LogoCentroProfissionalizante size="sm" />
              <span className="font-cert-serif text-xl font-bold text-white">
                Extensão Comunitária & Saúde Pública
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Portal Oficial da Campanha Educativa de Conscientização sobre Vacinação e Sistema de
              Validação Pública de Certificados de Extensão Universitária e Profissionalizante.
            </p>
          </div>

          <div className="md:col-span-4 space-y-2 text-xs">
            <p className="font-bold text-white uppercase tracking-wider">
              Instituições Certificadoras Parceiras
            </p>
            <p className="text-slate-300">
              <strong>Editora Mente e Saúde</strong> — CNPJ: 51.372.335/0001-71
              <br />
              Coordenação Editorial: Bárbara Lima dos Santos
            </p>
            <p className="text-slate-300 pt-1">
              <strong>Centro Profissionalizante Maria Dalva de Araújo</strong> — CNPJ: 51.269.112/0001-83
              <br />
              Coordenação de Extensão: James Araújo de Santana
            </p>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <p className="font-bold text-white uppercase tracking-wider">
              Acesso Rápido e Verificação
            </p>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="#campanha" className="hover:text-white transition-colors">
                  Metodologia da Campanha
                </a>
              </li>
              <li>
                <a href="#pilares" className="hover:text-white transition-colors">
                  Mini E-book e Radar Mito vs. Evidência
                </a>
              </li>
              <li>
                <a href="#certificado-pdf" className="hover:text-white transition-colors">
                  Certificado Nº 01 (Leitor PDF A4)
                </a>
              </li>
              <li>
                <a href="#validador" className="hover:text-white transition-colors">
                  Portal Validador (Cód. EMS-EXT-2023-0418)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2023–2026 Editora Mente e Saúde & Centro Profissionalizante Maria Dalva de Araújo.
            Todos os direitos reservados.
          </p>
          <p className="font-code-mono text-[11px]">
            Registro Ativo: EMS-EXT-2023-0418 · Livro 01/2023 · Folha 42
          </p>
        </div>
      </footer>

      {/* Modal do Leitor Completo do Mini E-book */}
      <MiniEbookModal
        isOpen={modalEbookAberto}
        activeChapterIndex={capituloPreviaIdx}
        onSelectChapter={setCapituloPreviaIdx}
        onClose={() => setModalEbookAberto(false)}
      />
    </div>
  );
}
