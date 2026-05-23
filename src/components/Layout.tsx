import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Phone, MapPin, Shield, HelpCircle, FileText } from 'lucide-react';
import { trackEvent } from '../api';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string, params?: any) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Layout({ children, activePage, onNavigate, isAdmin, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true); // default to hide, check storage
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('aura_cookie_consent');
    if (!consent) {
      setCookieConsent(false);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('aura_cookie_consent', 'accepted');
    setCookieConsent(true);
    trackEvent('page_view', activePage, 'Cookie Consent Accepted');
  };

  const handleNavigation = (page: string, params?: any) => {
    setMobileMenuOpen(false);
    onNavigate(page, params);
  };

  return (
    <div id="layout-root" className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] font-sans antialiased flex flex-col selection:bg-[#C5A880] selection:text-white">
      {/* Upper Announcement bar for Tuanny Magalhães personalized service */}
      <div className="bg-[#111111] text-[#E5D5C0] text-xs text-center py-2 px-4 letter-spacing tracking-[0.15em] uppercase font-light border-b border-[#2C2720]/20">
        Assessoria Imobiliária Privada & Consultoria de Arte Residencial • Rio de Janeiro & Região Serrana
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#1A1A1A]/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo Brand Design */}
          <div 
            onClick={() => handleNavigation('home')} 
            className="cursor-pointer group flex flex-col items-center select-none"
            id="header-logo"
          >
            <span className="text-xl font-light tracking-[0.2em] text-[#111111] group-hover:text-[#AF9164] transition-colors duration-500 font-serif">
              Tuanny Magalhães
            </span>
            <span className="text-[9px] tracking-[0.4em] text-[#AF9164] -mt-1 font-sans uppercase">
              IMÓVEIS DE LUXO
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/80">
            <button 
              onClick={() => handleNavigation('home')} 
              className={`hover:text-[#AF9164] transition-colors ${activePage === 'home' ? 'text-[#AF9164] border-b border-[#AF9164]/30 pb-1' : ''}`}
            >
              Início
            </button>
            <button 
              onClick={() => handleNavigation('results', { finalidade: 'comprar' })} 
              className={`hover:text-[#AF9164] transition-colors ${activePage === 'results' ? 'text-[#AF9164]' : ''}`}
            >
              Comprar
            </button>
            <button 
              onClick={() => handleNavigation('results', { finalidade: 'alugar' })} 
              className="hover:text-[#AF9164] transition-colors"
            >
              Alugar
            </button>
            <button 
              onClick={() => handleNavigation('neighborhoods')} 
              className={`hover:text-[#AF9164] transition-colors ${activePage === 'neighborhoods' || activePage === 'neighborhood' ? 'text-[#AF9164]' : ''}`}
            >
              Guia de Bairros
            </button>
            <button 
              onClick={() => handleNavigation('blog')} 
              className={`hover:text-[#AF9164] transition-colors ${activePage === 'blog' || activePage === 'blog-post' ? 'text-[#AF9164]' : ''}`}
            >
              Blog
            </button>
            <button 
              onClick={() => handleNavigation('about')} 
              className={`hover:text-[#AF9164] transition-colors ${activePage === 'about' ? 'text-[#AF9164]' : ''}`}
            >
              A Empresa
            </button>
          </nav>

          {/* Action buttons & Administrative Area */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handleNavigation('admin')} 
                  className="bg-[#111111] hover:bg-[#AF9164] text-white hover:text-[#111111] transition-all text-[11px] font-bold uppercase tracking-[0.15em] py-2 px-5 rounded-none"
                >
                  Painel Admin
                </button>
                <button 
                  onClick={onLogout} 
                  className="text-xs text-red-700 hover:text-red-900 font-bold uppercase tracking-wider transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleNavigation('admin')}
                className="border border-[#1A1A1A]/30 hover:border-[#AF9164] text-[#1A1A1A] hover:text-[#AF9164] transition-all text-[10px] font-bold uppercase tracking-[0.15em] py-2 px-4"
              >
                Acesso Privado
              </button>
            )}

            <button 
              onClick={() => handleNavigation('about', { scrollToContact: true })}
              className="bg-[#AF9164] hover:bg-[#111111] text-white text-[11px] font-semibold uppercase tracking-[0.2em] py-2.5 px-6 transition-all duration-300"
            >
              Atendimento VIP
            </button>
          </div>

          {/* Mobile drawer toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-[#111111] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col justify-between p-8" id="mobile-menu">
          <div className="flex justify-between items-center">
            <div className="text-lg font-serif tracking-[0.15em] font-light uppercase">Tuanny Magalhães</div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-[#111111]">
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col space-y-6 text-center text-lg uppercase tracking-[0.2em] font-light my-auto">
            <button onClick={() => handleNavigation('home')} className="hover:text-[#AF9164] py-2">Início</button>
            <button onClick={() => handleNavigation('results', { finalidade: 'comprar' })} className="hover:text-[#AF9164] py-2">Comprar</button>
            <button onClick={() => handleNavigation('results', { finalidade: 'alugar' })} className="hover:text-[#AF9164] py-2">Alugar</button>
            <button onClick={() => handleNavigation('neighborhoods')} className="hover:text-[#AF9164] py-2">Guia de Bairros</button>
            <button onClick={() => handleNavigation('blog')} className="hover:text-[#AF9164] py-2">Blog Editora</button>
            <button onClick={() => handleNavigation('about')} className="hover:text-[#AF9164] py-2">A Empresa</button>
            
            {isAdmin ? (
              <>
                <button onClick={() => handleNavigation('admin')} className="text-[#AF9164] font-semibold py-2">Administração</button>
                <button onClick={() => { setMobileMenuOpen(false); onLogout(); }} className="text-red-700 font-bold py-2">Desconectar</button>
              </>
            ) : (
              <button onClick={() => handleNavigation('admin')} className="text-xs tracking-widest text-[#1A1A1A]/60 py-2">Login Admin</button>
            )}
          </nav>

          <div className="flex flex-col space-y-4 items-center">
            <button 
              onClick={() => handleNavigation('about', { scrollToContact: true })}
              className="w-full bg-[#AF9164] text-white py-3 font-semibold uppercase tracking-[0.15em] text-xs text-center"
            >
              Falar com Consultor
            </button>
            <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">
              Tuanny Magalhães Imóveis Exclusivos © 2026
            </p>
          </div>
        </div>
      )}

      {/* Primary Page Canvas */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Premium Elegant Footer */}
      <footer className="bg-[#111111] text-[#FAF9F5] border-t border-[#AF9164]/20 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo Column */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-light tracking-[0.2em] font-serif">Tuanny Magalhães</span>
              <span className="text-[10px] tracking-[0.4em] text-[#AF9164] uppercase -mt-1">
                IMÓVEIS DE LUXO
              </span>
            </div>
            <p className="text-xs text-[#E5D5C0]/60 leading-relaxed max-w-sm font-light">
              Uma curadoria de residências excepcionais e de alto padrão criadas pelos maiores expoentes da arquitetura brasileira. Oferecemos governança imobiliária completa com discrição absoluta.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#AF9164] mb-6">Explore</h4>
            <div className="flex flex-col space-y-3 text-xs text-[#FAF9F5]/70">
              <button onClick={() => handleNavigation('results', { finalidade: 'comprar' })} className="hover:text-[#AF9164] transition-colors text-left">Imóveis Disponíveis</button>
              <button onClick={() => handleNavigation('results', { categoria: 'campo' })} className="hover:text-[#AF9164] transition-colors text-left">Casas de Campo</button>
              <button onClick={() => handleNavigation('results', { imovel_para_reforma: true })} className="hover:text-[#AF9164] transition-colors text-left">Imóveis para Reforma</button>
              <button onClick={() => handleNavigation('neighborhoods')} className="hover:text-[#AF9164] transition-colors text-left">Lifestyle & Guia de Bairros</button>
              <button onClick={() => handleNavigation('blog')} className="hover:text-[#AF9164] transition-colors text-left">Artigos e Tendências</button>
            </div>
          </div>

          {/* Legal and Support Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#AF9164] mb-6">Governança</h4>
            <div className="flex flex-col space-y-3 text-xs text-[#FAF9F5]/70">
              <button onClick={() => handleNavigation('about')} className="hover:text-[#AF9164] transition-colors text-left">Sobre Tuanny Magalhães</button>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-[#AF9164] transition-colors text-left">Política de Privacidade (LGPD)</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-[#AF9164] transition-colors text-left">Termos de Uso e Condições</button>
              <button onClick={() => handleNavigation('admin')} className="hover:text-[#AF9164] transition-colors text-left">Área Administrativa Secreta</button>
              <span className="text-[11px] text-[#AF9164] tracking-wide font-light">CRECI-RJ: 45.890-F</span>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#AF9164] mb-6">Atendimento VIP</h4>
            <div className="space-y-4 text-xs text-[#FAF9F5]/70">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-[#AF9164] mt-0.5 shrink-0" />
                <span>Av. Delfim Moreira, 1020 - Leblon<br />Rio de Janeiro - RJ, Brasil</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-[#AF9164] shrink-0" />
                <span>+55 (21) 98888-7711</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-[#AF9164] shrink-0" />
                <span>contato@tuannymagalhaes.com.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote and licensing */}
        <div className="max-w-7xl mx-auto border-t border-[#E5D5C0]/10 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#FAF9F5]/45 tracking-widest uppercase font-light gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <p>
              TUANNY MAGALHÃES IMÓVEIS PREMIUM LTDA © {new Date().getFullYear()} • TODOS OS DIREITOS RESERVADOS
            </p>
            <p className="text-[10px] text-[#FAF9F5]/30 tracking-[0.2em] font-light">
              PRODUÇÃO E PROJETO POR <span className="text-[#AF9164]/70 font-normal">GABRIEL MAGALHÃES TM</span> • RESPONSÁVEL DO PROJETO
            </p>
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <span>Privacidade Assegurada</span>
            <span>•</span>
            <span>Segurança Criptografada</span>
          </div>
        </div>
      </footer>

      {/* ----------------- PRIVATE LEGAL DIALOGS ----------------- */}
      {/* Privacy Policy Block (LGPD Compliant) */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 animate-fade-in" id="dialog-privacy">
          <div className="bg-[#FAF9F5] text-[#1A1A1A] max-w-2xl w-full p-8 overflow-y-auto max-h-[80vh] border border-[#AF9164]/30 relative rounded-none shadow-2xl">
            <button 
              onClick={() => setShowPrivacy(false)} 
              className="absolute top-4 right-4 text-[#1A1A1A] hover:text-[#AF9164]"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-serif tracking-widest uppercase text-[#111111] mb-6 border-b border-[#AF9164]/20 pb-3">
              Política de Privacidade e Proteção de Dados (LGPD)
            </h3>
            <div className="space-y-4 text-xs text-[#1A1A1A]/80 leading-relaxed font-light">
              <p>Optando pela excelência, a <strong>Tuanny Magalhães Imóveis de Luxo</strong> compromete-se com a segurança extrema de suas interações e a privacidade dos seus dados pessoais, em estrito alinhamento com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>.</p>
              <h5 className="font-bold uppercase tracking-wider text-[#AF9164] text-[11px]">1. Coleta e Finalidade de Dados</h5>
              <p>Os dados recolhidos através de nossos formulários de interesse VIP (Nome, endereço de e-mail e telefone) destinam-se exclusivamente ao estabelecimento de assessoria comercial direta e atendimento agendado para visitas físicas. O usuário administrativo se compromete a arquivar as informações de contatos atendidos.</p>
              <h5 className="font-bold uppercase tracking-wider text-[#AF9164] text-[11px]">2. Governança de Telemetria Anônima</h5>
              <p>Nossas métricas de uso e tráfego são totalmente anonimizadas no momento do registro em nossa base de dados persistente. O IP do visitante é mascarado imediatamente (p.ex. 192.168.***.***), impossibilitando qualquer rastreabilidade pessoal ou indesejada, preservando os princípios de discrição inerentes ao mercado premium.</p>
              <h5 className="font-bold uppercase tracking-wider text-[#AF9164] text-[11px]">3. Período de Retenção e Compartilhamento</h5>
              <p>Não compartilhamos, revendemos ou repassamos de forma alguma suas informações de contato para fins de publicidade externa de terceiros. Seus dados cadastrados permanecem seguros e guardados criptografadamente em nosso container privado e podem ser permanentemente excluídos mediante solicitação oficial do legítimo proprietário.</p>
            </div>
            <button 
              onClick={() => setShowPrivacy(false)}
              className="mt-8 w-full bg-[#111111] text-[#FAF9F5] py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#AF9164] hover:text-white transition-all rounded-none"
            >
              Compreendi e Aceito
            </button>
          </div>
        </div>
      )}

      {/* Terms of Use Dialog */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 animate-fade-in" id="dialog-terms">
          <div className="bg-[#FAF9F5] text-[#1A1A1A] max-w-2xl w-full p-8 overflow-y-auto max-h-[80vh] border border-[#AF9164]/30 relative rounded-none shadow-2xl">
            <button 
              onClick={() => setShowTerms(false)} 
              className="absolute top-4 right-4 text-[#1A1A1A] hover:text-[#AF9164]"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-serif tracking-widest uppercase text-[#111111] mb-6 border-b border-[#AF9164]/20 pb-3">
              Termos de Uso da Plataforma Tuanny Magalhães
            </h3>
            <div className="space-y-4 text-xs text-[#1A1A1A]/80 leading-relaxed font-light">
              <p>Seja bem-vindo à refinada plataforma digital da <strong>Tuanny Magalhães Imóveis de Luxo</strong>. Ao navegar e submeter manifestações de interesse nesta plataforma, o usuário concorda irrestritamente com os termos de governança e uso aqui pactuados.</p>
              <h5 className="font-bold uppercase tracking-wider text-[#AF9164] text-[11px]">1. Direitos sobre o Conteúdo e Marcas</h5>
              <p>Todos os materiais expostos (arquiteturas virtuais, fotos autorais, descrições comerciais premium de alta autoria literária e layouts visuais minimalistas) são de propriedade intelectual exclusiva de Tuanny Magalhães ou de seus licenciadores, sendo rigorosamente proibida qualquer cópia desautorizada ou reprodução automatizada.</p>
              <h5 className="font-bold uppercase tracking-wider text-[#AF9164] text-[11px]">2. Agendamentos de Visitas e Propostas</h5>
              <p>As propostas e visitas físicas coordenadas através de nosso canal virtual estão sujeitas a triagem por parte de nosso responsável comercial, dependendo da documentação legal e confirmação de exclusividade das unidades de altíssimo padrão envolvidas.</p>
            </div>
            <button 
              onClick={() => setShowTerms(false)}
              className="mt-8 w-full bg-[#111111] text-[#FAF9F5] py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#AF9164] hover:text-white transition-all rounded-none"
            >
              Concordo com os Termos
            </button>
          </div>
        </div>
      )}

      {/* ----------------- LGPD COOKIES CONSENT BANNER ----------------- */}
      {!cookieConsent && (
        <div className="fixed bottom-0 inset-x-0 bg-[#111111]/95 text-[#FAF9F5] border-t border-[#AF9164]/30 p-6 z-40 shadow-2xl backdrop-blur-md animate-slide-up" id="cookie-banner">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h5 className="text-xs uppercase tracking-widest font-semibold text-[#AF9164] flex items-center justify-center md:justify-start gap-2">
                <Shield size={14} /> CONSENTIMENTO DE COOKIES E RGPD
              </h5>
              <p className="text-[11px] text-[#E5D5C0]/80 leading-relaxed font-light max-w-4xl">
                Valorizamos a extrema privacidade do seu acesso. Utilizamos cookies funcionais essenciais e sistemas de telemetria estritamente anônimos para aprimorar sua experiência visual, analisar tráfego e acompanhar o desempenho da nossa curadoria residencial. Seus dados nunca são compartilhados.
              </p>
            </div>
            <div className="flex gap-4 shrink-0 min-w-80">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="flex-1 border border-[#E5D5C0]/20 hover:border-[#AF9164] text-[#E5D5C0] text-[10px] uppercase tracking-wider py-2 px-3 transition-colors rounded-none"
              >
                Ler Política
              </button>
              <button 
                onClick={acceptCookies}
                className="flex-1 bg-[#AF9164] text-white hover:bg-white hover:text-[#111111] text-[10px] uppercase tracking-widest font-bold py-2 px-4 transition-all"
              >
                Aceitar e prosseguir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
