import { getFirebaseApp } from '../../services/firebaseHelper.js';
import {
   createUserWithEmailAndPassword,
   getAuth,
   signInWithEmailAndPassword,
} from 'firebase/auth';
import { child, getDatabase, ref, set, update } from 'firebase/database';
import { authenticate, logout } from '../../apps/store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from './userActions';

let timer;

export const signUp = (firstName, lastName, email, password, role) => {
   return async (dispatch) => {
      console.log('SignUp başlatılıyor...', { email, role });
      
      try {
         const app = getFirebaseApp();
         if (!app) {
            throw new Error('Firebase app not initialized');
         }
         
         const auth = getAuth(app);
         console.log('Auth instance alındı');

         const result = await createUserWithEmailAndPassword(auth, email, password);
         console.log('Firebase kayıt başarılı:', result.user.uid);
         
         const { uid, stsTokenManager } = result.user;
         const { accessToken, expirationTime } = stsTokenManager;

         const expiryDate = new Date(expirationTime);
         const timeNow = new Date();
         const millisecondsUntilExpiry = expiryDate - timeNow;

         console.log('Kullanıcı verisi oluşturuluyor...');
         const userData = await createUser(firstName, lastName, email, uid, role);
         console.log('Kullanıcı verisi oluşturuldu:', userData);

         dispatch(authenticate({ token: accessToken, userData }));
         saveDataToStorage(accessToken, uid, expiryDate);

         timer = setTimeout(() => {
            dispatch(userLogout());
         }, millisecondsUntilExpiry);
         
         console.log('Kayıt işlemi tamamlandı');
      } catch (error) {
         console.error('SignUp hatası:', error);
         const errorCode = error.code;

         let message = 'Something went wrong.';

         if (errorCode === 'auth/email-already-in-use') {
            message = 'This email is already in use';
         } else if (errorCode === 'auth/weak-password') {
            message = 'Password should be at least 6 characters';
         } else if (errorCode === 'auth/invalid-email') {
            message = 'Invalid email address';
         } else if (errorCode === 'auth/network-request-failed') {
            message = 'Network error. Please check your internet connection.';
         }

         throw new Error(message);
      }
   };
};

export const signIn = (email, password) => {
   return async (dispatch) => {
      console.log('SignIn başlatılıyor...', { email });
      
      try {
         const app = getFirebaseApp();
         if (!app) {
            throw new Error('Firebase app not initialized');
         }
         
         const auth = getAuth(app);
         console.log('Auth instance alındı');

         const result = await signInWithEmailAndPassword(auth, email, password);
         console.log('Firebase giriş başarılı:', result.user.uid);
         
         const { uid, stsTokenManager } = result.user;
         const { accessToken, expirationTime } = stsTokenManager;

         const expiryDate = new Date(expirationTime);
         const timeNow = new Date();
         const millisecondsUntilExpiry = expiryDate - timeNow;

         console.log('Kullanıcı verisi alınıyor...');
         const userData = await getUserData(uid);
         console.log('Kullanıcı verisi alındı:', userData);

         dispatch(authenticate({ token: accessToken, userData }));
         saveDataToStorage(accessToken, uid, expiryDate);

         timer = setTimeout(() => {
            dispatch(userLogout());
         }, millisecondsUntilExpiry);
         
         console.log('Giriş işlemi tamamlandı');
      } catch (error) {
         console.error('SignIn hatası:', error);
         const errorCode = error.code;
         console.log('Hata kodu:', errorCode);

         let message = 'Something went wrong.';

         if (
            errorCode === '(auth/invalid-credential)' ||
            errorCode === 'auth/invalid-credential' ||
            errorCode === 'auth/wrong-password' ||
            errorCode === 'auth/user-not-found'
         ) {
            message = 'The username or password was incorrect';
         } else if (errorCode === 'auth/network-request-failed') {
            message = 'Network error. Please check your internet connection.';
         } else if (errorCode === 'auth/too-many-requests') {
            message = 'Too many failed attempts. Please try again later.';
         }

         throw new Error(message);
      }
   };
};

export const userLogout = () => {
   return async (dispatch) => {
      const { logout } = require('../../apps/store/authSlice');
      AsyncStorage.clear();
      clearTimeout(timer);
      dispatch(logout());
   };
};

export const updateSignedInUserData = async (userId, newData) => {
   if (newData.firstName && newData.lastName) {
      const firstLast = `${newData.firstName} ${newData.lastName}`.toLowerCase();
      newData.firstLast = firstLast;
   }

   const dbRef = ref(getDatabase());
   const childRef = child(dbRef, `users/${userId}`);
   await update(childRef, newData);
};

const createUser = async (firstName, lastName, email, userId, role) => {
   try {
      console.log("Firebase'e kaydedilecek rol:", role);
      const firstLast = `${firstName} ${lastName}`.toLowerCase();

      const userData = {
         firstName,
         lastName,
         firstLast,
         email,
         userId,
         role,
         signUpDate: new Date().toISOString(),
         boardIds: [],
      };

      const app = getFirebaseApp();
      if (!app) {
         throw new Error('Firebase app not initialized');
      }

      const database = getDatabase(app);
      const dbRef = ref(database);
      const childRef = child(dbRef, `users/${userId}`);
      
      console.log('Realtime Database\'e kullanıcı verisi yazılıyor...');
      await set(childRef, userData);
      console.log('Kullanıcı verisi başarıyla kaydedildi');
      
      return userData;
   } catch (error) {
      console.error('createUser hatası:', error);
      throw error;
   }
};

const saveDataToStorage = (token, userId, expiryDate) => {
   AsyncStorage.setItem(
      'userData',
      JSON.stringify({
         token,
         userId,
         expiryDate: expiryDate.toISOString(),
      })
   );
};
