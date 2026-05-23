import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Compass, Shield, BookOpen, Utensils, Award, GraduationCap, HeartPulse, Activity } from 'lucide-react';
import { Neighborhood, Property } from '../types';
import { trackEvent } from '../api';

interface NeighborhoodViewProps {
  neighborhoodId: string;
  neighborhoods: Neighborhood[];
  properties: Property[];
  onNavigate: (page: string, params?: any) => void;
}

export default function NeighborhoodView({
  neighborhoodId,
  neighborhoods,
  properties,
  onNavigate
}: NeighborhoodViewProps) {
  const [bairro, setBairro] = useState<Neighborhood | null>(null);
  const [activePhoto, setActivePhoto] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const match = neighborhoods.find(n => n.id === neighborhoodId || n.slug === neighborhoodId);
    if (!match) {
      setError('O guia do bairro correspondente não foi localizado.');
    } else {
      setBairro(match);
      setActivePhoto(match.fotos[0] || '');
      setError('');
      
      // Track analytics neighborhood view
      trackEvent('neighborhood_view', `/bairro/${match.slug}`, `Visited Guide: ${match.nome}`, { bairro_id: match.id });
    }
  }, [neighborhoodId, neighborhoods]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h3 className="font-serif text-xl text-[#111111]">{error}</h3>
        <button onClick={() => onNavigate('neighborhoods')} className="bg-[#111111] text-white py-2 px-6 text-xs uppercase tracking-wider">
          Voltar a Bairros
        </button>
      </div>
    );
  }

  if (!bairro) return null;

  // Find portfolio items located under this neighborhood
  const matchingProperties = properties.filter(p => p.status === 'ativo' && p.bairro.toLowerCase() === bairro.nome.toLowerCase());

  return (
    <div id={`bairro-guide-${bairro.id}`} className="pb-24">
      {/* Back CTA Link */}
      <div className="bg-white border-b border-[#1A1A1A]/5 py-4 px-6 text-xs text-[#1A1A1A]/40 uppercase tracking-widest">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={() => onNavigate('home')} className="hover:text-[#AF9164]">Início</button>
          <span>/</span>
          <button onClick={() => onNavigate('neighborhoods')} className="hover:text-[#AF9164]">Bairros</button>
          <span>/</span>
          <span className="text-[#1A1A1A]/75 normal-case font-light">{bairro.nome}</span>
        </div>
      </div>

      {/* Hero presentation with active photo */}
      <section className="bg-zinc-950 text-white min-h-[400px]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#AF9164] font-semibold block">
              Curadoria de Localidades Nobres • Zona Sul & Serra
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white font-light">{bairro.nome}</h1>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed font-light">{bairro.descricao}</p>

            <div className="pt-6 border-t border-white/5 space-y-2">
              <span className="text-[9px] text-[#AF9164] uppercase tracking-widest block font-bold">Estilo de Vida Associado</span>
              <p className="text-xs text-white/50 italic leading-relaxed font-light font-serif">
                "{bairro.estilo_vida}"
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-video bg-neutral-900 border border-white/5 overflow-hidden">
            <img src={activePhoto} alt={bairro.nome} className="w-full h-full object-cover animate-fade-in" />
            
            {/* Gallery miniatures */}
            {bairro.fotos.length > 1 && (
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                {bairro.fotos.map((f, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActivePhoto(f)}
                    className={`cursor-pointer w-16 h-10 border overflow-hidden transition-colors ${activePhoto === f ? 'border-[#AF9164]' : 'border-white/20 hover:border-white/55'}`}
                  >
                    <img src={f} alt={`Mini ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Advanced Lifestyle features of neighborhood */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 font-light">
        
        {/* Left Column Indicators list */}
        <div className="space-y-6">
          <h3 className="font-serif text-xl font-light text-[#111111] border-b border-[#AF9164]/20 pb-3 uppercase tracking-widest text-xs">
            Atributos Sociais e Conveniências
          </h3>

          <div className="space-y-4">
            {bairro.gastronomia && (
              <div className="bg-white p-5 border border-[#1A1A1A]/5 shadow-sm block relative">
                <Utensils className="text-[#AF9164]/40 absolute top-5 right-5" size={24} />
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#111111] mb-2 flex items-center gap-2">Gastronomia Criativa</h4>
                <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.gastronomia}</p>
              </div>
            )}
            
            {bairro.lazer && (
              <div className="bg-white p-5 border border-[#1A1A1A]/5 shadow-sm block relative">
                <Compass className="text-[#AF9164]/40 absolute top-5 right-5" size={24} />
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#111111] mb-2 flex items-center gap-2">Lazer e Recreação Privativa</h4>
                <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.lazer}</p>
              </div>
            )}

            {bairro.seguranca && (
              <div className="bg-white p-5 border border-[#1A1A1A]/5 shadow-sm block relative">
                <Shield className="text-[#AF9164]/40 absolute top-5 right-5" size={24} />
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#111111] mb-2 flex items-center gap-2">Governança & Segurança</h4>
                <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.seguranca}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column Services detail */}
        <div className="space-y-6">
          <h3 className="font-serif text-xl font-light text-[#111111] border-b border-[#AF9164]/20 pb-3 uppercase tracking-widest text-xs">
            Serviços Públicos e Demografia
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {bairro.escolas && (
                <div className="bg-white p-4 border border-[#1A1A1A]/5 shadow-sm">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#AF9164] mb-1 flex items-center gap-1">
                    <GraduationCap size={12} /> Escolas e Educação
                  </h5>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.escolas}</p>
                </div>
              )}

              {bairro.hospitais && (
                <div className="bg-white p-4 border border-[#1A1A1A]/5 shadow-sm">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#AF9164] mb-1 flex items-center gap-1">
                    <HeartPulse size={12} /> Hospitais e Clínicas
                  </h5>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.hospitais}</p>
                </div>
              )}

              {bairro.mobilidade && (
                <div className="bg-white p-4 border border-[#1A1A1A]/5 shadow-sm">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#AF9164] mb-1 flex items-center gap-1">
                    <Compass size={12} /> Mobilidade Logística
                  </h5>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.mobilidade}</p>
                </div>
              )}

              {bairro.perfil_publico && (
                <div className="bg-white p-4 border border-[#1A1A1A]/5 shadow-sm">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#AF9164] mb-1 flex items-center gap-1">
                    <Award size={12} /> Perfil do Público
                  </h5>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">{bairro.perfil_publico}</p>
                </div>
              )}

            </div>
          </div>
        </div>

      </section>

      {/* Portfolio listings matching this neighborhood */}
      <section className="bg-white border-t border-[#1A1A1A]/5 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-[#AF9164] font-semibold block">Aura Portfolio em Escopo</span>
            <h3 className="font-serif text-3xl font-light text-[#111111]">Imóveis Disponíveis no Bairro {bairro.nome}</h3>
            <p className="text-xs text-[#1A1A1A]/45 mt-1">Conheça as oportundiades off-market e ativas listadas em nosso banco:</p>
          </div>

          {matchingProperties.length === 0 ? (
            <div className="bg-[#FAF9F5] p-12 text-center border border-[#1A1A1A]/5 max-w-2xl mx-auto space-y-4">
              <h4 className="font-serif text-base text-[#111111]">Nenhuma residência à venda no momento</h4>
              <p className="text-xs text-[#1A1A1A]/50 font-light leading-relaxed">
                As unidades de altíssimo luxo localizadas no {bairro.nome} estão atualmente sob sigilo patrimonial fechado. Entre em contato direto com Carlos Albuquerque para receber relatórios confidenciais fora do mercado (off-market).
              </p>
              <button 
                onClick={() => onNavigate('about', { scrollToContact: true })}
                className="bg-[#111111] text-white py-2.5 px-6 text-[10px] uppercase tracking-widest font-bold"
              >
                Acionar Atendimento VIP
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {matchingProperties.map(prop => (
                <div 
                  key={prop.id}
                  onClick={() => onNavigate('property', { id: prop.id })}
                  className="bg-[#FAF9F5] border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 cursor-pointer group transition-all duration-300"
                >
                  <div className="h-56 bg-neutral-900 overflow-hidden relative">
                    <img src={prop.midia[0]} alt={prop.titulo} className="w-full h-full object-cover transition-transform group-hover:scale-102" />
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className="font-serif text-base text-[#111111] group-hover:text-[#AF9164] transition-colors line-clamp-1">{prop.titulo}</h4>
                    <p className="text-xs text-[#1A1A1A]/50 line-clamp-1 font-light">{prop.metragem}m² • {prop.suites} suítes • {prop.vagas} vagas</p>
                    <span className="text-xs font-semibold text-[#111111] block">R$ {prop.valor.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
