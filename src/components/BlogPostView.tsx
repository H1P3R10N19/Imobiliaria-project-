import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, BookOpen, ChevronLeft } from 'lucide-react';
import { BlogPost } from '../types';
import { trackEvent } from '../api';

interface BlogPostViewProps {
  postId: string;
  blogPosts: BlogPost[];
  onNavigate: (page: string, params?: any) => void;
}

export default function BlogPostView({ postId, blogPosts, onNavigate }: BlogPostViewProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const match = blogPosts.find(p => p.id === postId || p.slug === postId);
    if (!match) {
      setError('O ensaio editorial solicitado não foi localizado.');
    } else {
      setPost(match);
      setError('');
      
      // Track blog reading view telemetry
      trackEvent('blog_post_view', `/blog/${match.slug}`, `Read Article: ${match.titulo}`, { post_id: match.id });
    }
  }, [postId, blogPosts]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h3 className="font-serif text-xl text-[#111111]">{error}</h3>
        <button onClick={() => onNavigate('blog')} className="bg-[#111111] text-white py-2 px-6 text-xs uppercase tracking-wider">
          Voltar ao Blog
        </button>
      </div>
    );
  }

  if (!post) return null;

  // Curation of related posts
  const relatedPosts = blogPosts
    .filter(b => b.id !== post.id && b.categoria === post.categoria)
    .slice(0, 2);

  return (
    <article id={`article-profile-${post.id}`} className="min-h-screen pb-24">
      {/* Back to index link header */}
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <button 
          onClick={() => onNavigate('blog')}
          className="group flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#1A1A1A]/55 hover:text-[#AF9164] transition-colors"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Voltar aos Artigos
        </button>
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-10 pb-8 space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#AF9164] uppercase tracking-widest font-semibold">
          <span className="bg-[#AF9164]/10 border border-[#AF9164]/30 py-1 px-3">
            {post.categoria}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {new Date(post.publicado_em).toLocaleDateString('pt-BR')}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} /> {post.autor}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif text-[#111111] font-light leading-tight">
          {post.titulo}
        </h1>
        <div className="w-16 h-[1px] bg-[#AF9164] mt-4" />
      </header>

      {/* Hero Cover Image */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="h-80 md:h-[450px] bg-neutral-900 overflow-hidden border border-[#1A1A1A]/5 shadow-sm">
          <img src={post.imagem_destacada} alt={post.titulo} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Main Reading core content */}
      <div className="max-w-3xl mx-auto px-6 text-sm md:text-base text-[#1A1A1A]/80 leading-relaxed font-light gap-8 break-words text-justify select-text">
        {post.conteudo.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="mb-6">
            {paragraph}
          </p>
        ))}
        
        {/* Author sign of authenticity */}
        <div className="border-t border-[#1A1A1A]/10 pt-8 mt-12 flex items-center justify-between text-xs text-[#1A1A1A]/50">
          <span>Assinatura da Curadoria Editorial Aura</span>
          <span className="font-serif italic text-emerald-900">Selo de Autenticidade Clássica.</span>
        </div>
      </div>

      {/* Related recommendation rows at bottom */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#FAF9F5] border-t border-[#1A1A1A]/10 py-16 mt-24">
          <div className="max-w-4xl mx-auto px-6">
            <h4 className="font-serif text-lg font-light text-[#111111] mb-8 uppercase tracking-widest text-xs">
              Recomendado sob a mesma Categoria
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map(r => (
                <div 
                  key={r.id}
                  onClick={() => onNavigate('blog-post', { id: r.id })}
                  className="bg-white p-5 border border-[#1A1A1A]/5 hover:border-[#AF9164] cursor-pointer group flex gap-4 transition-all"
                >
                  <div className="w-20 h-20 overflow-hidden bg-neutral-900 shrink-0">
                    <img src={r.imagem_destacada} alt={r.titulo} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#AF9164] uppercase tracking-widest font-bold block">{r.categoria}</span>
                    <h5 className="font-serif text-sm font-light text-[#111111] leading-tight group-hover:text-[#AF9164] transition-colors line-clamp-2">
                      {r.titulo}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </article>
  );
}
