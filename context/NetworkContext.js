import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { AuthContext } from './AuthContext';

// Créer le contexte réseau
export const NetworkContext = createContext();

// Fournisseur de contexte réseau
export const NetworkProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [syncInterval, setSyncIntervalState] = useState(0); // 0 = manuel, autrement en minutes
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncTimer, setSyncTimer] = useState(null);

  // Surveiller l'état de la connexion
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    // Vérification initiale de la connexion
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Configuration de la synchronisation automatique
  useEffect(() => {
    if (syncTimer) {
      clearInterval(syncTimer);
      setSyncTimer(null);
    }

    if (syncInterval > 0 && user) {
      const timer = setInterval(() => {
        if (isConnected) {
          syncNow();
        }
      }, syncInterval * 60 * 1000);
      
      setSyncTimer(timer);
    }

    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, [syncInterval, isConnected, user]);

  // Surveiller les changements de connexion pour synchroniser automatiquement
  useEffect(() => {
    if (isConnected && user && lastSyncTime === null) {
      // Synchronisation initiale lorsque la connexion est établie
      syncNow();
    }
  }, [isConnected, user]);

  // Fonction pour changer l'intervalle de synchronisation
  const setSyncInterval = (minutes) => {
    setSyncIntervalState(minutes);
  };

  // Fonction pour synchroniser maintenant
  const syncNow = async () => {
    if (!isConnected) {
      Alert.alert("Erreur de synchronisation", "Aucune connexion internet disponible.");
      return;
    }

    if (!user) {
      Alert.alert("Erreur de synchronisation", "Vous devez être connecté pour synchroniser.");
      return;
    }

    try {
      setSyncStatus('syncing');
      
      // Simuler une synchronisation avec délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En production, ici vous appelleriez votre API pour synchroniser les données
      // const response = await fetch('https://api.example.com/sync', {...});
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      setSyncStatus('error');
      Alert.alert("Erreur de synchronisation", "Une erreur s'est produite lors de la synchronisation.");
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        syncStatus,
        syncInterval,
        lastSyncTime,
        setSyncInterval,
        syncNow,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};