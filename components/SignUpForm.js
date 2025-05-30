import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Input from '../components/Input';
import SubmitButton from '../components/SubmitButton';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signUp } from '../utils/actions/authActions';
import { ActivityIndicator, Alert, View, Text, Switch } from 'react-native';
import colors from '../constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { validateEmail } from '../utils/validationConstraints';

const initialState = {
   inputValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
   },
   inputValidities: {
      firstName: false,
      lastName: false,
      email: false,
      password: false,
   },
   formIsValid: false,
};

const SignUpForm = (props) => {
   const dispatch = useDispatch();

   const [error, setError] = useState();
   const [isLoading, setIsLoading] = useState(false);
   const [formState, dispatchFormState] = useReducer(reducer, initialState);
   const [isAdmin, setIsAdmin] = useState(false);

   const inputChangedHandler = useCallback(
      (inputId, inputValue) => {
         const result = validateInput(inputId, inputValue);
         dispatchFormState({ inputId, validationResult: result, inputValue });
      },
      [dispatchFormState]
   );

   useEffect(() => {
      if (error) {
         Alert.alert('An error occured', error, [{ text: 'Okay' }]);
      }
   }, [error]);

   const authHandler = useCallback(async () => {
      try {
         setIsLoading(true);
         const action = signUp(
            formState.inputValues.firstName,
            formState.inputValues.lastName,
            formState.inputValues.email,
            formState.inputValues.password,
            isAdmin ? 'admin' : 'staff'
         );
         setError(null);
         await dispatch(action);
      } catch (error) {
         setError(error.message);
         setIsLoading(false);
      }
   }, [dispatch, formState, isAdmin]);

   return (
      <>
         <Input
            id="firstName"
            label="First name"
            icon="user-o"
            iconPack={FontAwesome}
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities['firstName']}
         />

         <Input
            id="lastName"
            label="Last name"
            icon="user-o"
            iconPack={FontAwesome}
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities['lastName']}
         />

         <Input
            id="email"
            label="Email"
            icon="mail"
            iconPack={Feather}
            onInputChanged={inputChangedHandler}
            keyboardType="email-address"
            autoCapitalize="none"
            errorText={formState.inputValidities['email']}
         />

         <Input
            id="password"
            label="Password"
            icon="lock"
            autoCapitalize="none"
            secureTextEntry
            iconPack={Feather}
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['password']}
         />

         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
            <Text style={{ color: colors.text, fontSize: 16 }}>
               Admin Olarak Kaydol
            </Text>
            <Switch value={isAdmin} onValueChange={setIsAdmin} />
         </View>

         {isLoading ? (
            <ActivityIndicator
               size={'small'}
               color={colors.primary}
               style={{ marginTop: 10 }}
            />
         ) : (
            <SubmitButton
               title="Sign up"
               onPress={authHandler}
               style={{ marginTop: 20 }}
               //disabled={!formState.formIsValid}
            />
         )}
      </>
   );
};

export default SignUpForm;
