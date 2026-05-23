import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Maximize2, Sparkles, Send, CheckCircle, Info, Phone, Calendar, Compass, Layers, Tv, Video } from 'lucide-react';
import { Property, Lead, Neighborhood } from '../types';
import { api, trackEvent } from '../api';

interface PropertyViewProps {
  propertyId: string;
  onNavigate: (page: string, params?: any) => void;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'criado_em' | 'status'>) => Promise<boolean>;
  allProperties: Property[];
  neighborhoods: Neighborhood[];
}

export default function PropertyView({
  propertyId,
  onNavigate,
  onSubmitLead,
  allProperties,
  neighborhoods
}: PropertyViewProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'fotos' | 'video' | 'planta' | 'tour'>('fotos');
  const [error, setError] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Load single property
  useEffect(() => {
    // Scroll top
    window.scrollTo(0, 0);
    
    const propVal = allProperties.find(p => p.id === propertyId || p.slug === propertyId);
    if (!propVal) {
      setError('A propriedade de luxo solicitada não foi localizada.');
    } else {
      setProperty(propVal);
      setActiveMediaIndex(0);
      setActiveTab('fotos');
      setError('');

      // Track property view and trigger server views counter update
      api.trackPropView(propVal.id);
      trackEvent('property_view', `/imovel/${propVal.slug}`, `Viewed ${propVal.titulo}`, { imovel_id: propVal.id });
    }
  }, [propertyId, allProperties]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4 font-light">
        <h3 className="font-serif text-xl text-[#111111]">{error}</h3>
        <p className="text-xs text-[#1A1A1A]/50">Ela pode ter sido vendida sob sigilo ou desativada pelo administrador.</p>
        <button 
          onClick={() => onNavigate('results')}
          className="bg-[#111111] text-white py-2.5 px-6 text-xs uppercase tracking-widest font-semibold"
        >
          Voltar ao Portfólio
        </button>
      </div>
    );
  }

  if (!property) return null;

  const handleWhatsappAction = () => {
    // Record WhatsApp telemetry
    api.trackPropWhatsapp(property.id);
    trackEvent('whatsapp_click', `/imovel/${property.slug}`, `WhatsApp Interest: ${property.titulo}`, { imovel_id: property.id });

    // Open Link securely in a new context
    const messageText = `Olá, gostaria de receber maiores informações off-market sobre o imóvel: ${property.titulo} (${property.bairro}) no valor de R$ ${property.valor.toLocaleString('pt', { minimumFractionDigits: 0 })}.`;
    const encoded = encodeURIComponent(messageText);
    const link = `https://api.whatsapp.com/send?phone=5521988887711&text=${encoded}`;
    window.open(link, '_blank');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone) return;

    setFormLoading(true);
    const success = await onSubmitLead({
      nome,
      email,
      telefone,
      mensagem: mensagem || `Fiquei interessado na residência: ${property.titulo}. Solicito atendimento privado.`,
      imovel_id: property.id,
      imovel_titulo: property.titulo,
      origem: `Formulário Contato Imóvel: ${property.titulo}`
    });
    setFormLoading(false);

    if (success) {
      setFormSuccess(true);
      setNome('');
      setEmail('');
      setTelefone('');
      setMensagem('');
      setTimeout(() => setFormSuccess(false), 5000);
    }
  };

  // Curate Related Opportunities
  const relatedProperties = allProperties
    .filter(p => p.status === 'ativo' && p.id !== property.id && (p.tipo === property.tipo || p.bairro === property.bairro))
    .slice(0, 3);

  // Link Neighborhood guides
  const matchingNeighborhood = neighborhoods.find(n => n.nome.toLowerCase() === property.bairro.toLowerCase());

  return (
    <div id={`property-view-${property.id}`} className="min-h-screen pb-24">
      {/* Upper Navigation thread */}
      <div className="bg-white border-b border-[#1A1A1A]/5 py-4 px-6 text-xs text-[#1A1A1A]/40 uppercase tracking-widest">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={() => onNavigate('home')} className="hover:text-[#AF9164]">Início</button>
          <span>/</span>
          <button onClick={() => onNavigate('results')} className="hover:text-[#AF9164]">Portfólio</button>
          <span>/</span>
          <span className="text-[#1A1A1A]/75 normal-case font-light truncate max-w-sm whitespace-nowrap">
            {property.titulo}
          </span>
        </div>
      </div>

      {/* Media Center Deck */}
      <section className="bg-zinc-950 text-white min-h-[500px]" id="property-media-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Main Viewer (Left side) */}
          <div className="lg:col-span-8 relative aspect-video bg-neutral-900 flex flex-col justify-between">
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-6 z-10 flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-[#E5D5C0]">
                {property.tipo} • {property.bairro}
              </span>
              <span className="text-xs font-light text-white/60">
                {activeMediaIndex + 1} de {property.midia.length} fotos
              </span>
            </div>

            {/* Render tab state elements */}
            <div className="w-full h-full">
              {activeTab === 'fotos' && (
                <div className="w-full h-full relative group">
                  <img 
                    src={property.midia[activeMediaIndex] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                    alt={`Foto ${activeMediaIndex + 1}`}
                    className="w-full h-full object-cover select-none animate-fade-in"
                  />
                  {/* Prev/Next arrows on hover */}
                  <button 
                    onClick={() => setActiveMediaIndex(prev => prev === 0 ? property.midia.length-1 : prev-1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-[#AF9164] transition-colors rounded-none focus:outline-none"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setActiveMediaIndex(prev => (prev + 1) % property.midia.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-[#AF9164] transition-colors rounded-none focus:outline-none"
                    aria-label="Próximo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="w-full h-full">
                  {property.video ? (
                    <iframe 
                      src={property.video} 
                      title="Vídeo do Imóvel"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                      <Tv size={48} className="mb-2 text-[#AF9164]" />
                      Vídeo exclusivo indisponível para esta unidade.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'planta' && (
                <div className="w-full h-full p-8 flex items-center justify-center bg-zinc-900 border border-white/5">
                  {property.planta ? (
                    <img 
                      src={property.planta} 
                      alt="Planta Arquitetônica"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                      <Compass size={48} className="mb-2 text-[#AF9164]" />
                      Planta baixa sob demanda com nossos consultores de engenharia.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tour' && (
                <div className="w-full h-full bg-zinc-900">
                  {property.tour_virtual ? (
                    <iframe 
                      src={property.tour_virtual} 
                      title="Matterport Realidade Virtual Cobertura"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                      <Layers size={48} className="mb-2 text-[#AF9164]" />
                      Realidade Virtual 3D indisponível. Solicite áudio-conferência guiada.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Controls tabs column & small gallery (Right side) */}
          <div className="lg:col-span-4 bg-[#141414] p-6 flex flex-col justify-between border-l border-white/5">
            <div className="space-y-6">
              {/* Tabs list togglers */}
              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FAF9F5]/60">
                <button 
                  onClick={() => setActiveTab('fotos')}
                  className={`py-2 text-center border transition-colors ${activeTab === 'fotos' ? 'border-[#AF9164] text-[#E5D5C0] font-bold bg-[#1A1A1A]' : 'border-white/10 hover:border-white/20'}`}
                >
                  Fotos
                </button>
                <button 
                  onClick={() => setActiveTab('video')}
                  className={`py-2 text-center border transition-colors ${activeTab === 'video' ? 'border-[#AF9164] text-[#E5D5C0] bg-[#1A1A1A]' : 'border-white/10 hover:hover:border-white/20'}`}
                >
                  Filme
                </button>
                <button 
                  onClick={() => setActiveTab('planta')}
                  className={`py-2 text-center border transition-colors relative ${activeTab === 'planta' ? 'border-[#AF9164] text-[#E5D5C0] bg-[#1A1A1A]' : 'border-white/10 hover:border-white/20'}`}
                >
                  Planta
                  {property.planta && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#AF9164] rounded-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('tour')}
                  className={`py-2 text-center border transition-colors relative ${activeTab === 'tour' ? 'border-[#AF9164] text-[#E5D5C0] bg-[#1A1A1A]' : 'border-white/10 hover:border-white/20'}`}
                >
                  3D Tour
                  {property.tour_virtual && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#AF9164] rounded-full" />}
                </button>
              </div>

              {/* Photos miniature gallery preview */}
              <div className="space-y-3">
                <h5 className="text-[9px] uppercase tracking-widest text-[#FAF9F5]/45 font-bold">Miniaturas da Galeria</h5>
                <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1">
                  {property.midia.map((m, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { setActiveTab('fotos'); setActiveMediaIndex(idx); }}
                      className={`cursor-pointer aspect-square bg-[#1A1A1A] border overflow-hidden ${activeMediaIndex === idx && activeTab === 'fotos' ? 'border-[#AF9164] scale-98' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={m} alt={`Mini ${idx+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing segment */}
            <div className="pt-8 border-t border-white/5 space-y-2">
              <span className="text-[9px] text-[#FAF9F5]/40 uppercase tracking-widest">Valor do Patrimônio</span>
              <div className="text-2xl font-serif text-[#E5D5C0] font-normal">
                R$ {property.valor.toLocaleString('pt-BR')}
                {property.finalidade === 'alugar' && <span className="text-xs text-white/40"> / mês locação</span>}
              </div>
              <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-wider font-light">
                <span>Condomínio: R$ {property.condominio.toLocaleString('pt-BR')}</span>
                <span>IPTU Anual: R$ {property.iptu.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core details workspace */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Descriptive details (Left side) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Main Title Headers */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#AF9164]/10 text-[#AF9164] border border-[#AF9164]/30 text-[9px] uppercase tracking-widest font-semibold py-1 px-3">
                {property.finalidade === 'comprar' ? 'À Venda' : 'Locação Exclusiva'}
              </span>
              {property.exclusivo && (
                <span className="bg-[#111111] text-[#E5D5C0] text-[9px] uppercase tracking-widest font-normal py-1 px-3">
                  Exclusividade Certificada
                </span>
              )}
              {property.imovel_para_reforma && (
                <span className="bg-red-950 text-red-200 border border-red-800 text-[9px] uppercase tracking-widest font-bold py-1 px-2.5">
                  Estudo de Retrofit Viável
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-serif text-[#111111] leading-tight font-light col-span">
              {property.titulo}
            </h1>

            <div className="flex items-center text-xs text-[#1A1A1A]/60 font-light gap-2">
              <MapPin size={14} className="text-[#AF9164]" />
              <span>{property.bairro}, {property.cidade} — {property.estado}</span>
            </div>
          </div>

          {/* Bento Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 border border-[#1A1A1A]/5 shadow-sm text-center">
            <div className="space-y-1">
              <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest block font-bold">Área Útil</span>
              <span className="font-serif text-lg text-[#111111]">{property.metragem} m²</span>
            </div>
            <div className="space-y-1 border-l border-[#1A1A1A]/10">
              <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest block font-bold">Quartos</span>
              <span className="font-serif text-lg text-[#111111]">{property.quartos} Dorms</span>
            </div>
            <div className="space-y-1 border-l border-[#1A1A1A]/10">
              <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest block font-bold">Suítes</span>
              <span className="font-serif text-lg text-[#111111] text-[#AF9164]">{property.suites} Suítes</span>
            </div>
            <div className="space-y-1 border-l border-[#1A1A1A]/10">
              <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest block font-bold">Vagas Livres</span>
              <span className="font-serif text-lg text-[#111111]">{property.vagas} Veículos</span>
            </div>
          </div>

          {/* Literary Description */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#AF9164] border-b border-[#AF9164]/20 pb-2">
              Sobre a Residência
            </h4>
            <div className="text-xs md:text-sm text-[#1A1A1A]/80 leading-relaxed font-light whitespace-pre-line space-y-4">
              {property.descricao}
            </div>
          </div>

          {/* Specifications list (Bigger specs) */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#AF9164] border-b border-[#AF9164]/20 pb-2">
              Infraestrutura & Comodidades
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.caracteristicas.map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-[#1A1A1A]/70 font-light bg-white p-3 border border-[#1A1A1A]/5 rounded-none shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#AF9164] shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Differentials and architectural authorship */}
          {property.diferenciais && property.diferenciais.length > 0 && (
            <div className="bg-[#FAF9F5] border border-[#AF9164]/30 p-8 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#AF9164] font-semibold flex items-center gap-2">
                <Sparkles size={14} /> Atributos de Valor e Autoria
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.diferenciais.map((d, i) => (
                  <p key={i} className="text-xs text-[#1A1A1A]/75 leading-relaxed font-light flex items-start gap-1">
                    <span className="text-[#AF9164] font-bold mr-1">•</span>
                    {d}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Neighborhood profile */}
          {matchingNeighborhood && (
            <div className="border border-[#1A1A1A]/5 p-8 space-y-6 bg-white shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-[#AF9164] font-semibold block">Perfil de Localização</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 h-36 overflow-hidden bg-neutral-900 border border-[#1A1A1A]/5">
                  <img src={matchingNeighborhood.fotos[0]} alt={matchingNeighborhood.nome} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-serif text-lg text-[#111111]">{matchingNeighborhood.nome}</h4>
                  <p className="text-xs text-[#1A1A1A]/50 font-light leading-relaxed line-clamp-3">
                    {matchingNeighborhood.descricao}
                  </p>
                  <button 
                    onClick={() => onNavigate('neighborhood', { id: matchingNeighborhood.id })}
                    className="text-[10px] uppercase tracking-wider text-[#AF9164] font-semibold hover:underline"
                  >
                    Ler guia de estilo do bairro &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Lead registration Contact card (Right side) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-28 bg-white border border-[#AF9164]/30 p-8 shadow-md">
            <h3 className="font-serif text-lg font-light text-[#111111] mb-2">Manifestar Interesse</h3>
            <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest mb-6 leading-relaxed">
              Residência exclusiva: marque um atendimento privado.
            </p>

            {formSuccess ? (
              <div className="text-center space-y-4 py-8 animate-fade-in">
                <div className="w-12 h-12 bg-[#AF9164]/10 rounded-full flex items-center justify-center text-[#AF9164] mx-auto">
                  <CheckCircle size={24} />
                </div>
                <h5 className="font-serif text-base text-[#111111]">Solicitação Acolhida</h5>
                <p className="text-xs text-[#1A1A1A]/50 font-light leading-relaxed max-w-xs mx-auto">
                  Seus dados foram salvos criptografadamente em nosso dossiê confidencial. Nosso consultor responsável do ramo de alto padrão agendará o contato telefônico prioritário.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="E.g. Carlos de Albuquerque"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g. consultoria@albuquerque.com"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="E.g. (21) 98888-7711"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">Instruções de Agendamento</label>
                  <textarea
                    rows={3}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Quero agendar uma visita reservada nesta próxima semana."
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164] resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-[#111111] hover:bg-[#AF9164] text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-none mt-2"
                >
                  {formLoading ? 'SALVANDO SOLICITAÇÃO...' : 'ENVIAR CADASTRO VIP'}
                </button>
              </form>
            )}

            {/* Instand Whatsapp click route */}
            <div className="pt-6 border-t border-[#1A1A1A]/10 mt-6 space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 block font-bold text-center">Atendimento Emergência</span>
              <button 
                onClick={handleWhatsappAction}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-3.5 font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
              >
                <Phone size={14} /> Contato WhatsApp Imediato
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* Relacionados (Related Listings Carousel) */}
      {relatedProperties.length > 0 && (
        <section className="bg-[#FAF9F5] py-24 border-t border-[#1A1A1A]/5 mt-16">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="font-serif text-2xl text-[#111111] font-light mb-12">Outras Oportunidades Selecionadas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProperties.map(prop => (
                <div 
                  key={prop.id}
                  onClick={() => onNavigate('property', { id: prop.id })}
                  className="bg-white border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 cursor-pointer group transition-all duration-300 shadow-sm"
                >
                  <img src={prop.midia[0]} alt={prop.titulo} className="h-56 w-full object-cover" />
                  <div className="p-6 space-y-3">
                    <span className="text-[9px] text-[#AF9164] uppercase tracking-widest font-bold">
                      {prop.bairro}, RJ
                    </span>
                    <h4 className="text-sm font-serif text-[#111111] group-hover:text-[#AF9164] transition-colors line-clamp-1">
                      {prop.titulo}
                    </h4>
                    <span className="text-xs font-semibold text-[#1A1A1A] block">
                      R$ {prop.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
