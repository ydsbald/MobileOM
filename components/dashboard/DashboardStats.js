import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Users, ClipboardList, TriangleAlert as AlertTriangle } from 'lucide-react-native';

// Composant pour afficher les statistiques du tableau de bord
const DashboardStats = ({ patientCount, alertCount, observationCount }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <View style={styles.iconContainer}>
            <Users size={24} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{patientCount}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, styles.warningCard]}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={24} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{alertCount}</Text>
            <Text style={styles.statLabel}>Alertes</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.statCard, styles.secondaryCard]}>
        <View style={styles.iconContainer}>
          <ClipboardList size={24} color="white" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{observationCount}</Text>
          <Text style={styles.statLabel}>Observations récentes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  primaryCard: {
    backgroundColor: COLORS.primary,
  },
  warningCard: {
    backgroundColor: COLORS.warning,
  },
  secondaryCard: {
    backgroundColor: '#2D5DA1',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default DashboardStats;