import { useDispatch, useAppSelector } from './_index';
import { signInUser, signUpUser, signOutUser, clearError, checkAuthState, confirmSignUpUser } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';

export const useAuth = () => {

  const dispatch = useDispatch();
  const { isAuthenticated, user, error, isLoading } = useAppSelector(state => state.auth);

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() =>{
        dispatch(checkAuthState());
    }, [dispatch]);

    const signIn = async (username: string, password: string) => {
        setIsSigningIn(true);
        try { // Unwrap allows to handle the result of the thunk action
            await dispatch(signInUser({ username, password })).unwrap();
        } catch (error) {
            console.error('Error signing in:', error);
        } finally {
            setIsSigningIn(false);
        }
    }

    const signUp = async (username: string, password: string) => {
        setIsSigningUp(true);
        try {
            await dispatch(signUpUser({ username, password })).unwrap();
        } catch (error) {
            console.error('Error signing up:', error);
        } finally {
            setIsSigningUp(false);
        }
    }

    const signOut = async () => {
        setIsSigningOut(true);
        try {
            await dispatch(signOutUser()).unwrap();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsSigningOut(false);
        }
    }

    const confirmSignUp = async (username: string, code: string) => {
        setIsConfirming(true);
        try {
            await dispatch(confirmSignUpUser({ username, code })).unwrap();
        } catch (error) {
            console.error('Error confirming sign up:', error);
        } finally {
            setIsConfirming(false);
        }
    }

    const clearErrorState = () => {
        dispatch(clearError());
    } 

    return {
        isAuthenticated,
        user,
        error,
        isLoading,
        isSigningIn,
        isSigningUp,
        isConfirming,
        isSigningOut,
        signIn,
        signUp,
        signOut,
        confirmSignUp,
        clearErrorState
    }
}

    
