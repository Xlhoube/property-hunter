import { scrapeCasaSapo } from './src/lib/scrapers/casasapo.ts';
async function test() {
  console.log('Testing Casasapo...');
  try {
    const results = await scrapeCasaSapo('Porto', 5);
    console.log(results);
  } catch(e){
    console.error(e);
  }
}
test();
