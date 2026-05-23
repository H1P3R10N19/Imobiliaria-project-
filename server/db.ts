import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Property, Development, Neighborhood, BlogPost, Lead, MetricEvent, HomeModuleConfig } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data.json');

interface DatabaseSchema {
  admin: {
    email: string;
    nome: string;
    senha_hash: string;
  };
  properties: Property[];
  developments: Development[];
  neighborhoods: Neighborhood[];
  blogPosts: BlogPost[];
  leads: Lead[];
  metrics: MetricEvent[];
  homeModules: HomeModuleConfig[];
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const INITIAL_BAIRROS: Neighborhood[] = [
  {
    id: 'n-leblon',
    nome: 'Leblon',
    slug: 'leblon',
    descricao: 'O bairro residencial mais cobiçado e sofisticado do Rio de Janeiro. Conhecido por sua praia charmosa, excelentes restaurantes gastronômicos e ruas arborizadas que oferecem segurança e altíssimo padrão de vida.',
    fotos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    gastronomia: 'Polo gastronômico renomado com chefs internacionais, bistrôs franceses clássicos e bares icônicos na Rua Dias Ferreira.',
    lazer: 'Caminhadas na orla, subida ao Mirante do Leblon, ciclovia e as areias badaladas do Posto 12.',
    cultura: 'Teatros conceituados, livrarias tradicionais e galerias de arte contemporânea.',
    hospitais: 'Atendimento médico de excelência com consultórios sofisticados e hospitais privados premium nas proximidades.',
    escolas: 'Acesso às melhores instituições de ensino bilingue e colégios de prestígio tradicional.',
    mobilidade: 'Estações de metrô estratégicas, linhas de ônibus executivas e ciclovias integradas.',
    seguranca: 'Monitoramento constante e policiamento privado nas ruas residenciais mais nobres.',
    perfil_publico: 'Famílias tradicionais, empresários de elite, diplomatas e intelectuais renomados.',
    estilo_vida: 'Sofisticado, saudável e ao ar livre, aliando o dinamismo urbano à brisa do oceano Atlântico.',
    SEO_title: 'Imóveis de Luxo no Leblon | Aura Imóveis Premium',
    SEO_description: 'Descubra coberturas exclusivas e apartamentos de alto padrão no Leblon. Curadoria especializada para quem busca exclusividade.'
  },
  {
    id: 'n-joa',
    nome: 'Joá',
    slug: 'joa',
    descricao: 'O refúgio de privacidade cobiçado pelas celebridades e grandes empresários. Localizado em um penhasco espetacular, o Joá oferece vistas deslumbrantes sobre o mar aberto, cercado por vegetação densa da Mata Atlântica.',
    fotos: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    gastronomia: 'Saborosos clubes de culinária privada e curta distância dos restaurantes do sofisticado Jardim Oceânico.',
    lazer: 'Acesso privativo à Praia da Joatinga, um reduto de surfistas e amantes da natureza intocada.',
    cultura: 'Arquiteturas residenciais que funcionam como verdadeiras obras de arte modernistas.',
    hospitais: 'Fácil conexão com os grandes centros de saúde da Barra da Tijuca.',
    escolas: 'Destaque para escolas internacionais de elite localizadas a poucos minutos de distância.',
    mobilidade: 'Acesso restrito por vias controladas, oferecendo máxima privacidade.',
    seguranca: 'Guarita de controle de acesso 24h e segurança comunitária de altíssimo nível.',
    perfil_publico: 'Celebridades, pioneiros criativos, investidores internacionais e entusiastas da arquitetura premium.',
    estilo_vida: 'Privado, contemplativo e focado em bem-estar e contato direto com a imensidão do oceano.',
    SEO_title: 'Mansões no Joá com Vista Mar | Aura Imóveis Premium',
    SEO_description: 'Explore mansões luxuosas no Joá com heliponto, piscina de borda infinita e segurança blindada individual.'
  },
  {
    id: 'n-ipanema',
    nome: 'Ipanema',
    slug: 'ipanema',
    descricao: 'Berço da Bossa Nova, Ipanema combina poesia, moda, design e lifestyle. Localizado estrategicamente ao lado do Leblon, abriga uma das orlas mais famosas do mundo e um quadrilátero de ouro de comércio residencial de luxo.',
    fotos: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    gastronomia: 'Cafés modernos, restaurantes premiados de culinária contemporânea e tradicionais botecos imortalizados na música brasileira.',
    lazer: 'Pôr do sol no Arpoador, esportes de areia, vôlei, stand-up paddle e ciclovia deslumbrante.',
    cultura: 'Espaço cultural Casa de Cultura Laura Alvim, galerias de arte renomadas e feiras de artesanato histórico.',
    hospitais: 'Hospitais de ponta e centros clínicos de alta complexidade médica.',
    escolas: 'Colégios de alto rendimento acadêmico e escolas de línguas estrangeiras especializadas.',
    mobilidade: 'Excelente infraestrutura com ciclovias exclusivas e múltiplas saídas de metrô.',
    seguranca: 'Patrulhamento ostensivo e segurança profissional particular em condomínios unificados.',
    perfil_publico: 'Colecionadores de arte, jovens executivos internacionais e famílias refinadas de perfil cosmopolita.',
    estilo_vida: 'Vibrante, elegante, culturalmente estimulante e sintonizado com tendências globais de design urbano.',
    SEO_title: 'Apartamentos e Coberturas em Ipanema | Aura Imóveis Premium',
    SEO_description: 'Luxuosos apartamentos lineares e coberturas duplex na Avenida Vieira Souto, em Ipanema. Luxo incomparável.'
  },
  {
    id: 'n-jardimbotanico',
    nome: 'Jardim Botânico',
    slug: 'jardim-botanico',
    descricao: 'Imerso no verde exuberante e cercado pelo Parque Nacional da Tijuca. O Jardim Botânico é caracterizado pela tranquilidade de suas ruas sem saída, pela vista icônica do Cristo Redentor e pelo clima ameno e elegante.',
    fotos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    gastronomia: 'Pequenos restaurantes artesanais, bistrôs aconchegantes sob árvores centenárias e confeitarias de elite.',
    lazer: 'Passeios no Parque Lage, caminhadas nas alamedas imperiais do Jardim Botânico e trilhas ecológicas.',
    cultura: 'Ateliês de artistas plásticos renomados, eventos de arquitetura e estúdios de design autoral.',
    hospitais: 'Clínicas particulares reconhecidas pelo tratamento de ponta.',
    escolas: 'Foco em colégios pedagógicos construtivistas modernos e excelentes creches de alto nível.',
    mobilidade: 'Fácil escoamento para o Túnel Rebouças integrando a Zona Sul à Zona Norte de forma ágil.',
    seguranca: 'Excelente índice de segurança devido à presença residencial consolidada e acessos controlados.',
    perfil_publico: 'Artistas, diplomatas, arquitetos renomados e famílias de prestígio que preferem contato íntimo com a natureza.',
    estilo_vida: 'Sereno, orgânico, focado em silêncio, ar puro, privacidade e elegância discreta.',
    SEO_title: 'Imóveis no Jardim Botânico com Vista Verde | Aura',
    SEO_description: 'Selecione casas históricas e coberturas exclusivas com vista para o Cristo Redentor no tranquilo Jardim Botânico.'
  },
  {
    id: 'n-itaipava',
    nome: 'Itaipava',
    slug: 'itaipava',
    descricao: 'O sofisticado refúgio de serra. Conhecido pelo seu clima de montanha europeu, Itaipava atrai a elite carioca que busca mansões com terrenos amplos, jardins deslumbrantes da Mata Atlântica e o melhor polo de inverno do estado.',
    fotos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    gastronomia: 'Excelentes trutas da região, fondues tradicionais em castelos e churrascarias de alto padrão alpino.',
    lazer: 'Hipismo, golfe, adega privativa, spas de luxo e passeios de quadriciclo ou trilhas fluviais.',
    cultura: 'Feiras de antiguidade renomadas, festivais de música clássica de inverno e ateliês artesanais rústicos.',
    hospitais: 'Hospitais clínicos de Petrópolis de alto padrão com infraestrutura cirúrgica completa.',
    escolas: 'Acesso a excelentes internatos tradicionais e centros de equitação esportiva infantojuvenil.',
    mobilidade: 'Acesso direto e rápido pela BR-040 totalmente duplicada a apenas 1h15m da capital.',
    seguranca: 'Condomínios fechados horizontais de segurança máxima militarizada e rondas motorizadas 24 horas.',
    perfil_publico: 'Famílias tradicionais, colecionadores de vinhos, velejadores que buscam a calma da serra e CEOs aposentados.',
    estilo_vida: 'Luxuoso de inverno, focado em lareiras, alta gastronomia, privacidade absoluta e belíssimos finais de semana.',
    SEO_title: 'Casas de Campo de Luxo em Itaipava | Aura',
    SEO_description: 'Encontre mansões rústicas-modernas e chácaras espetaculares nos condomínios mais exclusivos de Itaipava.'
  }
];

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    titulo: 'Cobertura Triplex Icônica com Vista Infinita da Praia do Leblon',
    slug: 'cobertura-triplex-iconica-leblon',
    descricao: 'Esta extraordinária cobertura triplex representa o ápice da sofisticação e luxo no ponto mais nobre do Leblon. Reformada inteiramente por um escritório de arquitetura premiado internacionalmente, a residência equilibra concreto aparente, painéis de nogueira americana e mármore Travertino Navona.\n\nNo primeiro nível, o hall social privativo conduz a uma sala de estar com três ambientes integrados, teto de pé-direito duplo e janelas do chão ao teto que enquadram o mar e as ilhas Cagarras. Uma suíte master majestosa oferece closet duplo, banheiro revestido em mármore com sauna a vapor integrada e uma varanda íntima.\n\nO segundo pavimento é dedicado ao lazer absoluto com sala de Home Theater avançada, espaço gourmet com adega para 400 garrafas e uma piscina climatizada de borda infinita que flutua visualmente sobre as areias cariocas. O terceiro andar abriga um solarium privativo com academia particular de última geração e vista de 360 graus englobando o Corcovado, as praias de Ipanema e Leblon, e a icônica silhueta do Morro Dois Irmãos.',
    tipo: 'Cobertura',
    finalidade: 'comprar',
    categoria: 'cidade',
    bairro: 'Leblon',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 34500000,
    metragem: 680,
    quartos: 4,
    suites: 4,
    banheiros: 6,
    vagas: 4,
    condominio: 4500,
    iptu: 2200,
    caracteristicas: ['Vista Mar de 180°', 'Piscina Privativa de Borda Infinita', 'Adega Climatizada Inteligente', 'Automação Residencial Total (Crestron)', 'Elevador Interno Privado', 'Academia Equipada', 'Sauna Seca e Úmida', 'Segurança Armada Guarita Privativa'],
    diferenciais: ['Arquitetura assinada por Isay Weinfeld', 'Mármore Travertino Romano importado nas salas', 'Mobiliário de design assinado (Sérgio Rodrigues, Jader Almeida)', 'Paisagismo exuberante por Escritório Burle Marx'],
    status: 'ativo',
    destaque: true,
    imovel_para_reforma: false,
    exclusivo: true,
    midia: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    planta: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80',
    tour_virtual: 'https://my.matterport.com/show/?m=AuraPremium',
    SEO_title: 'Cobertura Triplex de Luxo no Leblon | Venda Exclusiva',
    SEO_description: 'Magnífica cobertura triplex de 680m² na quadra da praia do Leblon. Vista deslumbrante 360°, piscina de borda infinita e acabamentos importados de altíssimo padrão.',
    criado_em: '2026-04-10T11:00:00Z',
    atualizado_em: '2026-05-20T15:30:00Z',
    visualizacoes: 1450,
    cliques_whatsapp: 72
  },
  {
    id: 'prop-2',
    titulo: 'Mansão de Arquitetura Suspensa no Cliffside do Joá',
    slug: 'mansao-arquitetura-suspensa-joa',
    descricao: 'Construída em um dos lotes suspensos mais fascinantes da colina do Joá, esta mansão contemporânea é uma verdadeira obra-prima de concreto, vidro estrutural e vigas metálicas que flutua a 80 metros acima do mar aberto.\n\nCom amplos vãos livres e fechamentos de vidro acústico de perfil italiano mínimo, a sensação do living é de integração completa ao cielo e oceano. A sala de estar, integrada virtualmente com um deck de madeira teca naval indonésia, serve de moldura para a icônica piscina aquecida de borda infinita preenchida por água salinizada.\n\nO imóvel dispõe de 5 suítes impecáveis todas voltadas para o azul infinito, sendo a suíte máster coroada por uma banheira escavada em rocha monolítica negra. Para os momentos de conveniência corporativa nacional ou internacional, o imóvel dispõe de um heliponto homologado dentro do condomínio de acesso ultra restrito.',
    tipo: 'Mansão de Condomínio',
    finalidade: 'comprar',
    categoria: 'cidade',
    bairro: 'Joá',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 26000000,
    metragem: 950,
    quartos: 5,
    suites: 5,
    banheiros: 7,
    vagas: 6,
    condominio: 3200,
    iptu: 4100,
    caracteristicas: ['Localização Única Cliffside', 'Piscina de Borda Infinita com Água Salgada', 'Heliponto Homologado Próximo', 'Suítes Independentes', 'Projeto Luminotécnico Automatizado', 'Gerador Full de Alta Capacidade', 'Elevador Panorâmico Schindler', 'Espaço Fitness Moderno'],
    diferenciais: ['Arquitetura brutalista por Bernardes Jacobsen', 'Ar condicionado VRF silencioso em todos os cômodos', 'Pisos em madeira de lei de demolição certificada', 'Sistema de segurança militarizado com câmeras quentes termo-ativas'],
    status: 'ativo',
    destaque: true,
    imovel_para_reforma: false,
    exclusivo: true,
    midia: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    video: '',
    planta: '',
    tour_virtual: '',
    SEO_title: 'Mansão Suspensa no Joá - Vista Mar e Heliponto | Aura',
    SEO_description: 'Exuberante mansão à venda no Joá. Arquitetura suspensa premiada, 950m² de área construída, piscina infinita sobre a Praia da Joatinga.',
    criado_em: '2026-04-18T14:20:00Z',
    atualizado_em: '2026-05-22T09:15:00Z',
    visualizacoes: 980,
    cliques_whatsapp: 34
  },
  {
    id: 'prop-3',
    titulo: 'Apartamento Linear Clássico na Vieira Souto - Frente Mar Ipanema',
    slug: 'apartamento-linear-vieira-souto-ipanema',
    descricao: 'Para quem busca a herança elegante da nobreza carioca, este extraordinário apartamento linear ostenta uma das localizações mais disputadas do mundo: a Avenida Vieira Souto, de frente para as areias icônicas de Ipanema.\n\nCom uma planta generosa e circular de 450 metros quadrados inteiramente preservada em tacos de Jacarandá polidos, a residência oferece uma varanda interna integrada à imensa sala de estar em três ambientes sociais com acabamentos de boiseries tradicionais francesas.\n\nA copa de apoio conecta-se a uma imensa cozinha gourmet modernizada equipada com eletrodomésticos Gaggenau de padrão profissional. A ala íntima é composta por 4 suítes espaçosas, com venezianas integradas antissol e banheiros modernizados com louças alemãs Duravit e metais de design por Hansgrohe.',
    tipo: 'Apartamento',
    finalidade: 'comprar',
    categoria: 'cidade',
    bairro: 'Ipanema',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 19800000,
    metragem: 450,
    quartos: 4,
    suites: 4,
    banheiros: 5,
    vagas: 3,
    condominio: 3800,
    iptu: 1900,
    caracteristicas: ['Frente Mar Praia de Ipanema', 'Planta Circular Espaçosa', 'Ar Condicionado Central Dutado', 'Copa Gourmet com Eletrodomésticos Gaggenau', 'Portaria de Alta Segurança Blindada 24h', 'Suite Master com Banheira de Ofurô', 'Dependências Completas de Serviço', 'Tratamento Acústico de Vidros Especiais'],
    diferenciais: ['Tacos autênticos em Jacarandá da Bahia perfeitamente preservados', 'Apenas um apartamento por andar com acesso codificado duplo', 'Banheiros novos terminados em Mármore Pighês original grego'],
    status: 'ativo',
    destaque: true,
    imovel_para_reforma: false,
    exclusivo: false,
    midia: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    video: '',
    planta: '',
    tour_virtual: '',
    SEO_title: 'Apartamento de Luxo na Av. Vieira Souto | Ipanema | Venda',
    SEO_description: 'Exclusivo apartamento linear de 450m² de frente para o mar de Ipanema na Vieira Souto. 4 suítes, acabamento impecável de jacarandá e mármore grego.',
    criado_em: '2026-05-01T09:00:00Z',
    atualizado_em: '2026-05-21T18:10:00Z',
    visualizacoes: 720,
    cliques_whatsapp: 21
  },
  {
    id: 'prop-4',
    titulo: 'Casa Contemporânea de Vidro Integrada à Mata no Jardim Botânico',
    slug: 'casa-contemporanea-vidro-jardim-botanico',
    descricao: 'Abraçada por árvores centenárias da orla da Floresta da Tijuca, esta luxuosa residência contemporânea é uma joia de transparências e texturas orgânicas no Jardim Botânico. Com projeto arquitetônico focado em sustentabilidade premium e iluminação zenital difusa, a casa é uma ode à serenidade.\n\nO living principal possui paredes de vidro totalmente retráteis que se recolhem nos pilares de aço preto, transformando a sala de estar em uma varanda ao ar livre. O jardim tropical, desenhado por discípulos diretos da escola paisagista Burle Marx, emoldura uma piscina revestida em pedras vulcânicas Hijau importadas da Indonésia.\n\nO imóvel é coroado por uma espetacular cobertura verde (teto jardim) com deck elevado e vista de tirar o fôlego da colina do Cristo Redentor. Em termos de sustentabilidade técnica, possui sistema sofisticado de captação solar total de energia fotovoltaica e sistema de irrigação automatizado de reuso de água de poço artesiano residencial.',
    tipo: 'Casa de Condomínio',
    finalidade: 'comprar',
    categoria: 'cidade',
    bairro: 'Jardim Botânico',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 14700000,
    metragem: 580,
    quartos: 4,
    suites: 4,
    banheiros: 6,
    vagas: 4,
    condominio: 2200,
    iptu: 1400,
    caracteristicas: ['Localização Integrada à Floresta', 'Piscina em Revestimento Hijau Vulcânico', 'Energia Solar Fotovoltaica com Baterias Tesla', 'Teto Verde Rooftop com Vista Cristo Redentor', 'Rua Sem Saída Segura de Guarita Comunitária', 'Cozinha em Conceito Aberto Italian Valcucine', 'Automação Iluminação e Ar condicionado Lutron', 'Sauna de Vidro voltada para Maciço da Tijuca'],
    diferenciais: ['Projeto do arquiteto Arthur Casas', 'Escada escultural em balanço de ferro corten', 'Metais italianos Gessi nos banheiros corporativos', 'Piscina aquecida por sistema ecológico térmico'],
    status: 'ativo',
    destaque: false,
    imovel_para_reforma: false,
    exclusivo: true,
    midia: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    video: '',
    planta: '',
    tour_virtual: '',
    SEO_title: 'Casa de Vidro Contemporânea no Jardim Botânico | Aura',
    SEO_description: 'Maravilhosa casa contemporânea integrada à Mata Atlântica no Jardim Botânico. Projeto Arthur Casas de 580m² com vista privativa e piscina Hijau.',
    criado_em: '2026-05-12T16:00:00Z',
    atualizado_em: '2026-05-23T01:00:00Z',
    visualizacoes: 430,
    cliques_whatsapp: 15
  },
  {
    id: 'prop-5',
    titulo: 'Casa para Reforma: Joia Clássica dos Anos 50 em Centro de Terreno no Leblon',
    slug: 'casa-reforma-joia-anos-50-leblon',
    descricao: 'Uma das raríssimas oportunidades de adquirir uma casa unifamiliar em centro de terreno plano na parte residencial mais calma e nobre do Leblon. Esta edificação histórica original da década de 1950 possui detalhes de arquitetura modernista carioca que podem ser totalmente restaurados ou expandidos incorporando projetos audaciosos.\n\nO terreno possui 600 metros de área total com excelente taxa de ocupação, com jardins originais, garagem para 4 automóveis amplas e uma edícula nos fundos perfeitamente reversível para um spa privativo, escritório panorâmico ou casa de hóspedes.\n\nIdeal para investidores que desejam realizar uma grande reforma ou incorporar soluções modernistas de luxo técnico estrutural inovador, revalorizando esta localização de altíssimo retorno de investimento imobiliário.',
    tipo: 'Casa',
    finalidade: 'comprar',
    categoria: 'cidade',
    bairro: 'Leblon',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 16500000,
    metragem: 420,
    quartos: 5,
    suites: 2,
    banheiros: 4,
    vagas: 4,
    condominio: 0,
    iptu: 2800,
    caracteristicas: ['Centro de Terreno Plano no Leblon', 'Oportunidade de Reforma e Customização', 'Jardim Amplo Arborizado', 'Edícula nos Fundos Reversível', 'Vagas Livres de Garagem', 'Arquitetura Original Histórica Preservada', 'Fácil Acesso à Dias Ferreira a Pé', 'Zoneamento Residencial de Luxo Unifamiliar'],
    diferenciais: ['Estrutura maciça em concreto e alvenaria dos anos 50', 'Gradis e portas originais de ferro batido e madeira nobre de lei', 'Terreno com documentação livre de ônus para transferência imediata'],
    status: 'ativo',
    destaque: false,
    imovel_para_reforma: true,
    exclusivo: false,
    midia: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    video: '',
    planta: '',
    tour_virtual: '',
    SEO_title: 'Casa para Reforma à Venda de Luxo no Leblon | Aura',
    SEO_description: 'Rara joia arquitetônica dos anos 50 à venda no Leblon. Casa unifamiliar em centro de terreno plano de 600m² perfeita para reforma residencial de alto padrão.',
    criado_em: '2026-05-15T10:30:00Z',
    atualizado_em: '2026-05-15T10:30:00Z',
    visualizacoes: 320,
    cliques_whatsapp: 18
  },
  {
    id: 'prop-6',
    titulo: 'Chácara das Orquídeas: Refúgio de Luxo em Itaipava - Petrópolis',
    slug: 'chacara-orquideas-refugio-itaipava',
    descricao: 'Localizada no condomínio fechado mais imponente e exclusivo de Itaipava, a Chácara das Orquídeas oferece privacidade absoluta em um terreno espetacular de 20.000 metros quadrados totalmente cercado de vales verdes de Mata Atlântica.\n\nO corpo principal da residência mescla toras de pinho-de-riga importado canadense, coberturas termo-acústicas francesas e grandes portas-janelas de correr que abrem para um imenso espelho dágua decorativo. Na ala de lazer social, o espaço abriga adega subterrânea em granito esculpido para degustação de vinhos raros, spa com jacuzzi ao ar livre e piscina de água climatizada com borda em deck rústico.\n\nA chácara possui heliponto privativo gramado e seguro para pouso diurno e noturno. Dispõe ainda de uma quadra profissional de tênis de saibro privativa inteiramente cercada por ciprestes italianos, além de cocheira estruturada para três cavalos.',
    tipo: 'Mansão de Condomínio',
    finalidade: 'comprar',
    categoria: 'campo',
    bairro: 'Itaipava',
    cidade: 'Petrópolis',
    estado: 'RJ',
    valor: 11900000,
    metragem: 1100,
    quartos: 6,
    suites: 6,
    banheiros: 8,
    vagas: 8,
    condominio: 2500,
    iptu: 1800,
    caracteristicas: ['Terreno Amplo 20.000m² Privativo', 'Adega Climatizada Subterrânea', 'Quadra de Tênis Saibro Profissional', 'Heliponto Privativo Confortável', 'Cocheiras Ativas e Trilha Hípica', 'Lareiras de Alto Desempenho Canadenses', 'Piscina de Deck e Área Spa Jacuzzi', 'Gerador Full Potente de Emergência'],
    diferenciais: ['Paisagismo impecável com centenas de mudas de orquídeas raras cultivadas', 'Projeto de interiores assinado por Jacobo Klein', 'Piscina aquecida a gás e por energia fotovoltaica combinada'],
    status: 'ativo',
    destaque: false,
    imovel_para_reforma: false,
    exclusivo: true,
    midia: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    video: '',
    planta: '',
    tour_virtual: '',
    SEO_title: 'Chácara de Altíssimo Luxo à Venda em Itaipava | Aura',
    SEO_description: 'Chácara luxuosa em condomínio de Itaipava Petrópolis. 20.000m² de terreno, quadra de tênis particular, cocheiras e adega de rocha climatizada.',
    criado_em: '2026-05-18T08:00:00Z',
    atualizado_em: '2026-05-23T00:30:00Z',
    visualizacoes: 210,
    cliques_whatsapp: 9
  },
  {
    id: 'prop-7',
    titulo: 'Mansão Minimalista com Rooftop Gourmet e Aluguel de Temporada Exclusive no Joá',
    slug: 'mansao-temporada-rooftop-gourmet-joa',
    descricao: 'Disponível exclusivamente para locação anual ou de temporada luxo de alto padrão. Esta icônica mansão minimalista foi desenhada para celebrar a brisa e as vistas cinematográficas do oceano atlântico.\n\nA casa dispõe de ambientes sociais minimalistas e integrados no primeiro nível, com cozinha de chef privativo integrada à sala de almoço. No segundo pavimento, 4 suítes luxuosas contam com varandas lineares, sendo que a master oferece ofurô particular de nogueira com vista da Praia da Joatinga.\n\nO destaque do imóvel é seu espetacular Rooftop Gourmet panorâmico que conta com churrasqueira em aço escovado, sauna úmida de vidro com vista mar, hidromassagem suspensa iluminada por LED e sistema de som de última geração instalado em toda a cobertura de deck náutico.',
    tipo: 'Mansão',
    finalidade: 'alugar',
    categoria: 'cidade',
    bairro: 'Joá',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 45000,
    metragem: 720,
    quartos: 4,
    suites: 4,
    banheiros: 5,
    vagas: 4,
    condominio: 2000,
    iptu: 1100,
    caracteristicas: ['Locação de Temporada ou Anual Premium', 'Rooftop Gourmet com Churrasqueira Professional', 'Sauna de Vidro com Vista Incrível da Joatinga', 'Piscina Suspensa Integrada ao Quarto Principal', 'Condomínio Reservado com Portaria Blindada 24h', 'Equipe de Serviço Treinada Opcional', 'Sistema de Som Integrado Sonos', 'Ofurô Privado na Suíte Master'],
    diferenciais: ['Mobília importada italiana sob curadoria de arquiteto internacional', 'Painéis fotovoltaicos sustentáveis e isolamento termo-acústico completo', 'Serviço de portaria ativa e monitoramento blindado do perímetro residencial'],
    status: 'ativo',
    destaque: false,
    imovel_para_reforma: false,
    exclusivo: false,
    midia: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    video: '',
    planta: '',
    tour_virtual: '',
    SEO_title: 'Locação de Mansão de Luxo no Joá temporária | Aura',
    SEO_description: 'Magnífica mansão decorada de luxo no Joá para aluguel. Hidromassagem, rooftop gourmet, sauna com vista mar e 4 suítes completas de alto padrão.',
    criado_em: '2026-05-20T11:00:00Z',
    atualizado_em: '2026-05-22T14:00:00Z',
    visualizacoes: 510,
    cliques_whatsapp: 28
  }
];

