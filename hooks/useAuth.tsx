import { createUserWithEmailAndPassword, FirebaseAuthTypes, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';

interface AuthResult {
  success: boolean;
  user?: FirebaseAuthTypes.User;
  error?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
      setUser(user);
      if (initializing) setInitializing(false);
    };

    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      let errorMessage = 'An error occurred during sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      let errorMessage = 'An error occurred during sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signOutUser = async (): Promise<AuthResult> => {
    try {
      await signOut(getAuth());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(getAuth(), email);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'An error occurred while resetting password';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    loading: initializing,
    signIn,
    signUp,
    signOut: signOutUser,
    resetPassword,
  };
}; 