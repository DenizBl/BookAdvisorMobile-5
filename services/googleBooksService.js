const API_KEY = 'AIzaSyADs3COfx8CSFizkqQjYdpPQ6_eTc9LaO0';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const googleBooksService = {
  searchBooks: async (searchTerm) => {
    try {
      const response = await fetch(`${BASE_URL}?q=${searchTerm}&key=${API_KEY}`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  getBooksByCategory: async (category, lang = 'tr') => {
    try {
      const query = `subject:${encodeURIComponent(category)}`;
      const response = await fetch(`${BASE_URL}?q=${query}&langRestrict=${lang}&maxResults=20&key=${API_KEY}`);
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