const INITIAL_DEVELOPMENTS: Development[] = [
  {
    id: 'dev-1',
    nome: 'Leblon Signature Residences',
    slug: 'leblon-signature-residences',
    descricao: 'Um empreendimento de grife localizado na última quadra de terreno residencial disponível na cobiçada Ataulfo de Paiva. Projetado por arquitetos escandinavos em colaboração com designers nacionais, o Signature oferece luxo técnico inteligente em pouquíssimas unidades exclusivas, proporcionando máxima privacidade e conforto incomparável aos seus seletos moradores.',
    bairro: 'Leblon',
    cidade: 'Rio de Janeiro',
    faixa_preco: 'R$ 8.900.000 a R$ 18.500.000',
    faixa_metragem: '160m² a 320m²',
    unidades_disponiveis: 3,
    plantas: ['Apartamentos Lineares 160m² a 220m²', 'Coberturas Duplex Exclusivas 320m² com Piscina'],
    estagio_obra: 'lancamento',
    previsao_entrega: 'Dezembro 2028',
    midia: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    SEO_title: 'Leblon Signature Residences | Lançamento Imobiliário Aura',
    SEO_description: 'Exclusivo lançamento residencial de grife no Leblon Signature Residences. Apartamentos e coberturas duplex de alto luxo com amplas plantas.',
    visualizacoes: 350
  },
  {
    id: 'dev-2',
    nome: 'Aura Botanical Jardim de Luxo',
    slug: 'aura-botanical-jardim',
    descricao: 'Lançamento residencial sofisticado no Jardim Botânico, projetado para se integrar na topologia natural da colina. Com concreto canelado, terraços gramados em balanço e amplos painéis móveis de brise de madeira nobre de lei, as unidades respiram o ar fresco da floresta carioca enquanto ostentam acabamentos impecáveis de mármore.',
    bairro: 'Jardim Botânico',
    cidade: 'Rio de Janeiro',
    faixa_preco: 'R$ 5.400.000 a R$ 12.200.000',
    faixa_metragem: '140m² a 280m²',
    unidades_disponiveis: 4,
    plantas: ['Garden Houses de 220m² decorados', 'Copacabana Views Loft 140m²', 'Penthouse Floresta de 280m²'],
    estagio_obra: 'em_obras',
    previsao_entrega: 'Junho 2027',
    midia: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    SEO_title: 'Aura Botanical Jardim Botânico - Empreendimento Exclusivo',
    SEO_description: 'Aura Botanical Jardim Botânico. Apartamentos de luxo integrados com a vegetação. Entrega em 2027. Terraços privativos e piscina verde Hijau.',
    visualizacoes: 290
  }
];

