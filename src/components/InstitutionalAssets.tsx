import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';

export function obterEnderecoPortalVerificacao(): string {
  if (typeof window === 'undefined') {
    return 'https://portal-extensao.github.io/';
  }
  return `${window.location.origin}${window.location.pathname}`;
}

export function obterUrlCompletaVerificacao(codigo: string): string {
  const base = obterEnderecoPortalVerificacao();
  return `${base}?codigo=${encodeURIComponent(codigo)}#validador`;
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'cert';
  variant?: 'shield' | 'circle';
  className?: string;
}

/**
 * Logo da Editora Mente e Saúde (./assets/logo-editora.png)
 * Aplica moldura escudo arredondado (border-radius: 16px) ou circular (50%) com
 * mix-blend-mode: multiply sobre fundo claro e borda dupla institucional que integra #C8FCE1.
 */
export const LogoEditoraMenteSaude: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'shield',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: 'w-11 h-11',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
    cert: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`${
        variant === 'circle' ? 'logo-editora-container-circle' : 'logo-editora-container'
      } ${dimensions} shrink-0 ${className}`}
      title="Editora Mente e Saúde — CNPJ: 51.372.335/0001-71"
    >
      {!imgError ? (
        <img
          src="./assets/logo-editora.png"
          alt="Logotipo Oficial da Editora Mente e Saúde"
          referrerPolicy="no-referrer"
          className="logo-editora-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          aria-label="Editora Mente e Saúde"
        >
          <circle cx="50" cy="50" r="46" fill="#C8FCE1" stroke="#064E3B" strokeWidth="3" />
          <path
            d="M32 68 C28 52, 34 32, 50 28 C66 32, 72 52, 68 68 Z"
            fill="#064E3B"
          />
          <circle cx="50" cy="46" r="14" fill="#FFFFFF" />
          <path
            d="M44 46 C44 40, 56 40, 56 46 C56 52, 44 52, 44 46 Z"
            stroke="#0D9488"
            strokeWidth="2.5"
            fill="none"
          />
          <path d="M50 34 L50 58" stroke="#064E3B" strokeWidth="2.5" />
        </svg>
      )}
    </div>
  );
};

/**
 * Logo do Centro Profissionalizante Maria Dalva de Araújo (./assets/logo-centro.png)
 * Aplica border-radius: 50%; object-fit: cover; overflow: hidden;
 * box-shadow: 0 4px 12px rgba(10, 29, 86, 0.15); recortando perfeitamente o círculo azul
 * e eliminando 100% das bordas quadradas claras.
 */
export const LogoCentroProfissionalizante: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: 'w-11 h-11',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
    cert: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`logo-centro-container ${dimensions} shrink-0 ${className}`}
      title="Centro Profissionalizante Maria Dalva de Araújo — CNPJ: 51.269.112/0001-83"
    >
      {!imgError ? (
        <img
          src="./assets/logo-centro.png"
          alt="Logotipo Oficial do Centro Profissionalizante Maria Dalva de Araújo"
          referrerPolicy="no-referrer"
          className="logo-centro-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          aria-label="Centro Profissionalizante Maria Dalva de Araújo"
        >
          <circle cx="50" cy="50" r="50" fill="#0A1D56" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="#EFF6FF" strokeWidth="1.2" strokeDasharray="3 2" />
          <path
            d="M50 26 C38 26, 32 35, 32 45 C32 53, 38 59, 41 66 L59 66 C62 59, 68 53, 68 45 C68 35, 62 26, 50 26 Z"
            fill="#FFFFFF"
          />
          <rect x="42" y="69" width="16" height="6" rx="3" fill="#FFFFFF" />
        </svg>
      )}
    </div>
  );
};

interface AssinaturaBlocoProps {
  tipo: 'barbara' | 'james';
  compact?: boolean;
}

/**
 * MÓDULO 2: Assinaturas (./assets/assinatura-barbara.png e ./assets/assinatura-james.png)
 * Com filter: contrast(220%) brightness(108%) grayscale(100%); mix-blend-mode: multiply;
 * e Correção Textual renderizada via HTML/CSS limpo abaixo das rubricas.
 */
