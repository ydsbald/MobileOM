import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// AuthContext permettant de gérer l'authentification
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Chargement utilisateur depuis le stockage local
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('@user');
        if (userJSON) {
          setUser(JSON.parse(userJSON));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Inscription utilisateur
  const signUp = async (userData) => {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUsersJSON = await AsyncStorage.getItem('@registered_users');
      const existingUsers = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];
      
      const userExists = existingUsers.some(u => u.email === userData.email);
      if (userExists) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: 'user-' + Date.now(),
        ...userData,
        token: 'fake-jwt-token-' + Date.now(),
      };

      // Enregistrer le nouvel utilisateur dans la liste des utilisateurs enregistrés
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem('@registered_users', JSON.stringify(updatedUsers));

      // Connecter automatiquement l'utilisateur après l'inscription
      setUser(newUser);
      await AsyncStorage.setItem('@user', JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      throw error;
    }
  };

  // Connexion utilisateur
  const signIn = async (email, password) => {
    try {
      // Récupérer les utilisateurs enregistrés
      const existingUsersJSON = await AsyncStorage.getItem('@registered_users');
      const existingUsers = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];
      
      // Trouver l'utilisateur correspondant
      const foundUser = existingUsers.find(u => 
        u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Connecter l'utilisateur
      setUser(foundUser);
      await AsyncStorage.setItem('@user', JSON.stringify(foundUser));
      
      return foundUser;
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      throw error;
    }
  };

  // Déconnexion utilisateur
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
      router.replace('/auth');
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};