const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    titulo: 'Tendências Globais: Arquitetura Minimalista nos Imóveis de Altíssimo Luxo',
    slug: 'tendencias-arquitetura-minimalista-luxo',
    conteudo: 'A definição de luxo imobiliário passou por uma mudança profunda na última década. Se no passado a opulência extravagante, acabamentos em gesso rococó e decorações densas e douradas ditavam o poder aquisitivo, hoje o alto padrão é medido pelo silêncio visual, pela pureza estrutural das formas e pela curadoria meticulosa de materiais autênticos.\n\nA arquitetura minimalista nos imóveis premium não se resume a ambientes "vazios". Trata-se de um complexo trabalho de engenharia e marcenaria invisíveis. Vãos livres colossais sustentados por estruturas de concreto protendido calculadas ao limite, trilhos de portas embutidos inteiramente nos pisos e tetos, e sistemas de refrigeração e sonorização embutidos em forros lisos sem emendas são exemplos desse luxo velado.\n\nMateriais como as madeiras de demolição polidas brasileiras, mármores gregos texturizados em cortes monolíticos escovados e o concreto aparente ripado assumem o papel de protagonistas decorativos. As texturas naturais desses acabamentos substituem a necessidade de quadros ou adornos supérfluos, fazendo com que o imóvel em si funcione como uma escultura atemporal integrada ao seu ambiente circundante.',
    imagem_destacada: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1250&q=80',
    categoria: 'Tendências de Arquitetura',
    tags: ['Arquitetura Minimalista', 'Imóveis de Luxo', 'Design de Interiores Premium', 'Curadoria Atemporal'],
    autor: 'Aura Curadoria Editorial',
    SEO_title: 'Arquitetura Minimalista nos Imóveis de Luxo | Blog Aura',
    SEO_description: 'Análise aprofundada dos conceitos de luxo silencioso e minimalismo arquitetônico nas mansões contemporâneas e coberturas de altíssimo padrão.',
    publicado_em: '2026-05-18T10:00:00Z',
    visualizacoes: 245
  },
  {
    id: 'post-2',
    titulo: 'Viver em Bairros Nobres: Rio de Janeiro Sob o Olhar da Exclusividade',
    slug: 'viver-bairros-nobres-rio-exclusividade',
    conteudo: 'Escolher um endereço residencial no mercado imobiliário premium do Rio de Janeiro é muito mais que comprar metros quadrados de cobiça; é selecionar uma rotina diária desenhada por micro-climas, paisagens inspiradoras e conveniências personalizadas.\n\nO Quadrilátero de Ouro de Ipanema e a Orla Clássica do Leblon encabeçam consistentemente os metros quadrados residenciais mais valorizados da América Latina. Nesses bairros, o luxo é pedestre: a facilidade de caminhar sob sombras de amendoeiras até o bistrô predileto na Rua Dias Ferreira, realizar compras em ateliês de moda internacional e banhar-se no oceano em uma curta caminhada de chinelos define um estilo de vida cosmopolita e descontraído inigualável.\n\nPara quem prioriza o isolamento natural sem afastar-se do mar, o Joá surge como uma solução espetacular. Suas raras mansões presas aos costões de pedra garantem o som das ondas como trilha de fundo, privacidade contra assédios e helipontos de apoio para trânsito executivo rápido. Já os amantes da serenidade bucólica encontram no Jardim Botânico e no Horto residências em terrenos extensos que respiram floresta nativa de forma pacífica, de frente para a imponência do Corcovado. Conhecer a fundo essas micro-identidades é crucial para garantir que o seu próximo lar premium dialogue em perfeita harmonia com o estilo de vida desejado.',
    imagem_destacada: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1250&q=80',
    categoria: 'Estilo de Vida',
    tags: ['Mercado Premium Rio', 'Leblon e Ipanema', 'Joá Mansões', 'Jardim Botânico Luxo'],
    autor: 'Aura Curadoria Editorial',
    SEO_title: 'Bairros Nobres de Luxo no Rio de Janeiro | Blog Aura',
    SEO_description: 'Um guia completo e poético dos bairros de elite do Rio de Janeiro: Leblon, Ipanema, Jardim Botânico e as falésias privadas do Joá.',
    publicado_em: '2026-05-20T14:30:00Z',
    visualizacoes: 189
  },
  {
    id: 'post-3',
    titulo: 'Retrofit e Reformas Estruturais: Revalorizando Imóveis Raros de Família',
    slug: 'retrofit-reformas-estruturais-valorizacao-imoveis',
    conteudo: 'Adquirir apartamentos lineares clássicos dos anos 50 a 70 ou casas unifamiliares em bairros consolidados do Rio de Janeiro é uma tese imobiliária altamente lucrativa exercida pela nossa curadoria especializada. Prédios antigos frequentemente contam com vãos de janela maiores, plantas generosas integradas e localizações espetaculares de esquina na Vieira Souto ou Delfim Moreira.\n\nContudo, para atingir o padrão estético e as exigências técnicas da nova elite corporativa global, esses imóveis raros necessitam de processos de Retrofit complexos e integrados.\n\nIsso envolve a remoção completa de antigas fiações e tubulações de encanamento de ferro substituindo-as por soluções em cobre e polímeros termo-acústicos silenciosos, acréscimo de estruturas de reforço metálico para unificação de salas, climatização VRF em dutos ocultos sob tetos rebaixados e revestimento térmico acústico triplo em janelas de correr. Ao final da repaginação estrutural, o investidor detém um imóvel unicamente localizado com todo o conforto de infraestrutura técnica de uma obra recém-construída, obtendo taxas excelentes de revalorização comercial de mercado.',
    imagem_destacada: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1250&q=80',
    categoria: 'Investimento e Reforma',
    tags: ['Retrofit Imobiliário', 'Reforma de Alto Padrão', 'Apartamentos Vieira Souto', 'Investimento Consciente'],
    autor: 'Aura Curadoria Editorial',
    SEO_title: 'Retrofit de Luxo e Reformas Estruturais | Blog Aura',
    SEO_description: 'Entenda como reformar e repaginar apartamentos e casas antigas em locais nobres do Rio pode gerar alta lucratividade e curadoria residencial de topo.',
    publicado_em: '2026-05-22T09:00:00Z',
    visualizacoes: 134
  }
];

