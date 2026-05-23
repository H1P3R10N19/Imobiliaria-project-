import express from 'express';
import path from 'path';
import fs from 'fs';
import { DB } from './server/db';
import { MetricEvent } from './src/types';

const app = express();
app.use(express.json());

const PORT = 3000;
const ADMIN_TOKEN = 'aura-exclusive-secure-admin-token-2026';

// Middleware to authenticate admin
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === ADMIN_TOKEN) {
      return next();
    }
  }
  return res.status(401).json({ error: 'Acesso administrativo não autorizado.' });
}

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const result = DB.validateAdmin(email, password);
  if (result.success && result.user) {
    return res.json({
      token: ADMIN_TOKEN,
      user: result.user
    });
  } else {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === ADMIN_TOKEN) {
      return res.json({ nome: 'Carlos Albuquerque', email: 'admin@aura.com.br' });
    }
  }
  return res.status(401).json({ error: 'Não autenticado.' });
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
