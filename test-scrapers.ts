import { scrapeCasaSapo } from './src/lib/scrapers/casasapo';
import { scrapeIdealista } from './src/lib/scrapers/idealista';

async function run() {
  console.log('Testing CasaSapo...');
  const cs = await scrapeCasaSapo('Lisboa', 5);
  console.log('CasaSapo length:', cs.length);
  
  console.log('Testing Idealista...');
  const id = await scrapeIdealista('Lisboa', 5);
  console.log('Idealista length:', id.length);
}

run();
