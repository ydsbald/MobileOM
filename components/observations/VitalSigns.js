import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Thermometer, Heart, Droplet, Wind, Activity } from 'lucide-react-native';

// Composant pour la saisie et l'affichage des signes vitaux
const VitalSigns = ({ formData, handleChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Signes vitaux</Text>
      
      <View style={styles.vitalsGrid}>
        {/* Température */}
        <View style={styles.vitalContainer}>
          <View style={styles.vitalHeader}>
            <Thermometer size={20} color={COLORS.primary} />
            <Text style={styles.vitalLabel}>Température</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.vitalInput}
              value={formData.temperature}
              onChangeText={(value) => handleChange('temperature', value)}
              placeholder="36.5"
              keyboardType="decimal-pad"
            />
            <Text style={styles.vitalUnit}>°C</Text>
          </View>
        </View>
        
        {/* Tension artérielle */}
        <View style={styles.vitalContainer}>
          <View style={styles.vitalHeader}>
            <Activity size={20} color={COLORS.primary} />
            <Text style={styles.vitalLabel}>Tension artérielle</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.vitalInput}
              value={formData.bloodPressure}
              onChangeText={(value) => handleChange('bloodPressure', value)}
              placeholder="120/80"
            />
            <Text style={styles.vitalUnit}>mmHg</Text>
          </View>
        </View>
        
        {/* Fréquence cardiaque */}
        <View style={styles.vitalContainer}>
          <View style={styles.vitalHeader}>
            <Heart size={20} color={COLORS.primary} />
            <Text style={styles.vitalLabel}>Fréquence cardiaque</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.vitalInput}
              value={formData.heartRate}
              onChangeText={(value) => handleChange('heartRate', value)}
              placeholder="75"
              keyboardType="number-pad"
            />
            <Text style={styles.vitalUnit}>bpm</Text>
          </View>
        </View>
        
        {/* Saturation en oxygène */}
        <View style={styles.vitalContainer}>
          <View style={styles.vitalHeader}>
            <Droplet size={20} color={COLORS.primary} />
            <Text style={styles.vitalLabel}>Saturation O₂</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.vitalInput}
              value={formData.oxygenSaturation}
              onChangeText={(value) => handleChange('oxygenSaturation', value)}
              placeholder="98"
              keyboardType="number-pad"
            />
            <Text style={styles.vitalUnit}>%</Text>
          </View>
        </View>
        
        {/* Fréquence respiratoire */}
        <View style={styles.vitalContainer}>
          <View style={styles.vitalHeader}>
            <Wind size={20} color={COLORS.primary} />
            <Text style={styles.vitalLabel}>Fréquence respiratoire</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.vitalInput}
              value={formData.respiratoryRate}
              onChangeText={(value) => handleChange('respiratoryRate', value)}
              placeholder="16"
              keyboardType="number-pad"
            />
            <Text style={styles.vitalUnit}>/min</Text>
          </View>
        </View>
      </View>
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
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalContainer: {
    width: '48%',
    marginBottom: 16,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  vitalInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    paddingVertical: 10,
  },
  vitalUnit: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default VitalSigns;