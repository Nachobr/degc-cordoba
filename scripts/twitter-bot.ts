import { TwitterApi } from 'twitter-api-v2';
import sueldosData from '../data/sueldos.json';
import executionsData from '../data/executions.json';
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
    lastPostDate: string;
  }
  
  // Load or initialize posted items tracking
  function getPostedItems(): PostedItems {
    try {
      if (fs.existsSync(POSTED_ITEMS_FILE)) {
        return JSON.parse(fs.readFileSync(POSTED_ITEMS_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading posted items file:', error);
    }
    
    return {
      sueldos: [],
      executions: [],
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
  
  // Main function to post a random item
  async function postRandomItem() {
    const postedItems = getPostedItems();
    
    // Decide whether to post a sueldo or execution (50/50 chance)
    const postSueldo = Math.random() > 0.5;
    
    if (postSueldo && Array.isArray(sueldosData) && sueldosData.length > 0) {
      // Post a sueldo item
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
    } else if (Array.isArray(executionsData) && executionsData.length > 0) {
      // Post an execution item
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
      console.log('No data available to post');
    }
  }
  
  // Run the script
  postRandomItem().catch(console.error);
} catch (error) {
  console.error('Error initializing Twitter client:', error);
}