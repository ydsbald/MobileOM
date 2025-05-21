import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { DataContext } from '@/context/DataContext';
import { ChevronRight } from 'lucide-react-native';

// Composant pour afficher les observations d'un patient
const PatientObservations = ({ patientId }) => {
  const { observations } = useContext(DataContext);
  const [patientObservations, setPatientObservations] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    // Filtrer les observations du patient
    const filtered = observations.filter(obs => obs.patientId === patientId);
    
    // Trier par date décroissante (les plus récentes en premier)
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    setPatientObservations(sorted);
  }, [patientId, observations]);
  
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Rendu d'un élément de l'observation
  const renderObservationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.observationItem}
      onPress={() => router.push(`/observation/${item.id}`)}
    >
      <View style={styles.observationContent}>
        <Text style={styles.observationType}>
          {item.type || 'Observation générale'}
        </Text>
        <Text style={styles.observationDate}>{formatDate(item.date)}</Text>
      </View>
      <ChevronRight size={16} color={COLORS.textLight} />
    </TouchableOpacity>
  );
  
  // Rendu pour une liste vide
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucune observation enregistrée</Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={patientObservations.slice(0, 5)} // Limiter à 5 observations
        keyExtractor={(item) => item.id}
        renderItem={renderObservationItem}
        ListEmptyComponent={renderEmptyList}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  observationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  observationContent: {
    flex: 1,
  },
  observationType: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  observationDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default PatientObservations;