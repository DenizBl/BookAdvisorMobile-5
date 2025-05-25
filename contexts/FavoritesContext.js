import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFirebaseApp } from '../services/firebaseHelper';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, setDoc, getDocs, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FavoritesContext = createContext();

// Initialize Firebase services
let db;
let auth;

export const useFavorites = () => {
   const context = useContext(FavoritesContext);
   if (!context) {
      throw new Error('useFavorites must be used within a FavoritesProvider');
   }
   return context;
};

export const FavoritesProvider = ({ children }) => {
   const [favorites, setFavorites] = useState([]);
   const [loading, setLoading] = useState(true);
   const [commentCounts, setCommentCounts] = useState({});
   
   // Get user data from Redux store
   const userData = useSelector(state => state.auth.userData);
   const isAuthenticated = useSelector(state => !!state.auth.token);

   // Initialize Firebase services
   useEffect(() => {
      const app = getFirebaseApp();
      auth = getAuth(app);
      db = getFirestore(app);
   }, []);

   // Load favorites when user changes
   useEffect(() => {
      if (!isAuthenticated || !userData?.userId || !db) {
         setFavorites([]);
         setLoading(false);
         return;
      }

      const favRef = collection(db, 'users', userData.userId, 'favorites');
      const unsubscribe = onSnapshot(favRef, (snapshot) => {
         const favoritesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
         }));
         setFavorites(favoritesData);
         setLoading(false);
      });

      return () => unsubscribe();
   }, [isAuthenticated, userData?.userId, db]);

   // Load comment counts for favorites
   useEffect(() => {
      const fetchCommentCounts = async () => {
         if (!db || favorites.length === 0) return;

         const counts = {};
         for (const book of favorites) {
            try {
               const commentsRef = collection(db, 'bookComments', book.id, 'comments');
               const q = query(commentsRef);
               const querySnapshot = await getDocs(q);
               counts[book.id] = querySnapshot.size;
            } catch (error) {
               console.error('Error fetching comment count for book:', book.id, error);
               counts[book.id] = 0;
            }
         }
         setCommentCounts(counts);
      };

      if (favorites.length > 0) {
         fetchCommentCounts();
      }
   }, [favorites, db]);

   const addToFavorites = async (book) => {
      if (!isAuthenticated || !userData?.userId || !db) {
         console.error('User not authenticated or Firebase not initialized');
         return;
      }

      try {
         const favoriteData = {
            id: book.id,
            title: book.volumeInfo?.title || '',
            authors: book.volumeInfo?.authors || [],
            thumbnail: book.volumeInfo?.imageLinks?.thumbnail || '',
            description: book.volumeInfo?.description || '',
            publishedDate: book.volumeInfo?.publishedDate || '',
            addedAt: new Date().toISOString(),
            // Store the complete book object for proper navigation to BookDetail
            // This ensures all volumeInfo properties are available (publisher, pageCount, categories, etc.)
            completeBookData: book
         };

         await setDoc(doc(db, 'users', userData.userId, 'favorites', book.id), favoriteData);
      } catch (error) {
         console.error('Error adding to list:', error);
         throw error;
      }
   };

   const removeFromFavorites = async (bookId) => {
      if (!isAuthenticated || !userData?.userId || !db) {
         console.error('User not authenticated or Firebase not initialized');
         return;
      }

      try {
         await deleteDoc(doc(db, 'users', userData.userId, 'favorites', bookId));
      } catch (error) {
         console.error('Error removing from list:', error);
         throw error;
      }
   };

   const isFavorite = (bookId) => {
      return favorites.some(book => book.id === bookId);
   };

   const toggleFavorite = async (book) => {
      try {
         if (isFavorite(book.id)) {
            await removeFromFavorites(book.id);
         } else {
            await addToFavorites(book);
         }
      } catch (error) {
         console.error('Error toggling list item:', error);
      }
   };

   const value = {
      favorites,
      loading,
      commentCounts,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
   };

   return (
      <FavoritesContext.Provider value={value}>
         {children}
      </FavoritesContext.Provider>
   );
}; 