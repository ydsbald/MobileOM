import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { DataContext } from '@/context/DataContext';
import PatientListItem from '@/components/patients/PatientListItem';
import { Search, Plus, Users } from 'lucide-react-native';

export default function PatientsScreen() {
  const { patients, isLoading, addPatient } = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const router = useRouter();

  // Filtrer les patients en fonction de la recherche
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query);
  });

  const handleCreatePatient = async () => {
    try {
      setIsAddingPatient(true);
      const newPatientId = await addPatient();
      router.push(`/patient/${newPatientId}`);
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
    } finally {
      setIsAddingPatient(false);
    }
  };

  const renderEmptyList = () => {
    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptyDescription}>
            Aucun patient ne correspond à votre recherche
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Users size={64} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>Aucun patient</Text>
        <Text style={styles.emptyDescription}>
          Commencez par ajouter votre premier patient
        </Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleCreatePatient}
          disabled={isAddingPatient}
        >
          {isAddingPatient ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Ajouter un patient</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Patients</Text>
          <TouchableOpacity 
            style={styles.headerAddButton} 
            onPress={handleCreatePatient}
            disabled={isAddingPatient}
          >
            {isAddingPatient ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text style={styles.headerAddButtonText}>Ajouter</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des patients...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PatientListItem
                patient={item}
                onPress={() => router.push(`/patient/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    color: COLORS.textDark,
  },
  headerAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  headerAddButtonText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textDark,
    height: '100%',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textDark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
});