export const AssinaturaInstitucional: React.FC<AssinaturaBlocoProps> = ({
  tipo,
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const isBarbara = tipo === 'barbara';
  const srcPath = isBarbara
    ? './assets/assinatura-barbara.png'
    : './assets/assinatura-james.png';

  return (
    <div className="flex flex-col items-center text-center max-w-[300px] w-full">
      {/* Área da Rubrica Manuscrita com Filtro CSS Obrigatório */}
      <div
        className={`relative w-full flex items-end justify-center ${
          compact ? 'h-11' : 'h-13'
        } mb-0.5 overflow-visible`}
      >
        {!imgError ? (
          <img
            src={srcPath}
            alt={
              isBarbara
                ? 'Rubrica de Bárbara Lima dos Santos'
                : 'Rubrica de James Araújo de Santana'
            }
            referrerPolicy="no-referrer"
            className="assinatura-rubrica-img max-h-13 w-auto object-contain mx-auto"
            onError={() => setImgError(true)}
          />
        ) : isBarbara ? (
          <svg
            viewBox="0 0 360 95"
            className="assinatura-rubrica-img h-12 w-auto mx-auto"
            aria-label="Rubrica Bárbara Lima dos Santos"
          >
            <path
              d="M36 74 C44 26, 62 14, 52 72 C50 42, 86 20, 82 48 C78 68, 48 68, 92 64 C104 50, 112 68, 126 56 C138 42, 146 66, 162 52 C176 22, 168 72, 188 58 C206 46, 218 20, 212 64 C224 54, 244 48, 260 58 C278 24, 294 22, 286 64 C304 54, 322 50, 340 44"
              fill="none"
              stroke="#111827"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M64 82 Q195 66 332 62"
              fill="none"
              stroke="#111827"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 360 95"
            className="assinatura-rubrica-img h-12 w-auto mx-auto"
            aria-label="Rubrica James Araújo de Santana"
          >
            <path
              d="M44 34 C72 14, 82 20, 62 74 C52 92, 34 88, 46 68 C70 54, 92 64, 110 54 C124 44, 134 64, 152 52 C168 42, 184 18, 192 64 C172 48, 206 46, 224 56 C242 44, 256 62, 274 48 C292 18, 304 24, 294 64 C312 52, 328 56, 344 42"
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M58 78 Q205 64 338 56"
              fill="none"
              stroke="#0F172A"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Linha de Chancela */}
      <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#0F172A]/80 to-transparent mb-1" />

      {/* Correção Textual Limpa via HTML/CSS abaixo das rubricas (Módulo 2) */}
      {isBarbara ? (
        <div className="leading-tight space-y-0.5">
          <p className="text-[10.5px] font-bold tracking-wide text-[#064E3B] uppercase font-portal-sans">
            BÁRBARA LIMA DOS SANTOS
          </p>
          <p className="text-[9px] font-medium text-[#0F172A]/90 font-portal-sans">
            Editora-Chefe e Coordenadora de Extensão Editorial
          </p>
          <p className="text-[8.5px] font-code-mono text-[#064E3B] font-semibold">
            Editora Mente e Saúde (CNPJ: 51.372.335/0001-71)
          </p>
        </div>
      ) : (
        <div className="leading-tight space-y-0.5">
          <p className="text-[10.5px] font-bold tracking-wide text-[#0A1D56] uppercase font-portal-sans">
            JAMES ARAÚJO DE SANTANA
          </p>
          <p className="text-[9px] font-medium text-[#0F172A]/90 font-portal-sans">
            Coordenador de Extensão e Projetos Educativos
          </p>
          <p className="text-[8.5px] font-code-mono text-[#0A1D56] font-semibold">
            Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83)
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Selo Dourado de Autenticidade Acadêmica (#D97706 e #FEF3C7)
 */
export const SeloDouradoAutenticidade: React.FC<{ codigo?: string }> = ({
  codigo = 'EMS-EXT-2023-0418',
}) => {
  return (
    <div
      className="relative flex flex-col items-center justify-center select-none shrink-0"
      title={`Selo Oficial de Fé Pública Acadêmica — ${codigo}`}
    >
      <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-[#FEF3C7] via-[#F59E0B] to-[#B45309] shadow-md flex items-center justify-center relative">
        <div className="w-full h-full rounded-full border-2 border-dashed border-[#FFFDF9]/90 bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] flex flex-col items-center justify-center text-center px-1">
          <span className="text-[6.5px] font-bold tracking-[0.14em] text-[#92400E] uppercase">
            Selo Oficial
          </span>
          <span className="font-cert-cinzel text-[9.5px] font-bold text-[#78350F] leading-none my-0.5">
            FÉ PÚBLICA
          </span>
          <div className="w-9 h-[1px] bg-[#D97706]/60 my-0.5" />
          <span className="text-[6.5px] font-semibold text-[#064E3B] leading-tight">
            EXTENSÃO 12H
          </span>
          <span className="font-code-mono text-[6px] font-bold text-[#92400E] mt-0.5">
            {codigo}
          </span>
        </div>
      </div>
    </div>
  );
};

interface DynamicQrCodeProps {
  codigo: string;
  size?: number;
  showCaption?: boolean;
  onSelectVerification?: () => void;
}

/**
 * MÓDULO 5: GERAÇÃO DE QR CODE PADRÃO ISO/IEC 18004 REAL (RECONHECIDO POR CÂMERAS)
 * Gera localmente a matriz QR Code Reed-Solomon de alta definição apontando para:
 * window.location.origin + window.location.pathname + '?codigo=EMS-EXT-2023-0418#validador'
 */
export const QrCodeDinamico: React.FC<DynamicQrCodeProps> = ({
  codigo,
  size = 84,
  showCaption = true,
  onSelectVerification,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const verificationUrl = useMemo(() => {
    return obterUrlCompletaVerificacao(codigo);
  }, [codigo]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 360,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [verificationUrl]);

  return (
    <div className="flex flex-col items-center shrink-0">
      <div
        onClick={onSelectVerification}
        role={onSelectVerification ? 'button' : undefined}
        tabIndex={onSelectVerification ? 0 : undefined}
        onKeyDown={(e) => {
          if (onSelectVerification && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelectVerification();
          }
        }}
        title={`QR Code Oficial de Autenticação: ${verificationUrl}`}
        className={`p-1 bg-white border border-[#064E3B]/45 rounded-lg shadow-xs flex items-center justify-center ${
          onSelectVerification
            ? 'cursor-pointer hover:border-[#0D9488] transition-colors'
            : ''
        }`}
        style={{ width: size + 8, height: size + 8 }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code Oficial de Autenticação — ${codigo}`}
            width={size}
            height={size}
            className="w-full h-full object-contain block"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="bg-white flex items-center justify-center text-[8px] font-code-mono text-slate-500 text-center"
          >
            QR {codigo}
          </div>
        )}
      </div>
      {showCaption && (
        <span className="mt-1 font-code-mono text-[7px] font-bold text-[#0F172A] tracking-tight text-center">
          LEITURA VIA CÂMERA
        </span>
      )}
    </div>
  );
};
