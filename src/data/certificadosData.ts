export interface AtividadeDetalhada {
  etapa: string;
  descricao: string;
  horas: string;
  eixoMetodologico: string;
}

export interface CertificadoExtensao {
  numeroCertificado: string;
  codigoAutenticidade: string;
  nomeArquivoPdf: string;
  titular: string;
  profissao: string;
  cpf: string;
  cpfMascarado: string;
  instituicaoEnsino: string;
  tituloAtividade: string;
  modalidade: string;
  periodoRealizacao: string;
  cargaHorariaTotal: number;
  cargaHorariaExtenso: string;
  sinteseAtuacao: string;
  localDataEmissao: string;
  enquadramentoCurricular: string;
  livroRegistro: string;
  folhaRegistro: string;
  chaveControleVerificacao: string;
  hashSha256: string;
  statusRegistro: 'AUTÊNTICO E ATIVO' | 'REVOGADO';
  detalhamentoCargaHoraria: AtividadeDetalhada[];
}

/**
 * MÓDULO 6: ARQUITETURA ESCALÁVEL NO JAVASCRIPT (BANCO_CERTIFICADOS)
 * Certificado nº 01 (EMS-EXT-2023-0418) 100% configurado e pronto para adição
 * futura dos Certificados nº 02 a 10 mantendo o mesmo contrato estrutural.
 */
export const BANCO_CERTIFICADOS: CertificadoExtensao[] = [
  {
    numeroCertificado: '01',
    codigoAutenticidade: 'EMS-EXT-2023-0418',
    nomeArquivoPdf: 'Certificado_Extensao_01_EMS-EXT-2023-0418_Lucas_Goncalves_Silveira.pdf',
    titular: 'LUCAS GONÇALVES SILVEIRA',
    profissao: 'Médico',
    cpf: '702.794.941-57',
    cpfMascarado: '***.794.941-**',
    instituicaoEnsino: 'Centro Universitário Alfredo Nasser (UNIFAN)',
    tituloAtividade:
      'Campanha Educativa de Conscientização sobre Vacinação: Distribuição de Mini E-books, Combate a Fake News e Divulgação dos Canais Oficiais de Imunização',
    modalidade: 'Campanha Educativa, Conscientização de Vacinação e Atividade Comunitária',
    periodoRealizacao: '18 a 20 de maio de 2023',
    cargaHorariaTotal: 12,
    cargaHorariaExtenso: '12 (doze) horas',
    sinteseAtuacao:
      'No âmbito desta ação extensionista, o profissional atuou na elaboração técnico-científica e distribuição comunitária de folhetos e mini e-books educativos, comunicação em saúde para combate à desinformação (fake news), divulgação dos canais oficiais de imunização e aplicação de instrumentos digitais interativos para coleta de dados populacionais sobre hesitação vacinal.',
    localDataEmissao: 'Goiânia - GO, 26 de maio de 2023.',
    enquadramentoCurricular:
      'Item 08 - Atividades de Extensão: Campanhas educativas, de vacinação, coleta de dados populacionais e atividades comunitárias',
    livroRegistro: 'Livro de Extensão nº 01/2023',
    folhaRegistro: 'Folha 42',
    chaveControleVerificacao: '0418-7027-9457-8F4B',
    hashSha256: '8f4b2e91c7d04e38a1956b2f0e84d31c9a7b6254f8e10c3d592a7b4e16c80418',
    statusRegistro: 'AUTÊNTICO E ATIVO',
    detalhamentoCargaHoraria: [
      {
        etapa: 'Eixo I — Curadoria e Redação Técnico-Científica',
        descricao:
          'Revisão de literatura médica e estruturação didática do Mini E-book gratuito "Vacinar é Proteger: Guia Prático para a Família" e dos folhetos de orientação comunitária.',
        horas: '03h 00min',
        eixoMetodologico: 'Produção Editorial em Saúde Pública',
      },
      {
        etapa: 'Eixo II — Ação Comunitária e Educação Popular em Saúde',
        descricao:
          'Distribuição presencial e digital de materiais educativos, acolhimento de dúvidas de famílias e orientação direta sobre o Calendário Nacional de Vacinação (PNI/SUS).',
        horas: '04h 00min',
        eixoMetodologico: 'Extensão Comunitária Direta',
      },
      {
        etapa: 'Eixo III — Comunicação Científica e Combate a Fake News',
        descricao:
          'Desmistificação ativa de notícias falsas sobre segurança vacinal com base em notas técnicas da OMS, SBIm e Ministério da Saúde.',
        horas: '02h 30min',
        eixoMetodologico: 'Infodemiologia e Letramento em Saúde',
      },
      {
        etapa: 'Eixo IV — Coleta de Dados Populacionais e Canais Oficiais',
        descricao:
          'Aplicação de instrumentos digitais interativos (quizzes de percepção sobre hesitação vacinal) e treinamento prático de acesso ao Meu SUS Digital (ConecteSUS).',
        horas: '02h 30min',
        eixoMetodologico: 'Pesquisa-Ação e Cidadania Digital',
      },
    ],
  },
  /*
   * ESTRUTURA RESERVADA PARA OS CERTIFICADOS Nº 02 A 10:
   * Basta descomentar e preencher novos objetos abaixo seguindo o mesmo modelo:
   * {
   *   numeroCertificado: '02',
   *   codigoAutenticidade: 'EMS-EXT-2023-0419',
   *   nomeArquivoPdf: 'Certificado_Extensao_02_EMS-EXT-2023-0419_Nome_Participante.pdf',
   *   titular: 'NOME COMPLETO DO PARTICIPANTE',
   *   profissao: 'Médico',
   *   cpf: '000.000.000-00',
   *   cpfMascarado: '***.000.000-**',
   *   ...
   * }
   */
];

