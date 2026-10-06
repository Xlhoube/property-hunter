const cheerio = require('cheerio');
fetch('https://www.imovirtual.com/pt/resultados/comprar/apartamento/lisboa', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
})
.then(r => r.text())
.then(html => {
  const $ = cheerio.load(html);
  const data = JSON.parse($('#__NEXT_DATA__').html());
  const items = data?.props?.pageProps?.data?.searchAds?.items;
  console.log(JSON.stringify(items?.[0]?.images, null, 2));
});
