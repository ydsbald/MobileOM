import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '@/constants/colors';
import { ChevronRight } from 'lucide-react-native';

// Composant pour afficher un patient dans une liste
const PatientListItem = ({ patient, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      {/* Image du patient */}
      <Image
        source={{ uri: patient.imageUrl }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.name}>{patient.firstName} {patient.lastName}</Text>
        
        <View style={styles.detailsContainer}>
          {patient.gender && (
            <Text style={styles.detail}>{patient.gender}</Text>
          )}
          
          {patient.birthDate && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.detail}>{patient.birthDate}</Text>
            </>
          )}
          
          {patient.diagnosis && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.diagnosis}>{patient.diagnosis}</Text>
            </>
          )}
        </View>
      </View>
      
      <ChevronRight size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  detail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  separator: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    marginHorizontal: 6,
  },
  diagnosis: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default PatientListItem;
