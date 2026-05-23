import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { DB } from './server/db';
import { MetricEvent } from './src/types';

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aura-exclusive-secure-admin-token-2026';

// 7. Configuração do CORS no back-end
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper base64url encode/decode para JWT nativo sem dependências extras
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// 10. Funções exigidas: verifyToken, authMiddleware, requireAdmin
export function verifyToken(token: string): any {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expirado
    }
    return payload;
  } catch (e) {
    return null;
  }
}

export function signToken(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  let token = '';

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 11. Obter token de cookie HttpOnly se configurado
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
      const parts = c.trim().split('=');
      const k = parts[0];
      const v = parts.slice(1).join('=');
      acc[k] = v;
      return acc;
    }, {});
    token = cookies['aura_admin_token'] || '';
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      (req as any).user = decoded;
      return next();
    }
    (req as any).tokenExpired = true;
  }

  next();
}

app.use(authMiddleware);

export function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    return next();
  }

  // 9. Mensagens amigáveis de erro
  if ((req as any).tokenExpired) {
    return res.status(401).json({ error: 'Sua sessão expirou. Faça login novamente.' });
  }

  return res.status(401).json({ error: 'Você precisa estar logado para acessar o painel administrativo.' });
}

// 3. Proteger apenas as APIs administrativas recomendadas
app.use('/api/admin', requireAdmin);
app.use('/api/metrics', (req, res, next) => {
  if (req.path === '/track') {
    return next(); // A telemetria de tráfego é pública e acessível sem login
  }
  requireAdmin(req, res, next);
});

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const result = DB.validateAdmin(email, password);
  if (result.success && result.user) {
    const token = signToken({ 
      email: result.user.email, 
      nome: result.user.nome, 
      role: 'admin', 
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
    });

    // 11. Definir cookie HttpOnly
    res.cookie('aura_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      token,
      user: result.user
    });
  } else {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (user) {
    return res.json({ nome: user.nome, email: user.email });
  }
  if ((req as any).tokenExpired) {
    return res.status(401).json({ error: 'Sua sessão expirou. Faça login novamente.' });
  }
  return res.status(401).json({ error: 'Você precisa estar logado para acessar o painel administrativo.' });
});

// ---------------- PUBLIC SEARCH & CONTACT APIS ----------------
// 4. APIs públicas acessíveis sem login
app.get('/api/search', (req, res) => {
  try {
    const properties = DB.getProperties();
    const { q, finalidade, categoria, bairro, tipo, minPrice, maxPrice } = req.query;

    const filtered = properties.filter(p => {
      if (p.status !== 'ativo') return false;

      if (finalidade && p.finalidade !== finalidade) return false;
      if (categoria && p.categoria !== categoria) return false;
      if (bairro && p.bairro.toLowerCase() !== (bairro as string).toLowerCase()) return false;
      if (tipo && p.tipo !== tipo) return false;
      if (minPrice && p.valor < parseInt(minPrice as string)) return false;
      if (maxPrice && p.valor > parseInt(maxPrice as string)) return false;

      if (q) {
        const term = (q as string).toLowerCase();
        const matchTitle = p.titulo.toLowerCase().includes(term);
        const matchDesc = p.descricao.toLowerCase().includes(term);
        const matchBairro = p.bairro.toLowerCase().includes(term);
        if (!matchTitle && !matchDesc && !matchBairro) return false;
      }

      return true;
    });

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao executar busca.' });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    const lead = DB.addLead({
      nome: req.body.nome || 'Contato Web',
      email: req.body.email || '',
      telefone: req.body.telefone || '',
      mensagem: req.body.mensagem || '',
      origem: req.body.origem || 'Fale Conosco / Contato Geral',
      imovel_id: req.body.imovel_id,
      imovel_titulo: req.body.imovel_titulo
    });
    res.status(201).json({ success: true, lead });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao processar contato.' });
  }
});

app.post('/api/leads/create', (req, res) => {
  try {
    const lead = DB.addLead(req.body);
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar contato.' });
  }
});

// ---------------- PROPERTIES ROUTES ----------------
app.get('/api/properties', (req, res) => {
  res.json(DB.getProperties());
});

