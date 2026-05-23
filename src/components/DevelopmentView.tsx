import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Compass, Briefcase, Share2, Phone, Calendar, Layers, CheckCircle } from 'lucide-react';
import { Development, Lead } from '../types';
import { api, trackEvent } from '../api';

interface DevelopmentViewProps {
  developmentId: string;
  onNavigate: (page: string, params?: any) => void;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'criado_em' | 'status'>) => Promise<boolean>;
  allDevelopments: Development[];
}

export default function DevelopmentView({
  developmentId,
  onNavigate,
  onSubmitLead,
  allDevelopments
}: DevelopmentViewProps) {
  const [dev, setDev] = useState<Development | null>(null);
  const [activePhoto, setActivePhoto] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const d = allDevelopments.find(item => item.id === developmentId || item.slug === developmentId);
    if (!d) {
      setError('O empreendimento de grife solicitado não foi localizado.');
    } else {
      setDev(d);
      setActivePhoto(d.midia[0] || '');
      setError('');
      
      // Track dev view
      trackEvent('property_view', `/empreendimento/${d.slug}`, `Viewed Dev ${d.nome}`);
    }
  }, [developmentId, allDevelopments]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h3 className="font-serif text-xl text-[#111111]">{error}</h3>
        <button onClick={() => onNavigate('home')} className="bg-[#111111] text-white py-2 px-6 text-xs uppercase tracking-wider">
          Voltar ao Início
        </button>
      </div>
    );
  }

  if (!dev) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone) return;

    setFormLoading(true);
    const success = await onSubmitLead({
      nome,
      email,
      telefone,
      mensagem: mensagem || `Fiquei interessado em receber as plantas e fluxo de pagamento do empreendimento: ${dev.nome}.`,
      imovel_id: dev.id,
      imovel_titulo: `${dev.nome} (Empreendimento)`,
      origem: `Formulário Interesse Empreendimento: ${dev.nome}`
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
    <div id="dev-profile-root" className="pb-24">
      {/* Thread */}
      <div className="bg-white border-b border-[#1A1A1A]/5 py-4 px-6 text-xs text-[#1A1A1A]/45 uppercase tracking-widest">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => onNavigate('home')} className="hover:text-[#AF9164]">Início</button>
          <span className="mx-2">/</span>
          <span>Empreendimento</span>
          <span className="mx-2">/</span>
          <span className="text-[#1A1A1A]/75 normal-case font-light">{dev.nome}</span>
        </div>
      </div>

      {/* Main presentation headers with gallery */}
      <section className="bg-zinc-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 relative aspect-video bg-neutral-900 border border-white/5">
            <img src={activePhoto} alt={dev.nome} className="w-full h-full object-cover animate-fade-in" />
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              {dev.midia.map((m, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePhoto(m)}
                  className={`cursor-pointer w-16 h-10 border overflow-hidden ${activePhoto === m ? 'border-[#AF9164]' : 'border-white/20'}`}
                >
                  <img src={m} alt={`Mini ${idx+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="bg-[#AF9164]/20 border border-[#AF9164]/40 text-[#AF9164] text-[8px] uppercase tracking-widest font-bold px-2 py-0.5">
                {dev.estagio_obra === 'lancamento' ? 'Lançamento' : dev.estagio_obra === 'em_obras' ? 'Em Obras' : 'Pronto p/ Morar'}
              </span>
              <span className="text-[10px] text-white/50 tracking-wider font-light uppercase flex items-center gap-1">
                <MapPin size={10} /> {dev.bairro}, RJ
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-white font-light">{dev.nome}</h1>
            <p className="text-xs text-white/60 leading-relaxed font-light">{dev.descricao}</p>

            <div className="pt-6 border-t border-white/5 space-y-2">
              <span className="text-[9px] text-white/40 uppercase tracking-widest">Valores de Referência</span>
              <div className="text-2xl text-[#AF9164] font-serif">{dev.faixa_preco}</div>
              <p className="text-[10px] text-white/50 leading-relaxed font-light uppercase tracking-wider">
                Metragens de {dev.faixa_metragem} • {dev.unidades_disponiveis} {dev.unidades_disponiveis === 1 ? 'única unidade disponível' : 'unidades disponíveis'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Blueprints structures & Interest Form */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Plantas details */}
        <div className="lg:col-span-8 space-y-12">
          
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-light text-[#111111]">Tipologia e Configuração de Plantas</h3>
            <div className="w-12 h-[1px] bg-[#AF9164]" />
            <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-light">
              Projetado para assegurar o máximo aproveitamento do espaço interno, oferecendo excelente insolação natural e ventilação cruzada. Nossos analistas de engenharia detalharam as seguintes plantas disponíveis:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dev.plantas.map((planta, idx) => (
              <div key={idx} className="bg-white border border-[#1A1A1A]/5 p-6 space-y-4 shadow-sm relative">
                <Compass className="absolute top-6 right-6 text-[#AF9164]/30" size={32} />
                <span className="text-[9px] uppercase tracking-widest text-[#AF9164] font-bold block">Planta Sugestão {idx+1}</span>
                <h4 className="font-serif text-base text-[#111111]">{planta}</h4>
                <p className="text-xs text-[#1A1A1A]/50 leading-relaxed font-light">
                  Configuração de andar flexível com acabamento personalizável. Opções de ampliação do living social ou criação de sala íntima.
                </p>
              </div>
            ))}
          </div>

          {/* Construction Stage and Delivery */}
          <div className="bg-[#FAF9F5] border border-[#AF9164]/20 p-8 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#AF9164] font-semibold block flex items-center gap-2">
              <Layers size={14} /> Cronograma Físico de Obra
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs pt-2">
              <div className="bg-white p-4 border border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/40 text-[9px] font-bold block uppercase tracking-wider mb-1">Previsão Entrega</span>
                <span className="font-semibold text-[#1A1A1A]">{dev.previsao_entrega}</span>
              </div>
              <div className="bg-white p-4 border border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/40 text-[9px] font-bold block uppercase tracking-wider mb-1">Estágio Construtivo</span>
                <span className="font-semibold text-emerald-700 capitalize">{dev.estagio_obra === 'lancamento' ? 'Lançamento' : dev.estagio_obra === 'em_obras' ? 'Fundações / Estrutura' : 'Instalações Finais'}</span>
              </div>
              <div className="bg-white p-4 border border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/40 text-[9px] font-bold block uppercase tracking-wider mb-1">Status Jurídico</span>
                <span className="font-semibold text-emerald-700">Memorial de Incorporação Registrado</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action card */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-[#AF9164]/30 p-8 shadow-md">
            <h3 className="font-serif text-lg font-light text-[#111111] mb-2">Quero Receber Dossiê</h3>
            <p className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest mb-6">
              Plantas executivas e tabelas confidenciais de pagamento.
            </p>

            {formSuccess ? (
              <div className="text-center space-y-4 py-8 animate-fade-in">
                <div className="w-12 h-12 bg-[#AF9164]/10 rounded-full flex items-center justify-center text-[#AF9164] mx-auto">
                  <CheckCircle size={24} />
                </div>
                <h5 className="font-serif text-base text-[#111111]">Solicitação Recebida</h5>
                <p className="text-xs text-[#1A1A1A]/50 font-light leading-relaxed max-w-xs mx-auto">
                  Seus dados de interesse foram anexados com sucesso para triagem comercial na agência Aura. Entraremos em contato com as plantas complementares do {dev.nome}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="E.g. Carlos de Albuquerque"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g. consultoria@albuquerque.com"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="E.g. (21) 98888-7711"
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 block font-bold">Observações Adicionais</label>
                  <textarea
                    rows={3}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Tenho interesse em coberturas unificadas."
                    className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-[#111111] hover:bg-[#AF9164] text-white py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all rounded-none"
                >
                  {formLoading ? 'SALVANDO SOLICITAÇÃO...' : 'SOLICITAR INFORMAÇÕES'}
                </button>
              </form>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
