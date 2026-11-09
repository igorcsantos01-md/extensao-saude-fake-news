import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import {
  CertificadoExtensao,
  CAPITULOS_MINI_EBOOK,
} from '../data/certificadosData';
import {
  obterEnderecoPortalVerificacao,
  obterUrlCompletaVerificacao,
} from '../components/InstitutionalAssets';

/**
 * Carrega uma imagem local e aplica recortes/filtros em um Canvas offscreen
 * para embutir com nitidez máxima no PDF sem erros de CORS/CSSStyleSheet.
 */
async function carregarImagemProcessada(
  url: string,
  modo: 'logo-centro' | 'logo-editora' | 'assinatura'
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        if (modo === 'logo-centro') {
          const size = 320;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          // Recorte circular perfeito com escala 1.44x para eliminar 100% das bordas cinzas
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          ctx.fillStyle = '#0A1D56';
          ctx.fillRect(0, 0, size, size);

          const scale = 1.44;
          const drawSize = size * scale;
          const offset = (size - drawSize) / 2;
          ctx.drawImage(img, offset, offset, drawSize, drawSize);
          ctx.restore();
          return resolve(canvas.toDataURL('image/png'));
        }

        if (modo === 'logo-editora') {
          const size = 320;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          ctx.fillStyle = '#ECFDF5';
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, 38);
          ctx.fill();
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#064E3B';
          ctx.stroke();

          ctx.drawImage(img, 14, 14, size - 28, size - 28);
          return resolve(canvas.toDataURL('image/png'));
        }

        if (modo === 'assinatura') {
          canvas.width = img.width || 480;
          canvas.height = img.height || 140;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          // Aplica filter: contrast(220%) brightness(108%) grayscale(100%) + mix-blend-mode: multiply
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum > 210) {
              data[i + 3] = 0;
            } else {
              const darkness = Math.max(0, Math.min(255, (lum - 128) * 2.2 + 128));
              data[i] = Math.min(35, darkness * 0.2);
              data[i + 1] = Math.min(45, darkness * 0.25);
              data[i + 2] = Math.min(65, darkness * 0.35);
              data[i + 3] = Math.min(255, Math.round((255 - lum) * 2.2));
            }
          }
          ctx.putImageData(imageData, 0, 0);
          return resolve(canvas.toDataURL('image/png'));
        }

        resolve(null);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Gera um QR Code real padrão ISO/IEC 18004 (Reed-Solomon) em alta resolução (480x480)
 * 100% escaneável pela câmera nativa de qualquer celular.
 */