export interface CapituloEbook {
  numero: string;
  titulo: string;
  subtitulo: string;
  tempoLeitura: string;
  resumoExecutivo: string;
  topicosChave: string[];
  conteudoIntegral: {
    introducao: string;
    secoes: {
      subtituloSecao: string;
      paragrafo: string;
      destaqueClinico: string;
    }[];
    orientacaoPraticaFamilia: string;
    referenciaOficial: string;
  };
}

export const CAPITULOS_MINI_EBOOK: CapituloEbook[] = [
  {
    numero: 'Capítulo 01',
    titulo: 'Importância da Imunidade Coletiva',
    subtitulo: 'Como a vacinação individual constrói um escudo de proteção comunitária',
    tempoLeitura: '4 min de leitura',
    resumoExecutivo:
      'Explica de forma visual e acessível o conceito de bloqueio epidemiológico (imunidade de rebanho ou coletiva) e por que altas taxas de cobertura vacinal protegem recém-nascidos, gestantes, idosos e pacientes imunossuprimidos que não podem receber determinadas vacinas.',
    topicosChave: [
      'O efeito escudo na proteção de bebês ainda sem esquema vacinal completo',
      'Por que a queda de 95% para 75% na cobertura vacinal permite o retorno de surtos',
      'Solidariedade sanitária: proteger a família, a escola e a vizinhança',
    ],
    conteudoIntegral: {
      introducao:
        'Vacinar não é apenas um ato de proteção individual: é um pacto coletivo pela vida em comunidade. Quando uma parcela expressiva da população está imunizada contra um agente infeccioso, a circulação do vírus ou da bactéria encontra barreiras biológicas que impedem sua propagação em cadeia.',
      secoes: [
        {
          subtituloSecao: '1.1 O Escudo Invisível da Comunidade',
          paragrafo:
            'Na epidemiologia clínica, chamamos de imunidade coletiva (ou bloqueio de transmissão) o fenômeno em que o número de pessoas imunes é tão elevado que um patógeno não consegue encontrar hospedeiros suscetíveis suficientes para manter sua circulação ativa. Para doenças altamente contagiosas como o sarampo, a meta preconizada pelo Ministério da Saúde é de no mínimo 95% de cobertura vacinal.',
          destaqueClinico:
            'Meta de Segurança Epidemiológica (PNI/MS): 95% de cobertura vacinal homogênea para poliomielite, tríplice viral (sarampo, caxumba e rubéola) e pentavalente.',
        },
        {
          subtituloSecao: '1.2 Quem Mais Depende da Sua Vacina?',
          paragrafo:
            'Existem cidadãos que, por condições clínicas específicas ou faixa etária, não podem receber certas vacinas de vírus atenuado: bebês nos primeiros meses de vida, pacientes em tratamento oncológico (quimioterapia), transplantados e pessoas com imunodeficiências graves. Essas pessoas dependem diretamente da vacinação de seus familiares e vizinhos para não serem expostas a agentes letais.',
          destaqueClinico:
            'Cada adulto e criança vacinados interrompem até 12 cadeias secundárias de transmissão intradomiciliar e escolar.',
        },
      ],
      orientacaoPraticaFamilia:
        'Verifique semestralmente a caderneta de vacinação de todos os moradores da residência — incluindo adolescentes, adultos e idosos. A imunidade coletiva começa dentro de casa.',
      referenciaOficial:
        'Fonte: Ministério da Saúde — Manual de Normas e Procedimentos para Vacinação (Programa Nacional de Imunizações / SVS).',
    },
  },
  {
    numero: 'Capítulo 02',
    titulo: 'Como Funcionam as Vacinas',
    subtitulo: 'O treinamento inteligente do sistema imunológico e a memória celular',
    tempoLeitura: '5 min de leitura',
    resumoExecutivo:
      'Traduz a imunologia médica para o cotidiano familiar: como os antígenos vacinais ensinam os linfócitos B e T a reconhecerem vírus e bactérias antes do contato real, gerando anticorpos neutralizantes sem causar a doença.',
    topicosChave: [
      'A diferença entre infecção natural e simulação segura pela vacina',
      'Linfócitos de memória: por que o corpo reage em horas após ser vacinado',
      'Importância das doses de reforço para consolidar a proteção de longo prazo',
    ],
    conteudoIntegral: {
      introducao:
        'Imagine que o sistema imunológico humano é uma equipe de defesa altamente especializada. As vacinas funcionam como um treinamento tático seguro: elas apresentam ao organismo uma "fotografia molecular" do invasor (antígeno inativado, fragmento proteico ou instrução genética controlada), permitindo que o corpo aprenda a combatê-lo sem precisar adoecer.',
      secoes: [
        {
          subtituloSecao: '2.1 Reconhecimento, Produção de Anticorpos e Memória',
          paragrafo:
            'Ao receber uma dose vacinal, células apresentadoras de antígenos ativam os linfócitos B (responsáveis pela síntese de anticorpos específicos) e os linfócitos T (responsáveis pela defesa celular). Após essa resposta inicial, permanecem circulantes as chamadas células de memória imunológica, prontas para agir imediatamente caso a pessoa entre em contato com o microrganismo real no futuro.',
          destaqueClinico:
            'Janela de Soroconversão: O organismo leva em média de 10 a 14 dias após a aplicação para atingir níveis protetores de anticorpos circulantes.',
        },
        {
          subtituloSecao: '2.2 Por Que Algumas Vacinas Precisam de Mais de Uma Dose?',
          paragrafo:
            'Enquanto a primeira dose apresenta o antígeno ao sistema imune (resposta primária), as doses subsequentes e os reforços periódicos multiplicam exponencialmente a afinidade e a durabilidade dos anticorpos (resposta secundária). Abandonar o esquema na primeira dose deixa a proteção incompleta.',
          destaqueClinico:
            'Esquema Completo = Proteção Efetiva: A eficácia clínica demonstrada nos estudos depende do cumprimento integral das doses previstas no calendário.',
        },
      ],
      orientacaoPraticaFamilia:
        'Ao sair da sala de vacinação na Unidade Básica de Saúde (UBS), confira se o profissional anotou a lápis a data do próximo retorno e cadastre um lembrete no celular da família.',
      referenciaOficial:
        'Fonte: Sociedade Brasileira de Imunizações (SBIm) & Fundação Oswaldo Cruz (Bio-Manguinhos/Fiocruz).',
    },
  },
  {
    numero: 'Capítulo 03',
    titulo: 'Segurança dos Imunobiológicos',
    subtitulo: 'Fases de ensaios clínicos, aprovação na ANVISA e farmacovigilância contínua',
    tempoLeitura: '5 min de leitura',
    resumoExecutivo:
      'Detalha o rigoroso caminho científico que toda vacina percorre antes de chegar aos postos de saúde do SUS: fases pré-clínica e clínicas (I, II e III), controle lote a lote pelo INCQS/Fiocruz e monitoramento nacional de eventos pós-vacinação.',
    topicosChave: [
      'As 4 fases de avaliação científica e milhares de voluntários monitorados',
      'Controle de qualidade no Brasil: ANVISA e INCQS/Fiocruz em cada lote distribuído',
      'Diferença entre reações leves esperadas (dor local, febre baixa) e eventos raros',
    ],
    conteudoIntegral: {
      introducao:
        'Os imunobiológicos estão entre os produtos farmacêuticos mais rigorosamente testados e fiscalizados da medicina moderna. Diferentemente de medicamentos destinados a pessoas já enfermas, as vacinas são aplicadas em populações saudáveis — o que exige padrões de segurança extraordinariamente elevados.',
      secoes: [
        {
          subtituloSecao: '3.1 Do Laboratório à Unidade Básica de Saúde',
          paragrafo:
            'Antes de ser autorizada pela Agência Nacional de Vigilância Sanitária (ANVISA), toda vacina passa por estudos pré-clínicos e três fases clínicas sequenciais envolvendo dezenas de milhares de participantes. Além disso, no Brasil, cada lote distribuído pelo Programa Nacional de Imunizações é submetido à análise técnica do Instituto Nacional de Controle de Qualidade em Saúde (INCQS/Fiocruz) e armazenado em Rede de Frio monitorada 24 horas por dia (+2 °C a +8 °C).',
          destaqueClinico:
            'Dupla Chancela Sanitária: Registro regulatório na ANVISA + Certificação analítica lote a lote pelo INCQS/Fiocruz antes da distribuição estadual.',
        },
        {
          subtituloSecao: '3.2 Reações Esperadas e Cuidados Pós-Vacinação',
          paragrafo:
            'Sinais leves como sensibilidade no local da aplicação, vermelhidão discreta ou febre baixa nas primeiras 24 a 48 horas são manifestações benignas e autolimitadas que indicam a ativação normal do sistema imune. Compressas frias no local da aplicação aliviam rapidamente o desconforto local.',
          destaqueClinico:
            'Conduta Recomendada: Utilize apenas compressa fria com água limpa no local da injeção; nunca aplique pomadas caseiras nem faça uso preventivo de antitérmicos sem orientação médica.',
        },
      ],
      orientacaoPraticaFamilia:
        'Caso observe qualquer sintoma persistente após 48 horas da aplicação, procure a própria Unidade Básica de Saúde onde a dose foi administrada para avaliação médica e registro oficial.',
      referenciaOficial:
        'Fonte: Manual de Vigilância Epidemiológica de Eventos Supostamente Atribuíveis à Vacinação ou Imunização (ESAVI — Ministério da Saúde).',
    },
  },
  {
    numero: 'Capítulo 04',
    titulo: 'Calendário Vacinal por Faixa Etária',
    subtitulo: 'Guia rápido das principais vacinas gratuitas no SUS do nascimento à terceira idade',
    tempoLeitura: '6 min de leitura',
    resumoExecutivo:
      'Mapa prático de consulta para os pais e responsáveis identificarem as vacinas essenciais em cada ciclo da vida: Crianças (0 a 10 anos), Adolescentes (11 a 19 anos), Adultos (20 a 59 anos), Gestantes e Idosos (60+ anos).',
    topicosChave: [
      'Infância: BCG, Hepatite B, Pentavalente, VIP (Pólio), Rotavírus, Pneumo 10, Meningo C e Tríplice Viral',
      'Adolescência e Fase Adulta: HPV quadrivalente, Meningocócica ACWY, dT, Febre Amarela e Hepatite B',
      'Gestantes e Idosos (60+): dTpa acelular para proteção neonatal, Influenza anual e Covid-19',
    ],
    conteudoIntegral: {
      introducao:
        'O Programa Nacional de Imunizações (PNI) do Brasil oferece gratuitamente no Sistema Único de Saúde (SUS) um dos calendários vacinais mais completos do mundo, contemplando mais de 19 imunobiológicos de rotina para todas as fases da vida.',
      secoes: [
        {
          subtituloSecao: '4.1 Crianças e Adolescentes (Do Nascimento aos 19 Anos)',
          paragrafo:
            'Ao nascer: BCG (formas graves de tuberculose) e Hepatite B. No primeiro ano de vida: Pentavalente (difteria, tétano, coqueluche, Haemophilus influenzae B e hepatite B), VIP (poliomielite inativada), Pneumocócica 10-valente, Rotavírus humano, Meningocócica C e Febre Amarela (aos 9 meses). Aos 12 e 15 meses: Tríplice Viral, Tetraviral, Hepatite A e reforços. Na adolescência (9 a 14 anos): HPV (prevenção de diversos tipos de câncer) e Meningocócica ACWY.',
          destaqueClinico:
            'Atenção Especial: A vacina contra o HPV em dose única para adolescentes de 9 a 14 anos previne mais de 90% dos casos de câncer do colo do útero.',
        },
        {
          subtituloSecao: '4.2 Adultos, Gestantes e Pessoas Idosas (60+ Anos)',
          paragrafo:
            'Adultos devem manter em dia a Hepatite B (3 doses), Febre Amarela, Tríplice Viral e o reforço da Dupla Adulto (dT) a cada 10 anos. Gestantes têm indicação essencial da dTpa (a partir da 20ª semana de cada gestação) para transferir anticorpos contra a coqueluche diretamente ao bebê antes do parto, além de Hepatite B e Influenza. Idosos (60+ anos) contam com campanhas prioritárias anuais de Influenza, Covid-19 e esquemas específicos nos CRIEs.',
          destaqueClinico:
            'Proteção Materno-Fetal: A vacina dTpa na gestante reduz em mais de 85% o risco de hospitalização por coqueluche em recém-nascidos nos primeiros 2 meses de vida.',
        },
      ],
      orientacaoPraticaFamilia:
        'Perdeu o cartão físico de vacinação? Compareça à sala de vacina da UBS mais próxima com seu documento com foto e CPF ou consulte o histórico digital no aplicativo Meu SUS Digital.',
      referenciaOficial:
        'Fonte: Calendário Nacional de Vacinação vigente — Programa Nacional de Imunizações (PNI / Ministério da Saúde).',
    },
  },
];

