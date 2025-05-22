const API_KEY = 'AIzaSyADs3COfx8CSFizkqQjYdpPQ6_eTc9LaO0';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const googleBooksService = {
  searchBooks: async (searchTerm, options = {}) => {
    try {
      // Varsayılan değerleri tanımla
      const {
        maxResults = 20,
        startIndex = 0,
        orderBy = 'relevance',
        printType = 'books',
        langRestrict = '',
      } = options;

      // URL parametrelerini oluştur
      const params = new URLSearchParams({
        q: searchTerm,
        key: API_KEY,
        maxResults,
        startIndex,
        orderBy,
        printType,
      });

      // Opsiyonel parametreleri ekle
      if (langRestrict) params.append('langRestrict', langRestrict);

      // Rastgele çeşitlilik için orderBy'ı değiştir
      // Eğer options.random true ise, rastgele sıralama parametreleri ekle
      if (options.random) {
        // Google Books API doğrudan rastgele sıralama desteklemiyor
        // Bu nedenle startIndex'i rastgele değiştirerek farklı sonuçlar alabiliriz
        const randomStart = Math.floor(Math.random() * 40); // 0-39 arası rastgele bir başlangıç
        params.set('startIndex', randomStart);
        
        // Bazen relevance, bazen de newest ile sırala
        if (Math.random() > 0.5) {
          params.set('orderBy', 'newest');
        }
      }

      const url = `${BASE_URL}?${params.toString()}`;
      console.log('API isteği URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.log('Sonuç bulunamadı, arama terimi değiştiriliyor...');
        // Sonuç bulunamazsa, arama terimini genişlet
        const broaderTerm = searchTerm.split(' ').slice(0, 2).join(' ');
        params.set('q', broaderTerm);
        const retryUrl = `${BASE_URL}?${params.toString()}`;
        const retryResponse = await fetch(retryUrl);
        const retryData = await retryResponse.json();
        return retryData.items || [];
      }
      
      return data.items || [];
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  getBooksByCategory: async (category, lang = 'tr', maxResults = 20) => {
    try {
      const query = `subject:${encodeURIComponent(category)}`;
      const params = new URLSearchParams({
        q: query,
        langRestrict: lang,
        maxResults,
        key: API_KEY,
        orderBy: Math.random() > 0.5 ? 'relevance' : 'newest',
      });
      
      const response = await fetch(`${BASE_URL}?${params.toString()}`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error(`Error fetching books by category "${category}" with lang "${lang}":`, error);
      return [];
    }
  },

  getBookById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}?key=${API_KEY}`);
      if (!response.ok) {
        throw new Error('Book details could not be fetched');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  },

  getBooksByAuthor: async (author) => {
    try {
      const response = await fetch(`${BASE_URL}?q=inauthor:${author}&key=${API_KEY}`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching books by author:', error);
      throw error;
    }
  }
}; 