import React, { useEffect } from 'react';
import { MapPin, Shield, Compass, ChevronRight } from 'lucide-react';
import { Neighborhood } from '../types';
import { trackEvent } from '../api';

interface NeighborhoodsListProps {
  neighborhoods: Neighborhood[];
  onNavigate: (page: string, params?: any) => void;
}

export default function NeighborhoodsList({ neighborhoods, onNavigate }: NeighborhoodsListProps) {
  
  useEffect(() => {
    trackEvent('page_view', '/bairros', 'Visited Neighborhood Guides Index');
  }, []);

  return (
    <div id="neighborhoods-directory-root" className="max-w-7xl mx-auto px-6 py-16">
      
      {/* Editorial Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <span className="text-xs uppercase tracking-[0.3em] text-[#AF9164] font-medium block">Geolocalização & Estilos de Vida</span>
        <h1 className="text-3xl md:text-5xl font-serif font-light text-[#111111] leading-tight">Guia de Bairros Exclusivos</h1>
        <div className="w-12 h-[1px] bg-[#AF9164] mx-auto mt-4" />
        <p className="text-xs md:text-sm text-[#1A1A1A]/55 font-light leading-relaxed">
          Cada endereço nobre abriga características particulares de gastronomia, segurança e bem-estar. Escolha o quadrante de alto padrão que mais ressoa com a alma da sua família.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {neighborhoods.map(b => (
          <div 
            key={b.id}
            onClick={() => onNavigate('neighborhood', { id: b.id })}
            className="group cursor-pointer bg-white border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 hover:shadow-lg transition-all duration-500 overflow-hidden"
            id={`bairro-directory-card-${b.id}`}
          >
            {/* Visual Cover image */}
            <div className="relative h-64 overflow-hidden bg-neutral-900 shrink-0">
              <img 
                src={b.fotos[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                alt={b.nome} 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-[1.03] opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 text-xs text-[#E5D5C0] font-medium tracking-widest uppercase">
                <MapPin size={12} /> Rio de Janeiro & Serra
              </div>
            </div>

            {/* Typography descriptors */}
            <div className="p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#111111] group-hover:text-[#AF9164] transition-colors font-light">
                  {b.nome}
                </h3>
                <p className="text-xs text-[#1A1A1A]/50 font-light line-clamp-3 leading-relaxed">
                  {b.descricao}
                </p>
              </div>

              <div className="border-t border-[#1A1A1A]/5 pt-4 mt-4 flex justify-between items-center text-[10px] uppercase text-[#AF9164] tracking-widest font-bold">
                <span>Explorar Perfil Coordenado</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
