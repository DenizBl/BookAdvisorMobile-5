import React, { useState } from 'react';
import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   KeyboardAvoidingView,
   ScrollView,
   Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
         <ScrollView showsVerticalScrollIndicator={false}>
            <KeyboardAvoidingView
               style={styles.keyboardAvoidingView}
               behavior={Platform.OS === 'ios' ? 'height' : undefined}
               keyboardVerticalOffset={100}
            >
               <PageContainer style={styles.container}>
                  <View style={styles.logoContainer}>
                     <View style={styles.logoBackground}>
                        <Ionicons name="book" size={32} color={colors.white} style={styles.bookIcon} />
                        <Text style={styles.logoText}>BookAdvisor</Text>
                     </View>
                  </View>
                  {isSignUp ? <SignInForm /> : <SignUpForm />}
                  <TouchableOpacity onPress={toggleForm} style={styles.linkContainer}>
                     <Text style={styles.link}>
                        {`Switch to ${isSignUp ? 'Sign Up' : 'Sign In'}`}{' '}
                     </Text>
                  </TouchableOpacity>
               </PageContainer>
            </KeyboardAvoidingView>
         </ScrollView>
      </SafeAreaView>
   );
};

export default AuthScreen;

const styles = StyleSheet.create({
   container: {
      backgroundColor: colors.background,
   },
   keyboardAvoidingView: {
      flex: 1,
      justifyContent: 'center',
   },
   logoContainer: {
      paddingTop: 130,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 30,
      //paddingBottom: 100

   },
   logoBackground: {
      backgroundColor: colors.primary,
      paddingHorizontal: 30,
      paddingVertical: 20,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
   },
   logoText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.white,
      marginLeft: 10,
   },
   bookIcon: {
      marginRight: 5,
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
      color: "black",
      letterSpacing: 0.3,
   },
});
