const testAPIs = async () => {
  console.log('--- Testing Spoonacular API ---');
  try {
    const res = await fetch('https://api.spoonacular.com/recipes/findByIngredients?apiKey=3b17784c498746c79955f92ffe223e0c&ingredients=apples,flour&number=1&ranking=2');
    const data = await res.json();
    console.log('Recipe title:', data[0]?.title);
    console.log('Recipe image URL:', data[0]?.image);
    console.log('Spoonacular: SUCCESS ✅');
  } catch (e) { console.error('Spoonacular: FAILED ❌', e.message); }

  console.log('\n--- Testing Overpass (NGO) API ---');
  try {
    const query = `[out:json][timeout:15];
    (
      node["amenity"="social_facility"](around:25000,19.076,72.877);
      way["amenity"="social_facility"](around:25000,19.076,72.877);
    );
    out center;`;
    const res2 = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
    const data2 = await res2.json();
    console.log('Overpass found elements:', data2.elements?.length || 0);
    console.log('Overpass: SUCCESS ✅');
  } catch (e) { console.error('Overpass: FAILED ❌', e.message); }
};

testAPIs();
