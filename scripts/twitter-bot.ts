import { TwitterApi } from 'twitter-api-v2';
import sueldosData from '../data/sueldos.json';
import executionsData from '../data/executions.json';
import executionDetailsData from '../data/executionDetails.json';
import fs from 'fs';
import path from 'path';

// Twitter API credentials
// Add this at the top of your file
import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Log the credentials (with partial masking for security)
console.log('Checking Twitter API credentials:');
console.log(`API Key: ${process.env.TWITTER_API_KEY?.substring(0, 4)}...${process.env.TWITTER_API_KEY?.substring(process.env.TWITTER_API_KEY.length - 4)}`);
console.log(`API Secret: ${process.env.TWITTER_API_SECRET ? '✓ Present' : '✗ Missing'}`);
console.log(`Access Token: ${process.env.TWITTER_ACCESS_TOKEN?.substring(0, 4)}...${process.env.TWITTER_ACCESS_TOKEN?.substring(process.env.TWITTER_ACCESS_TOKEN.length - 4)}`);
console.log(`Access Secret: ${process.env.TWITTER_ACCESS_SECRET ? '✓ Present' : '✗ Missing'}`);

// Try creating the client with more detailed error handling
try {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  });
  
  console.log('Twitter client created successfully');
  
  // Track which items have been posted
  const POSTED_ITEMS_FILE = path.join(process.cwd(), 'data', 'posted-items.json');
  
  interface PostedItems {
    sueldos: string[];
    executions: string[];
    jurisdicciones: string[];
    lastPostDate: string;
  }
  
  // Load or initialize posted items tracking
  function getPostedItems(): PostedItems {
    try {
      if (fs.existsSync(POSTED_ITEMS_FILE)) {
        const data = JSON.parse(fs.readFileSync(POSTED_ITEMS_FILE, 'utf8'));
        // Ensure all required fields exist
        return {
          sueldos: data.sueldos || [],
          executions: data.executions || [],
          jurisdicciones: data.jurisdicciones || [],
          lastPostDate: data.lastPostDate || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error reading posted items file:', error);
    }
    
    return {
      sueldos: [],
      executions: [],
      jurisdicciones: [],
      lastPostDate: new Date().toISOString()
    };
  }
  
  // Save posted items
  function savePostedItems(items: PostedItems) {
    try {
      fs.writeFileSync(POSTED_ITEMS_FILE, JSON.stringify(items, null, 2));
    } catch (error) {
      console.error('Error saving posted items:', error);
    }
  }
  
  // Format currency
  function formatCurrency(amount: number): string {
    return amount.toLocaleString('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  // Generate a tweet for a sueldo item
  function generateSueldoTweet(item: any): string {
    return `💰 Gasto en Sueldos\n\n${item.jurisdiccion}\nCargo: ${item.cargo}\nSueldo Bruto: ${formatCurrency(item.montoBruto)}\nFecha: ${item.month}/${item.year}\n\n#TransparenciaGubernamental #Córdoba`;
  }
  
  // Generate a tweet for an execution item
  function generateExecutionTweet(item: any): string {
    return `🏗️ Obra Pública\n\n${item.obra}\nJurisdicción: ${item.jurisdiccion}\nMonto: ${formatCurrency(item.monto)}\nAño: ${item.year}\n\n#ObraPública #Córdoba #TransparenciaGubernamental`;
  }
  
  // NEW: Generate a tweet for a jurisdiccion summary
  function generateJurisdiccionTweet(jurisdiccion: string, totalSueldos: number, totalEjecuciones: number, totalGeneral: number, sueldosCount: number, ejecucionesCount: number): string {
    // Clean up the jurisdiccion name for the URL
    const cleanJurisdiccion = jurisdiccion.replace(/^\d+\s*-\s*/, ''); // Remove leading numbers like "193 - "
    
    return `💼 Resumen de Gastos: ${jurisdiccion}\n\n` +
           `Sueldos: ${formatCurrency(totalSueldos)} (${sueldosCount} cargos)\n` +
           `Ejecuciones: ${formatCurrency(totalEjecuciones)} (${ejecucionesCount} obras)\n` +
           `Total: ${formatCurrency(totalGeneral)}\n\n` +
           `Más detalles: https://degc-cordoba.vercel.app/gastos/${encodeURIComponent(cleanJurisdiccion)}\n\n` +
           `#GastosPúblicos #Córdoba #TransparenciaGubernamental`;
  }
  
  // Post a tweet
  async function postTweet(text: string): Promise<boolean> {
    try {
      await client.v2.tweet(text);
      console.log('Tweet posted successfully');
      return true;
    } catch (error) {
      console.error('Error posting tweet:', error);
      return false;
    }
  }
  
  // Get a random item that hasn't been posted yet
  function getRandomUnpostedItem(items: any[], postedIds: string[], idField: string): any | null {
    const unpostedItems = items.filter(item => !postedIds.includes(String(item[idField])));
    
    if (unpostedItems.length === 0) {
      console.log('All items have been posted. Resetting tracking.');
      return items[Math.floor(Math.random() * items.length)];
    }
    
    return unpostedItems[Math.floor(Math.random() * unpostedItems.length)];
  }
  
  // NEW: Get jurisdiccion totals (similar to the homepage logic)
  function getJurisdiccionTotals() {
    // Process sueldos data
    const sueldosMap = new Map<string, { total: number, count: number }>();
    
    if (Array.isArray(sueldosData)) {
      sueldosData.forEach(item => {
        const jurisdiccion = item.jurisdiccion;
        if (!sueldosMap.has(jurisdiccion)) {
          sueldosMap.set(jurisdiccion, { total: 0, count: 0 });
        }
        const current = sueldosMap.get(jurisdiccion)!;
        current.total += item.montoBruto;
        current.count += 1;
        sueldosMap.set(jurisdiccion, current);
      });
    }
    
    // Process execution data with details
    const executionMap = new Map<string, { total: number, count: number }>();
    
    if (Array.isArray(executionsData) && Array.isArray(executionDetailsData)) {
      // Create a map of execution details by idObra for faster lookup
      const detailsMap = new Map();
      executionDetailsData.forEach(detail => {
        detailsMap.set(detail.idObra, detail);
      });
      
      executionsData.forEach(item => {
        const detail = detailsMap.get(item.idObra);
        if (detail) {
          const jurisdiccion = detail.jurisdiccion;
          if (!executionMap.has(jurisdiccion)) {
            executionMap.set(jurisdiccion, { total: 0, count: 0 });
          }
          const current = executionMap.get(jurisdiccion)!;
          current.total += detail.pagado || 0;
          current.count += 1;
          executionMap.set(jurisdiccion, current);
        }
      });
    }
    
    // Combine data for all jurisdictions
    const allJurisdicciones = new Set([
      ...sueldosMap.keys(),
      ...executionMap.keys()
    ]);
    
    return Array.from(allJurisdicciones).map(jurisdiccion => {
      const sueldosData = sueldosMap.get(jurisdiccion) || { total: 0, count: 0 };
      const executionData = executionMap.get(jurisdiccion) || { total: 0, count: 0 };
      
      return {
        jurisdiccion,
        totalSueldos: sueldosData.total,
        totalEjecuciones: executionData.total,
        totalGeneral: sueldosData.total + executionData.total,
        sueldosCount: sueldosData.count,
        ejecucionesCount: executionData.count
      };
    });
  }
  
  // Main function to post a random item
  async function postRandomItem() {
    const postedItems = getPostedItems();
    
    // Decide what type of content to post (now with 3 options)
    const randomChoice = Math.random();
    
    if (randomChoice < 0.20 && Array.isArray(sueldosData) && sueldosData.length > 0) {
      // Post a sueldo item (20% chance)
      const item = getRandomUnpostedItem(
        sueldosData, 
        postedItems.sueldos, 
        'montoBruto' // Using montoBruto as a unique identifier
      );
      
      if (item) {
        const tweet = generateSueldoTweet(item);
        const success = await postTweet(tweet);
        
        if (success) {
          postedItems.sueldos.push(String(item.montoBruto));
          postedItems.lastPostDate = new Date().toISOString();
          savePostedItems(postedItems);
        }
      }
    } else if (randomChoice < 0.40 && Array.isArray(executionsData) && executionsData.length > 0) {
      // Post an execution item (20% chance)
      const item = getRandomUnpostedItem(
        executionsData, 
        postedItems.executions, 
        'idObra'
      );
      
      if (item) {
        const tweet = generateExecutionTweet(item);
        const success = await postTweet(tweet);
        
        if (success) {
          postedItems.executions.push(String(item.idObra));
          postedItems.lastPostDate = new Date().toISOString();
          savePostedItems(postedItems);
        }
      }
    } else {
      // Post a jurisdiccion summary (60% chance)
      const jurisdiccionTotals = getJurisdiccionTotals();
      
      // Sort by total spending and get top jurisdicciones
      const sortedJurisdicciones = jurisdiccionTotals
        .sort((a, b) => b.totalGeneral - a.totalGeneral)
        .filter(item => item.totalGeneral > 0);
      
      // Get a random unposted jurisdiccion
      const unpostedJurisdicciones = sortedJurisdicciones.filter(
        item => !postedItems.jurisdicciones?.includes(item.jurisdiccion)
      );
      
      let selectedJurisdiccion;
      if (unpostedJurisdicciones.length === 0) {
        // If all have been posted, reset and pick a random one from top 10
        console.log('All jurisdicciones have been posted. Resetting tracking.');
        selectedJurisdiccion = sortedJurisdicciones.slice(0, 10)[Math.floor(Math.random() * 10)];
      } else {
        // Pick a random unposted jurisdiccion
        selectedJurisdiccion = unpostedJurisdicciones[Math.floor(Math.random() * unpostedJurisdicciones.length)];
      }
      
      if (selectedJurisdiccion) {
        const tweet = generateJurisdiccionTweet(
          selectedJurisdiccion.jurisdiccion,
          selectedJurisdiccion.totalSueldos,
          selectedJurisdiccion.totalEjecuciones,
          selectedJurisdiccion.totalGeneral,
          selectedJurisdiccion.sueldosCount,
          selectedJurisdiccion.ejecucionesCount
        );
        
        const success = await postTweet(tweet);
        
        if (success) {
          postedItems.jurisdicciones.push(selectedJurisdiccion.jurisdiccion);
          postedItems.lastPostDate = new Date().toISOString();
          savePostedItems(postedItems);
        }
      }
    }
  }
  
  // Run the script
  postRandomItem().catch(console.error);
} catch (error) {
  console.error('Error initializing Twitter client:', error);
}