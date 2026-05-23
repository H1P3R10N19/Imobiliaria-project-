import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, User, ShieldAlert, BarChart2, MessageSquare, Home, Plus, Edit, Trash, Settings, 
  ArrowUpDown, Check, CheckCircle, RefreshCw, X, Eye, FileText, ChevronUp, ChevronDown, Layers, Compass 
} from 'lucide-react';
import { Property, Development, Neighborhood, BlogPost, Lead, HomeModuleConfig } from '../types';
import { api, trackEvent } from '../api';
import MetricsView from './MetricsView';

interface AdminViewProps {
  properties: Property[];
  developments: Development[];
  neighborhoods: Neighborhood[];
  blogPosts: BlogPost[];
  homeModules: HomeModuleConfig[];
  leads: Lead[];
  onRefreshData: () => Promise<void>;
  onNavigate: (page: string, params?: any) => void;
}

type Tab = 'leads' | 'properties' | 'developments' | 'blog' | 'neighborhoods' | 'modules' | 'metrics';

export default function AdminView({
  properties,
  developments,
  neighborhoods,
  blogPosts,
  homeModules,
  leads,
  onRefreshData,
  onNavigate
}: AdminViewProps) {
  // Authentication states
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Layout Tab selection
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // CRUD / Forms state machines
  const [formMode, setFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states - common
  const [mediaListString, setMediaListString] = useState(''); // Textarea URL strings separated by line breaks

  // Form fields - Property
  const [pTitulo, setPTitulo] = useState('');
  const [pDescricao, setPDescricao] = useState('');
  const [pTipo, setPTipo] = useState('Cobertura');
  const [pFinalidade, setPFinalidade] = useState<'comprar' | 'alugar'>('comprar');
  const [pCategoria, setPCategoria] = useState<'cidade' | 'campo'>('cidade');
  const [pBairro, setPBairro] = useState('');
  const [pCidade, setPCidade] = useState('Rio de Janeiro');
  const [pEstado, setPEstado] = useState('RJ');
  const [pValor, setPValor] = useState('');
  const [pMetragem, setPMetragem] = useState('');
  const [pQuartos, setPQuartos] = useState('');
  const [pSuites, setPSuites] = useState('');
  const [pBanheiros, setPBanheiros] = useState('');
  const [pVagas, setPVagas] = useState('');
  const [pCondominio, setPCondominio] = useState('');
  const [pIptu, setPIptu] = useState('');
  const [pCaracteristicas, setPCaracteristicas] = useState<string[]>([]);
  const [pDiferenciais, setPDiferenciais] = useState<string[]>([]);
  const [pStatus, setPStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [pDestaque, setPDestaque] = useState(false);
  const [pReforma, setPReforma] = useState(false);
  const [pExclusivo, setPExclusivo] = useState(false);
  const [pVideo, setPVideo] = useState('');
  const [pPlanta, setPPlanta] = useState('');
  const [pTour, setPTour] = useState('');
  const [pSEOtitle, setPSEOtitle] = useState('');
  const [pSEOdescription, setPSEOdescription] = useState('');

  // Input arrays row helpers
  const [newCaracteristica, setNewCaracteristica] = useState('');
  const [newDiferencial, setNewDiferencial] = useState('');

  // Form fields - Development
  const [dNome, setDNome] = useState('');
  const [dDescricao, setDDescricao] = useState('');
  const [dBairro, setDBairro] = useState('');
  const [dCidade, setDCidade] = useState('Rio de Janeiro');
  const [dFaixaPreco, setDFaixaPreco] = useState('');
  const [dFaixaMetragem, setDFaixaMetragem] = useState('');
  const [dUnidades, setDUnidades] = useState('');
  const [dPlantas, setDPlantas] = useState<string[]>([]);
  const [dPrevisao, setDPrevisao] = useState('');
  const [dEstagio, setDEstagio] = useState<'lancamento' | 'em_obras' | 'pronto'>('lancamento');
  const [newDPlanta, setNewDPlanta] = useState('');
  const [dSEOtitle, setDSEOtitle] = useState('');
  const [dSEOdescription, setDSEOdescription] = useState('');

  // Form fields - BlogPost
  const [bTitulo, setBTitulo] = useState('');
  const [bConteudo, setBConteudo] = useState('');
  const [bCapa, setBCapa] = useState('');
  const [bCategoria, setBCategoria] = useState('');
  const [bTags, setBTags] = useState<string[]>([]);
  const [newBTag, setNewBTag] = useState('');
  const [bAutor, setBAutor] = useState('Aura Curadoria Editorial');
  const [bSEOtitle, setBSEOtitle] = useState('');
  const [bSEOdescription, setBSEOdescription] = useState('');

  // Form fields - Neighborhood
  const [nNome, setNNome] = useState('');
  const [nDescricao, setNDescricao] = useState('');
  const [nGastronomia, setNGastronomia] = useState('');
  const [nLazer, setNLazer] = useState('');
  const [nCultura, setNCultura] = useState('');
  const [nHospitais, setNHospitais] = useState('');
  const [nEscolas, setNEscolas] = useState('');
  const [nMobilidade, setNMobilidade] = useState('');
  const [nSeguranca, setNSeguranca] = useState('');
  const [nPerfil, setNPerfil] = useState('');
  const [nEstilo, setNEstilo] = useState('');
  const [nSEOtitle, setNSEOtitle] = useState('');
  const [nSEOdescription, setNSEOdescription] = useState('');

  // Home Page Modules sorting state
  const [orderedModules, setOrderedModules] = useState<HomeModuleConfig[]>([]);

  // Verify stored session on boot
  useEffect(() => {
    const checkSession = async () => {
      try {
        const adminData = await api.me();
        if (adminData) {
          setIsAdmin(true);
        }
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkSession();
  }, []);

  // Sync module order local state when props load
  useEffect(() => {
    if (homeModules && homeModules.length > 0) {
      setOrderedModules([...homeModules].sort((a,b) => a.ordem - b.ordem));
    }
  }, [homeModules]);

  // Auth login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setAuthError('');
    setAuthLoading(true);
    try {
      const user = await api.login(email, password);
      if (user) {
        setIsAdmin(true);
        onRefreshData();
        trackEvent('page_view', '/admin', 'Admin Login Successful');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Credenciais inválidas. Tente admin@imobiliaria.com / Admin123@');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAdmin(false);
    onNavigate('home');
  };

  // Helper trigger messages
  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Status CRM Lead updates
  const handleLeadStatusChange = async (id: string, currentStatus: 'novo' | 'atendido' | 'arquivado') => {
    try {
      await api.updateLeadStatus(id, currentStatus);
      await onRefreshData();
      triggerSuccessMsg('Estágio do interesse atualizado no CRM.');
    } catch (e) {
      alert('Erro ao atualizar status do lead.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente este contato de interesse?')) return;
    try {
      await api.deleteLead(id);
      await onRefreshData();
      triggerSuccessMsg('Interesse removido com sucesso.');
    } catch (e) {
      alert('Erro fatal ao remover lead.');
    }
  };

  // ---------------- GENERAL ADD CLICK HANDLERS ----------------
  const openAddForm = () => {
    setSelectedId(null);
    setFormMode('add');
    setMediaListString('');
    
    // Reset properties forms
    setPTitulo('');
    setPDescricao('');
    setPTipo('Apartamento');
    setPFinalidade('comprar');
    setPCategoria('cidade');
    setPBairro('');
    setPValor('');
    setPMetragem('');
    setPQuartos('');
    setPSuites('');
    setPBanheiros('');
    setPVagas('');
    setPCondominio('');
    setPIptu('');
    setPCaracteristicas([]);
    setPDiferenciais([]);
    setPStatus('ativo');
    setPDestaque(false);
    setPReforma(false);
    setPExclusivo(false);
    setPVideo('');
    setPPlanta('');
    setPTour('');
    setPSEOtitle('');
    setPSEOdescription('');

    // Reset dev form
    setDNome('');
    setDDescricao('');
    setDBairro('');
    setDFaixaPreco('');
    setDFaixaMetragem('');
    setDUnidades('');
    setDPlantas([]);
    setDPrevisao('');
    setDEstagio('lancamento');
    setDSEOtitle('');
    setDSEOdescription('');

    // Reset post form
    setBTitulo('');
    setBConteudo('');
    setBCapa('');
    setBCategoria('');
    setBTags([]);
    setBAutor('Aura Curadoria Editorial');
    setBSEOtitle('');
    setBSEOdescription('');

    // Reset Bairro form
    setNNome('');
    setNDescricao('');
    setNGastronomia('');
    setNLazer('');
    setNCultura('');
    setNHospitais('');
    setNEscolas('');
    setNMobilidade('');
    setNSeguranca('');
    setNPerfil('');
    setNEstilo('');
    setNSEOtitle('');
    setNSEOdescription('');
  };

  // Edit forms trigger loaders
  const openEditForm = (item: any, type: Tab) => {
    setSelectedId(item.id);
    setFormMode('edit');
    
    if (type === 'properties') {
      const prop = item as Property;
      setPTitulo(prop.titulo);
      setPDescricao(prop.descricao);
      setPTipo(prop.tipo);
      setPFinalidade(prop.finalidade);
      setPCategoria(prop.categoria);
      setPBairro(prop.bairro);
      setPCidade(prop.cidade);
      setPEstado(prop.estado);
      setPValor(prop.valor.toString());
      setPMetragem(prop.metragem.toString());
      setPQuartos(prop.quartos.toString());
      setPSuites(prop.suites.toString());
      setPBanheiros(prop.banheiros.toString());
      setPVagas(prop.vagas.toString());
      setPCondominio(prop.condominio.toString());
      setPIptu(prop.iptu.toString());
      setPCaracteristicas(prop.caracteristicas || []);
      setPDiferenciais(prop.diferenciais || []);
      setPStatus(prop.status);
      setPDestaque(prop.destaque || false);
      setPReforma(prop.imovel_para_reforma || false);
      setPExclusivo(prop.exclusivo || false);
      setPVideo(prop.video || '');
      setPPlanta(prop.planta || '');
      setPTour(prop.tour_virtual || '');
      setPSEOtitle(prop.SEO_title || '');
      setPSEOdescription(prop.SEO_description || '');
      setMediaListString((prop.midia || []).join('\n'));
    }

    if (type === 'developments') {
      const dev = item as Development;
      setDNome(dev.nome);
      setDDescricao(dev.descricao);
      setDBairro(dev.bairro);
      setDCidade(dev.cidade);
      setDFaixaPreco(dev.faixa_preco);
      setDFaixaMetragem(dev.faixa_metragem);
      setDUnidades(dev.unidades_disponiveis.toString());
      setDPlantas(dev.plantas || []);
      setDPrevisao(dev.previsao_entrega);
      setDEstagio(dev.estagio_obra);
      setDSEOtitle(dev.SEO_title || '');
      setDSEOdescription(dev.SEO_description || '');
      setMediaListString((dev.midia || []).join('\n'));
    }

    if (type === 'blog') {
      const p = item as BlogPost;
      setBTitulo(p.titulo);
      setBConteudo(p.conteudo);
      setBCapa(p.imagem_destacada);
      setBCategoria(p.categoria);
      setBTags(p.tags || []);
      setBAutor(p.autor);
      setBSEOtitle(p.SEO_title || '');
      setBSEOdescription(p.SEO_description || '');
    }

    if (type === 'neighborhoods') {
      const n = item as Neighborhood;
      setNNome(n.nome);
      setNDescricao(n.descricao);
      setNGastronomia(n.gastronomia || '');
      setNLazer(n.lazer || '');
      setNCultura(n.cultura || '');
      setNHospitais(n.hospitais || '');
      setNEscolas(n.escolas || '');
      setNMobilidade(n.mobilidade || '');
      setNSeguranca(n.seguranca || '');
      setNPerfil(n.perfil_publico || '');
      setNEstilo(n.estilo_vida || '');
      setNSEOtitle(n.SEO_title || '');
      setNSEOdescription(n.SEO_description || '');
      setMediaListString((n.fotos || []).join('\n'));
    }
  };

  // Submit operations handlers
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitulo || !pBairro || !pValor || !pMetragem) return;

    setActionLoading(true);
    const midia = mediaListString.split('\n').map(u => u.trim()).filter(Boolean);
    const payload = {
      titulo: pTitulo,
      descricao: pDescricao,
      tipo: pTipo,
      finalidade: pFinalidade,
      categoria: pCategoria,
      bairro: pBairro,
      cidade: pCidade,
      estado: pEstado,
      valor: parseInt(pValor),
      metragem: parseInt(pMetragem),
      quartos: parseInt(pQuartos || '0'),
      suites: parseInt(pSuites || '0'),
      banheiros: parseInt(pBanheiros || '0'),
      vagas: parseInt(pVagas || '0'),
      condominio: parseInt(pCondominio || '0'),
      iptu: parseInt(pIptu || '0'),
      caracteristicas: pCaracteristicas,
      diferenciais: pDiferenciais,
      status: pStatus,
      destaque: pDestaque,
      imovel_para_reforma: pReforma,
      exclusivo: pExclusivo,
      midia: midia.length > 0 ? midia : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
      video: pVideo,
      planta: pPlanta,
      tour_virtual: pTour,
      SEO_title: pSEOtitle || `${pTitulo} em ${pBairro} | Aura`,
      SEO_description: pSEOdescription || pDescricao.substring(0, 150)
    };

    try {
      if (formMode === 'add') {
        await api.createProperty(payload);
        triggerSuccessMsg('Residência de alto padrão incorporada ao acervo.');
      } else if (selectedId) {
        await api.updateProperty(selectedId, payload);
        triggerSuccessMsg('Dados da residência redefinidos.');
      }

      await onRefreshData();
      setFormMode('list');
    } catch (err) {
      alert('Erro ao registrar residência.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente este imóvel de luxo do catálogo?')) return;
    try {
      await api.deleteProperty(id);
      await onRefreshData();
      triggerSuccessMsg('Residência removida do acervo.');
    } catch (e) {
      alert('Erro ao deletar imóvel.');
    }
  };

  const handleDevelopmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dNome || !dBairro || !dFaixaPreco) return;

    setActionLoading(true);
    const midia = mediaListString.split('\n').map(u => u.trim()).filter(Boolean);
    const payload = {
      nome: dNome,
      descricao: dDescricao,
      bairro: dBairro,
      cidade: dCidade,
      faixa_preco: dFaixaPreco,
      faixa_metragem: dFaixaMetragem,
      unidades_disponiveis: parseInt(dUnidades || '1'),
      plantas: dPlantas,
      estagio_obra: dEstagio,
      previsao_entrega: dPrevisao,
      midia: midia.length > 0 ? midia : ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'],
      SEO_title: dSEOtitle || `${dNome} ${dBairro} | Aura`,
      SEO_description: dSEOdescription || dDescricao.substring(0, 150)
    };

    try {
      if (formMode === 'add') {
        await api.createDevelopment(payload);
        triggerSuccessMsg('Empreendimento incorporado com sucesso.');
      } else if (selectedId) {
        await api.updateDevelopment(selectedId, payload);
        triggerSuccessMsg('Empreendimento redefinido.');
      }
      await onRefreshData();
      setFormMode('list');
    } catch(err) {
      alert('Erro ao salvar empreendimento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDevelopment = async (id: string) => {
    if (!confirm('Excluir este empreendimento definitivamente de nosso banco?')) return;
    try {
      await api.deleteDevelopment(id);
      await onRefreshData();
      triggerSuccessMsg('Empreendimento excluído.');
    } catch (e) {
      alert('Falha interna ao deletar.');
    }
  };

  const handleBlogPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitulo || !bConteudo || !bCategoria) return;

    setActionLoading(true);
    const payload = {
      titulo: bTitulo,
      conteudo: bConteudo,
      imagem_destacada: bCapa || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      categoria: bCategoria,
      tags: bTags,
      autor: bAutor,
      SEO_title: bSEOtitle || bTitulo,
      SEO_description: bSEOdescription || bConteudo.substring(0, 150)
    };

    try {
      if (formMode === 'add') {
        await api.createBlogPost(payload);
        triggerSuccessMsg('Artigo literário publicado.');
      } else if (selectedId) {
        await api.updateBlogPost(selectedId, payload);
        triggerSuccessMsg('Artigo de blog atualizado.');
      }
      await onRefreshData();
      setFormMode('list');
    } catch (err) {
      alert('Erro ao gerenciar blog.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente este artigo do editorial?')) return;
    try {
      await api.deleteBlogPost(id);
      await onRefreshData();
      triggerSuccessMsg('Artigo de blog deletado.');
    } catch(e) {
      alert('Erro.');
    }
  };

  const handleNeighborhoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nNome || !nDescricao) return;

    setActionLoading(true);
    const fotos = mediaListString.split('\n').map(u => u.trim()).filter(Boolean);
    const payload = {
      nome: nNome,
      descricao: nDescricao,
      fotos: fotos.length > 0 ? fotos : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
      gastronomia: nGastronomia,
      lazer: nLazer,
      cultura: nCultura,
      hospitais: nHospitais,
      escolas: nEscolas,
      mobilidade: nMobilidade,
      seguranca: nSeguranca,
      perfil_publico: nPerfil,
      estilo_vida: nEstilo,
      SEO_title: nSEOtitle || `Bairro ${nNome} de Luxo | Aura`,
      SEO_description: nSEOdescription || nDescricao.substring(0, 150)
    };

    try {
      if (formMode === 'add') {
        await api.createNeighborhood(payload);
        triggerSuccessMsg('Guia de bairro adicionado.');
      } else if (selectedId) {
        await api.updateNeighborhood(selectedId, payload);
        triggerSuccessMsg('Guia regional de bairro atualizado.');
      }
      await onRefreshData();
      setFormMode('list');
    } catch (err) {
      alert('Erro ao registrar perfil do bairro.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNeighborhood = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente o perfil desse bairro do guia?')) return;
    try {
      await api.deleteNeighborhood(id);
      await onRefreshData();
      triggerSuccessMsg('Perfil regional deletado.');
    } catch (e) {
      alert('Erro técnico.');
    }
  };

  // ---------------- MODULE REORDER ACTIONS ----------------
  const handleToggleModule = (mId: string) => {
    const updated = orderedModules.map(m => m.id === mId ? { ...m, ativo: !m.ativo } : m);
    setOrderedModules(updated);
  };

  const handleMoveModule = (direction: 'up' | 'down', index: number) => {
    const nextList = [...orderedModules];
    if (direction === 'up' && index > 0) {
      const temp = nextList[index];
      nextList[index] = nextList[index - 1];
      nextList[index - 1] = temp;
    } else if (direction === 'down' && index < nextList.length - 1) {
      const temp = nextList[index];
      nextList[index] = nextList[index + 1];
      nextList[index + 1] = temp;
    }
    // Re-assign explicit sequence indexes
    const formatted = nextList.map((m, idx) => ({ ...m, ordem: idx + 1 }));
    setOrderedModules(formatted);
  };

  const handleSaveModulesSort = async () => {
    setActionLoading(true);
    try {
      await api.updateHomeModules(orderedModules);
      triggerSuccessMsg('Ordenação e visibilidade dadas aos blocos da Home sincronizadas!');
      onRefreshData();
    } catch (e) {
      alert('Erro ao guardar configurações de módulos.');
    } finally {
      setActionLoading(false);
    }
  };

  // LOGIN INTERFACE OVERLAY GUARD
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FAF9F5]" id="admin-login-guard">
        <div className="bg-white max-w-sm w-full p-8 border border-[#AF9164]/30 shadow-2xl relative">
          
          <div className="absolute top-0 inset-x-0 h-1 bg-[#AF9164]" />
          
          <div className="text-center space-y-2 mb-8">
            <Lock size={28} className="mx-auto text-[#AF9164]" />
            <h2 className="font-serif text-xl tracking-widest text-[#111111] uppercase">Acesso Reservado</h2>
            <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">
              Digite as credenciais corporativas Aura
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 mb-6 leading-relaxed flex items-start gap-2 rounded-none">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-light">
            <div className="space-y-1 block">
              <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold">Email de Trabalho</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@imobiliaria.com"
                className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
              />
            </div>

            <div className="space-y- block">
              <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold">Senha de Assinante</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#111111] hover:bg-[#AF9164] hover:text-white text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-none mt-4"
            >
              {authLoading ? 'CONECTANDO...' : 'REIVINDICAR ACESSO'}
            </button>
          </form>

          <p className="text-center text-[10px] text-[#1A1A1A]/35 tracking-wider uppercase mt-8 block">
            Dica: admin@aura.com.br • admin123
          </p>
        </div>
      </div>
    );
  }

  // CORE PANEL MASTER CANVAS
  return (
    <div id="admin-master-container" className="min-h-screen bg-[#FAF9F5] flex flex-col md:flex-row">
      
      {/* ----------------- ADMIN COMPACT SIDEBAR ----------------- */}
      <aside className="md:w-64 bg-[#111111] text-[#FAF9F5] border-r border-[#AF9164]/20 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex flex-col border-b border-[#AF9164]/20 pb-6 text-center md:text-left select-none">
            <span className="text-xl tracking-[0.3em] font-serif font-light text-white leading-none">AURA PANEL</span>
            <span className="text-[8px] tracking-[0.5em] text-[#AF9164] uppercase mt-1">Governador de Sistema</span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col space-y-1 text-xs uppercase tracking-wider font-semibold text-white/70">
            <button 
              onClick={() => { setActiveTab('leads'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 relative ${activeTab === 'leads' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <MessageSquare size={14} /> CRM Interests ({leads.length})
              {leads.filter(l => l.status === 'novo').length > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-600 rounded-full" />
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('properties'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 ${activeTab === 'properties' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <Home size={14} /> Imóveis Ativos ({properties.length})
            </button>
            <button 
              onClick={() => { setActiveTab('developments'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 ${activeTab === 'developments' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <Layers size={14} /> Empreendimentos ({developments.length})
            </button>
            <button 
              onClick={() => { setActiveTab('blog'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 ${activeTab === 'blog' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <FileText size={14} /> Editorial Blog ({blogPosts.length})
            </button>
            <button 
              onClick={() => { setActiveTab('neighborhoods'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 ${activeTab === 'neighborhoods' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <Compass size={14} /> Guia de Bairros ({neighborhoods.length})
            </button>
            <button 
              onClick={() => { setActiveTab('modules'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 ${activeTab === 'modules' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <Settings size={14} /> Ordenar Dobras Home
            </button>
            <button 
              onClick={() => { setActiveTab('metrics'); setFormMode('list'); }}
              className={`p-3 text-left hover:bg-[#FAF9F5]/5 hover:text-[#AF9164] transition-all flex items-center gap-3 ${activeTab === 'metrics' ? 'bg-[#AF9164]/5 border-l-2 border-[#AF9164] text-[#AF9164]' : ''}`}
            >
              <BarChart2 size={14} /> Métricas de Tráfego
            </button>
          </nav>
        </div>

        {/* User context footer */}
        <div className="pt-6 border-t border-[#AF9164]/20 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <User size={14} className="text-[#AF9164]" />
            <div className="leading-tight shrink-0">
              <p className="font-semibold">Carlos Albuquerque</p>
              <p className="text-[9px] text-[#FAF9F5]/45">CEO Consultor</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-950 text-red-200 border border-red-900 py-1.5 text-[10px] uppercase font-bold tracking-wider hover:bg-red-900 transition-colors"
          >
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* ----------------- ADMIN CONTENT DESK ----------------- */}
      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-x-hidden">
        
        {/* Toast confirmation notifications banner */}
        {successMsg && (
          <div className="bg-[#AF9164]/10 border border-[#AF9164]/40 p-4 leading-relaxed text-xs text-[#AF9164] font-semibold flex items-center gap-2 animate-fade-in rounded-none">
            <Check size={16} /> {successMsg}
          </div>
        )}

        {/* ================================== TAB 1: CRM LEADS INBOX ================================== */}
        {activeTab === 'leads' && (
          <div className="space-y-6" id="dashboard-tab-leads">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <h1 className="text-2xl font-serif text-[#111111] font-light">CRM Interests Inbox</h1>
                <p className="text-xs text-[#1A1A1A]/45 mt-0.5">Gestão confidencial de captações de interesse, propostas e videoconferências marcadas pelo formulário</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white border border-[#1A1A1A]/5 p-12 text-center text-xs text-[#1A1A1A]/40 font-light">
                Não há manifestações registradas de interesse fora do mercado no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map(lead => (
                  <div 
                    key={lead.id} 
                    className={`bg-white border p-6 shadow-sm group transition-all rounded-none ${lead.status === 'novo' ? 'border-red-950 bg-red-500/5' : lead.status === 'atendido' ? 'border-emerald-600/30' : 'border-[#1A1A1A]/5'}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-widest font-bold py-0.5 px-2 ${lead.status === 'novo' ? 'bg-red-800 text-white' : lead.status === 'atendido' ? 'bg-emerald-700 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                            {lead.status === 'novo' ? 'Novo Lead' : lead.status === 'atendido' ? 'Atendido' : 'Arquivado'}
                          </span>
                          <span className="text-[10px] text-[#1A1A1A]/45 font-mono">
                            {new Date(lead.criado_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="font-serif text-base text-[#111111] font-light">{lead.nome}</h4>
                        <div className="text-xs font-light text-[#1A1A1A]/65 flex flex-wrap gap-4">
                          <span>Email: <strong>{lead.email}</strong></span>
                          <span>Tel: <strong>{lead.telefone}</strong></span>
                        </div>
                        <p className="text-xs text-[#1A1A1A]/85 italic bg-[#FAF9F5] p-3 border border-[#1A1A1A]/5 m-2 font-serif">
                          "{lead.mensagem}"
                        </p>
                        {lead.imovel_titulo && (
                          <div className="text-[10px] uppercase text-[#AF9164] font-bold">
                            Imovel Vinculado: <span className="hover:underline cursor-pointer" onClick={() => onNavigate(lead.imovel_titulo.includes('Empreendimento') ? 'development' : 'property', { id: lead.imovel_id })}>{lead.imovel_titulo}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-[#1A1A1A]/40 font-light italic">Fluxo Origem: {lead.origem}</p>
                      </div>

                      {/* Actions Status Select */}
                      <div className="flex items-center gap-3 self-end md:self-center shrink-0 text-xs">
                        <select
                          value={lead.status}
                          onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as any)}
                          className="bg-transparent border border-[#1A1A1A]/10 text-xs py-1 px-3 focus:outline-none"
                        >
                          <option value="novo">Novo</option>
                          <option value="atendido">Atendido</option>
                          <option value="arquivado">Arquivado</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 px-2.5 bg-red-100 text-red-800 hover:bg-red-800 hover:text-white transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================== TAB 2 + Forms: MANAGE PROPERTIES ================================== */}
        {activeTab === 'properties' && (
          <div className="space-y-6" id="dashboard-tab-properties">
            
            {/* List state */}
            {formMode === 'list' && (
              <>
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
                  <div>
                    <h1 className="text-2xl font-serif text-[#111111] font-light">Catálogo de Imóveis Ativos</h1>
                    <p className="text-xs text-[#1A1A1A]/45 mt-0.5">Adicione ou organize residências catalogadas</p>
                  </div>
                  <button 
                    onClick={openAddForm}
                    className="bg-[#111111] text-white hover:bg-[#AF9164] text-xs font-semibold uppercase tracking-[0.15em] py-2.5 px-6 rounded-none flex items-center gap-2"
                  >
                    <Plus size={14} /> Adicionar Imóvel
                  </button>
                </div>

                <div className="bg-white border border-[#1A1A1A]/5 overflow-x-auto">
                  <table className="w-full text-xs text-left text-[#1A1A1A]/80 border-collapse">
                    <thead className="text-[9px] uppercase tracking-widest font-bold text-[#AF9164] border-b border-[#1A1A1A]/15 bg-[#FAF9F5]">
                      <tr>
                        <th className="py-2.5 px-3">Residência de Luxo</th>
                        <th className="py-2.5 px-3 text-center">Bairro</th>
                        <th className="py-2.5 px-3 text-center">Finalidade</th>
                        <th className="py-2.5 px-3 text-center">Preço</th>
                        <th className="py-2.5 px-3 text-center">Destaque</th>
                        <th className="py-2.5 px-3 text-center">Exclusivo</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A]/10 font-light">
                      {properties.map(p => (
                        <tr key={p.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-3 font-serif font-light text-[#111111] max-w-sm truncate">{p.titulo}</td>
                          <td className="py-3 px-3 text-center">{p.bairro}</td>
                          <td className="py-3 px-3 text-center capitalize">{p.finalidade}</td>
                          <td className="py-3 px-3 text-center font-semibold text-[#111111]">R$ {p.valor.toLocaleString('pt')}</td>
                          <td className="py-3 px-3 text-center">{p.destaque ? 'Sim' : 'Não'}</td>
                          <td className="py-3 px-3 text-center">{p.exclusivo ? 'Sim' : 'Não'}</td>
                          <td className="py-3 px-3 text-right flex items-center justify-end gap-2 pt-3">
                            <button 
                              onClick={() => openEditForm(p, 'properties')}
                              className="text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Edit size={12} /> Editar
                            </button>
                            <span>|</span>
                            <button 
                              onClick={() => handleDeleteProperty(p.id)}
                              className="text-red-700 hover:underline flex items-center gap-1"
                            >
                              <Trash size={12} /> Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Add/Edit properties form panel */}
            {(formMode === 'add' || formMode === 'edit') && (
              <div className="bg-white border border-[#AF9164]/30 p-8 shadow-md">
                <div className="flex justify-between items-center border-b border-[#AF9164]/20 pb-4 mb-8">
                  <h3 className="font-serif text-lg font-light text-[#111111]">
                    {formMode === 'add' ? 'Adicionar Nova Residência de Alto Padrão' : `Editando: ${pTitulo}`}
                  </h3>
                  <button 
                    onClick={() => setFormMode('list')}
                    className="text-xs text-[#1A1A1A]/55 uppercase tracking-wide flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                </div>

                <form onSubmit={handlePropertySubmit} className="space-y-6 text-xs font-light">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Título Comercial do Imóvel</label>
                      <input
                        type="text"
                        required
                        value={pTitulo}
                        onChange={(e) => setPTitulo(e.target.value)}
                        placeholder="Ex: Cobertura Triplex Icônica na Quadra da Praia Leblon"
                        className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Tipo da Estrutura</label>
                      <select
                        value={pTipo}
                        onChange={(e) => setPTipo(e.target.value)}
                        className="w-full h-11 bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                      >
                        <option value="Cobertura">Cobertura</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Mansão">Mansão de Enseada</option>
                        <option value="Mansão de Condomínio">Mansão de Condomínio</option>
                        <option value="Casa">Casa Unifamiliar</option>
                        <option value="Chácara de Campo">Chácara de Campo</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Descrição Comentada (Rascunho de Atração)</label>
                    <textarea
                      rows={6}
                      required
                      value={pDescricao}
                      onChange={(e) => setPDescricao(e.target.value)}
                      placeholder="Redija o texto com forte apelo emocional focado no topo do design e arquitetura..."
                      className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Finalidade</label>
                      <select
                        value={pFinalidade}
                        onChange={(e) => setPFinalidade(e.target.value as any)}
                        className="w-full h-11 bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3"
                      >
                        <option value="comprar">Comprar</option>
                        <option value="alugar">Alugar</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Categoria Local</label>
                      <select
                        value={pCategoria}
                        onChange={(e) => setPCategoria(e.target.value as any)}
                        className="w-full h-11 bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3"
                      >
                        <option value="cidade">Cidade / Zona Nobre</option>
                        <option value="campo">Campo / Serra Imperial</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Bairro</label>
                      <input
                        type="text"
                        required
                        value={pBairro}
                        onChange={(e) => setPBairro(e.target.value)}
                        placeholder="Ex: Leblon"
                        className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Valor Absoluto (R$)</label>
                      <input
                        type="number"
                        required
                        value={pValor}
                        onChange={(e) => setPValor(e.target.value)}
                        placeholder="Ex: 19500000"
                        className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Área (m²)</label>
                      <input type="number" required value={pMetragem} onChange={(e) => setPMetragem(e.target.value)} className="w-full bg-[#FAF9F5] border py-3 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Quartos</label>
                      <input type="number" value={pQuartos} onChange={(e) => setPQuartos(e.target.value)} className="w-full bg-[#FAF9F5] border py-3 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Suítes</label>
                      <input type="number" value={pSuites} onChange={(e) => setPSuites(e.target.value)} className="w-full bg-[#FAF9F5] border py-3 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Vagas auto</label>
                      <input type="number" value={pVagas} onChange={(e) => setPVagas(e.target.value)} className="w-full bg-[#FAF9F5] border py-3 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Condomínio</label>
                      <input type="number" value={pCondominio} onChange={(e) => setPCondominio(e.target.value)} className="w-full bg-[#FAF9F5] border py-3 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">IPTU Anual</label>
                      <input type="number" value={pIptu} onChange={(e) => setPIptu(e.target.value)} className="w-full bg-[#FAF9F5] border py-3 px-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Characteristi list */}
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Comodidades e Atributos</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={newCaracteristica} 
                          onChange={(e) => setNewCaracteristica(e.target.value)} 
                          placeholder="Ex: Adega Subterrânea" 
                          className="flex-grow bg-[#FAF9F5] border text-xs py-2 px-3"
                        />
                        <button 
                          type="button" 
                          onClick={() => { if (newCaracteristica) { setPCaracteristicas([...pCaracteristicas, newCaracteristica]); setNewCaracteristica(''); } }}
                          className="bg-[#111111] text-white py-2 px-4 uppercase text-[10px] font-bold"
                        >
                          Mais +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {pCaracteristicas.map((c, i) => (
                          <span key={i} className="bg-[#FAF9F5] border py-1 px-2 text-[9px] flex items-center gap-1 uppercase tracking-wider">
                            {c} <button type="button" onClick={() => setPCaracteristicas(pCaracteristicas.filter((_, idx) => idx !== i))} className="text-red-700 font-bold ml-1">x</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Differentials list */}
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Diferenciais e Autoria</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={newDiferencial} 
                          onChange={(e) => setNewDiferencial(e.target.value)} 
                          placeholder="Ex: Projeto Isay Weinfeld" 
                          className="flex-grow bg-[#FAF9F5] border text-xs py-2 px-3"
                        />
                        <button 
                          type="button" 
                          onClick={() => { if (newDiferencial) { setPDiferenciais([...pDiferenciais, newDiferencial]); setNewDiferencial(''); } }}
                          className="bg-[#111111] text-white py-2 px-4 uppercase text-[10px] font-bold"
                        >
                          Mais +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {pDiferenciais.map((d, i) => (
                          <span key={i} className="bg-[#FAF9F5] border py-1 px-2 text-[9px] flex items-center gap-1 uppercase tracking-wider">
                            {d} <button type="button" onClick={() => setPDiferenciais(pDiferenciais.filter((_, idx) => idx !== i))} className="text-red-700 font-bold ml-1">x</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Media arrays path */}
                  <div className="space-y-1 block">
                    <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Imagens do Imóvel (Uma URL por linha)</label>
                    <textarea
                      rows={4}
                      value={mediaListString}
                      onChange={(e) => setMediaListString(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
                      className="w-full bg-[#FAF9F5] border border-[#1A1A1A]/10 text-xs py-3 px-3 font-mono"
                    />
                  </div>

                  {/* Embed parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Link incorporado Vídeo (YouTube embed)</label>
                      <input type="text" value={pVideo} onChange={(e) => setPVideo(e.target.value)} placeholder="https://www.youtube.com/embed/XXXXX" className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Link Planta Baixa (Mídia URL)</label>
                      <input type="text" value={pPlanta} onChange={(e) => setPPlanta(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">Link Virtual Tour 3D (Matterport iframe)</label>
                      <input type="text" value={pTour} onChange={(e) => setPTour(e.target.value)} placeholder="https://my.matterport.com/show/?m=..." className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                  </div>

                  {/* SEO parameters block */}
                  <div className="bg-[#FAF9F5] p-5 border border-[#AF9164]/20 space-y-4">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#AF9164]">Meta Tags SEO - Indexação Diferenciada</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">SEO Title</label>
                        <input type="text" value={pSEOtitle} onChange={(e) => setPSEOtitle(e.target.value)} placeholder="Cobertura Duplex no Leblon Exclusiva | Aura Imóveis" className="w-full bg-white border py-2.5 px-3" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/55 block font-bold">SEO Meta Description</label>
                        <input type="text" value={pSEOdescription} onChange={(e) => setPSEOdescription(e.target.value)} placeholder="Confira as fotos e plantas dessa cobertura de altíssimo luxo de frente para o mar..." className="w-full bg-white border py-2.5 px-3" />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes controls */}
                  <div className="flex flex-wrap gap-6 pt-4 border-t font-light">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={pDestaque} onChange={() => setPDestaque(!pDestaque)} className="w-4 h-4" />
                      <span>Imóvel em Destaque Especial</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={pReforma} onChange={() => setPReforma(!pReforma)} className="w-4 h-4" />
                      <span>Oportunidade p/ Reforma (Retrofit)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={pExclusivo} onChange={() => setPExclusivo(!pExclusivo)} className="w-4 h-4" />
                      <span>Exclusividade Exclusiva Aura</span>
                    </label>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-[#AF9164] hover:bg-[#111111] text-white py-3.5 px-8 font-bold uppercase tracking-[0.2em] border-none transition-all"
                    >
                      {actionLoading ? 'SALVANDO...' : 'SAlVAR IMÓVEL'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMode('list')}
                      className="border border-[#1A1A1A]/20 py-3.5 px-8 uppercase font-bold tracking-[0.2em]"
                    >
                      Voltar ao catálogo
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        )}

        {/* ================================== TAB 3: MANAGE DEVELOPMENTS ================================== */}
        {activeTab === 'developments' && (
          <div className="space-y-6" id="dashboard-tab-developments">
            {formMode === 'list' && (
              <>
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
                  <div>
                    <h1 className="text-2xl font-serif text-[#111111] font-light">Edifícios e Empreendimentos de Grife</h1>
                    <p className="text-xs text-[#1A1A1A]/45 mt-0.5">Gerencie os lançamentos e as fases construtivas</p>
                  </div>
                  <button 
                    onClick={openAddForm}
                    className="bg-[#111111] text-white hover:bg-[#AF9164] text-xs font-semibold uppercase tracking-[0.15em] py-2.5 px-6 rounded-none flex items-center gap-2"
                  >
                    <Plus size={14} /> Novo Empreendimento
                  </button>
                </div>

                <div className="bg-white border border-[#1A1A1A]/10 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-[9px] uppercase tracking-widest font-bold text-[#AF9164] border-b bg-[#FAF9F5]">
                      <tr>
                        <th className="py-2.5 px-3">Nome do Empreendimento</th>
                        <th className="py-2.5 px-3 text-center">Bairro</th>
                        <th className="py-2.5 px-3 text-center">Referência Faixa</th>
                        <th className="py-2.5 px-3 text-center">Estágio de Obra</th>
                        <th className="py-2.5 px-3 text-center">Entrega</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-light">
                      {developments.map(d => (
                        <tr key={d.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-3 font-serif font-light text-[#111111]">{d.nome}</td>
                          <td className="py-3 px-3 text-center">{d.bairro}</td>
                          <td className="py-3 px-3 text-center">{d.faixa_preco}</td>
                          <td className="py-3 px-3 text-center capitalize font-semibold">{d.estagio_obra}</td>
                          <td className="py-3 px-3 text-center">{d.previsao_entrega}</td>
                          <td className="py-3 px-3 text-right flex items-center justify-end gap-2 pt-3">
                            <button onClick={() => openEditForm(d, 'developments')} className="text-emerald-800 hover:underline">Editar</button>
                            <span>|</span>
                            <button onClick={() => handleDeleteDevelopment(d.id)} className="text-red-700 hover:underline">Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {(formMode === 'add' || formMode === 'edit') && (
              <div className="bg-white border border-[#AF9164]/30 p-8">
                <h3 className="font-serif text-lg font-light text-[#111111] border-b pb-4 mb-6">Empreendimento</h3>
                <form onSubmit={handleDevelopmentSubmit} className="space-y-6 text-xs font-light">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1 block">
                      <label className="text-[9px] uppercase tracking-wider block font-bold">Nome da Torre</label>
                      <input type="text" required value={dNome} onChange={(e) => setDNome(e.target.value)} className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                    <div className="space-y-1 block">
                      <label className="text-[9px] uppercase tracking-wider block font-bold">Bairro</label>
                      <input type="text" required value={dBairro} onChange={(e) => setDBairro(e.target.value)} className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[9px] uppercase tracking-wider block font-bold">Descrição</label>
                    <textarea rows={4} required value={dDescricao} onChange={(e) => setDDescricao(e.target.value)} className="w-full bg-[#FAF9F5] border py-2.5 px-3 resize-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase block font-bold">Faixa de Preço</label>
                      <input type="text" required value={dFaixaPreco} onChange={(e) => setDFaixaPreco(e.target.value)} placeholder="R$ 5M a R$ 12M" className="w-full bg-[#FAF9F5] border py-2 px-3" />
                    </div>
                    <div className="space-y-1 font-light">
                      <label className="text-[9px] uppercase block font-bold">Faixa Metragem</label>
                      <input type="text" required value={dFaixaMetragem} onChange={(e) => setDFaixaMetragem(e.target.value)} placeholder="160m² a 320m²" className="w-full bg-[#FAF9F5] border py-2 px-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase block font-bold">Estágio de Obra</label>
                      <select value={dEstagio} onChange={(e) => setDEstagio(e.target.value as any)} className="w-full h-10 bg-[#FAF9F5] border">
                        <option value="lancamento">Lançamento</option>
                        <option value="em_obras">Em Obras</option>
                        <option value="pronto">Pronto</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase block font-bold">Disponíveis</label>
                      <input type="number" value={dUnidades} onChange={(e) => setDUnidades(e.target.value)} className="w-full bg-[#FAF9F5] border py-2 px-3" />
                    </div>
                  </div>

                  {/* Plants Strings addition helper */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider">Plantas Tipológicas</label>
                    <div className="flex gap-2">
                      <input type="text" value={newDPlanta} onChange={(e) => setNewDPlanta(e.target.value)} placeholder="Ex: Penthouse Floresta de 280m²" className="flex-grow bg-[#FAF9F5] border py-2 px-3" />
                      <button type="button" onClick={() => { if (newDPlanta) { setDPlantas([...dPlantas, newDPlanta]); setNewDPlanta(''); } }} className="bg-black text-white px-4 py-2">Ok</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dPlantas.map((pl, idx) => (
                        <span key={idx} className="bg-[#FAF9F5] border py-1 px-2 text-[9px] flex items-center font-bold">
                          {pl} <button type="button" onClick={() => setDPlantas(dPlantas.filter((_, i) => i !== idx))} className="text-red-700 ml-1 font-bold">x</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 mt-2">
                    <label className="text-[9px] uppercase font-bold">Fotos (URL por linha)</label>
                    <textarea rows={3} value={mediaListString} onChange={(e) => setMediaListString(e.target.value)} className="w-full bg-[#FAF9F5] border py-2 px-3 font-mono" />
                  </div>

                  <div className="bg-[#FAF9F5] p-4 border border-[#AF9164]/20 space-y-4">
                    <span className="text-[9px] uppercase font-bold text-[#AF9164]">Meta Tags SEO</span>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={dSEOtitle} onChange={(e) => setDSEOtitle(e.target.value)} placeholder="SEO Title" className="bg-white py-2 px-3 border" />
                      <input type="text" value={dSEOdescription} onChange={(e) => setDSEOdescription(e.target.value)} placeholder="SEO Meta Description" className="bg-white py-2 px-3 border" />
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button type="submit" className="bg-[#AF9164] text-white py-3 px-8 uppercase font-bold">Salvar Lançamento</button>
                    <button type="button" onClick={() => setFormMode('list')} className="border py-3 px-8 uppercase font-bold">Voltar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================================== TAB 4: EDITORIAL BLOG CRUD ================================== */}
        {activeTab === 'blog' && (
          <div className="space-y-6" id="dashboard-tab-blog">
            {formMode === 'list' && (
              <>
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-2xl font-serif font-light">Editorial de Luxo Aura</h1>
                    <p className="text-xs text-[#1A1A1A]/40 mt-0.5">Gestão de publicações artísticas e notas de tendência</p>
                  </div>
                  <button onClick={openAddForm} className="bg-[#111111] text-white py-2.5 px-6 uppercase text-xs font-semibold tracking-wider flex items-center gap-2">
                    <Plus size={14} /> Novo Artigo
                  </button>
                </div>

                <div className="bg-white border border-[#1A1A1A]/10 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-[9px] uppercase tracking-widest font-bold text-[#AF9164] bg-[#FAF9F5]">
                      <tr>
                        <th className="py-2.5 px-3">Título do Artigo</th>
                        <th className="py-2.5 px-3 text-center">Categoria</th>
                        <th className="py-2.5 px-3 text-center">Autor</th>
                        <th className="py-2.5 px-3 text-center">Publicação</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-light">
                      {blogPosts.map(post => (
                        <tr key={post.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-3 font-serif truncate max-w-sm">{post.titulo}</td>
                          <td className="py-3 px-3 text-center">{post.categoria}</td>
                          <td className="py-3 px-3 text-center">{post.autor}</td>
                          <td className="py-3 px-3 text-center">{new Date(post.publicado_em).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-3 text-right flex items-center justify-end gap-2 pt-3">
                            <button onClick={() => openEditForm(post, 'blog')} className="text-emerald-800 font-semibold hover:underline">Editar</button>
                            <span>|</span>
                            <button onClick={() => handleDeletePost(post.id)} className="text-red-700 hover:underline">Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {(formMode === 'add' || formMode === 'edit') && (
              <div className="bg-white border border-[#AF9164]/30 p-8">
                <form onSubmit={handleBlogPostSubmit} className="space-y-6 text-xs font-light">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase block font-bold">Título do Artigo</label>
                    <input type="text" required value={bTitulo} onChange={(e) => setBTitulo(e.target.value)} className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1 block">
                      <label className="text-[9px] uppercase block font-bold">Categoria</label>
                      <input type="text" required value={bCategoria} onChange={(e) => setBCategoria(e.target.value)} placeholder="Ex: Tendências de Design" className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                    <div className="space-y-1 block">
                      <label className="text-[9px] uppercase block font-bold">Capa (URL da Imagem)</label>
                      <input type="text" required value={bCapa} onChange={(e) => setBCapa(e.target.value)} className="w-full bg-[#FAF9F5] border py-2.5 px-3" />
                    </div>
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[9px] uppercase block font-bold">Conteúdo Integral</label>
                    <textarea rows={10} required value={bConteudo} onChange={(e) => setBConteudo(e.target.value)} className="w-full bg-[#FAF9F5] border py-2.5 px-3 resize-none font-sans" />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="submit" className="bg-[#AF9164] text-white py-3 px-8 uppercase font-bold">SAlVAR ARTIGO</button>
                    <button type="button" onClick={() => setFormMode('list')} className="border py-3 px-8 uppercase font-bold text-center">Voltar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================================== TAB 5: NEIGHBORHOODS GUIDES CRUD ================================== */}
        {activeTab === 'neighborhoods' && (
          <div className="space-y-6" id="dashboard-tab-neighborhoods">
            {formMode === 'list' && (
              <>
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-2xl font-serif font-light">Guias de Estilo e Bairros</h1>
                    <p className="text-xs text-[#1A1A1A]/40 mt-0.5">Gerencie os perfis de vida e serviços das localidades de venda</p>
                  </div>
                  <button onClick={openAddForm} className="bg-[#111111] text-white py-2.5 px-6 uppercase text-xs font-semibold tracking-wider flex items-center gap-2">
                    <Plus size={14} /> Novo Guia Bairro
                  </button>
                </div>

                <div className="bg-white border text-xs overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#FAF9F5] text-[#AF9164] font-bold">
                      <tr>
                        <th className="py-2 px-3">Bairro</th>
                        <th className="py-2 px-3 text-center">Estilo de Vida</th>
                        <th className="py-2 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-light">
                      {neighborhoods.map(n => (
                        <tr key={n.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-3 font-serif">{n.nome}</td>
                          <td className="py-3 px-3 text-center italic">"{n.estilo_vida}"</td>
                          <td className="py-3 px-3 text-right flex items-center justify-end gap-2 pt-3">
                            <button onClick={() => openEditForm(n, 'neighborhoods')} className="text-emerald-800 font-semibold hover:underline">Editar</button>
                            <span>|</span>
                            <button onClick={() => handleDeleteNeighborhood(n.id)} className="text-red-700 hover:underline">Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {(formMode === 'add' || formMode === 'edit') && (
              <div className="bg-white border p-8">
                <form onSubmit={handleNeighborhoodSubmit} className="space-y-6 text-xs font-light">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" required value={nNome} onChange={(e) => setNNome(e.target.value)} placeholder="Nome do Bairro (Ex: Leblon)" className="bg-[#FAF9F5] py-2.5 px-3 border" />
                    <input type="text" value={nEstilo} onChange={(e) => setNEstilo(e.target.value)} placeholder="Frase Estilo de Vida" className="bg-[#FAF9F5] py-2.5 px-3 border" />
                  </div>
                  <textarea rows={4} required value={nDescricao} onChange={(e) => setNDescricao(e.target.value)} placeholder="Descrição geral do ambiente..." className="w-full bg-[#FAF9F5] py-2.5 px-3 border" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" value={nGastronomia} onChange={(e) => setNGastronomia(e.target.value)} placeholder="Gastronomia regional" className="bg-[#FAF9F5] py-2 px-3 border" />
                    <input type="text" value={nLazer} onChange={(e) => setNLazer(e.target.value)} placeholder="Lazer e atividades" className="bg-[#FAF9F5] py-2 px-3 border" />
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[9px] uppercase font-bold">Fotos (URLs, uma por linha)</label>
                    <textarea rows={3} value={mediaListString} onChange={(e) => setMediaListString(e.target.value)} className="w-full bg-[#FAF9F5] border" />
                  </div>

                  <div className="pt-6 flex gap-4 animate-fade-in">
                    <button type="submit" className="bg-[#AF9164] text-white py-3.5 px-8 font-bold">GUARDAR GUIA</button>
                    <button type="button" onClick={() => setFormMode('list')} className="border py-3 px-8 font-bold">Voltar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================================== TAB 6: DYNAMIC HOME SECTIONS REORDER WEIGHTS ================================== */}
        {activeTab === 'modules' && (
          <div className="space-y-6" id="dashboard-tab-modules">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-2xl font-serif font-light">Ordenar Dobras da Home</h1>
                <p className="text-xs text-[#1A1A1A]/45 mt-0.5">Defina se um módulo estará ativo e reordene dinamicamente a hierarquia arrastando ou clicando nas setas de peso</p>
              </div>
              <button 
                onClick={handleSaveModulesSort}
                disabled={actionLoading}
                className="bg-[#AF9164] hover:bg-[#111111] text-white py-2.5 px-6 uppercase text-xs tracking-wider font-semibold"
              >
                {actionLoading ? 'GRAVANDO...' : 'Sincronizar Layout Home'}
              </button>
            </div>

            <div className="space-y-3 max-w-3xl">
              {orderedModules.map((mod, idx) => (
                <div 
                  key={mod.id} 
                  className={`bg-white p-4 border flex items-center justify-between shadow-sm rounded-none transition-all ${mod.ativo ? 'border-[#AF9164]/30' : 'border-[#1A1A1A]/5 opacity-55 bg-neutral-100'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Index weight badge */}
                    <span className="w-7 h-7 rounded-full bg-[#111111] text-[#E5D5C0] font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div className="leading-tight">
                      <h4 className="font-serif text-sm font-semibold text-[#111111]">{mod.titulo}</h4>
                      <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-mono">Identificador Técnico: {mod.id}</p>
                    </div>
                  </div>

                  {/* Order Weight arrows and active toggle */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider text-[#1A1A1A]/60 font-semibold select-none">
                      <input 
                        type="checkbox" 
                        checked={mod.ativo} 
                        onChange={() => handleToggleModule(mod.id)}
                        className="w-4 h-4 text-[#AF9164] border-gray-300"
                      />
                      <span>{mod.ativo ? 'Visível' : 'Ocultado'}</span>
                    </label>

                    <div className="flex space-x-1 border-l border-[#1A1A1A]/10 pl-4 shrink-0">
                      <button 
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveModule('up', idx)}
                        className={`p-1.5 border hover:bg-neutral-50 transition-colors ${idx === 0 ? 'text-neutral-300' : 'text-[#111111]'}`}
                        aria-label="Subir"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button 
                        type="button"
                        disabled={idx === orderedModules.length - 1}
                        onClick={() => handleMoveModule('down', idx)}
                        className={`p-1.5 border hover:bg-neutral-50 transition-colors ${idx === orderedModules.length - 1 ? 'text-neutral-300' : 'text-[#111111]'}`}
                        aria-label="Descer"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-[#1A1A1A]/10 max-w-3xl flex justify-end">
              <button 
                onClick={handleSaveModulesSort}
                className="bg-[#111111] hover:bg-[#AF9164] text-white font-bold py-3 px-8 text-xs uppercase tracking-widest rounded-none shadow-md transition-colors"
              >
                Gravar Configuração de Hierarquia
              </button>
            </div>
          </div>
        )}

        {/* ================================== TAB 7: RICH TELEMETRY GRAPH WORKSPACE ================================== */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fade-in" id="dashboard-tab-metrics">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <h1 className="text-2xl font-serif text-[#111111] font-light flex items-center gap-2">
                  <BarChart2 size={24} className="text-[#AF9164]" /> Governança de Tráfego & Telemetria VIP
                </h1>
                <p className="text-xs text-[#1A1A1A]/45 mt-0.5">Relatório consolidador retrospectivo de conversões, interesses e canais de atração orgânica</p>
              </div>
              <button 
                onClick={onRefreshData}
                className="bg-transparent border border-[#AF9164]/30 text-[#AF9164] py-2 px-4 uppercase text-[10px] tracking-wider font-bold flex items-center gap-1.5 rounded-none"
              >
                <RefreshCw size={12} /> Sincronizar Dados
              </button>
            </div>

            {/* Standalone telemetry graphs inlined */}
            <MetricsView />
          </div>
        )}

      </main>

    </div>
  );
}