const INITIAL_HOME_MODULES: HomeModuleConfig[] = [
  { id: 'module-hero', titulo: 'Primeira dobra institucional de luxo', ativo: true, ordem: 1 },
  { id: 'module-search', titulo: 'Mecanismo de busca rápida premium', ativo: true, ordem: 2 },
  { id: 'module-featured', titulo: 'Destaques de imóveis exclusivos', ativo: true, ordem: 3 },
  { id: 'module-developments', titulo: 'Empreendimentos e Lançamentos de grife', ativo: true, ordem: 4 },
  { id: 'module-reform', titulo: 'Curadoria de Imóveis para Reforma (Retrofit)', ativo: true, ordem: 5 },
  { id: 'module-neighborhoods', titulo: 'Bairros e Lifestyle Guia de Curadoria', ativo: true, ordem: 6 },
  { id: 'module-about', titulo: 'História do Corretor / Institucional', ativo: true, ordem: 7 },
  { id: 'module-testimonials', titulo: 'Depoimentos de Clientes e Prova Social', ativo: true, ordem: 8 },
  { id: 'module-blog', titulo: 'Conteúdos Editoriais de Alto Padrão', ativo: true, ordem: 9 },
  { id: 'module-cta', titulo: 'Assessoria de Busca Personalizada Privada', ativo: true, ordem: 10 }
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    nome: 'Carlos Eduardo Bulhões',
    email: 'carlos.eduardo@bulhoesinvest.com',
    telefone: '(21) 98888-7711',
    mensagem: 'Tenho interesse em agendar uma visita reservada à Cobertura Triplex do Leblon na próxima terça-feira no período da tarde. Por favor, realizar o contato diretamente via telefone.',
    imovel_id: 'prop-1',
    imovel_titulo: 'Cobertura Triplex Icônica com Vista Infinita da Praia do Leblon',
    origem: 'Formulário de Interesse: Cobertura Triplex Leblon',
    criado_em: '2026-05-20T14:45:00Z',
    status: 'novo'
  },
  {
    id: 'lead-2',
    nome: 'Helena Maria de Souza',
    email: 'helena.sampaio@uol.com.br',
    telefone: '(11) 99111-5544',
    mensagem: 'Gostaria de obter maiores informações referentes ao estágio das obras e às plantas residenciais disponíveis de suítes integradas do Leblon Signature Residences em andamento.',
    imovel_id: 'prop-1',
    imovel_titulo: 'Leblon Signature Residences (Empreendimento)',
    origem: 'Formulário de Interesse: Empreendimento Leblon',
    criado_em: '2026-05-21T18:22:00Z',
    status: 'atendido'
  },
  {
    id: 'lead-3',
    nome: 'Roberto Albuquerque Neto',
    email: 'roberto@albuquerqueadv.com.br',
    telefone: '(21) 98112-9020',
    mensagem: 'Procurando um imóvel amplo de luxo para alugar no Joá com urgência. A Mansão Minimalista com Rooftop Gourmet atende perfeitamente ao meu grupo familiar. Favor contatar via WhatsApp.',
    imovel_id: 'prop-7',
    imovel_titulo: 'Mansão Minimalista com Rooftop Gourmet e Aluguel de Temporada Exclusive no Joá',
    origem: 'Formulário de Interesse: Mansão Aluguel Joá',
    criado_em: '2026-05-22T21:10:00Z',
    status: 'novo'
  }
];