export interface CardMitoEvidencia {
  id: number;
  categoria: string;
  mitoPergunta: string;
  alertaDesinformacao: string;
  vereditoCientifico: string;
  explicacaoMedica: string;
  dadoComprovado: string;
  fonteCientifica: string;
}

export const RADAR_MITO_EVIDENCIA: CardMitoEvidencia[] = [
  {
    id: 1,
    categoria: 'Imunobiologia Viral',
    mitoPergunta: 'Vacinas de gripe causam a própria gripe?',
    alertaDesinformacao:
      'Relato frequente na comunidade: receio de tomar a vacina anual de Influenza no outono/inverno por acreditar que ela provoca gripe nos dias seguintes.',
    vereditoCientifico: 'MITO DESMENTIDO — BIOLOGICAMENTE IMPOSSÍVEL',
    explicacaoMedica:
      'A vacina contra a gripe (Influenza trivalente ou tetravalente) distribuída pelo SUS e pela rede privada no Brasil é composta exclusivamente por vírus inativados (mortos) e fragmentados. Como não há vírus vivo ou íntegro na formulação, é biologicamente impossível que a vacina se multiplique ou cause infecção gripal. Eventual febre baixa ou dor no corpo nas primeiras 24h decorre apenas da ativação normal do sistema imune, ou de resfriados comuns contraídos antes dos 14 dias necessários para a vacina fazer efeito.',
    dadoComprovado:
      'Redução de até 75% nas internações hospitalares por síndrome respiratória aguda grave (SRAG) e pneumonias secundárias em idosos e portadores de comorbidades vacinados.',
    fonteCientifica: 'Instituto Butantan / Ministério da Saúde (Informe Técnico da Campanha Nacional de Influenza).',
  },
  {
    id: 2,
    categoria: 'Imunologia Pediátrica',
    mitoPergunta: 'Múltiplas vacinas sobrecarregam o sistema imune infantil?',
    alertaDesinformacao:
      'Dúvida recorrente de pais: medo de aplicar várias vacinas no mesmo comparecimento à UBS ou nos primeiros meses de vida do bebê.',
    vereditoCientifico: 'MITO DESMENTIDO — SISTEMA IMUNE TEM ALTA CAPACIDADE',
    explicacaoMedica:
      'Desde o momento do parto, o sistema imunológico do lactente entra em contato diário com milhares de antígenos ambientais na respiração, amamentação e contato cutâneo. Todas as vacinas do calendário infantil juntas utilizam menos de 0,1% da capacidade de resposta dos linfócitos de uma criança. Além disso, as vacinas modernas são altamente purificadas: hoje todo o calendário pediátrico contém menos antígenos totais do que uma única vacina antiga continha na década de 1980.',
    dadoComprovado:
      'A administração simultânea das vacinas recomendadas para a idade apresenta a mesma eficácia sorológica e o mesmo perfil de segurança que a aplicação separada, evitando atrasos que deixariam o bebê vulnerável.',
    fonteCientifica: 'Sociedade Brasileira de Pediatria (SBP) & Organização Mundial da Saúde (OMS).',
  },
  {
    id: 3,
    categoria: 'Vigilância Epidemiológica',
    mitoPergunta: 'Doenças já erradicadas não precisam mais de vacinação?',
    alertaDesinformacao:
      'Falsa percepção de segurança: acreditar que poliomielite (paralisia infantil), sarampo ou difteria desapareceram definitivamente e não oferecem mais risco.',
    vereditoCientifico: 'MITO DESMENTIDO — RISCO REAL DE REINTRODUÇÃO',
    explicacaoMedica:
      'Com exceção da varíola humana (única doença humana globalmente erradicada em 1980), patógenos como o poliovírus e o vírus do sarampo continuam circulando em outras regiões do planeta. Em um mundo conectado por viagens internacionais diárias, basta que a cobertura vacinal de um município caia abaixo de 95% para que um único caso importado desencadeie novos surtos epidêmicos em crianças não vacinadas.',
    dadoComprovado:
      'A manutenção de cobertura vacinal ≥ 95% é a única barreira sanitária que impede o retorno da paralisia infantil e de surtos graves de sarampo no território nacional.',
    fonteCientifica: 'Organização Pan-Americana da Saúde (OPAS/OMS) & Programa Nacional de Imunizações (PNI).',
  },
  {
    id: 4,
    categoria: 'Farmacovigilância e Segurança',
    mitoPergunta: 'Efeitos adversos graves são comuns?',
    alertaDesinformacao:
      'Amplificação em redes sociais: compartilhamento de relatos isolados ou distorcidos que fazem eventos raríssimos parecerem frequentes.',
    vereditoCientifico: 'MITO DESMENTIDO — EVENTOS GRAVES SÃO EXTREMAMENTE RAROS',
    explicacaoMedica:
      'Mais de 99,9% das reações pós-vacinais restringem-se a manifestações locais leves (dor no braço, discreto inchaço) ou febre baixa passageira que cessa em até 48 horas. Eventos adversos graves (como reações alérgicas anafiláticas) ocorrem em proporção inferior a 1 caso para cada 500.000 a 1.000.000 de doses aplicadas — e todas as salas de vacinação do SUS possuem protocolo imediato de manejo. O risco de sequelas graves pela doença natural é milhares de vezes superior ao risco vacinal.',
    dadoComprovado:
      'Monitoramento contínuo pelo Sistema Nacional de Vigilância de ESAVI (ANVISA / Ministério da Saúde) confirma a altíssima segurança dos imunobiológicos do PNI.',
    fonteCientifica: 'ANVISA — Boletim de Farmacovigilância de Vacinas & Comitê Consultivo Global da OMS (GACVS).',
  },
];

