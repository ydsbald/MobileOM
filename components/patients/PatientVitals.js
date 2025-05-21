import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/colors';
import { DataContext } from '@/context/DataContext';

// Composant pour afficher les dernières constantes vitales d'un patient
const PatientVitals = ({ patientId }) => {
  const { observations } = useContext(DataContext);
  const [latestVitals, setLatestVitals] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Filtrer les observations du patient
    const patientObservations = observations.filter(obs => obs.patientId === patientId);
    
    if (patientObservations.length > 0) {
      // Trier par date décroissante
      const sorted = [...patientObservations].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      
      // Prendre la plus récente
      setLatestVitals(sorted[0]);
    }
    
    setIsLoading(false);
  }, [patientId, observations]);
  
  // Si aucune constante vitale n'est disponible
  if (!isLoading && !latestVitals) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Dernières constantes</Text>
        <Text style={styles.noData}>Aucune constante vitale enregistrée</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dernières constantes</Text>
      
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <>
          <Text style={styles.date}>
            {new Date(latestVitals.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Température</Text>
              <Text style={styles.vitalValue}>
                {latestVitals.temperature ? `${latestVitals.temperature} °C` : '-'}
              </Text>
            </View>
            
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Tension</Text>
              <Text style={styles.vitalValue}>
                {latestVitals.bloodPressure || '-'}
              </Text>
            </View>
            
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Fréq. cardiaque</Text>
              <Text style={styles.vitalValue}>
                {latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : '-'}
              </Text>
            </View>
            
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Saturation O₂</Text>
              <Text style={styles.vitalValue}>
                {latestVitals.oxygenSaturation ? `${latestVitals.oxygenSaturation} %` : '-'}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  vitalLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  vitalValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.textDark,
  },
  noData: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
    padding: 16,
  },
});

export default PatientVitals;