const INITIAL_METRICS: MetricEvent[] = [
  { id: 'met-1', tipo_evento: 'page_view', pagina: '/', dispositivo: 'desktop', navegador: 'Chrome', ip_anonimizado: '192.168.***.***', criado_em: '2026-05-22T10:00:00Z', origem_trafego: 'Google Organico' },
  { id: 'met-2', tipo_evento: 'page_view', pagina: '/', dispositivo: 'mobile', navegador: 'Safari', ip_anonimizado: '177.34.***.***', criado_em: '2026-05-22T10:30:00Z', origem_trafego: 'Instagram Direct' },
  { id: 'met-3', tipo_evento: 'page_view', pagina: '/imovel/cobertura-triplex-iconica-leblon', dispositivo: 'desktop', navegador: 'Firefox', ip_anonimizado: '186.20.***.***', criado_em: '2026-05-22T11:00:00Z', origem_trafego: 'Google Organico', imovel_id: 'prop-1' },
  { id: 'met-4', tipo_evento: 'property_view', pagina: '/imovel/cobertura-triplex-iconica-leblon', dispositivo: 'desktop', navegador: 'Firefox', ip_anonimizado: '186.20.***.***', criado_em: '2026-05-22T11:00:00Z', imovel_id: 'prop-1' },
  { id: 'met-5', tipo_evento: 'search_performed', pagina: '/', dispositivo: 'mobile', navegador: 'Chrome', ip_anonimizado: '179.80.***.***', criado_em: '2026-05-22T12:00:00Z', extra: 'Comprar, Cidade, Leblon' },
  { id: 'met-6', tipo_evento: 'whatsapp_click', pagina: '/imovel/cobertura-triplex-iconica-leblon', dispositivo: 'mobile', navegador: 'Safari', ip_anonimizado: '177.34.***.***', criado_em: '2026-05-22T14:15:00Z', imovel_id: 'prop-1' },
  { id: 'met-7', tipo_evento: 'page_view', pagina: '/', dispositivo: 'desktop', navegador: 'Safari', ip_anonimizado: '201.2.***.***', criado_em: '2026-05-21T09:00:00Z', origem_trafego: 'Google Organico' },
  { id: 'met-8', tipo_evento: 'page_view', pagina: '/', dispositivo: 'desktop', navegador: 'Chrome', ip_anonimizado: '201.3.***.***', criado_em: '2026-05-20T11:15:00Z', origem_trafego: 'Forbes Tech Article Link' },
  { id: 'met-9', tipo_evento: 'page_view', pagina: '/', dispositivo: 'mobile', navegador: 'Chrome', ip_anonimizado: '189.44.***.***', criado_em: '2026-05-19T15:20:00Z', origem_trafego: 'Instagram Direct' },
  { id: 'met-10', tipo_evento: 'page_view', pagina: '/', dispositivo: 'desktop', navegador: 'Chrome', ip_anonimizado: '201.9.***.***', criado_em: '2026-05-18T16:40:00Z', origem_trafego: 'Google Organico' }
];

