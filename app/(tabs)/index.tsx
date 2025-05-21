import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { DataContext } from '@/context/DataContext';
import { AuthContext } from '@/context/AuthContext';
import { NetworkContext } from '@/context/NetworkContext';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PatientListItem from '@/components/patients/PatientListItem';
import AlertBadge from '@/components/common/AlertBadge';
import SyncStatus from '@/components/common/SyncStatus';
import { Clock, Users, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { isConnected, syncStatus } = useContext(NetworkContext);
  const { user } = useContext(AuthContext);
  const { patients, recentObservations, alerts, isLoading } = useContext(DataContext);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    // Récupère les 5 patients les plus récemment modifiés
    if (patients.length > 0) {
      const sorted = [...patients].sort((a, b) => 
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
      ).slice(0, 5);
      setRecentPatients(sorted);
    }
  }, [patients]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Bonjour, Dr {user?.firstName || 'Utilisateur'} 😊!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <SyncStatus isConnected={isConnected} syncStatus={syncStatus} />
        </View>

        <DashboardStats 
          patientCount={patients.length} 
          alertCount={alerts.length}
          observationCount={recentObservations.length}
        />

        {alerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <AlertTriangle size={20} color={COLORS.warning} />
                <Text style={styles.sectionTitle}>Alertes actives</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/observations')}>
                <Text style={styles.seeAll}>Tout voir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertContainer}>
              {alerts.slice(0, 3).map((alert) => (
                <AlertBadge 
                  key={alert.id} 
                  title={`${alert.patientName} - ${alert.type}`}
                  description={alert.message}
                  severity={alert.severity}
                  date={alert.date}
                  onPress={() => router.push(`/observation/${alert.observationId}`)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Activité récente</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/observations')}>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentActivityContainer}>
            {recentObservations.length > 0 ? (
              recentObservations.slice(0, 3).map((observation) => (
                <TouchableOpacity
                  key={observation.id}
                  style={styles.activityItem}
                  onPress={() => router.push(`/observation/${observation.id}`)}
                >
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Observation: {observation.patientName}</Text>
                    <Text style={styles.activityDescription} numberOfLines={1}>
                      {observation.type} - {observation.notes ? observation.notes.substring(0, 50) + (observation.notes.length > 50 ? '...' : '') : 'Pas de notes'}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {new Date(observation.date).toLocaleDateString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyMessage}>Aucune observation récente</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Patients récents</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/patients')}>
              <Text style={styles.seeAll}>Tous les patients</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patientsContainer}>
            {recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <PatientListItem
                  key={patient.id}
                  patient={patient}
                  onPress={() => router.push(`/patient/${patient.id}`)}
                />
              ))
            ) : (
              <Text style={styles.emptyMessage}>Aucun patient enregistré</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.textDark,
    marginLeft: 8,
  },
  seeAll: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  alertContainer: {
    gap: 8,
  },
  recentActivityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  activityDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  activityTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  patientsContainer: {
    gap: 8,
  },
  emptyMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
  },
});