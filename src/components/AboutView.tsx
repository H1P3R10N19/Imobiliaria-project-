import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Award, Shield, Key, Eye, CheckCircle, Send } from 'lucide-react';
import { Lead } from '../types';
import { trackEvent } from '../api';

interface AboutViewProps {
  initialScrollToContact?: boolean;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'criado_em' | 'status'>) => Promise<boolean>;
}

export default function AboutView({ initialScrollToContact, onSubmitLead }: AboutViewProps) {
  const contactFormRef = useRef<HTMLDivElement>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    trackEvent('page_view', '/sobre', 'Visited Corporate About Us Page');

    if (initialScrollToContact && contactFormRef.current) {
      setTimeout(() => {
        contactFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      window.scrollTo(0, 0);
    }
  }, [initialScrollToContact]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone) return;

    setFormLoading(true);
    const success = await onSubmitLead({
      nome,
      email,
      telefone,
      mensagem: mensagem || 'Solicito contato confidencial para agendamento de consultoria de busca imobiliária premium (Tuanny Magalhães).',
      origem: 'Formulário Contato Direto - Página Quem Somos'
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

  return (
    <div id="about-us-container" className="min-h-screen pb-24">
      {/* Banner backdrop */}
      <section className="relative h-96 bg-zinc-950 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/55 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80" 
          alt="Luxury Architecture background" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-20 text-white max-w-2xl px-6 space-y-4">
          <span className="text-xs uppercase tracking-[0.4em] text-[#E5D5C0] font-semibold block">Tuanny Magalhães Imóveis Exclusivos</span>
          <h1 className="text-4xl md:text-5xl font-serif text-white font-extralight tracking-wider">Governança Patrimonial</h1>
          <div className="w-12 h-[1px] bg-[#E5D5C0] mx-auto mt-4" />
        </div>
      </section>
 
      {/* Main content body (History & values) */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left side text story */}
        <div className="lg:col-span-8 space-y-8 font-light text-justify">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#AF9164] font-semibold block">Nossos Compromissos</span>
            <h2 className="text-2xl md:text-3.5xl font-serif font-light text-[#111111] leading-tight">
              A Singularidade da Assessoria Premium Tuanny Magalhães
            </h2>
          </div>

          <p className="text-sm text-[#1A1A1A]/75 leading-relaxed">
            No mercado imobiliário tradicional de alto padrão, a quantidade de transações frequentemente atropela o refinamento e a discrição necessários para negócios de alta envergadura. A <strong>Tuanny Magalhães Imóveis de Luxo</strong> foi modelada pelo conselheiro de patrimônios Carlos Albuquerque sob o pilar oposto: **a curadoria qualificada e escassa**.
          </p>

          <p className="text-sm text-[#1A1A1A]/75 leading-relaxed">
            Nós compreendemos que a busca por uma nova residência – seja uma cobertura reformada de frente para o mar do Leblon ou uma chácara de inverno com heliponto nas colinas de Itaipava – envolve aspectos emocionais complexos e rigorosas transações corporativas. Por isso, oferecemos assessoria ponta a ponta com especialistas em engenharia civil (avaliando de forma antecipada a viabilidade física de reformas e retrofit), advogados seniores especializados (assegurando certidões limpas de ônus e total proteção contratual das partes) e consultores de arte arquitetônica.
          </p>

          <blockquote className="border-l-2 border-[#AF9164] pl-6 py-2 my-8 font-serif italic text-base text-[#AF9164]/90">
            "Não comercializamos apenas metros quadrados de concreto; nós intermediamos legados familiares e criativos materializados nas formas mais sinceras da arquitetura."<br />
            <span className="text-xs font-sans uppercase font-bold text-[#111111] tracking-wider not-italic block mt-3">— Carlos Albuquerque, Fundador & Diretor Geral</span>
          </blockquote>

          <p className="text-sm text-[#1A1A1A]/75 leading-relaxed">
            Toda a nossa atuação é restrita por contratos de confidencialidade comercial ativa. Nenhuma transação ou acervo imobiliário administrado por Tuanny Magalhães é divulgado para imprensas de entretenimento, garantindo segurança patrimonial total e a paz de espírito necessária para o estabelecimento de governanças duradouras.
          </p>

          {/* Pillars List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-[#1A1A1A]/10">
            <div className="flex gap-4">
              <div className="p-3 bg-[#FAF9F5] border border-[#AF9164]/20 text-[#AF9164] shrink-0 self-start">
                <Shield size={20} />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-base text-[#111111]">Sigilo Blindado</h4>
                <p className="text-[#1A1A1A]/55 text-xs leading-relaxed font-light">Todas as reuniões e documentações de propostas ocorrem sob sigilo jurídico de Dados (LGPD) e anonimização ativa.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="p-3 bg-[#FAF9F5] border border-[#AF9164]/20 text-[#AF9164] shrink-0 self-start">
                <Award size={20} />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-base text-[#111111]">Avaliação de Retrofit</h4>
                <p className="text-[#1A1A1A]/55 text-xs leading-relaxed font-light">Especialidade em vistorias estruturais completas de engenharia antes do fechamento do negócio.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side contact form with scroll anchor */}
        <div ref={contactFormRef} className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="bg-white border border-[#AF9164]/30 p-8 shadow-md" id="contact-panel">
            <h3 className="font-serif text-lg font-light text-[#111111] mb-2 flex items-center gap-2">
              Atendimento Consultivo
            </h3>
            <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest mb-6">
              Agende uma videoconferência fechada.
            </p>

            {formSuccess ? (
              <div className="text-center space-y-4 py-8 animate-fade-in">
                <div className="w-12 h-12 bg-[#AF9164]/10 rounded-full flex items-center justify-center text-[#AF9164] mx-auto">
                  <CheckCircle size={24} />
                </div>
                <h5 className="font-serif text-base text-[#111111]">Solicitação Recebida</h5>
                <p className="text-xs text-[#1A1A1A]/55 leading-relaxed font-light max-w-sm mx-auto">
                  Carlos Albuquerque e equipe de analistas seniores acataram suas especificações confidenciais. Um convite de acesso será gerado para o e-mail cadastrado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Carlos Albuquerque"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164]"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">E-mail de Trabalho</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@empresa.com"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164]"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Contato Telefônico</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(21) 98888-7711"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164]"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Resumo das Necessidades</label>
                  <textarea
                    rows={4}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Desejo estabelecer um portfólio de aquisições de retrofits de coberturas no Leblon ou Ipanema..."
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none focus:border-[#AF9164] resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-[#111111] hover:bg-[#AF9164] text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-none"
                >
                  {formLoading ? 'AGUARDE...' : 'CONECTAR ANALISTA DE LUXO'}
                </button>
              </form>
            )}

            <div className="pt-6 border-t border-[#1A1A1A]/15 mt-6 space-y-3 font-light text-center text-xs">
              <p className="flex items-center justify-center gap-2">
                <MapPin size={12} className="text-[#AF9164]" /> Av. Delfim Moreira, 1020 - Leblon, RJ
              </p>
              <p className="flex items-center justify-center gap-2">
                <Phone size={12} className="text-[#AF9164]" /> +55 (21) 98888-7711
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
