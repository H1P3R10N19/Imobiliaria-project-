import React, { useState, useEffect } from 'react';
import { Search, Hash, BookOpen } from 'lucide-react';
import { BlogPost } from '../types';
import { trackEvent } from '../api';

interface BlogViewProps {
  blogPosts: BlogPost[];
  onNavigate: (page: string, params?: any) => void;
}

export default function BlogView({ blogPosts, onNavigate }: BlogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    trackEvent('page_view', '/blog', 'Visited Editorial Blog Index');
  }, []);

  const categories = Array.from(new Set(blogPosts.map(p => p.categoria))).sort();

  // Filter blog posts
  const filteredPosts = blogPosts.filter(p => {
    const matchesCategory = !selectedCategory || p.categoria === selectedCategory;
    const matchesSearch = !searchTerm || 
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="blog-index-root" className="max-w-7xl mx-auto px-6 py-16">
      
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <span className="text-xs uppercase tracking-[0.3em] text-[#AF9164] font-semibold block flex items-center justify-center gap-2">
          <BookOpen size={14} /> Curadoria de Conteúdo
        </span>
        <h1 className="text-3xl md:text-5xl font-serif text-[#111111] leading-tight font-light">Tuanny Magalhães Editorial de Luxo</h1>
        <div className="w-12 h-[1px] bg-[#AF9164] mx-auto mt-4" />
        <p className="text-xs text-[#1A1A1A]/55 font-light leading-relaxed">
          Tendências globais de arquitetura minimalista, investimentos de retrofit e guias aprofundados sobre a alta cultura imobiliária no Rio de Janeiro.
        </p>
      </div>

      {/* Control Utility and Category tags */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1A1A1A]/10 pb-8 mb-12">
        {/* Category toggles */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            onClick={() => setSelectedCategory('')}
            className={`py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold border transition-colors ${!selectedCategory ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#1A1A1A]/10 text-[#1A1A1A]/55 hover:border-[#AF9164]'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold border transition-colors ${selectedCategory === cat ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#1A1A1A]/10 text-[#1A1A1A]/55 hover:border-[#AF9164]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Text Filter search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Pesquisar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/15 py-2.5 pl-4 pr-10 text-xs focus:outline-none focus:border-[#AF9164] font-light rounded-none"
          />
          <Search size={14} className="absolute right-3 top-3 text-[#1A1A1A]/40" />
        </div>
      </div>

      {/* Main post grid columns */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-[#1A1A1A]/5 p-16 text-center space-y-4">
          <h3 className="font-serif text-lg text-[#111111]">Nenhum artigo localizado</h3>
          <p className="text-xs text-[#1A1A1A]/50 font-light max-w-xs mx-auto leading-relaxed">
            Nossa curadoria editorial publica ensaios direcionados e estritamente polidos. Tente outros termos de pesquisa.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
            className="bg-[#111111] text-white py-2 px-6 text-[10px] uppercase tracking-wide font-bold"
          >
            Limpar Busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article 
              key={post.id}
              onClick={() => onNavigate('blog-post', { id: post.id })}
              className="cursor-pointer group bg-white border border-[#1A1A1A]/5 hover:border-[#AF9164]/30 hover:shadow-md transition-all duration-300 p-4"
              id={`blog-card-${post.id}`}
            >
              {/* Photo */}
              <div className="relative h-56 overflow-hidden bg-neutral-900 shrink-0">
                <img 
                  src={post.imagem_destacada} 
                  alt={post.titulo} 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-102 group-hover:opacity-100 transition-all duration-300"
                />
                <span className="absolute top-4 left-4 z-20 bg-[#111111] text-white text-[8px] uppercase tracking-widest font-bold py-1 px-2">
                  {post.categoria}
                </span>
              </div>

              {/* Text */}
              <div className="pt-6 space-y-3">
                <div className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest">
                  Publicado em {new Date(post.publicado_em).toLocaleDateString('pt-BR')}
                </div>
                <h3 className="font-serif text-lg text-[#111111] group-hover:text-[#AF9164] transition-colors leading-snug line-clamp-2">
                  {post.titulo}
                </h3>
                <p className="text-xs text-[#1A1A1A]/50 line-clamp-3 leading-relaxed font-light">
                  {post.conteudo}
                </p>

                {/* Tags block */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[9px] bg-[#FAF9F5] text-[#1A1A1A]/60 py-0.5 px-2 rounded-none border border-[#1A1A1A]/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