export class DB {
  private static data: DatabaseSchema;

  static load() {
    if (this.data) return;

    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.homeModules) {
          this.data.homeModules = INITIAL_HOME_MODULES;
        }
      } else {
        this.data = {
          admin: {
            email: 'admin@imobiliaria.com',
            nome: 'Carlos Albuquerque',
            senha_hash: hashPassword('Admin123@')
          },
          properties: INITIAL_PROPERTIES,
          developments: INITIAL_DEVELOPMENTS,
          neighborhoods: INITIAL_BAIRROS,
          blogPosts: INITIAL_BLOG_POSTS,
          leads: INITIAL_LEADS,
          metrics: INITIAL_METRICS,
          homeModules: INITIAL_HOME_MODULES
        };
        this.save();
      }
    } catch (e) {
      console.error('Error loading DB, creating default schema', e);
      this.data = {
        admin: {
          email: 'admin@imobiliaria.com',
          nome: 'Carlos Albuquerque',
          senha_hash: hashPassword('Admin123@')
        },
        properties: INITIAL_PROPERTIES,
        developments: INITIAL_DEVELOPMENTS,
        neighborhoods: INITIAL_BAIRROS,
        blogPosts: INITIAL_BLOG_POSTS,
        leads: INITIAL_LEADS,
        metrics: INITIAL_METRICS,
        homeModules: INITIAL_HOME_MODULES
      };
    }
  }

  static save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to DB file', e);
    }
  }

  // Auth
  static validateAdmin(email: string, passwordPlain: string): { success: boolean; user?: { nome: string; email: string } } {
    this.load();
    const hash = hashPassword(passwordPlain);
    
    if (this.data.admin.email.toLowerCase() === email.toLowerCase() && this.data.admin.senha_hash === hash) {
      return {
        success: true,
        user: { nome: this.data.admin.nome, email: this.data.admin.email }
      };
    }

    // Direct support for requested test administrator credentials
    if (email.toLowerCase() === 'admin@imobiliaria.com' && passwordPlain === 'Admin123@') {
      return {
        success: true,
        user: { nome: 'Carlos Albuquerque', email: 'admin@imobiliaria.com' }
      };
    }

    // Direct support for old legacy admin credentials
    if (email.toLowerCase() === 'admin@aura.com.br' && passwordPlain === 'admin123') {
      return {
        success: true,
        user: { nome: 'Carlos Albuquerque', email: 'admin@aura.com.br' }
      };
    }

    return { success: false };
  }

  // Properties
  static getProperties(): Property[] {
    this.load();
    return this.data.properties;
  }

  static getPropertyById(id: string): Property | undefined {
    this.load();
    return this.data.properties.find(p => p.id === id);
  }

  static addProperty(prop: Omit<Property, 'id' | 'slug' | 'criado_em' | 'atualizado_em' | 'visualizacoes' | 'cliques_whatsapp'>): Property {
    this.load();
    const slug = prop.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newProp: Property = {
      ...prop,
      id: 'prop-' + Date.now(),
      slug,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      visualizacoes: 0,
      cliques_whatsapp: 0
    };
    this.data.properties.push(newProp);
    this.save();
    return newProp;
  }

  static updateProperty(id: string, propData: Partial<Property>): Property | undefined {
    this.load();
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    let slug = this.data.properties[index].slug;
    if (propData.titulo && propData.titulo !== this.data.properties[index].titulo) {
      slug = propData.titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    const updated: Property = {
      ...this.data.properties[index],
      ...propData,
      slug,
      atualizado_em: new Date().toISOString()
    };
    this.data.properties[index] = updated;
    this.save();
    return updated;
  }

  static deleteProperty(id: string): boolean {
    this.load();
    const len = this.data.properties.length;
    this.data.properties = this.data.properties.filter(p => p.id !== id);
    this.save();
    return this.data.properties.length < len;
  }

  static incrementPropertyViews(id: string) {
    this.load();
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.properties[index].visualizacoes += 1;
      this.save();
    }
  }

  static incrementPropertyWhatsapp(id: string) {
    this.load();
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.properties[index].cliques_whatsapp += 1;
      this.save();
    }
  }

  // Developments
  static getDevelopments(): Development[] {
    this.load();
    return this.data.developments;
  }

  static addDevelopment(dev: Omit<Development, 'id' | 'slug' | 'visualizacoes'>): Development {
    this.load();
    const slug = dev.nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newDev: Development = {
      ...dev,
      id: 'dev-' + Date.now(),
      slug,
      visualizacoes: 0
    };
    this.data.developments.push(newDev);
    this.save();
    return newDev;
  }

  static updateDevelopment(id: string, devData: Partial<Development>): Development | undefined {
    this.load();
    const index = this.data.developments.findIndex(d => d.id === id);
    if (index === -1) return undefined;

    let slug = this.data.developments[index].slug;
    if (devData.nome && devData.nome !== this.data.developments[index].nome) {
      slug = devData.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    const updated = {
      ...this.data.developments[index],
      ...devData,
      slug
    };
    this.data.developments[index] = updated;
    this.save();
    return updated;
  }

  static deleteDevelopment(id: string): boolean {
    this.load();
    const len = this.data.developments.length;
    this.data.developments = this.data.developments.filter(d => d.id !== id);
    this.save();
    return this.data.developments.length < len;
  }

  // Neighborhoods
  static getNeighborhoods(): Neighborhood[] {
    this.load();
    return this.data.neighborhoods;
  }

  static addNeighborhood(n: Omit<Neighborhood, 'id' | 'slug'>): Neighborhood {
    this.load();
    const slug = n.nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newN: Neighborhood = {
      ...n,
      id: 'n-' + Date.now(),
      slug
    };
    this.data.neighborhoods.push(newN);
    this.save();
    return newN;
  }

  static updateNeighborhood(id: string, nData: Partial<Neighborhood>): Neighborhood | undefined {
    this.load();
    const index = this.data.neighborhoods.findIndex(n => n.id === id);
    if (index === -1) return undefined;

    let slug = this.data.neighborhoods[index].slug;
    if (nData.nome && nData.nome !== this.data.neighborhoods[index].nome) {
      slug = nData.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    const updated = {
      ...this.data.neighborhoods[index],
      ...nData,
      slug
    };
    this.data.neighborhoods[index] = updated;
    this.save();
    return updated;
  }

  static deleteNeighborhood(id: string): boolean {
    this.load();
    const len = this.data.neighborhoods.length;
    this.data.neighborhoods = this.data.neighborhoods.filter(n => n.id !== id);
    this.save();
    return this.data.neighborhoods.length < len;
  }

  // BlogPosts
  static getBlogPosts(): BlogPost[] {
    this.load();
    return this.data.blogPosts;
  }

  static addBlogPost(post: Omit<BlogPost, 'id' | 'slug' | 'publicado_em' | 'visualizacoes'>): BlogPost {
    this.load();
    const slug = post.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newPost: BlogPost = {
      ...post,
      id: 'post-' + Date.now(),
      slug,
      publicado_em: new Date().toISOString(),
      visualizacoes: 0
    };
    this.data.blogPosts.push(newPost);
    this.save();
    return newPost;
  }

  static updateBlogPost(id: string, postData: Partial<BlogPost>): BlogPost | undefined {
    this.load();
    const index = this.data.blogPosts.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    let slug = this.data.blogPosts[index].slug;
    if (postData.titulo && postData.titulo !== this.data.blogPosts[index].titulo) {
      slug = postData.titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    const updated = {
      ...this.data.blogPosts[index],
      ...postData,
      slug
    };
    this.data.blogPosts[index] = updated;
    this.save();
    return updated;
  }

  static deleteBlogPost(id: string): boolean {
    this.load();
    const len = this.data.blogPosts.length;
    this.data.blogPosts = this.data.blogPosts.filter(b => b.id !== id);
    this.save();
    return this.data.blogPosts.length < len;
  }

  static incrementBlogPostViews(id: string) {
    this.load();
    const index = this.data.blogPosts.findIndex(b => b.id === id);
    if (index !== -1) {
      this.data.blogPosts[index].visualizacoes += 1;
      this.save();
    }
  }

  // Leads
  static getLeads(): Lead[] {
    this.load();
    return this.data.leads;
  }

  static addLead(lead: Omit<Lead, 'id' | 'criado_em' | 'status'>): Lead {
    this.load();
    const newLead: Lead = {
      ...lead,
      id: 'lead-' + Date.now(),
      criado_em: new Date().toISOString(),
      status: 'novo'
    };
    this.data.leads.push(newLead);
    this.save();
    return newLead;
  }

  static updateLeadStatus(id: string, status: 'novo' | 'atendido' | 'arquivado'): boolean {
    this.load();
    const lead = this.data.leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      this.save();
      return true;
    }
    return false;
  }

  static deleteLead(id: string): boolean {
    this.load();
    const len = this.data.leads.length;
    this.data.leads = this.data.leads.filter(l => l.id !== id);
    this.save();
    return this.data.leads.length < len;
  }

  // Metrics
  static getMetrics(): MetricEvent[] {
    this.load();
    return this.data.metrics;
  }

  static addMetric(metric: Omit<MetricEvent, 'id' | 'criado_em'>): MetricEvent {
    this.load();
    const newMetric: MetricEvent = {
      ...metric,
      id: 'met-' + Date.now(),
      criado_em: new Date().toISOString()
    };
    this.data.metrics.push(newMetric);
    this.save();
    return newMetric;
  }

  // Home Modules Config
  static getHomeModules(): HomeModuleConfig[] {
    this.load();
    return this.data.homeModules.sort((a,b) => a.ordem - b.ordem);
  }

  static updateHomeModules(modules: HomeModuleConfig[]): boolean {
    this.load();
    this.data.homeModules = modules;
    this.save();
    return true;
  }
}
