import React, { useState, useEffect } from 'react';
import { AreaChart, Eye, Phone, Send, Percent, Smartphone, Globe, AlertCircle, RefreshCw, Award, TrendingUp, HelpCircle } from 'lucide-react';
import { api } from '../api';

export default function MetricsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    try {
      const summary = await api.getMetricsSummary();
      setData(summary);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar telemetria de tráfego.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4" id="metrics-loader">
        <RefreshCw size={32} className="text-[#AF9164] animate-spin" />
        <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-widest font-light">Lendo Dossiê Metrológico de Acesso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 flex items-start gap-4" id="metrics-error">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-sm">Falha Técnica de Processamento</h5>
          <p className="text-xs text-red-700/80 mt-1 font-light">{error}</p>
          <button 
            onClick={loadSummary}
            className="mt-3 bg-red-800 text-white hover:bg-red-900 py-1 px-3 text-[10px] uppercase font-bold tracking-wider"
          >
            Tentar de Novo
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Helpers to draw elegant SVG grids for Daily access
  const drawDailyAreaChart = () => {
    const chartData = data.visitsChartData || [];
    if (chartData.length === 0) return null;

    // Find maximum visits to normalize SVG scale
    const maxVisits = Math.max(...chartData.map((d: any) => d.visitas), 10);
    const height = 180;
    const width = 500;
    const padding = 30;

    // Map coordinates
    const points = chartData.map((d: any, idx: number) => {
      const x = padding + (idx * (width - padding * 2)) / (chartData.length - 1);
      const y = height - padding - (d.visitas * (height - padding * 2)) / maxVisits;
      return { x, y, name: d.name, valBefore: d.visitas, leadsBefore: d.leads };
    });

    // Create polyline paths
    const pathString = points.map((p: any) => `${p.x},${p.y}`).join(' ');
    // Create closed path for nice background glow area
    const areaString = `${padding},${height - padding} ${pathString} ${width - padding},${height - padding}`;

    // Leads points path
    const maxLeads = Math.max(...chartData.map((d: any) => d.leads), 5);
    const leadPoints = chartData.map((d: any, idx: number) => {
      const x = padding + (idx * (width - padding * 2)) / (chartData.length - 1);
      const y = height - padding - (d.leads * (height - padding * 2)) / maxLeads;
      return { x, y };
    });
    const leadPathString = leadPoints.map((p: any) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[#AF9164] font-bold">Acessos x Captação de Leads (Últimos 7 dias)</span>
          <div className="flex gap-4 text-[9px] uppercase tracking-widest font-semibold text-[#1A1A1A]/60">
            <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#AF9164] inline-block" /> Visitas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-emerald-700 inline-block" /> Formulários</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Vertical axis grids */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#2C2720" strokeWidth="1" strokeOpacity="0.1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2C2720" strokeWidth="1" strokeOpacity="0.1" />
          
          {/* horizontal lines markers */}
          {[0, 0.5, 1].map((coef, i) => {
            const h = padding + coef * (height - padding * 2);
            const valLabel = Math.round(maxVisits * (1 - coef));
            return (
              <g key={i}>
                <line x1={padding} y1={h} x2={width - padding} y2={h} stroke="#2C2720" strokeDasharray="3,3" strokeWidth="1" strokeOpacity="0.05" />
                <text x={padding - 5} y={h + 3} textAnchor="end" className="text-[8px] fill-[#1A1A1A]/30 font-sans">{valLabel}</text>
              </g>
            );
          })}

          {/* Draw visits glowing Area */}
          <polygon points={areaString} fill="url(#visits-gradient)" />
          <polyline points={pathString} stroke="#AF9164" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Draw leads line */}
          <polyline points={leadPathString} stroke="#047857" strokeWidth="1.5" strokeDasharray="1,1" fill="none" strokeLinecap="round" />

          {/* Horizontal dot and text labels inside nodes */}
          {points.map((p: any, idx: number) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3.5" fill="#AF9164" stroke="#FFFFFF" strokeWidth="1" />
              {/* Tooltip trigger or permanent labels */}
              <text x={p.x} y={height - padding + 12} textAnchor="middle" className="text-[8px] fill-[#1A1A1A]/40 font-mono">{p.name}</text>
              <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[7.5px] font-bold fill-[#111111] opacity-0 group-hover:opacity-100 transition-opacity bg-black">{p.valBefore}</text>
            </g>
          ))}

          {/* SVG definitions design */}
          <defs>
            <linearGradient id="visits-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AF9164" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#AF9164" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  // Safe division helper
  const globalConversionRate = data.totalVisits > 0 
    ? ((data.leadSubmissions + data.whatsappClicks) / data.totalVisits) * 100 
    : 0;

  return (
    <div id="metrics-dashboard-canvas" className="space-y-8 font-light">
      
      {/* Visual core stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Card 1: Views */}
        <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm block relative">
          <Eye className="text-[#AF9164]/30 absolute top-5 right-5" size={24} />
          <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Visitas Totais</span>
          <div className="text-2xl font-serif text-[#111111] mt-2 font-normal">{data.totalVisits}</div>
          <p className="text-[9px] text-[#1A1A1A]/40 mt-1 uppercase tracking-wider">Acessos de visualizações</p>
        </div>

        {/* Card 2: Unique */}
        <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm block relative">
          <Globe className="text-[#AF9164]/30 absolute top-5 right-5" size={24} />
          <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Visitantes Únicos</span>
          <div className="text-2xl font-serif text-[#111111] mt-2 font-normal">{data.uniqueVisitors}</div>
          <p className="text-[9px] text-[#1A1A1A]/40 mt-1 uppercase tracking-wider">Por IPs mascarados (LGPD)</p>
        </div>

        {/* Card 3: WhatsApp clicks */}
        <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm block relative">
          <Phone className="text-[#AF9164]/30 absolute top-5 right-5" size={24} />
          <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Cliques WhatsApp</span>
          <div className="text-2xl font-serif text-[#111111] mt-2 font-normal">{data.whatsappClicks}</div>
          <p className="text-[9px] text-[#1A1A1A]/40 mt-1 uppercase tracking-wider">Interesse ágil direto</p>
        </div>

        {/* Card 4: Leads */}
        <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm block relative">
          <Send className="text-[#AF9164]/30 absolute top-5 right-5" size={24} />
          <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Interesses Cadastrados</span>
          <div className="text-2xl font-serif text-[#111111] mt-2 font-normal">{data.leadSubmissions}</div>
          <p className="text-[9px] text-[#1A1A1A]/40 mt-1 uppercase tracking-wider">Formulários de Dossiê VIP</p>
        </div>

        {/* Card 5: Conversion Coef */}
        <div className="bg-white p-[#AF9164]/10 border border-[#AF9164]/30 p-6 shadow-sm block relative">
          <Percent className="text-[#AF9164] absolute top-5 right-5" size={20} />
          <span className="text-[9px] text-[#AF9164] uppercase tracking-widest font-bold">Taxa Conversão Global</span>
          <div className="text-2xl font-serif text-emerald-800 mt-2 font-bold">{globalConversionRate.toFixed(1)}%</div>
          <p className="text-[9px] text-[#1A1A1A]/40 mt-1 uppercase tracking-wider">Ações por acessos totais</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Line area analytics chart */}
        <div className="lg:col-span-8">
          {drawDailyAreaChart()}
        </div>

        {/* Devices and Traffic origins splits */}
        <div className="lg:col-span-4 bg-white p-6 border border-[#1A1A1A]/5 shadow-sm space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-[#AF9164] font-bold block">Origens & Dispositivos</span>
          
          {/* Traffic Sources Progress bars */}
          <div className="space-y-4">
            <h5 className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/45 font-bold">Canais de Tráfego</h5>
            <div className="space-y-3">
              {data.trafficData && data.trafficData.slice(0, 4).map((tr: any, idx: number) => {
                const maxVal = Math.max(...data.trafficData.map((t: any) => t.value), 1);
                const perc = (tr.value / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-[#1A1A1A]/70 leading-none">
                      <span>{tr.name || 'Direto'}</span>
                      <span className="font-semibold">{tr.value}</span>
                    </div>
                    <div className="w-full bg-[#FAF9F5] h-1">
                      <div className="bg-[#AF9164] h-1" style={{ width: `${perc}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device types */}
          <div className="space-y-4 pt-4 border-t border-[#1A1A1A]/5">
            <h5 className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/45 font-bold">Aparelhos de Navegação</h5>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {data.deviceData && data.deviceData.map((dev: any, i: number) => (
                <div key={i} className="bg-[#FAF9F5] p-3 border border-[#1A1A1A]/5">
                  <span className="capitalize text-[#1A1A1A]/60 flex items-center justify-center gap-1 text-[11px] mb-1">
                    <Smartphone size={10} className="text-[#AF9164]" /> {dev.name}
                  </span>
                  <span className="font-semibold text-[#1A1A1A] block text-sm">{dev.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Property performance and ranking grids */}
      <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm space-y-6">
        <div className="border-b border-[#1A1A1A]/5 pb-4">
          <h4 className="font-serif text-base tracking-widest uppercase text-[#111111] flex items-center gap-2">
            <Award size={16} /> Rankings e Conversão por Unidade Residencial
          </h4>
          <span className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest mt-1 block">Acompanhamento do interesse detalhado por imóvel ativo do acervo</span>
        </div>

        <div className="overflow-x-auto pr-1">
          <table className="w-full text-xs text-left text-[#1A1A1A]/80 border-collapse">
            <thead className="text-[8px] uppercase tracking-widest font-bold text-[#AF9164] border-b border-[#1A1A1A]/10 bg-[#FAF9F5]">
              <tr>
                <th className="py-2.5 px-3">Imóvel curado</th>
                <th className="py-2.5 px-3 text-center">Bairro</th>
                <th className="py-2.5 px-3 text-center">Visitas</th>
                <th className="py-2.5 px-3 text-center">WhatsApp</th>
                <th className="py-2.5 px-3 text-center">Leads Form</th>
                <th className="py-2.5 px-3 text-right">Eficácia (Conv %)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5 font-light">
              {data.propertiesPerformance && data.propertiesPerformance.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-[#FAF9F5]/50">
                  <td className="py-3 px-3 font-serif font-light text-[#111111] max-w-xs truncate">{item.titulo}</td>
                  <td className="py-3 px-3 text-center text-[#1A1A1A]/60">{item.bairro}</td>
                  <td className="py-3 px-3 text-center font-mono">{item.visualizacoes}</td>
                  <td className="py-3 px-3 text-center font-mono">{item.cliques_whatsapp}</td>
                  <td className="py-3 px-3 text-center font-mono">{item.leads}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-800 font-mono">
                    {item.conversao}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search keywords performed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Terms lists */}
        <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-[#AF9164] font-bold block">Keywords & Filtros Pesquisados</span>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.searchesRanking && data.searchesRanking.length > 0 ? (
              data.searchesRanking.map((s: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-[#1A1A1A]/5 font-mono">
                  <span className="text-[#1A1A1A]/60 truncate">{s.termos}</span>
                  <span className="font-semibold text-[#1A1A1A]/85">{s.buscas} buscas</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#1A1A1A]/40 text-center py-6">Nenhuma busca complexa realizada recentemente.</p>
            )}
          </div>
        </div>

        {/* Neighborhood searches read rates and blog reading stats */}
        <div className="bg-white p-6 border border-[#1A1A1A]/5 shadow-sm space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-[#AF9164] font-bold block">Visitas aos Guias Regionais</span>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.neighborhoodRanking && data.neighborhoodRanking.length > 0 ? (
              data.neighborhoodRanking.map((n: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-[#1A1A1A]/5">
                  <span className="text-[#1A1A1A]/70">{n.bairro}</span>
                  <span className="font-semibold">{n.total} acessos</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#1A1A1A]/40 text-center py-6">Nenhum percurso de bairro visto.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
