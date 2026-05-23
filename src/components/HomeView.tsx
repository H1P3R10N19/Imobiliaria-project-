import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, MapPin, Grid, Layers, HardHat, Sparkles, Send, Flame, ShieldAlert, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';
import { Property, Development, Neighborhood, BlogPost, HomeModuleConfig, Lead } from '../types';
import { api, trackEvent } from '../api';

interface HomeViewProps {
  properties: Property[];
  developments: Development[];
  neighborhoods: Neighborhood[];
  blogPosts: BlogPost[];
  homeModules: HomeModuleConfig[];
  onNavigate: (page: string, params?: any) => void;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'criado_em' | 'status'>) => Promise<boolean>;
}

export default function HomeView({
  properties,
  developments,
  neighborhoods,
  blogPosts,
  homeModules,
  onNavigate,
  onSubmitLead
}: HomeViewProps) {
  // Local state for Search module (Quick queries)
  const [searchPurpose, setSearchPurpose] = useState<'comprar' | 'alugar'>('comprar');
  const [searchCategory, setSearchCategory] = useState<'cidade' | 'campo'>('cidade');
  const [searchBairro, setSearchBairro] = useState('');

  // Local state for the CTA VIP Form
  const [ctaName, setCtaName] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');
  const [ctaPhone, setCtaPhone] = useState('');
  const [ctaMessage, setCtaMessage] = useState('');
  const [ctaSuccess, setCtaSuccess] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);

  // Hero slideshow dynamic images
  const [heroIndex, setHeroIndex] = useState(0);
  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams: any = {
      finalidade: searchPurpose,
      categoria: searchCategory,
    };
    if (searchBairro) {
      queryParams.bairro = searchBairro;
    }
    
    // Track quick search event prior to forwarding to results layout
    const trackTerm = `${searchPurpose === 'comprar' ? 'Comprar' : 'Alugar'}, ${searchCategory === 'cidade' ? 'Cidade' : 'Campo'}${searchBairro ? ', ' + searchBairro : ''}`;
    trackEvent('search_performed', '/', trackTerm);
    
    onNavigate('results', queryParams);
  };

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctaName || !ctaPhone || !ctaEmail) return;

    setCtaLoading(true);
    const success = await onSubmitLead({
      nome: ctaName,
      email: ctaEmail,
      telefone: ctaPhone,
      mensagem: ctaMessage || 'Desejo receber assessoria imobiliária personalizada Aura para imóveis de altíssimo padrão.',
      origem: 'Formulário Sessão VIP - Home CTA'
    });
    setCtaLoading(false);

    if (success) {
      setCtaSuccess(true);
      setCtaName('');
      setCtaEmail('');
      setCtaPhone('');
      setCtaMessage('');
      setTimeout(() => setCtaSuccess(false), 5000);
    }
  };

  const getBairroOptions = () => {
    const distinct = Array.from(new Set(properties.map(p => p.bairro)));
    return distinct.sort();
  };

  // Render individual component modules depending on orders
  const renderModule = (module: HomeModuleConfig) => {
    if (!module.ativo) return null;

    switch (module.id) {
      case 'module-hero':
        return (
          <section key={module.id} className="relative h-[85vh] flex items-center justify-center overflow-hidden" id="section-hero">
            <div className="absolute inset-0 bg-black/45 z-10" />
            <img 
              src={heroBackgrounds[heroIndex]} 
              alt="Exclusive Manor Background" 
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-[1.03]"
            />
            
            <div className="relative z-20 text-center text-white px-6 max-w-4xl space-y-6">
              <span className="text-xs tracking-[0.4em] uppercase text-[#E5D5C0] font-medium block animate-fade-in">
                A Mais Rigorosa Curadoria Residencial do Brasil
              </span>
              <h1 className="text-4xl md:text-6xl font-extralight tracking-wide leading-tight font-serif text-[#FAF9F5] select-text">
                Onde a Arquitetura vira <span className="italic font-normal">Obra de Arte</span>
              </h1>
              <p className="text-sm md:text-base text-[#FAF9F5]/80 font-light max-w-2xl mx-auto tracking-wide leading-relaxed">
                Selecionamos com exclusividade absoluta as residências mais sofisticadas da Zona Sul carioca e da Serra Imperial brasileira.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => onNavigate('results')}
                  className="bg-[#AF9164] hover:bg-white text-white hover:text-[#111111] transition-all py-3 px-8 text-xs font-semibold uppercase tracking-[0.2em] rounded-none shadow-lg"
                >
                  Conhecer Portfólio
                </button>
                <button 
                  onClick={() => onNavigate('about')}
                  className="bg-transparent border border-white/45 hover:border-[#AF9164] hover:bg-black/25 text-white transition-all py-3 px-8 text-xs font-semibold uppercase tracking-[0.2em] rounded-none"
                >
                  Nossa Filosofia
                </button>
              </div>
            </div>
            
            {/* Slider bottom indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
              {heroBackgrounds.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${heroIndex === idx ? 'bg-[#AF9164] w-6' : 'bg-white/40'}`}
                  aria-label={`Visualizador ${idx+1}`}
                />
              ))}
            </div>
          </section>
        );

      case 'module-search':
        return (
          <section key={module.id} className="relative z-30 -mt-16 max-w-5xl mx-auto px-6 mb-16" id="section-search">
            <div className="bg-white p-6 md:p-8 shadow-xl border border-[#AF9164]/10 rounded-none">
              <form onSubmit={handleQuickSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                
                {/* Purpose Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Desejo</label>
                  <div className="flex bg-[#FAF9F5] p-1 border border-[#1A1A1A]/10">
                    <button
                      type="button"
                      onClick={() => setSearchPurpose('comprar')}
                      className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${searchPurpose === 'comprar' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
                    >
                      Comprar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchPurpose('alugar')}
                      className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${searchPurpose === 'alugar' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
                    >
                      Alugar
                    </button>
                  </div>
                </div>

                {/* Category Spec */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Localização</label>
                  <div className="flex bg-[#FAF9F5] p-1 border border-[#1A1A1A]/10">
                    <button
                      type="button"
                      onClick={() => setSearchCategory('cidade')}
                      className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${searchCategory === 'cidade' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
                    >
                      Cidade
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchCategory('campo')}
                      className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${searchCategory === 'campo' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
                    >
                      Campo
                    </button>
                  </div>
                </div>

                {/* Neighborhood Choice */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164] block">Bairro de Interesse</label>
                  <select
                    value={searchBairro}
                    onChange={(e) => setSearchBairro(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2.5 px-3 uppercase tracking-wider focus:outline-none focus:border-[#AF9164] h-[38px]"
                  >
                    <option value="">Qualquer Bairro</option>
                    {getBairroOptions().map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Search Action */}
                <div>
                  <button
                    type="submit"
                    className="w-full bg-[#AF9164] hover:bg-[#111111] text-white text-xs font-semibold uppercase tracking-[0.2em] py-3.5 px-6 transition-all duration-300 flex items-center justify-center gap-2 rounded-none"
                  >
                    <Search size={14} /> Filtrar Mansões
                  </button>
                </div>

              </form>
            </div>
          </section>
        );

      case 'module-featured':
        const highlightList = properties.filter(p => p.status === 'ativo' && p.destaque && !p.imovel_para_reforma).slice(0, 3);
        return (
          <section key={module.id} className="max-w-7xl mx-auto px-6 mb-24" id="section-featured">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.25em] text-[#AF9164] font-semibold block">Seleção Especial</span>
                <h2 className="text-3xl font-serif tracking-wide text-[#111111] font-light">Imóveis em Destaque Exclusivo</h2>
              </div>
              <button 
                onClick={() => onNavigate('results', { destaque: true })}
                className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/60 hover:text-[#AF9164] transition-all mt-4 md:mt-0"
              >
                Ver todos os destaques <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlightList.map(prop => (
                <div 
                  key={prop.id}
                  onClick={() => onNavigate('property', { id: prop.id })}
                  className="bg-white border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 cursor-pointer group transition-all duration-500 overflow-hidden"
                  id={`featured-${prop.id}`}
                >
                  {/* Photo with hover zoom */}
                  <div className="relative h-72 overflow-hidden bg-zinc-900">
                    <span className="absolute top-4 left-4 z-20 bg-[#111111] text-[#E5D5C0] text-[9px] uppercase tracking-widest font-normal py-1 px-2.5">
                      {prop.exclusivo ? 'Exclusividade Aura' : 'Curadoria Premium'}
                    </span>
                    <img 
                      src={prop.midia[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                      alt={prop.titulo}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Property Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center text-[10px] text-[#AF9164] uppercase tracking-wider font-semibold gap-1">
                      <MapPin size={10} />
                      {prop.bairro}, {prop.cidade}
                    </div>
                    <h3 className="text-base font-serif tracking-normal text-[#111111] group-hover:text-[#AF9164] transition-colors line-clamp-1">
                      {prop.titulo}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/50 line-clamp-2 leading-relaxed">
                      {prop.descricao}
                    </p>

                    <div className="border-t border-[#1A1A1A]/5 pt-4 flex justify-between items-center text-[11px] text-[#1A1A1A]/60 tracking-wider">
                      <span>{prop.metragem}m²</span>
                      <span>•</span>
                      <span>{prop.suites} Suítes</span>
                      <span>•</span>
                      <span>{prop.vagas} Vagas</span>
                    </div>

                    <div className="pt-2 text-sm font-semibold tracking-wide text-[#111111]">
                      {prop.finalidade === 'comprar' ? (
                        <>R$ {prop.valor.toLocaleString('pt-BR')}</>
                      ) : (
                        <>R$ {prop.valor.toLocaleString('pt-BR')} <span className="text-xs text-[#1A1A1A]/50 font-light">/ mês aluguel</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'module-developments':
        const activeDevs = developments.slice(0, 2);
        return (
          <section key={module.id} className="bg-[#111111] text-[#FAF9F5] py-24 border-y border-[#AF9164]/10" id="section-developments">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="flex flex-col md:flex-row items-end justify-between mb-16">
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#AF9164] font-medium block">Em Lançamento e Obra</span>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-wide font-serif">Empreendimentos de Grife</h2>
                  <p className="text-xs md:text-sm text-[#FAF9F5]/50 leading-relaxed max-w-xl font-light">
                    Lançamentos imobiliários assinados pelos melhores escritórios de engenharia e design. Alta performance financeira e patrimonial.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('results', { is_dev: true })}
                  className="bg-transparent border border-[#AF9164]/30 hover:border-[#AF9164] text-[#AF9164] text-xs font-semibold uppercase tracking-[0.2em] py-3 px-6 transition-all mt-6 md:mt-0"
                >
                  Todos os Empreendimentos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {activeDevs.map(dev => (
                  <div 
                    key={dev.id}
                    onClick={() => onNavigate('development', { id: dev.id })}
                    className="cursor-pointer group flex flex-col md:flex-row bg-[#1A1A1A] border border-[#FAF9F5]/5 hover:border-[#AF9164]/40 transition-all duration-500 overflow-hidden"
                    id={`devcard-${dev.id}`}
                  >
                    <div className="relative md:w-2/5 h-64 md:h-auto overflow-hidden bg-neutral-900 shrink-0">
                      <img 
                        src={dev.midia[0] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'} 
                        alt={dev.nome}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#AF9164] uppercase tracking-widest font-semibold">
                            {dev.bairro}, RJ
                          </span>
                          <span className="bg-[#FAF9F5]/10 text-[#FAF9F5] text-[8px] uppercase tracking-widest px-2 py-0.5 font-light">
                            {dev.estagio_obra === 'lancamento' ? 'Lançamento' : dev.estagio_obra === 'em_obras' ? 'Em Obras' : 'Pronto'}
                          </span>
                        </div>
                        <h3 className="text-xl font-serif font-light text-[#FAF9F5] group-hover:text-[#AF9164] transition-colors">
                          {dev.nome}
                        </h3>
                        <p className="text-xs text-[#FAF9F5]/50 leading-relaxed font-light line-clamp-3">
                          {dev.descricao}
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-[#FAF9F5]/5 pt-4">
                        <div className="text-[11px] text-[#FAF9F5]/40 uppercase tracking-widest flex justify-between">
                          <span>Faixa:</span>
                          <span className="text-[#AF9164] font-medium">{dev.faixa_preco}</span>
                        </div>
                        <div className="text-[11px] text-[#FAF9F5]/40 uppercase tracking-widest flex justify-between">
                          <span>Previsão:</span>
                          <span className="text-[#FAF9F5]/80 font-medium">{dev.previsao_entrega}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        );

      case 'module-reform':
        const reformMatches = properties.filter(p => p.status === 'ativo' && p.imovel_para_reforma).slice(0, 2);
        if (reformMatches.length === 0) return null;
        return (
          <section key={module.id} className="max-w-7xl mx-auto px-6 py-24" id="section-reform">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              
              <div className="lg:col-span-1 space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#AF9164] font-semibold block flex items-center gap-2">
                  <HardHat size={14} /> Retrofit Curadoria
                </span>
                <h2 className="text-3xl font-serif text-[#111111] font-light leading-tight">
                  Grandes Oportunidades de Reforma
                </h2>
                <p className="text-sm text-[#1A1A1A]/60 leading-relaxed font-light">
                  Propriedades com excelente embasamento técnico e localizações inigualáveis na Vieira Souto, Delfim Moreira e quadras da praia do Leblon, com enorme potencial de revalorização comercial após retrofit estrutural completo.
                </p>
                <button
                  onClick={() => onNavigate('results', { imovel_para_reforma: true })}
                  className="bg-[#111111] hover:bg-[#AF9164] text-white hover:text-[#111111] transition-all text-xs font-semibold uppercase tracking-[0.2em] py-3 px-6 rounded-none flex items-center gap-2"
                >
                  Conhecer Joias Clássicas <ArrowRight size={14} />
                </button>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                {reformMatches.map(prop => (
                  <div 
                    key={prop.id}
                    onClick={() => onNavigate('property', { id: prop.id })}
                    className="cursor-pointer bg-white border border-[#1A1A1A]/10 hover:border-[#AF9164] group p-4 transition-all duration-500 rounded-none shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="relative h-48 overflow-hidden bg-neutral-900 border border-[#1A1A1A]/5">
                        <span className="absolute top-4 right-4 z-20 bg-[#AF9164] text-white text-[8px] uppercase tracking-widest font-semibold px-2 py-0.5">
                          Para Reforma
                        </span>
                        <img 
                          src={prop.midia[0]} 
                          alt={prop.titulo}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-700"
                        />
                      </div>
                      <h4 className="text-base font-serif font-light text-[#111111] group-hover:text-[#AF9164] transition-colors line-clamp-1">
                        {prop.titulo}
                      </h4>
                      <p className="text-xs text-[#1A1A1A]/50 line-clamp-2">
                        {prop.descricao}
                      </p>
                    </div>

                    <div className="border-t border-[#1A1A1A]/5 pt-4 mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-[#AF9164] uppercase tracking-widest font-bold">
                        {prop.bairro}, RJ
                      </span>
                      <span className="text-xs font-semibold text-[#111111]">
                        R$ {prop.valor.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        );

      case 'module-neighborhoods':
        const selectBairros = neighborhoods.slice(0, 3);
        return (
          <section key={module.id} className="bg-[#FAF9F5] border-y border-[#1A1A1A]/5 py-24" id="section-neighborhoods">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-[#AF9164] font-medium block">Geolocalização e Lifestyle</span>
                <h2 className="text-3xl font-serif font-light text-[#111111] tracking-wide">Guia de Bairros Exclusivos</h2>
                <div className="w-12 h-[1px] bg-[#AF9164] mx-auto mt-4" />
                <p className="text-xs text-[#1A1A1A]/55 font-light leading-relaxed">
                  Conecte-se com a alma gastronômica, cultural e de segurança de cada região sofisticada do Rio de Janeiro e Serra Imperial.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {selectBairros.map(b => (
                  <div 
                    key={b.id}
                    onClick={() => onNavigate('neighborhood', { id: b.id })}
                    className="cursor-pointer group relative h-96 overflow-hidden bg-neutral-900 flex flex-col justify-end p-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img 
                      src={b.fotos[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                      alt={b.nome}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 opacity-65 group-hover:opacity-80"
                    />
                    
                    <div className="relative z-20 space-y-4 text-white">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-[#E5D5C0] font-semibold border border-[#E5D5C0]/30 py-0.5 px-2 rounded-none">
                        Saiba Mais
                      </span>
                      <h3 className="text-2xl font-serif tracking-wide text-white">{b.nome}</h3>
                      <p className="text-xs text-[#FAF9F5]/75 line-clamp-2 leading-relaxed font-light">
                        {b.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-12">
                <button
                  onClick={() => onNavigate('neighborhoods')}
                  className="bg-transparent text-xs text-[#1A1A1A] hover:text-[#AF9164] font-semibold uppercase tracking-[0.2em] border-b border-[#1A1A1A]/30 hover:border-[#AF9164] pb-1 transition-all"
                >
                  Explorar todos os bairros
                </button>
              </div>

            </div>
          </section>
        );

      case 'module-about':
        return (
          <section key={module.id} className="max-w-7xl mx-auto px-6 py-24" id="section-about">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Graphic Composition */}
              <div className="relative h-[550px] bg-neutral-100 border border-[#AF9164]/20 p-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#AF9164]/5 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" 
                  alt="Beautiful architectural office" 
                  className="w-full h-full object-cover opacity-90 shadow-2xl"
                />
                
                {/* floating badge badge */}
                <div className="absolute bottom-12 -left-6 z-20 bg-[#111111] text-[#E5D5C0] border border-[#AF9164]/30 p-6 max-w-xs hidden md:block">
                  <h5 className="font-serif text-lg tracking-wide">Compromisso Ético</h5>
                  <p className="text-[10px] text-[#FAF9F5]/60 mt-2 lowercase font-light uppercase tracking-widest leading-relaxed">
                    Nenhum imóvel ou transação realizada pela Aura é divulgada publicamente na imprensa. Total sigilo contratual assegurado.
                  </p>
                </div>
              </div>

              {/* Text Description */}
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#AF9164] font-semibold block">Nossa Origem</span>
                <h2 className="text-3xl md:text-4xl font-serif text-[#111111] leading-tight font-light">
                  Aura: Alta Governança para Patrimônios Imobiliários
                </h2>
                <div className="w-16 h-[1px] bg-[#AF9164] my-2" />
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-light">
                  Fundada no Rio de Janeiro pelo corretor e conselheiro patrimonial Carlos Albuquerque, a Aura Imóveis de Luxo nasceu da necessidade de um serviço imobiliário altamente consultivo, focado em discrição, avaliação técnica de engenharia e curadoria de arte arquitetônica.
                </p>
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-light">
                  Não somos uma imobiliária de massa. Trabalhamos exclusivamente como <strong>Property Hunters</strong> e assessores sob demanda de um seleto grupo de famílias unifamiliares, grandes investidores nacionais e corporações multinacionais.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#1A1A1A]/5 font-light">
                  <div>
                    <h5 className="text-[#AF9164] font-serif text-xl">+750M</h5>
                    <p className="text-[10px] text-[#1A1A1A]/45 uppercase tracking-widest mt-1">Em transações estruturadas</p>
                  </div>
                  <div>
                    <h5 className="text-[#AF9164] font-serif text-xl">100%</h5>
                    <p className="text-[10px] text-[#1A1A1A]/45 uppercase tracking-widest mt-1">De discrição e absoluto sigilo</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        );

      case 'module-testimonials':
        return (
          <section key={module.id} className="bg-[#111111] text-[#FAF9F5] py-24 border-t border-[#AF9164]/20" id="section-testimonials">
            <div className="max-w-5xl mx-auto px-6 text-center space-y-10">
              <span className="text-xs uppercase tracking-[0.3em] text-[#AF9164] font-medium block">Reconhecimento VIP</span>
              <MessageSquare size={32} className="text-[#AF9164] mx-auto opacity-80" />
              
              <div className="min-h-48 flex items-center justify-center">
                <p className="text-lg md:text-2xl font-serif font-extralight tracking-wide leading-relaxed italic max-w-3xl text-[#E5D5C0]">
                  "A contratação da assessoria privada da Aura foi crucial para a aquisição da nossa cobertura no Leblon. O sigilo comercial absoluto e a análise de Retrofit apresentada justificaram cada centavo do investimento. Uma governança impecável."
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs uppercase tracking-widest font-semibold text-white">Conselheiro Sócio Majoritário</h5>
                <p className="text-[10px] text-[#AF9164] tracking-widest uppercase font-light">Fundo Financeiro de Arbitragem - SP / RJ</p>
              </div>
            </div>
          </section>
        );

      case 'module-blog':
        const highlightArticles = blogPosts.slice(0, 3);
        if (highlightArticles.length === 0) return null;
        return (
          <section key={module.id} className="max-w-7xl mx-auto px-6 py-24" id="section-blog">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.25em] text-[#AF9164] font-semibold block">Editorial de Luxo</span>
                <h2 className="text-3xl font-serif font-light text-[#111111] tracking-wide">Tendências & Arquitetura</h2>
              </div>
              <button
                onClick={() => onNavigate('blog')}
                className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 hover:text-[#AF9164] transition-all"
              >
                Visitar editorial do blog <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlightArticles.map(post => (
                <article 
                  key={post.id}
                  onClick={() => onNavigate('blog-post', { id: post.id })}
                  className="cursor-pointer group space-y-4 bg-white p-4 border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden bg-neutral-900">
                    <img 
                      src={post.imagem_destacada} 
                      alt={post.titulo}
                      className="w-full h-full object-cover opacity-95 group-hover:scale-102 group-hover:opacity-100 transition-all duration-75"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#AF9164] uppercase tracking-widest font-bold">
                      {post.categoria}
                    </span>
                    <h3 className="text-base font-serif text-[#111111] group-hover:text-[#AF9164] transition-colors leading-snug line-clamp-2">
                      {post.titulo}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/50 line-clamp-2 leading-relaxed">
                      {post.conteudo}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case 'module-cta':
        return (
          <section key={module.id} className="max-w-7xl mx-auto px-6 mb-24" id="section-cta">
            <div className="bg-[#FAF9F5] border border-[#AF9164]/30 grid grid-cols-1 lg:grid-cols-12 rounded-none shadow-xl overflow-hidden">
              
              {/* Left Column Statement */}
              <div className="lg:col-span-5 bg-[#111111] text-[#FAF9F5] p-12 flex flex-col justify-between space-y-12">
                <div className="space-y-6">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#AF9164] font-semibold block">Assessoria Direta</span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white font-light leading-tight">
                    Busca Imobiliária Sob Encomenda VIP
                  </h3>
                  <p className="text-xs text-[#E5D5C0]/75 leading-relaxed font-light">
                    Informe suas diretrizes específicas de orçamento, metragem ou localização confidencial. Nossa equipe de analistas executivos realizará uma varredura fora de mercado (off-market) para encontrar a propriedade ideal para sua família.
                  </p>
                </div>

                <div className="space-y-3 text-[11px] text-[#FAF9F5]/50 tracking-wider uppercase font-light">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#AF9164] rounded-full" /> Total sigilo de dados (LGPD)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#AF9164] rounded-full" /> Confidencialidade comercial blindada
                  </p>
                </div>
              </div>

              {/* Right Column Form Registration */}
              <div className="lg:col-span-7 p-12 bg-white">
                <h4 className="text-xs uppercase tracking-widest text-[#AF9164] font-semibold mb-8">Solicitar Atendimento Exclusivo</h4>
                
                {ctaSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-12 h-12 bg-[#AF9164]/10 rounded-full flex items-center justify-center text-[#AF9164]">
                      <Send size={20} />
                    </div>
                    <h5 className="font-serif text-lg text-[#111111]">Solicitação Recebida com Sucesso</h5>
                    <p className="text-xs text-[#1A1A1A]/60 max-w-sm leading-relaxed font-light">
                      Agradecemos seu contato de prestígio. Um dos nossos consultores patrimoniais seniores entrará em contato de forma estritamente privada nas próximas horas.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCtaSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={ctaName}
                          onChange={(e) => setCtaName(e.target.value)}
                          placeholder="Carlos Albuquerque"
                          className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-4 focus:outline-none focus:border-[#AF9164] rounded-none font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold">E-mail Corporativo</label>
                        <input
                          type="email"
                          required
                          value={ctaEmail}
                          onChange={(e) => setCtaEmail(e.target.value)}
                          placeholder="carlos@albuquerque.com"
                          className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-4 focus:outline-none focus:border-[#AF9164] rounded-none font-light"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold">Telefone / WhatsApp</label>
                        <input
                          type="tel"
                          required
                          value={ctaPhone}
                          onChange={(e) => setCtaPhone(e.target.value)}
                          placeholder="(21) 98888-7711"
                          className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-4 focus:outline-none focus:border-[#AF9164] rounded-none font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold">Especifique sua Busca (Opcional)</label>
                        <input
                          type="text"
                          value={ctaMessage}
                          onChange={(e) => setCtaMessage(e.target.value)}
                          placeholder="Ex: Cobertura de frente para o mar no Leblon"
                          className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-4 focus:outline-none focus:border-[#AF9164] rounded-none font-light"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={ctaLoading}
                        className="w-full bg-[#AF9164] hover:bg-[#111111] text-white py-3.5 text-xs font-bold uppercase tracking-[0.25em] transition-all rounded-none"
                      >
                        {ctaLoading ? 'AGUARDE...' : 'CONECTAR ASSESSORIA VIP'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div id="home-view-root">
      {/* Dynamic Render in Sort Sequence */}
      {homeModules.map((module) => renderModule(module))}
    </div>
  );
}
