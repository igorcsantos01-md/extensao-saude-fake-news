import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  Printer,
  Download,
  Loader2,
  ShieldCheck,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { CertificadoExtensao } from '../data/certificadosData';
import {
  LogoEditoraMenteSaude,
  LogoCentroProfissionalizante,
  AssinaturaInstitucional,
  SeloDouradoAutenticidade,
  QrCodeDinamico,
  obterEnderecoPortalVerificacao,
  obterUrlCompletaVerificacao,
} from './InstitutionalAssets';
import { baixarCertificadoPdfA4 } from '../utils/pdfGenerator';

interface CertificadoPdfViewerProps {
  certificado: CertificadoExtensao;
  onSelectVerification: (codigo: string) => void;
}

type ModoPagina = 'frente' | 'verso' | 'ambos';

export const CertificadoPdfViewer: React.FC<CertificadoPdfViewerProps> = ({
  certificado,
  onSelectVerification,
}) => {
  const [modoPagina, setModoPagina] = useState<ModoPagina>('ambos');
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [containerScale, setContainerScale] = useState<number>(1);
  const [gerandoPdf, setGerandoPdf] = useState<boolean>(false);
  const stageWrapperRef = useRef<HTMLDivElement>(null);
  const frenteArticleRef = useRef<HTMLElement>(null);
  const versoArticleRef = useRef<HTMLElement>(null);

  const portalBaseUrl = obterEnderecoPortalVerificacao();
  const verificationUrl = obterUrlCompletaVerificacao(certificado.codigoAutenticidade);

  // Calcula escala responsiva automática para telas menores sem perder a proporção A4 Paisagem (1122x793)
  useEffect(() => {
    const updateScale = () => {
      if (!stageWrapperRef.current) return;
      const availableWidth = stageWrapperRef.current.clientWidth - 48;
      const baseSheetWidth = 1122;
      if (availableWidth < baseSheetWidth) {
        setContainerScale(Math.max(0.32, availableWidth / baseSheetWidth));
      } else {
        setContainerScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const effectiveScale = containerScale * (zoomPercent / 100);

  const handleZoomOut = () => {
    setZoomPercent((prev) => Math.max(70, prev - 10));
  };

  const handleZoomIn = () => {
    setZoomPercent((prev) => Math.min(130, prev + 10));
  };

  const handleZoomReset = () => {
    setZoomPercent(100);
  };

  const handleDownloadCertificatePdf = async () => {
    if (gerandoPdf) return;
    setGerandoPdf(true);
    try {
      await baixarCertificadoPdfA4(
        certificado,
        frenteArticleRef.current,
        versoArticleRef.current
      );
    } finally {
      setGerandoPdf(false);
    }
  };

  const handlePrintCertificate = () => {
    document.body.classList.remove('printing-ebook');
    window.print();
  };

  const exibirFrente = modoPagina === 'frente' || modoPagina === 'ambos';
  const exibirVerso = modoPagina === 'verso' || modoPagina === 'ambos';

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-[#0F172A] print-only-container cert-print-section">
      {/* ==========================================================================
          BARRA SUPERIOR DO VISUALIZADOR PDF (TOOLBAR ESCURA #1E293B)
          ========================================================================== */}
      <div className="bg-[#1E293B] text-slate-100 px-4 py-3.5 border-b border-slate-700/80 no-print">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Identificação do Arquivo PDF */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-400/30 flex items-center justify-center text-red-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-code-mono text-xs sm:text-sm font-semibold text-white truncate">
                  {certificado.nomeArquivoPdf}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Documento Oficial A4 Paisagem (297mm × 210mm) · Assinado Digitalmente e Registrado em Livro
              </p>
            </div>
          </div>

          {/* Alternador de Páginas Interativo */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0F172A]/80 p-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setModoPagina('frente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                modoPagina === 'frente'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              📄 Página 1: Frente do Certificado
            </button>
            <button
              type="button"
              onClick={() => setModoPagina('verso')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                modoPagina === 'verso'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              📋 Página 2: Verso / Memorial e Registro
            </button>
            <button
              type="button"
              onClick={() => setModoPagina('ambos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                modoPagina === 'ambos'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              📑 Visualizar Frente e Verso Juntos
            </button>
          </div>

          {/* Controles de Zoom + Botões de Download Direto PDF e Impressão A4 Paisagem */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center bg-[#0F172A] border border-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Reduzir Zoom (-)"
                aria-label="Reduzir Zoom"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                title="Restaurar Zoom 100%"
                className="px-2.5 py-1 font-code-mono text-xs font-semibold text-slate-200 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                {zoomPercent}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Aumentar Zoom (+)"
                aria-label="Aumentar Zoom"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {zoomPercent !== 100 && (
                <button
                  type="button"
                  onClick={handleZoomReset}
                  title="Resetar Zoom"
                  className="p-1.5 text-amber-400 hover:text-amber-300 rounded-md transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={gerandoPdf}
              onClick={handleDownloadCertificatePdf}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] disabled:opacity-60 text-white shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {gerandoPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando PDF A4...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>⬇️ Baixar PDF Original (A4 Paisagem)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintCertificate}
              title="Imprimir diretamente na impressora ou Salvar como PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>🖨️ Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-barra de Status Criptográfico e Validação Direta */}
      <div className="bg-[#0F172A] px-5 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
          <span>Registro Oficial nº {certificado.numeroCertificado}</span>
          <span aria-hidden="true">·</span>
          <span className="font-code-mono text-emerald-300 font-semibold">
            Cód. {certificado.codigoAutenticidade}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-code-mono text-amber-300 font-semibold">
            Chave: {certificado.chaveControleVerificacao}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {certificado.livroRegistro}, {certificado.folhaRegistro}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelectVerification(certificado.codigoAutenticidade)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Validar Registro Digital deste Certificado</span>
        </button>
      </div>

      {/* ==========================================================================
          PALCO DE VISUALIZAÇÃO DO DOCUMENTO A4 PAISAGEM (FRENTE E VERSO)
          ========================================================================== */}
      <div
        ref={stageWrapperRef}
        className="w-full bg-[#334155] py-8 px-4 sm:px-6 overflow-x-auto flex flex-col items-center gap-10 print-only-container"
      >
        {/* PÁGINA 1: FRENTE DO CERTIFICADO */}
        <div
          className={`${
            exibirFrente ? 'block' : 'hidden print:block'
          } flex flex-col items-center`}
          style={{
            height: `${Math.round(793 * effectiveScale)}px`,
            width: `${Math.round(1122 * effectiveScale)}px`,
          }}
        >
          <div
            className="cert-zoom-stage origin-top-left"
            style={{
              transform: `scale(${effectiveScale})`,
              width: '1122px',
              height: '793px',
            }}
          >
            <article
              ref={frenteArticleRef}
              aria-label="Página 1: Frente do Certificado de Extensão"
              className="cert-a4-sheet px-14 py-9 flex flex-col justify-between"
            >
              {/* Moldura Guilloché Acadêmica Tripla */}
              <div className="guilloche-outer-border" />
              <div className="guilloche-middle-border" />
              <div className="guilloche-inner-border" />

              {/* Cantoneiras Clássicas Acadêmicas */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-[#D97706] pointer-events-none" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-[#D97706] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-[#D97706] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-[#D97706] pointer-events-none" />

              {/* CABEÇALHO DO CERTIFICADO (Logos lado a lado + Título do Programa) */}
              <header className="relative z-10 flex items-center justify-between gap-6 border-b border-[#064E3B]/20 pb-3.5 pt-1">
                <div className="flex items-center gap-3.5 shrink-0">
                  <LogoEditoraMenteSaude size="cert" variant="shield" />
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B] leading-tight">
                      Editora Mente e Saúde
                    </p>
                    <p className="font-code-mono text-[9.5px] font-semibold text-[#0F172A]/75">
                      CNPJ: 51.372.335/0001-71
                    </p>
                    <p className="text-[9px] text-[#0D9488] font-medium">
                      Conselho Editorial e Extensão Científica
                    </p>
                  </div>
                </div>

                <div className="text-center max-w-[460px] px-2">
                  <p className="text-[10.5px] font-bold tracking-[0.16em] text-[#064E3B] uppercase leading-snug">
                    PROGRAMA INTERINSTITUCIONAL DE EXTENSÃO, COMUNICAÇÃO CIENTÍFICA E EDUCAÇÃO EM SAÚDE
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-[9.5px] text-[#0F172A]/75 font-medium">
                    <span>Certificado Nº {certificado.numeroCertificado}</span>
                    <span aria-hidden="true">·</span>
                    <span>{certificado.livroRegistro}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-code-mono font-semibold text-[#0A1D56]">
                      Cód. {certificado.codigoAutenticidade}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#0A1D56] leading-tight">
                      Centro Profissionalizante
                    </p>
                    <p className="text-[10.5px] font-bold uppercase text-[#0A1D56] leading-tight">
                      Maria Dalva de Araújo
                    </p>
                    <p className="font-code-mono text-[9.5px] font-semibold text-[#0F172A]/75">
                      CNPJ: 51.269.112/0001-83
                    </p>
                  </div>
                  <LogoCentroProfissionalizante size="cert" />
                </div>
              </header>

              {/* CORPO PRINCIPAL DA FRENTE DO CERTIFICADO */}
              <div className="relative z-10 my-auto py-1 text-center px-6">
                <div className="inline-block mb-1.5">
                  <h1 className="font-cert-cinzel text-[31px] font-bold tracking-[0.12em] text-[#064E3B] uppercase leading-tight">
                    CERTIFICADO DE ATIVIDADE DE EXTENSÃO
                  </h1>
                  <div className="h-[2px] w-72 mx-auto bg-gradient-to-r from-transparent via-[#D97706] to-transparent mt-1" />
                </div>

                <p className="text-[14px] leading-relaxed text-[#0F172A] max-w-[910px] mx-auto mt-1.5">
                  A <strong className="font-semibold text-[#064E3B]">Editora Mente e Saúde</strong>{' '}
                  (<span className="font-code-mono text-[12.5px]">CNPJ: 51.372.335/0001-71</span>), em
                  parceria institucional com o{' '}
                  <strong className="font-semibold text-[#0A1D56]">
                    Centro Profissionalizante Maria Dalva de Araújo
                  </strong>{' '}
                  (<span className="font-code-mono text-[12.5px]">CNPJ: 51.269.112/0001-83</span>),
                  certifica para os devidos fins de comprovação curricular e acadêmica que
                </p>

                {/* Nome e Qualificação do Titular */}
                <div className="my-3 py-2 px-8 bg-gradient-to-r from-[#ECFDF5]/60 via-[#FFFBEB]/80 to-[#EFF6FF]/60 border-y border-[#D97706]/35 max-w-[880px] mx-auto">
                  <h2 className="font-cert-serif text-[33px] font-bold tracking-wide text-[#0A1D56] uppercase leading-none">
                    {certificado.titular}
                  </h2>
                  <p className="mt-1.5 text-[13px] font-semibold text-[#0F172A] tracking-wide">
                    <span>{certificado.profissao}</span>
                    <span className="mx-2 text-[#D97706]">|</span>
                    <span className="font-code-mono">CPF: {certificado.cpf}</span>
                    <span className="mx-2 text-[#D97706]">|</span>
                    <span>{certificado.instituicaoEnsino}</span>
                  </p>
                </div>

                {/* Descrição da Campanha e Carga Horária */}
                <div className="space-y-2 text-[13.5px] leading-[1.58] text-[#0F172A] max-w-[930px] mx-auto text-justify">
                  <p>
                    participou de forma efetiva da Atividade de Extensão intitulada{' '}
                    <strong className="font-bold text-[#064E3B]">
                      &ldquo;{certificado.tituloAtividade}&rdquo;
                    </strong>
                    , desenvolvida na modalidade de{' '}
                    <strong className="font-semibold text-[#0A1D56]">
                      {certificado.modalidade}
                    </strong>
                    , realizada no período de{' '}
                    <strong className="font-semibold">{certificado.periodoRealizacao}</strong>,
                    contabilizando carga horária total de{' '}
                    <strong className="font-bold text-[#064E3B] underline decoration-[#D97706] underline-offset-4">
                      {certificado.cargaHorariaExtenso}
                    </strong>
                    .
                  </p>
                  <p>{certificado.sinteseAtuacao}</p>
                </div>

                {/* Local e Data de Emissão */}
                <p className="mt-3 font-cert-serif italic text-[16.5px] font-semibold text-[#0F172A]">
                  {certificado.localDataEmissao}
                </p>
              </div>

              {/* RODAPÉ DA FRENTE: ASSINATURAS + SELO DOURADO + QR CODE REAL + QUADRO DE VERIFICAÇÃO MANUAL */}
              <footer className="relative z-10 pt-2 border-t border-[#064E3B]/15 space-y-1.5">
                <div className="flex items-end justify-between gap-3">
                  <AssinaturaInstitucional tipo="barbara" />

                  {/* Núcleo Central de Fé Pública, QR Code Real e Endereço/Código para Verificação Manual */}
                  <div className="flex items-center gap-2.5 shrink-0 pb-0.5">
                    <SeloDouradoAutenticidade codigo={certificado.codigoAutenticidade} />
                    <QrCodeDinamico
                      codigo={certificado.codigoAutenticidade}
                      size={78}
                      showCaption={false}
                      onSelectVerification={() =>
                        onSelectVerification(certificado.codigoAutenticidade)
                      }
                    />
                    <div className="bg-white/95 border border-[#064E3B]/40 rounded-lg p-2 text-left w-[195px] shadow-2xs space-y-0.5">
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-[#064E3B]">
                        Autenticação Pública Manual
                      </p>
                      <p className="font-code-mono text-[8.5px] font-bold text-[#0F172A]">
                        Cód.: {certificado.codigoAutenticidade}
                      </p>
                      <p className="font-code-mono text-[8px] font-bold text-[#92400E]">
                        Chave: {certificado.chaveControleVerificacao}
                      </p>
                      <p className="text-[7.5px] font-semibold text-[#0A1D56] pt-0.5">
                        Endereço de Verificação Online:
                      </p>
                      <p className="font-code-mono text-[7px] text-slate-700 break-all leading-tight">
                        {portalBaseUrl}
                      </p>
                    </div>
                  </div>

                  <AssinaturaInstitucional tipo="james" />
                </div>

                {/* Linha de Rodapé de Verificação Manual por Extenso */}
                <div className="text-center pt-0.5">
                  <p className="font-code-mono text-[8px] font-semibold text-[#064E3B]">
                    Verificação de Autenticidade: Escaneie o QR Code com a câmera ou acesse{' '}
                    <span className="underline">{portalBaseUrl}</span> informando o Código{' '}
                    <strong>{certificado.codigoAutenticidade}</strong> ou a Chave{' '}
                    <strong>{certificado.chaveControleVerificacao}</strong>
                  </p>
                </div>
              </footer>
            </article>
          </div>
        </div>

        {/* PÁGINA 2: VERSO DO CERTIFICADO (MEMORIAL DESCRITIVO E REGISTRO ACADÊMICO) */}
        <div
          className={`${
            exibirVerso ? 'block' : 'hidden print:block'
          } flex flex-col items-center`}
          style={{
            height: `${Math.round(793 * effectiveScale)}px`,
            width: `${Math.round(1122 * effectiveScale)}px`,
          }}
        >
          <div
            className="cert-zoom-stage origin-top-left"
            style={{
              transform: `scale(${effectiveScale})`,
              width: '1122px',
              height: '793px',
            }}
          >
            <article
              ref={versoArticleRef}
              aria-label="Página 2: Verso do Certificado — Memorial Descritivo e Registro Acadêmico"
              className="cert-a4-sheet px-14 py-8 flex flex-col justify-between"
            >
              {/* Moldura Guilloché Acadêmica Tripla */}
              <div className="guilloche-outer-border" />
              <div className="guilloche-middle-border" />
              <div className="guilloche-inner-border" />

              {/* Cabeçalho do Verso */}
              <header className="relative z-10 flex items-center justify-between border-b-2 border-[#064E3B] pb-2.5">
                <div className="flex items-center gap-3">
                  <LogoEditoraMenteSaude size="sm" variant="shield" />
                  <LogoCentroProfissionalizante size="sm" />
                  <div>
                    <h2 className="font-cert-cinzel text-[17.5px] font-bold text-[#064E3B] tracking-wider uppercase">
                      MEMORIAL DESCRITIVO E REGISTRO ACADÊMICO DE ATIVIDADE DE EXTENSÃO
                    </h2>
                    <p className="text-[10.5px] text-[#0F172A]/80 font-medium">
                      Verso Oficial do Certificado Nº {certificado.numeroCertificado} · Fé Pública Interinstitucional e Validação Curricular
                    </p>
                  </div>
                </div>

                <div className="text-right font-code-mono">
                  <span className="text-[9.5px] uppercase tracking-wider text-[#0A1D56] block font-bold">
                    STATUS DO DOCUMENTO
                  </span>
                  <span className="text-[11px] font-bold text-[#064E3B]">
                    ● {certificado.statusRegistro}
                  </span>
                </div>
              </header>

              {/* Quadro 1: Identificação Completa do Participante e Enquadramento Curricular */}
              <div className="relative z-10 grid grid-cols-12 gap-4 my-1.5">
                <div className="col-span-7 bg-white/90 border border-[#064E3B]/25 rounded-lg p-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#064E3B] border-b border-slate-200 pb-1 mb-1.5">
                    1. Dados de Identificação do Profissional Extensionista
                  </h3>
                  <dl className="grid grid-cols-2 gap-y-1 gap-x-4 text-[11px]">
                    <div>
                      <dt className="text-slate-500 text-[9.5px] uppercase">Titular Certificado</dt>
                      <dd className="font-bold text-[#0F172A]">{certificado.titular}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 text-[9.5px] uppercase">CPF Registrado</dt>
                      <dd className="font-code-mono font-semibold text-[#0F172A]">
                        {certificado.cpf}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 text-[9.5px] uppercase">Qualificação Profissional</dt>
                      <dd className="font-semibold text-[#0A1D56]">{certificado.profissao}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 text-[9.5px] uppercase">Instituição de Origem / Formação</dt>
                      <dd className="font-semibold text-[#0F172A]">
                        {certificado.instituicaoEnsino}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="col-span-5 bg-[#EFF6FF]/75 border border-[#0A1D56]/25 rounded-lg p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#0A1D56] border-b border-[#0A1D56]/15 pb-1 mb-1">
                      2. Enquadramento Curricular e Pontuação
                    </h3>
                    <p className="text-[11px] font-semibold text-[#0F172A] leading-snug">
                      {certificado.enquadramentoCurricular}
                    </p>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-[#0A1D56]/15 flex items-center justify-between text-[10.5px]">
                    <span className="font-medium text-slate-600">Período: {certificado.periodoRealizacao}</span>
                    <span className="font-code-mono font-bold text-[#064E3B]">
                      Carga Total: {certificado.cargaHorariaTotal}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Quadro 2: Detalhamento das 12 Horas de Atividades Práticas */}
              <div className="relative z-10 bg-white/90 border border-[#064E3B]/25 rounded-lg overflow-hidden my-1">
                <div className="bg-[#ECFDF5] px-4 py-1 border-b border-[#064E3B]/20 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#064E3B]">
                    3. Matriz de Atividades Práticas e Metodologia Extensionista (12 Horas)
                  </h3>
                  <span className="font-code-mono text-[9.5px] font-semibold text-[#064E3B]">
                    18 a 20 de maio de 2023
                  </span>
                </div>
                <table className="w-full text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[9.5px] uppercase">
                      <th className="py-1 px-3 font-semibold w-[27%]">Eixo de Atuação</th>
                      <th className="py-1 px-3 font-semibold w-[46%]">Detalhamento Técnico-Científico</th>
                      <th className="py-1 px-3 font-semibold w-[18%]">Natureza</th>
                      <th className="py-1 px-3 font-semibold text-right w-[9%]">C.H.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {certificado.detalhamentoCargaHoraria.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-3 font-bold text-[#0A1D56] align-top">
                          {item.etapa}
                        </td>
                        <td className="py-1.5 px-3 text-[#0F172A] leading-snug align-top">
                          {item.descricao}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 align-top">
                          {item.eixoMetodologico}
                        </td>
                        <td className="py-1.5 px-3 font-code-mono font-bold text-[#064E3B] text-right align-top">
                          {item.horas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quadro 3: Registro Acadêmico, Endereço Web Manual, Código, Chave de Controle e Hash SHA-256 + QR Code Real */}
              <div className="relative z-10 grid grid-cols-12 gap-3 items-center bg-[#FFFBEB]/90 border border-[#D97706]/45 rounded-lg p-3 my-1">
                <div className="col-span-9 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
                      4. Registro Oficial de Fé Pública, Endereço Web e Chaves de Verificação de Autenticidade
                    </h3>
                    <div className="flex items-center gap-3 font-code-mono text-[10px] font-bold">
                      <span className="text-[#064E3B]">
                        Código: {certificado.codigoAutenticidade}
                      </span>
                      <span className="text-[#92400E]">
                        Chave/Dígito: {certificado.chaveControleVerificacao}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-[#0F172A] leading-snug">
                    Certificado registrado sob o <strong>nº {certificado.numeroCertificado}</strong> no{' '}
                    <strong>{certificado.livroRegistro}</strong>, <strong>{certificado.folhaRegistro}</strong>,
                    expedido conjuntamente pela <strong>Editora Mente e Saúde (CNPJ: 51.372.335/0001-71)</strong> e
                    pelo <strong>Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83)</strong>.
                  </p>
                  <div className="grid grid-cols-1 gap-1 pt-0.5">
                    <div className="flex items-center gap-2 text-[9.5px] font-code-mono text-[#0A1D56] bg-white/95 px-2.5 py-1 rounded border border-[#0A1D56]/20">
                      <span className="font-bold uppercase shrink-0">
                        Endereço p/ Verificação Manual (sem QR Code):
                      </span>
                      <span className="truncate select-all font-semibold">{verificationUrl}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9.5px] font-code-mono text-slate-700 bg-white/95 px-2.5 py-1 rounded border border-[#D97706]/30">
                      <span className="font-bold text-[#92400E] shrink-0">HASH SHA-256:</span>
                      <span className="truncate select-all">{certificado.hashSha256}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2.5">
                  <div className="text-right text-[9px] leading-tight text-slate-700">
                    <p className="font-bold text-[#0F172A]">Leitura via Câmera</p>
                    <p>Aponte a câmera do celular para o QR Code ou acesse a URL ao lado.</p>
                  </div>
                  <QrCodeDinamico
                    codigo={certificado.codigoAutenticidade}
                    size={76}
                    showCaption={false}
                    onSelectVerification={() =>
                      onSelectVerification(certificado.codigoAutenticidade)
                    }
                  />
                </div>
              </div>

              {/* Rodapé do Verso com Rubricas */}
              <footer className="relative z-10 pt-1 flex items-end justify-between gap-6">
                <AssinaturaInstitucional tipo="barbara" compact />
                <div className="text-center pb-0.5 max-w-[340px]">
                  <p className="font-cert-serif italic text-xs font-semibold text-slate-800">
                    {certificado.localDataEmissao}
                  </p>
                  <p className="font-code-mono text-[8.5px] text-slate-600 mt-0.5">
                    Documento Oficial de 2 Laudas (Frente e Verso) · Válido em Território Nacional
                  </p>
                  <p className="font-code-mono text-[8px] font-semibold text-[#064E3B]">
                    Cód.: {certificado.codigoAutenticidade} · Chave: {certificado.chaveControleVerificacao}
                  </p>
                </div>
                <AssinaturaInstitucional tipo="james" compact />
              </footer>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
