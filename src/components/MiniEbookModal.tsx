import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Printer,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { CAPITULOS_MINI_EBOOK, CapituloEbook } from '../data/certificadosData';
import {
  LogoEditoraMenteSaude,
  LogoCentroProfissionalizante,
} from './InstitutionalAssets';
import { baixarMiniEbookPdf } from '../utils/pdfGenerator';

interface MiniEbookModalProps {
  isOpen: boolean;
  activeChapterIndex: number;
  onSelectChapter: (idx: number) => void;
  onClose: () => void;
}

export const MiniEbookModal: React.FC<MiniEbookModalProps> = ({
  isOpen,
  activeChapterIndex,
  onSelectChapter,
  onClose,
}) => {
  const [baixandoEbook, setBaixandoEbook] = useState(false);

  if (!isOpen) return null;

  const capitulo: CapituloEbook =
    CAPITULOS_MINI_EBOOK[activeChapterIndex] || CAPITULOS_MINI_EBOOK[0];

  const handleDownloadEbookPdf = async () => {
    if (baixandoEbook) return;
    setBaixandoEbook(true);
    try {
      await baixarMiniEbookPdf();
    } finally {
      setBaixandoEbook(false);
    }
  };

  const handlePrintEbook = () => {
    document.body.classList.add('printing-ebook');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-ebook');
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ebook-modal-title"
    >
      <div className="bg-[#FFFDF9] border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Cabeçalho do Leitor Editorial */}
        <div className="bg-[#064E3B] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="w-6 h-6 text-amber-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                Publicação Educativa de Distribuição Gratuita · Registro 2023–2026
              </p>
              <h2
                id="ebook-modal-title"
                className="font-cert-serif text-xl sm:text-2xl font-bold text-white truncate"
              >
                Vacinar é Proteger: Guia Prático para a Família
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={baixandoEbook}
              onClick={handleDownloadEbookPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {baixandoEbook ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Baixando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar E-book (PDF)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrintEbook}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar Leitor do Mini E-book"
              className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Navegação entre os 4 Capítulos */}
        <div className="bg-[#ECFDF5] px-6 py-2.5 border-b border-emerald-200 flex items-center gap-2 overflow-x-auto shrink-0">
          {CAPITULOS_MINI_EBOOK.map((cap, idx) => (
            <button
              key={cap.numero}
              type="button"
              onClick={() => onSelectChapter(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                idx === activeChapterIndex
                  ? 'bg-[#064E3B] text-white shadow-sm'
                  : 'text-[#064E3B] hover:bg-emerald-100'
              }`}
            >
              {cap.numero}: {cap.titulo}
            </button>
          ))}
        </div>

        {/* Conteúdo Editorial do Capítulo Selecionado */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#0F172A]">
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2 text-xs text-[#0D9488] font-semibold">
              <span>{capitulo.numero}</span>
              <span aria-hidden="true">·</span>
              <span>{capitulo.tempoLeitura}</span>
              <span aria-hidden="true">·</span>
              <span>Coordenação Técnica: Dr. Lucas Gonçalves Silveira & Equipe Extensionista</span>
            </div>
            <h3 className="font-cert-serif text-3xl font-bold text-[#064E3B] mt-1">
              {capitulo.titulo}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{capitulo.subtitulo}</p>
          </div>

          {/* Introdução com Capitular */}
          <p className="text-base leading-relaxed text-slate-800 max-w-3xl first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-[#064E3B] first-letter:float-left first-letter:mr-2.5 first-letter:leading-none">
            {capitulo.conteudoIntegral.introducao}
          </p>

          {/* Seções Científicas do Capítulo */}
          <div className="space-y-5">
            {capitulo.conteudoIntegral.secoes.map((sec, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs"
              >
                <h4 className="text-base font-bold text-[#0A1D56]">
                  {sec.subtituloSecao}
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  {sec.paragrafo}
                </p>
                <div className="bg-[#ECFDF5] border border-[#0D9488]/30 rounded-lg p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-[#064E3B] leading-relaxed">
                    {sec.destaqueClinico}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Orientação Prática para a Família */}
          <div className="bg-[#FFFBEB] border border-[#D97706]/40 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#92400E]">
              <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
              <span>Recomendação Prática para a Família</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">
              {capitulo.conteudoIntegral.orientacaoPraticaFamilia}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              {capitulo.conteudoIntegral.referenciaOficial}
            </p>
          </div>
        </div>

        {/* Rodapé de Paginação do Leitor */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <LogoEditoraMenteSaude size="sm" />
            <LogoCentroProfissionalizante size="sm" />
            <span className="text-xs text-slate-600 hidden sm:inline">
              Editora Mente e Saúde & Centro Profissionalizante Maria Dalva de Araújo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeChapterIndex === 0}
              onClick={() => onSelectChapter(Math.max(0, activeChapterIndex - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Capítulo Anterior</span>
            </button>
            <button
              type="button"
              disabled={activeChapterIndex === CAPITULOS_MINI_EBOOK.length - 1}
              onClick={() =>
                onSelectChapter(
                  Math.min(CAPITULOS_MINI_EBOOK.length - 1, activeChapterIndex + 1)
                )
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#064E3B] text-white hover:bg-[#0D9488] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Próximo Capítulo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
