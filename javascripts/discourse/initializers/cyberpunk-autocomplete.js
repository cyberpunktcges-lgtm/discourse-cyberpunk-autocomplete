import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "cyberpunk-autocomplete",
  
  initialize() {
    withPluginApi("0.8", api => {
      
      let cardCache = [];
      let cacheTime = localStorage.getItem('tcg_component_cache_time');
      let cachedData = localStorage.getItem('tcg_component_cache_data');

      // 1. Cargamos las cartas desde tu GitHub (se actualiza cada 24h)
      if (cachedData && cacheTime && (Date.now() - cacheTime < 86400000)) {
          cardCache = JSON.parse(cachedData);
          console.log("🟢 [COMPONENTE] Cartas cargadas desde caché.");
      } else {
          fetch("https://api.github.com/repos/cyberpunktcges-lgtm/cyberpunk-tcg-cartas/contents/")
          .then(r => r.json())
          .then(data => {
              if(Array.isArray(data)) {
                  cardCache = data.filter(f => f.name.endsWith('.webp')).map(f => {
                      let nombre = f.name.replace('.webp', '');
                      return nombre.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  });
                  localStorage.setItem('tcg_component_cache_data', JSON.stringify(cardCache));
                  localStorage.setItem('tcg_component_cache_time', Date.now());
                  console.log("🟢 [COMPONENTE] Cartas actualizadas desde GitHub.");
              }
          }).catch(e => console.log("🔴 [COMPONENTE ERROR]", e));
      }

      // 2. Inyectamos la función nativa de autocompletado en el editor
      api.addComposerAutocomplete("[", {
        action: (text) => {
          if (text.length < 2) return [];
          const textLower = text.toLowerCase();
          
          return cardCache
            .filter(c => c.toLowerCase().includes(textLower))
            .slice(0, 6)
            .map(c => ({
                text: c + "]", 
                title: c, 
                icon: "clone" 
            }));
        }
      });
      
    });
  }
};