export interface CanalOficial {
  id: string;
  nomeOficial: string;
  orgaoResponsavel: string;
  finalidadePublica: string;
  urlOficial: string;
  passoAPassoComunidade: string[];
  destaqueUtilidade: string;
}

export const CANAIS_OFICIAIS_IMUNIZACAO: CanalOficial[] = [
  {
    id: 'meu-sus-digital',
    nomeOficial: 'Meu SUS Digital (antigo ConecteSUS)',
    orgaoResponsavel: 'Ministério da Saúde · DATASUS / Governo Federal',
    finalidadePublica:
      'Carteira Nacional de Vacinação Digital oficial, histórico completo de doses registradas na Rede Nacional de Dados em Saúde (RNDS) e emissão de certificados de vacinação.',
    urlOficial: 'https://meususdigital.saude.gov.br',
    passoAPassoComunidade: [
      '1. Acesse o portal web ou baixe gratuitamente o aplicativo "Meu SUS Digital" (Google Play / App Store).',
      '2. Entre utilizando sua conta única Gov.br (CPF e senha pessoal).',
      '3. No menu principal, toque no ícone "Vacinas" para visualizar a Carteira Nacional Digital de Vacinação.',
      '4. Clique em "Exportar PDF" ou validar QR Code para apresentar em escolas, concursos, estágios e viagens.',
    ],
    destaqueUtilidade: 'Acesso imediato à Caderneta de Vacinação Digital com QR Code oficial do SUS',
  },
  {
    id: 'pni-ministerio-saude',
    nomeOficial: 'Programa Nacional de Imunizações (PNI)',
    orgaoResponsavel: 'Secretaria de Vigilância em Saúde e Ambiente (SVSA / MS)',
    finalidadePublica:
      'Consulta aos Calendários Nacionais de Vacinação atualizados por faixa etária, notas técnicas oficiais, campanhas nacionais de multivacinação e informes epidemiológicos.',
    urlOficial: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/calendario-nacional-de-vacinacao',
    passoAPassoComunidade: [
      '1. Acesse a página oficial do Calendário Nacional de Vacinação no portal do Ministério da Saúde.',
      '2. Selecione o perfil desejado: Criança, Adolescente, Adulto, Gestante, Idoso ou Povos Indígenas.',
      '3. Confira a lista de vacinas gratuitas disponíveis nas Unidades Básicas de Saúde (UBS) para cada idade.',
      '4. Compare com sua caderneta física ou digital e dirija-se ao posto de saúde mais próximo para atualização.',
    ],
    destaqueUtilidade: 'Tabela oficial atualizada de doses gratuitas do SUS do nascimento à terceira idade',
  },
  {
    id: 'saude-com-ciencia',
    nomeOficial: 'Portal Saúde com Ciência',
    orgaoResponsavel: 'Iniciativa Interministerial · Ministério da Saúde & MCTI',
    finalidadePublica:
      'Plataforma pública oficial de enfrentamento à desinformação em saúde, checagem científica de boatos sobre vacinas e divulgação de evidências médicas verificadas.',
    urlOficial: 'https://www.gov.br/saude/pt-br/assuntos/saude-com-ciencia',
    passoAPassoComunidade: [
      '1. Antes de compartilhar qualquer mensagem alarmista ou corrente sobre vacinas no WhatsApp, acesse o portal.',
      '2. Consulte a seção "Fato ou Fake / Checagens" para verificar se a afirmação já foi analisada por especialistas.',
      '3. Leia o parecer técnico fundamentado em estudos clínicos da Fiocruz, Instituto Butantan, ANVISA e OMS.',
      '4. Baixe os cards explicativos oficiais para compartilhar informação verificada nos grupos da família e comunidade.',
    ],
    destaqueUtilidade: 'Verificação oficial contra Fake News com pareceres técnicos da Fiocruz, Butantan e ANVISA',
  },
];
