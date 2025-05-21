import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Wifi, WifiOff, Check, RefreshCcw } from 'lucide-react-native';

// Composant pour afficher le statut de synchronisation
const SyncStatus = ({ isConnected, syncStatus, onSync }) => {
  // Obtenir l'icône et le message en fonction de l'état
  const getStatusDisplay = () => {
    if (!isConnected) {
      return {
        icon: <WifiOff size={16} color={COLORS.error} />,
        text: 'Hors ligne',
        color: COLORS.error
      };
    }
    
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <ActivityIndicator size="small" color={COLORS.primary} />,
          text: 'Synchronisation...',
          color: COLORS.primary
        };
      case 'success':
        return {
          icon: <Check size={16} color={COLORS.success} />,
          text: 'Synchronisé',
          color: COLORS.success
        };
      case 'error':
        return {
          icon: <RefreshCcw size={16} color={COLORS.warning} />,
          text: 'Erreur de sync',
          color: COLORS.warning
        };
      default:
        return {
          icon: <Wifi size={16} color={COLORS.primary} />,
          text: 'Connecté',
          color: COLORS.primary
        };
    }
  };
  
  const { icon, text, color } = getStatusDisplay();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: color }]}
      onPress={onSync}
      disabled={!isConnected || syncStatus === 'syncing' || !onSync}
    >
      {icon}
      <Text style={[styles.text, { color }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 6,
  },
});

export default SyncStatus;