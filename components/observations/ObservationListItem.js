import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Thermometer, Heart } from 'lucide-react-native';

// Composant pour afficher une observation dans une liste
const ObservationListItem = ({ observation, onPress }) => {
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Définir le statut de l'observation (alerte ou normal)
  const getObservationStatus = () => {
    if (observation.temperature >= 38.5) {
      return {
        color: COLORS.error,
        icon: <Thermometer size={16} color={COLORS.error} />,
        text: `${observation.temperature}°C`
      };
    }
    
    if (observation.heartRate > 100 || observation.heartRate < 60) {
      return {
        color: COLORS.warning,
        icon: <Heart size={16} color={COLORS.warning} />,
        text: `${observation.heartRate} bpm`
      };
    }
    
    return {
      color: COLORS.textLight,
      icon: null,
      text: 'Normal'
    };
  };
  
  const status = getObservationStatus();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.patientName}>{observation.patientName || 'Patient non sélectionné'}</Text>
          <Text style={styles.date}>{formatDate(observation.date)}</Text>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.type}>{observation.type || 'Type non spécifié'}</Text>
          
          {observation.notes && (
            <Text style={styles.notes} numberOfLines={1}>
              {observation.notes}
            </Text>
          )}
        </View>
      </View>
      
      {status.icon && (
        <View style={[styles.statusContainer, { borderColor: status.color }]}>
          {status.icon}
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.textDark,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  details: {
    
  },
  type: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  notes: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default ObservationListItem;