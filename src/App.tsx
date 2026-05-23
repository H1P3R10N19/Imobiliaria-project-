import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import ResultsView from './components/ResultsView';
import PropertyView from './components/PropertyView';
import DevelopmentView from './components/DevelopmentView';
import NeighborhoodsList from './components/NeighborhoodsList';
import NeighborhoodView from './components/NeighborhoodView';
import BlogView from './components/BlogView';
import BlogPostView from './components/BlogPostView';
import AboutView from './components/AboutView';
import AdminView from './components/AdminView';

import { api, trackEvent } from './api';
import { Property, Development, Neighborhood, BlogPost, Lead, HomeModuleConfig, AdminUser } from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface PageState {
  type: 'home' | 'results' | 'property' | 'development' | 'neighborhoods' | 'neighborhood' | 'blog' | 'blog-post' | 'about' | 'admin';
  params?: any;
}

export default function App() {
  const [activePage, setActivePage] = useState<PageState>({ type: 'home' });
  const [isAdmin, setIsAdmin] = useState(false);

  // Core collections data state of catalog
  const [properties, setProperties] = useState<Property[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [homeModules, setHomeModules] = useState<HomeModuleConfig[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Telemetry indicators
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sincronizar banco de dados local
  const loadDatabase = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carregar apenas os dados públicos primordiais de forma paralela
      const [propsData, devsData, neighborhoodsData, blogsData, modulesData] = await Promise.all([
        api.getProperties(),
        api.getDevelopments(),
        api.getNeighborhoods(),
        api.getBlogPosts(),
        api.getHomeModules()
      ]);

      setProperties(propsData || []);
      setDevelopments(devsData || []);
      setNeighborhoods(neighborhoodsData || []);
      setBlogPosts(blogsData || []);
      setHomeModules(modulesData || []);

      // Verificar autenticação opcional do administrador de forma silenciosa e segura
      const token = localStorage.getItem('aura_admin_token');
      if (token) {
        try {
          const user = await api.me();
          if (user) {
            setIsAdmin(true);
            const fetchedLeads = await api.getLeads();
            setLeads(fetchedLeads || []);
          } else {
            setIsAdmin(false);
          }
        } catch (authError) {
          // Token inválido/expirado, limpa-o de forma silenciosa sem quebrar a Home pública
          setIsAdmin(false);
          localStorage.removeItem('aura_admin_token');
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err: any) {
      // Mensagem amigável de erro
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Synchronize layout elements on refresh
  const handleRefreshAllData = async () => {
    await loadDatabase();
  };

  // Hash Parsing for deep-linking routing
  const parseHash = (): PageState => {
    const hash = window.location.hash || '#home';
    const [route, query] = hash.split('?');
    const type = (route.replace('#', '') || 'home') as PageState['type'];
    const params: any = {};
    if (query) {
      query.split('&').forEach(part => {
        const [key, val] = part.split('=');
        if (key) {
          // Parse true/false values safely
          const decoded = decodeURIComponent(val || '');
          if (decoded === 'true') params[key] = true;
          else if (decoded === 'false') params[key] = false;
          else params[key] = decoded;
        }
      });
    }
    return { type, params };
  };

  // Router handler mapping back to window.hash change
  const navigateTo = (page: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let queryStr = '';
    if (params) {
      queryStr = '?' + Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&');
    }
    // Update hash which triggers hashchange listener
    window.location.hash = `#${page}${queryStr}`;
  };

  // Effect listeners
  useEffect(() => {
    loadDatabase();

    // Setup Hashchange trigger
    const handleHashChange = () => {
      const parsed = parseHash();
      setActivePage(parsed);
      
      // Track screen page view analytics
      trackEvent('page_view', `/${parsed.type}`, `Visited ${parsed.type}`);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initial parse boot
    const initial = parseHash();
    setActivePage(initial);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update leads when admin signs in
  useEffect(() => {
    if (isAdmin) {
      api.getLeads().then(setLeads).catch(console.error);
    } else {
      setLeads([]);
    }
  }, [isAdmin]);

  // Unified Lead Submittal handler
  const handleLeadSubmit = async (leadData: Omit<Lead, 'id' | 'criado_em' | 'status'>) => {
    try {
      const savedLead = await api.createLead(leadData);
      if (savedLead) {
        trackEvent('lead_submitted', '/form', `Lead saved: ${leadData.nome}`);
        
        // If logged as admin, sync CRM table list dynamically
        if (isAdmin) {
          const fetchedLeads = await api.getLeads();
          setLeads(fetchedLeads || []);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAdmin(false);
    navigateTo('home');
  };

  // Loader UI state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 space-y-4 font-light text-[#1A1A1A]">
        <RefreshCw size={40} className="text-[#AF9164] animate-spin" />
        <div className="text-center space-y-1 select-none">
          <span className="text-xl tracking-[0.4em] uppercase font-serif">AURA</span>
          <span className="text-[9px] tracking-[0.5em] text-[#AF9164] block font-sans">IMÓVEIS DE LUXO</span>
        </div>
        <p className="text-[11px] uppercase tracking-widest text-zinc-400">Restaurando Governança Patrimonial...</p>
      </div>
    );
  }

  // Crash screen error handling
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-8 font-light text-[#1a1a1a]">
        <div className="bg-white p-8 max-w-md w-full border border-red-800/20 text-center space-y-4 shadow-xl">
          <AlertCircle size={48} className="text-red-700 mx-auto" />
          <h2 className="font-serif text-lg font-normal">Aviso</h2>
          <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">{error}</p>
          <button 
            onClick={loadDatabase}
            className="w-full bg-[#111111] hover:bg-[#AF9164] text-white py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Render current active subviews dynamically
  const renderPageContent = () => {
    switch (activePage.type) {
      case 'results':
        return (
          <ResultsView 
            properties={properties} 
            initialFilters={activePage.params} 
            onNavigate={navigateTo} 
          />
        );
      
      case 'property':
        return (
          <PropertyView 
            propertyId={activePage.params?.id} 
            allProperties={properties}
            neighborhoods={neighborhoods}
            onNavigate={navigateTo}
            onSubmitLead={handleLeadSubmit}
          />
        );

      case 'development':
        return (
          <DevelopmentView 
            developmentId={activePage.params?.id}
            allDevelopments={developments}
            onNavigate={navigateTo}
            onSubmitLead={handleLeadSubmit}
          />
        );

      case 'neighborhoods':
        return (
          <NeighborhoodsList 
            neighborhoods={neighborhoods} 
            onNavigate={navigateTo} 
          />
        );

      case 'neighborhood':
        return (
          <NeighborhoodView 
            neighborhoodId={activePage.params?.id}
            neighborhoods={neighborhoods}
            properties={properties}
            onNavigate={navigateTo}
          />
        );

      case 'blog':
        return (
          <BlogView 
            blogPosts={blogPosts} 
            onNavigate={navigateTo} 
          />
        );

      case 'blog-post':
        return (
          <BlogPostView 
            postId={activePage.params?.id}
            blogPosts={blogPosts}
            onNavigate={navigateTo}
          />
        );

      case 'about':
        return (
          <AboutView 
            initialScrollToContact={activePage.params?.scrollToContact}
            onSubmitLead={handleLeadSubmit}
          />
        );

      case 'admin':
        return (
          <AdminView 
            properties={properties}
            developments={developments}
            neighborhoods={neighborhoods}
            blogPosts={blogPosts}
            homeModules={homeModules}
            leads={leads}
            onRefreshData={handleRefreshAllData}
            onNavigate={navigateTo}
          />
        );

      case 'home':
      default:
        return (
          <HomeView 
            properties={properties}
            developments={developments}
            neighborhoods={neighborhoods}
            blogPosts={blogPosts}
            homeModules={homeModules}
            onNavigate={navigateTo}
            onSubmitLead={handleLeadSubmit}
          />
        );
    }
  };

  return (
    <Layout 
      activePage={activePage.type} 
      onNavigate={navigateTo} 
      isAdmin={isAdmin}
      onLogout={handleLogout}
    >
      {renderPageContent()}
    </Layout>
  );
}
