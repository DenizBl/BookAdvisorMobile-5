import React, { useState } from 'react';
import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   KeyboardAvoidingView,
   ScrollView,
   Platform,
   Image,
   ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import colors from '../constants/colors';
import PageContainer from '../components/PageContainer';
import SignUpForm from '../components/SignUpForm';
import SignInForm from '../components/SignInForm';

const AuthScreen = (props) => {
   const [isSignUp, setIsSignUp] = useState(true);

   const toggleForm = () => {
      setIsSignUp((prevState) => !prevState);
   };
   return (
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
         <ImageBackground
            source={{
               uri: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
         >
            <View style={styles.overlay} />
            <ScrollView showsVerticalScrollIndicator={false}>
               <KeyboardAvoidingView
                  style={styles.keyboardAvoidingView}
                  behavior={Platform.OS === 'ios' ? 'height' : undefined}
                  keyboardVerticalOffset={100}
               >
                  <PageContainer style={styles.transparentContainer}>
                     <View style={styles.logoContainer}>
                        {/* Lottie Animasyon */}
                        <View style={styles.animationContainer}>
                           <LottieView
                              source={{
                                 uri: 'https://lottie.host/299c206f-733c-41d0-ae42-e93472443cec/YmqVDAOaF3.json',
                              }}
                              autoPlay
                              loop
                              style={styles.bookAnimation}
                              resizeMode="contain"
                           />
                        </View>

                        {/* Logo Metni */}
                        <View style={styles.logoTextContainer}>
                           <Text style={styles.logoText}>BookAdvisor</Text>
                           <Text style={styles.logoSubtext}>
                              Kitap Dünyasına Hoş Geldiniz
                           </Text>
                        </View>
                     </View>

                     {/* Form Container with Background */}
                     <View style={styles.formContainer}>
                        {/* Form Header Animation */}
                        <View style={styles.formHeaderContainer}>
                           <LottieView
                              source={{
                                 uri: 'https://assets9.lottiefiles.com/packages/lf20_1pxqjqps.json',
                              }}
                              autoPlay
                              loop
                              style={styles.readingAnimation}
                              resizeMode="contain"
                           />
                           <Text style={styles.formHeaderText}>
                              {isSignUp
                                 ? 'Hesabınıza Giriş Yapın'
                                 : 'Yeni Hesap Oluşturun'}
                           </Text>
                        </View>

                        {isSignUp ? <SignInForm /> : <SignUpForm />}

                        <TouchableOpacity
                           onPress={toggleForm}
                           style={styles.linkContainer}
                        >
                           <Text style={styles.link}>
                              {`Switch to ${isSignUp ? 'Sign Up' : 'Sign In'}`}{' '}
                           </Text>
                        </TouchableOpacity>
                     </View>
                  </PageContainer>
               </KeyboardAvoidingView>
            </ScrollView>
         </ImageBackground>
      </SafeAreaView>
   );
};

export default AuthScreen;

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   backgroundImage: {
      flex: 1,
      width: '100%',
      height: '100%',
   },
   overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for text readability
   },
   transparentContainer: {
      backgroundColor: 'transparent',
   },
   keyboardAvoidingView: {
      flex: 1,
      justifyContent: 'center',
   },
   logoContainer: {
      paddingTop: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
   },

   // Lottie Animasyonları
   animationContainer: {
      alignItems: 'center',
      marginBottom: 20,
   },
   bookAnimation: {
      width: 150,
      height: 150,
   },

   // Logo Metni
   logoTextContainer: {
      alignItems: 'center',
   },
   logoText: {
      fontSize: 42,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: 2,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10,
   },
   logoSubtext: {
      fontSize: 18,
      color: '#fff',
      textAlign: 'center',
      fontStyle: 'italic',
      opacity: 0.9,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 5,
   },

   // Form Container
   formContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
   },

   // Form Header
   formHeaderContainer: {
      alignItems: 'center',
      marginBottom: 20,
   },
   readingAnimation: {
      width: 80,
      height: 80,
   },
   formHeaderText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      textAlign: 'center',
      marginTop: 10,
   },

   linkContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 15,
   },
   link: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 0.3,
   },
});