async function gerarQrCodeIsoRealDataUrl(textoUrl: string): Promise<string> {
  return QRCode.toDataURL(textoUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 480,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}

/**
 * Renderizador Vetorial Nativo em jsPDF (Frente e Verso em A4 Paisagem 297mm x 210mm)
 */
async function renderizarCertificadoVetorialJsPdf(
  doc: jsPDF,
  certificado: CertificadoExtensao
): Promise<void> {
  const portalBaseUrl = obterEnderecoPortalVerificacao();
  const verificationUrl = obterUrlCompletaVerificacao(certificado.codigoAutenticidade);

  const [logoEditora, logoCentro, rubricaBarbara, rubricaJames, qrDataUrl] =
    await Promise.all([
      carregarImagemProcessada('./assets/logo-editora.png', 'logo-editora'),
      carregarImagemProcessada('./assets/logo-centro.png', 'logo-centro'),
      carregarImagemProcessada('./assets/assinatura-barbara.png', 'assinatura'),
      carregarImagemProcessada('./assets/assinatura-james.png', 'assinatura'),
      gerarQrCodeIsoRealDataUrl(verificationUrl),
    ]);

  const desenharMolduraGuilloche = () => {
    // Fundo Pergaminho Puro (#FFFDF9)
    doc.setFillColor(255, 253, 249);
    doc.rect(0, 0, 297, 210, 'F');

    // Moldura Tripla Acadêmica
    doc.setDrawColor(6, 78, 59); // #064E3B
    doc.setLineWidth(0.8);
    doc.rect(5, 5, 287, 200);

    doc.setDrawColor(217, 119, 6); // #D97706
    doc.setLineWidth(0.35);
    doc.rect(6.8, 6.8, 283.4, 196.4);

    doc.setDrawColor(10, 29, 86); // #0A1D56
    doc.setLineWidth(0.5);
    doc.rect(8.2, 8.2, 280.6, 193.6);
  };

  // =========================================================================
  // PÁGINA 1: FRENTE DO CERTIFICADO (297mm x 210mm)
  // =========================================================================
  desenharMolduraGuilloche();

  if (logoEditora) {
    doc.addImage(logoEditora, 'PNG', 14, 12, 20, 20);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 78, 59);
  doc.text('EDITORA MENTE E SAÚDE', 37, 18);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CNPJ: 51.372.335/0001-71', 37, 22.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(13, 148, 136);
  doc.text('Conselho Editorial e Extensão Científica', 37, 26.5);

  // Título Superior Central
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 78, 59);
  doc.text(
    'PROGRAMA INTERINSTITUCIONAL DE EXTENSÃO, COMUNICAÇÃO CIENTÍFICA',
    148.5,
    17,
    { align: 'center' }
  );
  doc.text('E EDUCAÇÃO EM SAÚDE', 148.5, 21.2, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(10, 29, 86);
  doc.text(
    `Certificado Nº ${certificado.numeroCertificado} · ${certificado.livroRegistro} · Cód. ${certificado.codigoAutenticidade}`,
    148.5,
    26.2,
    { align: 'center' }
  );

  // Logo Centro Profissionalizante à Direita
  if (logoCentro) {
    doc.addImage(logoCentro, 'PNG', 263, 12, 20, 20);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(10, 29, 86);
  doc.text('CENTRO PROFISSIONALIZANTE', 260, 17.5, { align: 'right' });
  doc.text('MARIA DALVA DE ARAÚJO', 260, 21.8, { align: 'right' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CNPJ: 51.269.112/0001-83', 260, 26.2, { align: 'right' });

  // Linha divisória do cabeçalho
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.25);
  doc.line(14, 35, 283, 35);

  // Título Principal
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(6, 78, 59);
  doc.text('CERTIFICADO DE ATIVIDADE DE EXTENSÃO', 148.5, 47, { align: 'center' });

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.line(95, 50, 202, 50);

  // Parágrafo Introdutório
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  const introLines = doc.splitTextToSize(
    'A Editora Mente e Saúde (CNPJ: 51.372.335/0001-71), em parceria institucional com o Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83), certifica para os devidos fins de comprovação curricular e acadêmica que',
    245
  );
  doc.text(introLines, 148.5, 58.5, { align: 'center' });

  // Faixa de Destaque do Titular
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.rect(24, 67, 249, 21, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(10, 29, 86);
  doc.text(certificado.titular, 148.5, 77, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${certificado.profissao}  |  CPF: ${certificado.cpf}  |  ${certificado.instituicaoEnsino}`,
    148.5,
    84.2,
    { align: 'center' }
  );

  // Corpo do Texto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.1);
  doc.setTextColor(15, 23, 42);
  const paragrafo1 = `participou de forma efetiva da Atividade de Extensão intitulada "${certificado.tituloAtividade}", desenvolvida na modalidade de ${certificado.modalidade}, realizada no período de ${certificado.periodoRealizacao}, contabilizando carga horária total de ${certificado.cargaHorariaExtenso}.`;
  const linesP1 = doc.splitTextToSize(paragrafo1, 248);
  doc.text(linesP1, 24.5, 96.5);

  const linesP2 = doc.splitTextToSize(certificado.sinteseAtuacao, 248);
  doc.text(linesP2, 24.5, 114.5);

  // Local e Data
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(certificado.localDataEmissao, 148.5, 136.5, { align: 'center' });

  // =========================================================================
  // RODAPÉ DA FRENTE: ASSINATURAS + SELO + QR CODE REAL + QUADRO DE VERIFICAÇÃO MANUAL
  // =========================================================================
  // 1. Assinatura Esquerda (Bárbara Lima dos Santos — x: 14..94)
  if (rubricaBarbara) {
    doc.addImage(rubricaBarbara, 'PNG', 22, 149, 64, 18);
  }
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(15, 168.5, 93, 168.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(6, 78, 59);
  doc.text('BÁRBARA LIMA DOS SANTOS', 54, 173, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text('Editora-Chefe e Coordenadora de Extensão Editorial', 54, 176.8, {
    align: 'center',
  });
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(6, 78, 59);
  doc.text('Editora Mente e Saúde (CNPJ: 51.372.335/0001-71)', 54, 180.5, {
    align: 'center',
  });

  // 2. Núcleo Central de Fé Pública, QR Code Real e Quadro de Verificação Manual (x: 96..201)
  // Selo Oficial Dourado
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.circle(109, 165, 11.5, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 53, 15);
  doc.text('SELO OFICIAL', 109, 161.2, { align: 'center' });
  doc.setFontSize(8);
  doc.text('FÉ PÚBLICA', 109, 165.2, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(5.5);
  doc.text(certificado.codigoAutenticidade, 109, 169.5, { align: 'center' });

  // QR Code ISO/IEC 18004 Real (Escaneável por câmera)
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(6, 78, 59);
    doc.setLineWidth(0.25);
    doc.rect(123.5, 151.5, 25, 25, 'FD');
    doc.addImage(qrDataUrl, 'PNG', 124.5, 152.5, 23, 23);
    doc.link(123.5, 151.5, 25, 25, { url: verificationUrl });
  }

  // Quadro de Verificação Manual por Código, Chave e Endereço Web
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.25);
  doc.rect(150.5, 151.5, 49, 25, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('AUTENTICAÇÃO PÚBLICA MANUAL', 152.5, 155.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(15, 23, 42);
  doc.text(`Cód.: ${certificado.codigoAutenticidade}`, 152.5, 159.8);
  doc.setTextColor(146, 64, 14);
  doc.text(`Chave: ${certificado.chaveControleVerificacao}`, 152.5, 163.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(10, 29, 86);
  doc.text('Endereço p/ Verificação Online:', 152.5, 167.8);

  doc.setFont('courier', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(15, 23, 42);
  const urlLinesFront = doc.splitTextToSize(portalBaseUrl, 45);
  doc.text(urlLinesFront.slice(0, 2), 152.5, 171.2);
  doc.link(150.5, 151.5, 49, 25, { url: verificationUrl });

  // Faixa Inferior Unificada de Verificação Digital na Frente
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(6, 78, 59);
  doc.text(
    `Verifique via QR Code ou acesse ${portalBaseUrl} informando o Código ${certificado.codigoAutenticidade} ou Chave ${certificado.chaveControleVerificacao}`,
    148.5,
    191.5,
    { align: 'center' }
  );

  // 3. Assinatura Direita (James Araújo de Santana — x: 203..282)
  if (rubricaJames) {
    doc.addImage(rubricaJames, 'PNG', 210, 149, 64, 18);
  }
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(203, 168.5, 282, 168.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(10, 29, 86);
  doc.text('JAMES ARAÚJO DE SANTANA', 242.5, 173, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text('Coordenador de Extensão e Projetos Educativos', 242.5, 176.8, {
    align: 'center',
  });
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.1);
  doc.setTextColor(10, 29, 86);
  doc.text(
    'Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83)',
    242.5,
    180.5,
    { align: 'center' }
  );

  // =========================================================================
  // PÁGINA 2: VERSO — MEMORIAL DESCRITIVO E REGISTRO ACADÊMICO
  // =========================================================================
  doc.addPage('a4', 'landscape');
  desenharMolduraGuilloche();

  if (logoEditora) doc.addImage(logoEditora, 'PNG', 14, 12, 13, 13);
  if (logoCentro) doc.addImage(logoCentro, 'PNG', 29, 12, 13, 13);

  doc.setFont('times', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(6, 78, 59);
  doc.text(
    'MEMORIAL DESCRITIVO E REGISTRO ACADÊMICO DE ATIVIDADE DE EXTENSÃO',
    46,
    17.5
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Verso Oficial do Certificado Nº ${certificado.numeroCertificado} · Fé Pública Interinstitucional e Validação Curricular`,
    46,
    22.5
  );

  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.5);
  doc.line(14, 28, 283, 28);

  // Bloco 1: Identificação e Enquadramento
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.25);
  doc.rect(14, 31, 155, 31, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(6, 78, 59);
  doc.text('1. DADOS DE IDENTIFICAÇÃO DO PROFISSIONAL EXTENSIONISTA', 18, 36.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(15, 23, 42);
  doc.text(`Titular Certificado: ${certificado.titular}`, 18, 42.2);
  doc.text(`CPF Registrado: ${certificado.cpf}`, 18, 47.4);
  doc.text(`Qualificação Profissional: ${certificado.profissao}`, 18, 52.6);
  doc.text(`Instituição de Origem: ${certificado.instituicaoEnsino}`, 18, 57.8);

  // Enquadramento Curricular
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(10, 29, 86);
  doc.rect(173, 31, 110, 31, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(10, 29, 86);
  doc.text('2. ENQUADRAMENTO CURRICULAR E PONTUAÇÃO', 177, 36.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  const enqLines = doc.splitTextToSize(certificado.enquadramentoCurricular, 102);
  doc.text(enqLines, 177, 42.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(6, 78, 59);
  doc.text(
    `Período: ${certificado.periodoRealizacao} | Total: ${certificado.cargaHorariaTotal}h`,
    177,
    58
  );

  // Bloco 2: Tabela de 12 Horas de Atividades Práticas (Com colunas calibradas sem sobreposição)
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(6, 78, 59);
  doc.rect(14, 65, 269, 7.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(6, 78, 59);
  doc.text(
    '3. MATRIZ DE ATIVIDADES PRÁTICAS E METODOLOGIA EXTENSIONISTA (12 HORAS)',
    18,
    70.2
  );

  let yRow = 72.5;
  certificado.detalhamentoCargaHoraria.forEach((item) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, yRow, 269, 14, 'FD');

    // Linha vertical separadora entre Eixo e Descrição
    doc.setDrawColor(226, 232, 240);
    doc.line(93, yRow, 93, yRow + 14);
    doc.line(258, yRow, 258, yRow + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(10, 29, 86);
    const etapaLines = doc.splitTextToSize(item.etapa, 73);
    doc.text(etapaLines, 17, yRow + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(item.eixoMetodologico, 17, yRow + 11.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(15, 23, 42);
    const descLines = doc.splitTextToSize(item.descricao, 159);
    doc.text(descLines, 96, yRow + 5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(6, 78, 59);
    doc.text(item.horas, 279.5, yRow + 8.2, { align: 'right' });

    yRow += 14;
  });

  // Bloco 3: Registro em Livro, Código, Chave de Controle, Endereço Web e Hash SHA-256 + QR Code Real
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.35);
  doc.rect(14, 131.5, 269, 31, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(146, 64, 14);
  doc.text(
    '4. REGISTRO OFICIAL DE FÉ PÚBLICA, ENDEREÇO WEB E CHAVES DE VERIFICAÇÃO DE AUTENTICIDADE',
    18,
    136.8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Certificado registrado sob o nº ${certificado.numeroCertificado} no ${certificado.livroRegistro}, ${certificado.folhaRegistro}, expedido pela Editora Mente e Saúde (CNPJ: 51.372.335/0001-71) e Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83).`,
    18,
    142,
    { maxWidth: 230 }
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(6, 78, 59);
  doc.text(
    `CÓDIGO DE AUTENTICIDADE: ${certificado.codigoAutenticidade}   |   CHAVE DE CONTROLE / DÍGITO: ${certificado.chaveControleVerificacao}`,
    18,
    149.8
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(10, 29, 86);
  doc.text(
    `ENDEREÇO PARA VERIFICAÇÃO MANUAL (SEM QR CODE): ${verificationUrl}`,
    18,
    154.8
  );
  doc.link(18, 151.5, 230, 5, { url: verificationUrl });

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(`HASH SHA-256: ${certificado.hashSha256}`, 18, 159.8);

  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(6, 78, 59);
    doc.setLineWidth(0.25);
    doc.rect(253.5, 134, 26, 26, 'FD');
    doc.addImage(qrDataUrl, 'PNG', 254.5, 135, 24, 24);
    doc.link(253.5, 134, 26, 26, { url: verificationUrl });
  }

  // Rodapé do Verso com Rubricas Sem Sobreposição
  if (rubricaBarbara) doc.addImage(rubricaBarbara, 'PNG', 26, 164, 54, 15);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(18, 180, 92, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(6, 78, 59);
  doc.text('BÁRBARA LIMA DOS SANTOS', 55, 184.2, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.text('Editora Mente e Saúde (CNPJ: 51.372.335/0001-71)', 55, 188, {
    align: 'center',
  });

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(certificado.localDataEmissao, 148.5, 179.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Documento Oficial de 2 Laudas (Frente e Verso) · Válido em Todo o Território Nacional',
    148.5,
    184.2,
    {
      align: 'center',
    }
  );
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(6, 78, 59);
  doc.text(
    `Registro: ${certificado.codigoAutenticidade} · Chave: ${certificado.chaveControleVerificacao}`,
    148.5,
    188,
    { align: 'center' }
  );

  if (rubricaJames) doc.addImage(rubricaJames, 'PNG', 215, 164, 54, 15);
  doc.line(204, 180, 279, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(10, 29, 86);
  doc.text('JAMES ARAÚJO DE SANTANA', 241.5, 184.2, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.text('Centro Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83)', 241.5, 188, {
    align: 'center',
  });
}

/**
 * Exporta e força o download imediato do arquivo .pdf de 2 páginas (Frente e Verso)
 * em formato A4 Paisagem (297mm x 210mm) com QR Code ISO/IEC 18004 real.
 */
export async function baixarCertificadoPdfA4(
  certificado: CertificadoExtensao,
  _frenteNode?: HTMLElement | null,
  _versoNode?: HTMLElement | null
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  await renderizarCertificadoVetorialJsPdf(doc, certificado);
  doc.save(certificado.nomeArquivoPdf);
}

/**
 * Gera e faz o download imediato do Mini E-book completo em formato PDF (A4 Retrato)
 */
export async function baixarMiniEbookPdf(): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  CAPITULOS_MINI_EBOOK.forEach((cap, index) => {
    if (index > 0) {
      doc.addPage('a4', 'portrait');
    }

    // Fundo Editorial
    doc.setFillColor(255, 253, 249);
    doc.rect(0, 0, 210, 297, 'F');

    // Cabeçalho Institucional
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(167, 243, 208);
    doc.text(
      'CAMPANHA EDUCATIVA DE CONSCIENTIZAÇÃO SOBRE VACINAÇÃO · DISTRIBUIÇÃO GRATUITA',
      14,
      10
    );

    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Vacinar é Proteger: Guia Prático para a Família', 14, 19);

    // Identificação do Capítulo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(13, 148, 136);
    doc.text(`${cap.numero.toUpperCase()} · ${cap.tempoLeitura.toUpperCase()}`, 14, 38);

    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(10, 29, 86);
    doc.text(cap.titulo, 14, 47);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text(cap.subtitulo, 14, 54);

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);
    doc.line(14, 58, 196, 58);

    // Introdução
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const introLines = doc.splitTextToSize(cap.conteudoIntegral.introducao, 182);
    doc.text(introLines, 14, 67);

    let yPos = 67 + introLines.length * 5.2 + 6;

    // Seções
    cap.conteudoIntegral.secoes.forEach((sec) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, yPos, 182, 56, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(10, 29, 86);
      doc.text(sec.subtituloSecao, 18, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.8);
      doc.setTextColor(30, 41, 59);
      const pLines = doc.splitTextToSize(sec.paragrafo, 174);
      doc.text(pLines, 18, yPos + 15);

      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(13, 148, 136);
      doc.rect(18, yPos + 39, 174, 13, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(6, 78, 59);
      const destLines = doc.splitTextToSize(sec.destaqueClinico, 168);
      doc.text(destLines, 21, yPos + 44.5);

      yPos += 62;
    });

    // Recomendação Prática para a Família
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(217, 119, 6);
    doc.rect(14, yPos, 182, 28, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(146, 64, 14);
    doc.text('RECOMENDAÇÃO PRÁTICA PARA A FAMÍLIA:', 18, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const recLines = doc.splitTextToSize(
      cap.conteudoIntegral.orientacaoPraticaFamilia,
      174
    );
    doc.text(recLines, 18, yPos + 13.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(cap.conteudoIntegral.referenciaOficial, 18, yPos + 24);

    // Rodapé do Mini E-book
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Editora Mente e Saúde (CNPJ: 51.372.335/0001-71) & Centro Profissionalizante Maria Dalva de Araújo (CNPJ: 51.269.112/0001-83)',
      14,
      286
    );
    doc.text(`Página ${index + 1} de ${CAPITULOS_MINI_EBOOK.length}`, 196, 286, {
      align: 'right',
    });
  });

  doc.save('Mini_Ebook_Vacinar_e_Proteger_Guia_Pratico_Familia.pdf');
}
