export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  criado_em: string;
}

export interface Property {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  tipo: string; // e.g., 'Cobertura', 'Casa de Condomínio', 'Apartamento', 'Mansão'
  finalidade: 'comprar' | 'alugar';
  categoria: 'cidade' | 'campo';
  bairro: string;
  cidade: string;
  estado: string;
  valor: number;
  metragem: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  condominio?: number;
  iptu?: number;
  caracteristicas: string[]; // e.g., ['Piscina', 'Vista Mar', 'Adega', 'Automação']
  diferenciais: string[];   // e.g., ['Projeto de Isay Weinfeld', 'Mármore Travertino Romano']
  status: 'ativo' | 'inativo';
  destaque: boolean;
  imovel_para_reforma: boolean;
  exclusivo: boolean;
  midia: string[]; // URLs of images
  video?: string; // Optional video embed or file
  planta?: string; // Planta image URL
  tour_virtual?: string; // Tour link
  SEO_title?: string;
  SEO_description?: string;
  criado_em: string;
  atualizado_em: string;
  visualizacoes: number;
  cliques_whatsapp: number;
}

export interface Development {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  bairro: string;
  cidade: string;
  faixa_preco: string; // e.g. "R$ 4.500.000 a R$ 12.000.000"
  faixa_metragem: string; // e.g. "180m² a 450m²"
  unidades_disponiveis: number;
  plantas: string[]; // URLs or description of plant variants
  estagio_obra: 'lancamento' | 'em_obras' | 'pronto';
  previsao_entrega: string; // e.g., "Dezembro 2027" or "Pronto"
  midia: string[]; // Image URLs
  SEO_title?: string;
  SEO_description?: string;
  visualizacoes: number;
}

export interface Neighborhood {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  fotos: string[];
  gastronomia: string;
  lazer: string;
  cultura: string;
  hospitais: string;
  escolas: string;
  mobilidade: string;
  seguranca: string;
  perfil_publico: string;
  estilo_vida: string;
  SEO_title?: string;
  SEO_description?: string;
}

export interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  imagem_destacada: string;
  categoria: string;
  tags: string[];
  autor: string;
  SEO_title?: string;
  SEO_description?: string;
  publicado_em: string;
  visualizacoes: number;
}

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  imovel_id?: string; // Optional if general or blog
  imovel_titulo?: string; // Helper for UI
  origem: string; // e.g., "Página de Imóvel: Cobertura Leblon", "WhatsApp Click"
  criado_em: string;
  status: 'novo' | 'atendido' | 'arquivado';
}

export interface MetricEvent {
  id: string;
  tipo_evento: 'page_view' | 'property_view' | 'search_performed' | 'lead_submitted' | 'whatsapp_click' | 'blog_post_view' | 'neighborhood_view';
  pagina: string;
  imovel_id?: string;
  bairro_id?: string;
  post_id?: string;
  origem_trafego?: string;
  dispositivo: 'desktop' | 'mobile' | 'tablet';
  navegador: string;
  ip_anonimizado: string;
  criado_em: string;
  extra?: string; // For things like search terms
}

export interface HomeModuleConfig {
  id: string; // e.g. "hero", "search", "featured", "reform", "exclusive", "developments", "neighborhoods", "blog", "about", "cta", "testimonials"
  titulo: string;
  ativo: boolean;
  ordem: number;
}