app.get('/api/properties/:id_or_slug', (req, res) => {
  const { id_or_slug } = req.params;
  const properties = DB.getProperties();
  const property = properties.find(p => p.id === id_or_slug || p.slug === id_or_slug);
  if (!property) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }
  res.json(property);
});

app.post('/api/properties/:id/view', (req, res) => {
  const { id } = req.params;
  DB.incrementPropertyViews(id);
  res.json({ success: true });
});

app.post('/api/properties/:id/whatsapp', (req, res) => {
  const { id } = req.params;
  DB.incrementPropertyWhatsapp(id);
  res.json({ success: true });
});

// 3. APIs administrativas protegidas por requireAdmin
app.post('/api/properties/create', requireAdmin, (req, res) => {
  try {
    const property = DB.addProperty(req.body);
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar imóvel.' });
  }
});

app.put('/api/properties/update/:id', requireAdmin, (req, res) => {
  const updated = DB.updateProperty(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/properties/delete/:id', requireAdmin, (req, res) => {
  const success = DB.deleteProperty(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }
  res.json({ success: true });
});

// Retrocompatibilidade de rotas REST padrão
app.post('/api/properties', requireAdmin, (req, res) => {
  try {
    const property = DB.addProperty(req.body);
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar imóvel.' });
  }
});

app.put('/api/properties/:id', requireAdmin, (req, res) => {
  const updated = DB.updateProperty(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/properties/:id', requireAdmin, (req, res) => {
  const success = DB.deleteProperty(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }
  res.json({ success: true });
});

// ---------------- DEVELOPMENTS ROUTES ----------------
app.get('/api/developments', (req, res) => {
  res.json(DB.getDevelopments());
});

app.get('/api/developments/:id_or_slug', (req, res) => {
  const { id_or_slug } = req.params;
  const developments = DB.getDevelopments();
  const dev = developments.find(d => d.id === id_or_slug || d.slug === id_or_slug);
  if (!dev) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }
  res.json(dev);
});

app.post('/api/developments', requireAdmin, (req, res) => {
  try {
    const dev = DB.addDevelopment(req.body);
    res.status(201).json(dev);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar empreendimento.' });
  }
});

app.put('/api/developments/:id', requireAdmin, (req, res) => {
  const updated = DB.updateDevelopment(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/developments/:id', requireAdmin, (req, res) => {
  const success = DB.deleteDevelopment(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }
  res.json({ success: true });
});

// ---------------- NEIGHBORHOODS ROUTES ----------------
app.get('/api/neighborhoods', (req, res) => {
  res.json(DB.getNeighborhoods());
});

app.get('/api/neighborhoods/:id_or_slug', (req, res) => {
  const { id_or_slug } = req.params;
  const neighborhoods = DB.getNeighborhoods();
  const neighborhood = neighborhoods.find(n => n.id === id_or_slug || n.slug === id_or_slug);
  if (!neighborhood) {
    return res.status(404).json({ error: 'Bairro não encontrado.' });
  }
  res.json(neighborhood);
});

app.post('/api/neighborhoods', requireAdmin, (req, res) => {
  try {
    const neighborhood = DB.addNeighborhood(req.body);
    res.status(201).json(neighborhood);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar bairro.' });
  }
});

app.put('/api/neighborhoods/:id', requireAdmin, (req, res) => {
  const updated = DB.updateNeighborhood(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Bairro não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/neighborhoods/:id', requireAdmin, (req, res) => {
  const success = DB.deleteNeighborhood(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Bairro não encontrado.' });
  }
  res.json({ success: true });
});

// ---------------- BLOG POSTS ROUTES ----------------
app.get('/api/blog', (req, res) => {
  res.json(DB.getBlogPosts());
});

app.get('/api/blog/:id_or_slug', (req, res) => {
  const { id_or_slug } = req.params;
  const posts = DB.getBlogPosts();
  const post = posts.find(p => p.id === id_or_slug || p.slug === id_or_slug);
  if (!post) {
    return res.status(404).json({ error: 'Artigo do blog não encontrado.' });
  }
  DB.incrementBlogPostViews(post.id);
  res.json(post);
});

// 3. APIs administrativas de blog protegidas por requireAdmin
app.post('/api/blog/create', requireAdmin, (req, res) => {
  try {
    const post = DB.addBlogPost(req.body);
    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao publicar artigo.' });
  }
});

app.put('/api/blog/update/:id', requireAdmin, (req, res) => {
  const updated = DB.updateBlogPost(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Artigo não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/blog/delete/:id', requireAdmin, (req, res) => {
  const success = DB.deleteBlogPost(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Artigo não encontrado.' });
  }
  res.json({ success: true });
});

// Retrocompatibilidade rotas REST padrão
app.post('/api/blog', requireAdmin, (req, res) => {
  try {
    const post = DB.addBlogPost(req.body);
    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao publicar artigo.' });
  }
});

app.put('/api/blog/:id', requireAdmin, (req, res) => {
  const updated = DB.updateBlogPost(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Artigo não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/blog/:id', requireAdmin, (req, res) => {
  const success = DB.deleteBlogPost(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Artigo não encontrado.' });
  }
  res.json({ success: true });
});

// ---------------- LEADS ROUTES ----------------
app.get('/api/leads/admin', requireAdmin, (req, res) => {
  res.json(DB.getLeads().sort((a,b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()));
});

// Retrocompatibilidade leads list
app.get('/api/leads', requireAdmin, (req, res) => {
  res.json(DB.getLeads().sort((a,b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()));
});

app.post('/api/leads', (req, res) => {
  try {
    const lead = DB.addLead(req.body);
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar contato de interesse.' });
  }
});

app.put('/api/leads/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status || !['novo', 'atendido', 'arquivado'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }
  const result = DB.updateLeadStatus(req.params.id, status);
  if (!result) {
    return res.status(404).json({ error: 'Interesse não localizado.' });
  }
  res.json({ success: true });
});

app.delete('/api/leads/:id', requireAdmin, (req, res) => {
  const success = DB.deleteLead(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Interesse não localizado.' });
  }
  res.json({ success: true });
});

// ---------------- HOME MODULES ROUTES ----------------
app.get('/api/home-modules', (req, res) => {
  res.json(DB.getHomeModules());
});

app.put('/api/home-modules', requireAdmin, (req, res) => {
  const success = DB.updateHomeModules(req.body);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Falha ao atualizar módulos da Home.' });
  }
});

// ---------------- TELEMETRY TRACK ROUTE ----------------
app.post('/api/metrics/track', (req, res) => {
  try {
    // Record client events
    const event = DB.addMetric(req.body);
    res.status(201).json(event);
  } catch (e) {
    res.status(400).json({ error: 'Erro de processamento métrico.' });
  }
});

// ---------------- RICH ANALYTICS SUMMARY ENDPOINT ----------------
app.get('/api/metrics/summary', requireAdmin, (req, res) => {
  const metrics = DB.getMetrics();
  const leads = DB.getLeads();
  const properties = DB.getProperties();
  const neighborhoods = DB.getNeighborhoods();
  const posts = DB.getBlogPosts();

  // Total views
  const totalVisits = metrics.filter(m => m.tipo_evento === 'page_view').length;

  // Unique IP addresses
  const uniqueVisitors = new Set(metrics.map(m => m.ip_anonimizado)).size;

  // Aggregate daily visits and leads over past 7 days
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  const visitsChartData = last7Days.map(dateStr => {
    const dayVisits = metrics.filter(m => m.tipo_evento === 'page_view' && m.criado_em.startsWith(dateStr)).length;
    const dayLeads = leads.filter(l => l.criado_em.startsWith(dateStr)).length;
    return {
      name: dateStr.split('-').slice(1).join('/'), // e.g. "05/23"
      visitas: dayVisits,
      leads: dayLeads
    };
  });

  // Pages most accessed
  const pageViewsMap: Record<string, number> = {};
  metrics.filter(m => m.tipo_evento === 'page_view').forEach(m => {
    pageViewsMap[m.pagina] = (pageViewsMap[m.pagina] || 0) + 1;
  });
  const pagesRanking = Object.entries(pageViewsMap)
    .map(([pagina, acessos]) => ({ pagina, acessos }))
    .sort((a,b) => b.acessos - a.acessos)
    .slice(0, 8);

  // In-app Searches aggregated
  const searches = metrics.filter(m => m.tipo_evento === 'search_performed');
  const searchTermsRanking: Record<string, number> = {};
  searches.forEach(s => {
    if (s.extra) {
      searchTermsRanking[s.extra] = (searchTermsRanking[s.extra] || 0) + 1;
    }
  });
  const searchesRanking = Object.entries(searchTermsRanking)
    .map(([termos, buscas]) => ({ termos, buscas }))
    .sort((a,b) => b.buscas - a.buscas)
    .slice(0, 10);

  // Traffic Source distribution
  const trafficMap: Record<string, number> = {};
  metrics.filter(m => m.origem_trafego).forEach(m => {
    if (m.origem_trafego) {
      trafficMap[m.origem_trafego] = (trafficMap[m.origem_trafego] || 0) + 1;
    }
  });
  const trafficData = Object.entries(trafficMap)
    .map(([origem, valor]) => ({ name: origem, value: valor }))
    .sort((a,b) => b.value - a.value);

  // Device distribution
  const deviceMap = { desktop: 0, mobile: 0, tablet: 0 };
  metrics.forEach(m => {
    if (m.dispositivo in deviceMap) {
      deviceMap[m.dispositivo as 'desktop'|'mobile'|'tablet'] += 1;
    } else {
      deviceMap.desktop += 1; // default fallback
    }
  });

  const deviceData = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));

  // WhatsApp vs Lead Form conversion clicks
  const whatsappClicks = metrics.filter(m => m.tipo_evento === 'whatsapp_click').length;
  const leadSubmissions = leads.length;

  // Property views ranking
  const propertiesPerformance = properties.map(p => {
    const pLeadsCount = leads.filter(l => l.imovel_id === p.id).length;
    // Conversion rate is leads / views %
    const coef = p.visualizacoes > 0 ? (pLeadsCount / p.visualizacoes) * 100 : 0;
    return {
      id: p.id,
      titulo: p.titulo,
      bairro: p.bairro,
      visualizacoes: p.visualizacoes,
      cliques_whatsapp: p.cliques_whatsapp,
      leads: pLeadsCount,
      conversao: parseFloat(coef.toFixed(1))
    };
  }).sort((a,b) => b.visualizacoes - a.visualizacoes);

  // Neighborhood search metrics (from metrics search extra info or view events)
  const neighborhoodSearchMap: Record<string, number> = {};
  metrics.filter(m => m.tipo_evento === 'neighborhood_view').forEach(m => {
    if (m.bairro_id) {
      const b = neighborhoods.find(n => n.id === m.bairro_id);
      if (b) {
        neighborhoodSearchMap[b.nome] = (neighborhoodSearchMap[b.nome] || 0) + 1;
      }
    }
  });
  // Also check searches containing neighborhood
  searches.forEach(s => {
    if (s.extra) {
      const parts = s.extra.split(', ');
      if (parts.length > 2) {
        const neighborhoodTerm = parts[2];
        neighborhoodSearchMap[neighborhoodTerm] = (neighborhoodSearchMap[neighborhoodTerm] || 0) + 1;
      }
    }
  });
  const neighborhoodRanking = Object.entries(neighborhoodSearchMap)
    .map(([bairro, total]) => ({ bairro, total }))
    .sort((a,b) => b.total - a.total);

  // Blog posts reading stats
  const blogPerformance = posts.map(p => ({
    id: p.id,
    titulo: p.titulo,
    visualizacoes: p.visualizacoes
  })).sort((a,b) => b.visualizacoes - a.visualizacoes);

  res.json({
    totalVisits,
    uniqueVisitors,
    visitsChartData,
    pagesRanking,
    searchesRanking,
    trafficData,
    deviceData,
    whatsappClicks,
    leadSubmissions,
    propertiesPerformance,
    neighborhoodRanking,
    blogPerformance
  });
});

// Serve frontend build static files in production, use Vite otherwise
async function startServer() {
  DB.load(); // Load data store initial models

  if (process.env.NODE_ENV === 'production') {
    // Serve production static assets
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  } else {
    // Vite Dev Server Middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aura Imóveis API Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
