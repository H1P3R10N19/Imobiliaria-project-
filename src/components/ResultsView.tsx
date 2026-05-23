import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, MapPin, Grid, List, ChevronRight, X, Phone, Heart } from 'lucide-react';
import { Property } from '../types';
import { trackEvent } from '../api';

interface ResultsViewProps {
  properties: Property[];
  initialFilters: any;
  onNavigate: (page: string, params?: any) => void;
}

export default function ResultsView({ properties, initialFilters, onNavigate }: ResultsViewProps) {
  // Filters State
  const [finalidade, setFinalidade] = useState<'comprar' | 'alugar' | ''>(initialFilters?.finalidade || '');
  const [categoria, setCategoria] = useState<'cidade' | 'campo' | ''>(initialFilters?.categoria || '');
  const [bairro, setBairro] = useState<string>(initialFilters?.bairro || '');
  const [tipo, setTipo] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [minQuartos, setMinQuartos] = useState<string>('');
  const [minSuites, setMinSuites] = useState<string>('');
  const [reforma, setReforma] = useState<boolean>(initialFilters?.imovel_para_reforma || false);
  const [exclusivo, setExclusivo] = useState<boolean>(false);
  const [destaque, setDestaque] = useState<boolean>(initialFilters?.destaque || false);

  // Layout & Sorting
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('recentes');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync initial filters
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.finalidade !== undefined) setFinalidade(initialFilters.finalidade);
      if (initialFilters.categoria !== undefined) setCategoria(initialFilters.categoria);
      if (initialFilters.bairro !== undefined) setBairro(initialFilters.bairro);
      if (initialFilters.imovel_para_reforma !== undefined) setReforma(initialFilters.imovel_para_reforma);
      if (initialFilters.destaque !== undefined) setDestaque(initialFilters.destaque);
    }
  }, [initialFilters]);

  // Distinct Options for Dropdowns
  const distinctBairros = Array.from(new Set(properties.map(p => p.bairro))).sort();
  const distinctTipos = Array.from(new Set(properties.map(p => p.tipo))).sort();

  // Reset Filters
  const resetFilters = () => {
    setFinalidade('');
    setCategoria('');
    setBairro('');
    setTipo('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMinQuartos('');
    setMinSuites('');
    setReforma(false);
    setExclusivo(false);
    setDestaque(false);
    trackEvent('page_view', '/properties', 'Reset Filters');
  };

  // Perform Filtering
  const filteredProperties = properties.filter(p => {
    if (p.status !== 'ativo') return false;
    
    // Purpose filter
    if (finalidade && p.finalidade !== finalidade) return false;
    
    // Category filter
    if (categoria && p.categoria !== categoria) return false;
    
    // Neighborhood filter
    if (bairro && p.bairro.toLowerCase() !== bairro.toLowerCase()) return false;
    
    // Type filter
    if (tipo && p.tipo !== tipo) return false;
    
    // Price Minimum filter
    if (minPrice && p.valor < parseInt(minPrice)) return false;
    
    // Price Maximum filter
    if (maxPrice && p.valor > parseInt(maxPrice)) return false;
    
    // Area filter
    if (minArea && p.metragem < parseInt(minArea)) return false;
    
    // Rooms filter
    if (minQuartos && p.quartos < parseInt(minQuartos)) return false;
    
    // Suites filter
    if (minSuites && p.suites < parseInt(minSuites)) return false;
    
    // Reform Opportunity filter
    if (reforma && !p.imovel_para_reforma) return false;
    
    // Exclusive filter
    if (exclusivo && !p.exclusivo) return false;

    // Highlight filter
    if (destaque && !p.destaque) return false;

    return true;
  });

  // Sorting Handler
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'preco-crescente':
        return a.valor - b.valor;
      case 'preco-decrescente':
        return b.valor - a.valor;
      case 'area-decrescente':
        return b.metragem - a.metragem;
      case 'recentes':
      default:
        // sort by newest
        return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
    }
  });

  // Track search results loading
  useEffect(() => {
    trackEvent('page_view', '/properties', `Results Rendered: ${sortedProperties.length} matches`);
  }, [finalidade, categoria, bairro, tipo, minPrice, maxPrice, reforma, exclusivo, destaque]);

  return (
    <div id="results-view-root" className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Title Header */}
      <div className="mb-12 space-y-2 border-b border-[#1A1A1A]/5 pb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#AF9164] font-medium">Portfólio Tuanny Magalhães</span>
        <h1 className="text-3xl font-serif font-light text-[#111111]">Encontre sua Residência Ideal</h1>
        <p className="text-xs text-[#1A1A1A]/50 font-light uppercase tracking-wider">
          Exibindo {sortedProperties.length} {sortedProperties.length === 1 ? 'imóvel selecionado' : 'imóveis selecionados'} de alto padrão
        </p>
      </div>

      {/* Control Utility bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-[#1A1A1A]/5 mb-8 text-xs">
        {/* Toggle device filters */}
        <button 
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden bg-[#111111] text-white py-2 px-4 flex items-center gap-2 tracking-wider uppercase font-semibold"
        >
          <SlidersHorizontal size={14} /> Filtros
        </button>

        {/* Desktop inline tags helper */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-wider">
          <span className="text-[#1A1A1A]/40 font-bold block">Filtros Ativos:</span>
          {finalidade && <span className="bg-[#FAF9F5] border border-[#AF9164]/30 py-1 px-2 text-[#AF9164]">{finalidade === 'comprar' ? 'Comprar' : 'Alugar'}</span>}
          {categoria && <span className="bg-[#FAF9F5] border border-[#AF9164]/30 py-1 px-2 text-[#AF9164]">{categoria === 'cidade' ? 'Cidade' : 'Campo'}</span>}
          {bairro && <span className="bg-[#FAF9F5] border border-[#AF9164]/30 py-1 px-2 text-[#AF9164]">{bairro}</span>}
          {reforma && <span className="bg-[#FAF9F5] border border-[#AF9164]/30 py-1 px-2 text-[#AF9164]">Retrofit</span>}
          {exclusivo && <span className="bg-[#FAF9F5] border border-[#AF9164]/30 py-1 px-2 text-[#AF9164]">Exclusivo</span>}
          {destaque && <span className="bg-[#FAF9F5] border border-[#AF9164]/30 py-1 px-2 text-[#AF9164]">Destaque</span>}
          {(!finalidade && !categoria && !bairro && !reforma && !exclusivo && !destaque) && (
            <span className="text-[#1A1A1A]/45">Nenhum filtro específico aplicado</span>
          )}
        </div>

        {/* Sort select & mode */}
        <div className="flex items-center space-x-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-[#1A1A1A]/50">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-[#1A1A1A]/10 py-1.5 px-3 uppercase tracking-wider text-[11px] focus:outline-none focus:border-[#AF9164]"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="preco-crescente">Menor Preço</option>
              <option value="preco-decrescente">Maior Preço</option>
              <option value="area-decrescente">Maior Metragem</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-1 border-l border-[#1A1A1A]/5 pl-4">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'text-[#AF9164] bg-[#FAF9F5]' : 'text-[#1A1A1A]/40'}`}
              aria-label="Grade"
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'text-[#AF9164] bg-[#FAF9F5]' : 'text-[#1A1A1A]/40'}`}
              aria-label="Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* =============== DESKTOP FILTERS COLLAPSE =============== */}
        <aside className="hidden lg:block space-y-8 bg-white p-6 border border-[#1A1A1A]/5 self-start">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/5 pb-4">
            <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#111111] flex items-center gap-2">
              <Filter size={14} /> Filtros Avançados
            </h3>
            <button 
              onClick={resetFilters}
              className="text-[10px] text-red-700 hover:text-red-900 font-bold uppercase tracking-wider"
            >
              Limpar Tudo
            </button>
          </div>

          {/* Purpose Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Finalidade</h4>
            <div className="flex bg-[#FAF9F5] p-1 border border-[#1A1A1A]/10">
              <button
                onClick={() => setFinalidade(finalidade === 'comprar' ? '' : 'comprar')}
                className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${finalidade === 'comprar' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
              >
                Comprar
              </button>
              <button
                onClick={() => setFinalidade(finalidade === 'alugar' ? '' : 'alugar')}
                className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${finalidade === 'alugar' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
              >
                Alugar
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Ambiente</h4>
            <div className="flex bg-[#FAF9F5] p-1 border border-[#1A1A1A]/10">
              <button
                onClick={() => setCategoria(categoria === 'cidade' ? '' : 'cidade')}
                className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${categoria === 'cidade' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
              >
                Cidade
              </button>
              <button
                onClick={() => setCategoria(categoria === 'campo' ? '' : 'campo')}
                className={`flex-1 text-center py-2 text-[11px] uppercase tracking-wider font-semibold transition-all ${categoria === 'campo' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
              >
                Campo
              </button>
            </div>
          </div>

          {/* Neighborhood Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Bairro</h4>
            <select
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2 px-3 uppercase tracking-wider focus:outline-none focus:border-[#AF9164]"
            >
              <option value="">Qualquer Bairro</option>
              {distinctBairros.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Tipo do Imóvel</h4>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2 px-3 focus:outline-none focus:border-[#AF9164]"
            >
              <option value="">Todos</option>
              {distinctTipos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Valores (R$)</h4>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Valor Mínimo"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2 px-3 focus:outline-none focus:border-[#AF9164] font-light"
              />
              <input
                type="number"
                placeholder="Valor Máximo"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2 px-3 focus:outline-none focus:border-[#AF9164] font-light"
              />
            </div>
          </div>

          {/* Metragem Mínima */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Metragem Mínima</h4>
            <input
              type="number"
              placeholder="Ex: 250m²"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2 px-3 focus:outline-none focus:border-[#AF9164] font-light"
            />
          </div>

          {/* Suites Mínimas */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AF9164]">Mínimo de Suítes</h4>
            <select
              value={minSuites}
              onChange={(e) => setMinSuites(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-2 px-3 focus:outline-none"
            >
              <option value="">Qualquer</option>
              <option value="1">1+ Suíte</option>
              <option value="2">2+ Suítes</option>
              <option value="3">3+ Suítes</option>
              <option value="4">4+ Suítes</option>
              <option value="5">5+ Suítes</option>
            </select>
          </div>

          {/* Checkboxes parameters */}
          <div className="pt-4 border-t border-[#1A1A1A]/5 space-y-3 font-light">
            <label className="flex items-center gap-3 text-xs text-[#1A1A1A]/70 cursor-pointer">
              <input
                type="checkbox"
                checked={reforma}
                onChange={() => setReforma(!reforma)}
                className="text-[#AF9164] focus:ring-[#AF9164] border-gray-300 w-4 h-4 rounded-none"
              />
              <span>Retrofit / Imóvel para Reforma</span>
            </label>

            <label className="flex items-center gap-3 text-xs text-[#1A1A1A]/70 cursor-pointer">
              <input
                type="checkbox"
                checked={exclusivo}
                onChange={() => setExclusivo(!exclusivo)}
                className="text-[#AF9164] focus:ring-[#AF9164] border-gray-300 w-4 h-4 rounded-none"
              />
              <span>Exclusividade Tuanny Magalhães</span>
            </label>

            <label className="flex items-center gap-3 text-xs text-[#1A1A1A]/70 cursor-pointer">
              <input
                type="checkbox"
                checked={destaque}
                onChange={() => setDestaque(!destaque)}
                className="text-[#AF9164] focus:ring-[#AF9164] border-gray-300 w-4 h-4 rounded-none"
              />
              <span>Imóveis em Destaque</span>
            </label>
          </div>
        </aside>

        {/* =============== MAIN LISTINGS SECTION =============== */}
        <section className="lg:col-span-3">
          {sortedProperties.length === 0 ? (
            <div className="bg-white border border-[#1A1A1A]/5 p-16 text-center space-y-4">
              <h3 className="font-serif text-lg text-[#111111]">Nenhuma residência corresponde aos filtros</h3>
              <p className="text-xs text-[#1A1A1A]/50 max-w-sm mx-auto font-light leading-relaxed">
                Nossa curadoria é extremamente rigorosa e focada apenas no topo do alto padrão. Selecione outros bairros ou remova alguns termos de pesquisa.
              </p>
              <button 
                onClick={resetFilters}
                className="bg-[#111111] text-white hover:bg-[#AF9164] py-2 px-6 text-[10px] uppercase tracking-widest font-bold transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedProperties.map(prop => (
                <div 
                  key={prop.id}
                  onClick={() => onNavigate('property', { id: prop.id })}
                  className="bg-white border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 cursor-pointer group transition-all duration-500 overflow-hidden shadow-sm flex flex-col justify-between"
                  id={`grid-prop-${prop.id}`}
                >
                  <div className="relative h-64 overflow-hidden bg-zinc-900 shrink-0">
                    {prop.exclusivo && (
                      <span className="absolute top-4 left-4 z-20 bg-[#111111] text-[#E5D5C0] text-[8px] uppercase tracking-widest font-normal py-1 px-2.5">
                        Exclusividade Tuanny Magalhães
                      </span>
                    )}
                    {prop.imovel_para_reforma && (
                      <span className="absolute top-4 right-4 z-20 bg-[#AF9164] text-white text-[8px] uppercase tracking-widest font-semibold px-2 py-1">
                        Retrofit Oportunidade
                      </span>
                    )}
                    <img 
                      src={prop.midia[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                      alt={prop.titulo}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-103 opacity-90 group-hover:opacity-100"
                    />
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-[10px] text-[#AF9164] uppercase tracking-wider font-semibold gap-1">
                        <MapPin size={10} />
                        {prop.bairro}, {prop.cidade}
                      </div>
                      <h3 className="text-base font-serif tracking-normal text-[#111111] group-hover:text-[#AF9164] transition-colors line-clamp-1">
                        {prop.titulo}
                      </h3>
                      <p className="text-xs text-[#1A1A1A]/50 line-clamp-2 leading-relaxed font-light">
                        {prop.descricao}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="border-t border-[#1A1A1A]/5 pt-4 flex justify-between items-center text-[10px] text-[#1A1A1A]/55 tracking-wider uppercase font-light">
                        <span>{prop.metragem}m²</span>
                        <span>•</span>
                        <span>{prop.suites} Suítes</span>
                        <span>•</span>
                        <span>{prop.vagas} Vagas</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-[#111111]">
                          R$ {prop.valor.toLocaleString('pt-BR')}
                          {prop.finalidade === 'alugar' && <span className="text-[10px] text-[#1A1A1A]/50 font-normal"> /mês</span>}
                        </span>
                        <span className="text-[10px] uppercase text-[#AF9164] font-semibold tracking-widest group-hover:underline flex items-center gap-1">
                          Ver Imóvel <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW mode */
            <div className="space-y-6">
              {sortedProperties.map(prop => (
                <div 
                  key={prop.id}
                  onClick={() => onNavigate('property', { id: prop.id })}
                  className="bg-white border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 cursor-pointer group transition-all duration-300 flex flex-col md:flex-row overflow-hidden shadow-sm"
                  id={`list-prop-${prop.id}`}
                >
                  <div className="relative md:w-1/3 h-56 md:h-auto overflow-hidden bg-zinc-900 shrink-0">
                    <img 
                      src={prop.midia[0]} 
                      alt={prop.titulo}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102"
                    />
                  </div>
                  <div className="p-8 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-[9px] text-[#AF9164] uppercase tracking-wider font-semibold gap-1">
                        <MapPin size={10} />
                        {prop.bairro}, {prop.cidade}
                      </div>
                      <h3 className="text-lg font-serif text-[#111111] group-hover:text-[#AF9164] transition-colors">
                        {prop.titulo}
                      </h3>
                      <p className="text-xs text-[#1A1A1A]/50 leading-relaxed font-light line-clamp-2">
                        {prop.descricao}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-t border-[#1A1A1A]/5 pt-4 gap-4">
                      <div className="flex space-x-4 text-[10px] text-[#1A1A1A]/60 tracking-wider">
                        <span>{prop.metragem}m²</span>
                        <span>•</span>
                        <span>{prop.suites} Suítes</span>
                        <span>•</span>
                        <span>{prop.vagas} Vagas</span>
                      </div>
                      <div className="text-sm font-semibold text-[#111111]">
                        R$ {prop.valor.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* =============== MOBILE FILTER OVERLAY =============== */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end justify-end p-4 lg:hidden" id="mobile-filter-drawer">
          <div className="bg-[#FAF9F5] w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col justify-between border border-[#AF9164]/30 animate-slide-up rounded-none">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
                <h3 className="font-serif text-base tracking-widest uppercase text-[#111111] flex items-center gap-2">
                  <Filter size={16} /> Filtrar Imóveis
                </h3>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="text-[#111111]"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Purpose Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#AF9164]">Finalidade</label>
                <div className="flex bg-[#FAF9F5] p-1 border border-[#1A1A1A]/10">
                  <button
                    onClick={() => { setFinalidade(finalidade === 'comprar' ? '' : 'comprar'); }}
                    className={`flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-semibold transition-all ${finalidade === 'comprar' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
                  >
                    Comprar
                  </button>
                  <button
                    onClick={() => { setFinalidade(finalidade === 'alugar' ? '' : 'alugar'); }}
                    className={`flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-semibold transition-all ${finalidade === 'alugar' ? 'bg-[#111111] text-white' : 'text-[#1A1A1A]/60'}`}
                  >
                    Alugar
                  </button>
                </div>
              </div>

              {/* Neighborhood select */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#AF9164]">Bairro</label>
                <select
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/10 text-xs py-2 px-3 focus:outline-none"
                >
                  <option value="">Todos</option>
                  {distinctBairros.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#AF9164]">Preço</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/10 text-xs py-2 px-3"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/10 text-xs py-2 px-3"
                  />
                </div>
              </div>

              {/* Checkbox fields */}
              <div className="space-y-3 pt-4 border-t border-[#1A1A1A]/10 font-light text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reforma}
                    onChange={() => setReforma(!reforma)}
                    className="text-[#AF9164]"
                  />
                  <span>Retrofit / Oportunidade Reforma</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exclusivo}
                    onChange={() => setExclusivo(!exclusivo)}
                    className="text-[#AF9164]"
                  />
                  <span>Exclusividade Tuanny Magalhães</span>
                </label>
              </div>
            </div>

            <div className="pt-8 flex gap-3">
              <button
                onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                className="flex-1 border border-[#1A1A1A]/20 py-3 uppercase tracking-widest text-[10px] text-center font-bold"
              >
                Limpar
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-[#AF9164] text-white py-3 uppercase tracking-widest text-[10px] text-center font-bold"
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
