import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { AuthContext } from '@/context/AuthContext';
import { NetworkContext } from '@/context/NetworkContext';
import { DataContext } from '@/context/DataContext';
import { LogOut, CloudSun as CloudSync, Bell, ChevronRight, User, Clock, Thermometer, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useContext(AuthContext);
  const { isConnected, syncNow, setSyncInterval, syncInterval } = useContext(NetworkContext);
  const { clearAllData } = useContext(DataContext);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await syncNow();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      Alert.alert('Erreur', 'La synchronisation a échoué. Veuillez réessayer.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Supprimer toutes les données',
      'Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await clearAllData();
              Alert.alert('Succès', 'Toutes les données ont été supprimées.');
            } catch (error) {
              console.error('Erreur lors de la suppression des données:', error);
              Alert.alert('Erreur', 'La suppression des données a échoué.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };


  const toggleSyncInterval = () => {
    // Alterner entre synchronisation manuelle (0) et automatique (5 minutes)
    const newInterval = syncInterval === 0 ? 5 : 0;
    setSyncInterval(newInterval);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Paramètres</Text>
        
        {/* Section Profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileIconContainer}>
              <User size={24} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>
        
        {/* Section Synchronisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronisation</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <CloudSync size={20} color={COLORS.primary} />
                <Text style={styles.settingLabel}>Synchronisation automatique</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: COLORS.primary + '80' }}
                thumbColor={syncInterval > 0 ? COLORS.primary : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={toggleSyncInterval}
                value={syncInterval > 0}
              />
            </View>
            
            {syncInterval > 0 && (
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Clock size={20} color={COLORS.primary} />
                  <Text style={styles.settingLabel}>Intervalle de synchronisation</Text>
                </View>
                <View style={styles.settingValueContainer}>
                  <Text style={styles.settingValue}>{syncInterval} min</Text>
                  <ChevronRight size={16} color={COLORS.textLight} />
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.syncNowButton]} 
              onPress={handleSyncNow}
              disabled={!isConnected || isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Text style={styles.syncNowText}>Synchroniser maintenant</Text>
                  <Text style={styles.syncStatusText}>
                    {isConnected ? 'Connecté' : 'Hors ligne'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Bell size={20} color={COLORS.primary} />
                <Text style={styles.settingLabel}>Alertes</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: COLORS.primary + '80' }}
                thumbColor={notificationsEnabled ? COLORS.primary : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Thermometer size={20} color={COLORS.primary} />
                <Text style={styles.settingLabel}>Seuil de fièvre</Text>
              </View>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValue}>38.5°C</Text>
                <ChevronRight size={16} color={COLORS.textLight} />
              </View>
            </View>
          </View>
        </View>
        
        {/* Section Danger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerButton]}
              onPress={handleClearAllData}
              disabled={isClearing}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color={COLORS.error} />
              ) : (
                <>
                  <Trash2 size={20} color={COLORS.error} />
                  <Text style={styles.dangerButtonText}>Effacer toutes les données</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerButton]}
              onPress={handleSignOut}
            >
              <LogOut size={20} color={COLORS.error} />
              <Text style={styles.dangerButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MediTrack v1.0.0</Text>
          <View style={styles.authorContainer}>
            <Text style={styles.madeWithLove}>© 2025 </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/avotraadrien')}>
            <Text style={styles.authorLink}>MPY'Dev</Text>
            </TouchableOpacity>
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
    padding: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    color: COLORS.textDark,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 12,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textLight,
    marginRight: 8,
  },
  syncNowButton: {
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
  },
  syncNowText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 4,
  },
  syncStatusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  dangerButton: {
    paddingVertical: 16,
  },
  dangerButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.error,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  authorContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  madeWithLove: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.textLight,
  },
  authorLink: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  
});