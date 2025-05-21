import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { DataContext } from '@/context/DataContext';
import { Plus, ChevronRight } from 'lucide-react-native';
import PatientVitals from '@/components/patients/PatientVitals';
import PatientObservations from '@/components/patients/PatientObservations';


interface PatientFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  diagnosis: string;
  medicalHistory: string;
  medications: string;
  imageUri: string;
}
export default function PatientScreen() {
  const { id } = useLocalSearchParams();
  const patientId = id as string;
  const router = useRouter();
  const { getPatientById, updatePatient, createObservationForPatient, deletePatient, uploadPatientImage } = useContext(DataContext);

  const [patient, setPatient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    diagnosis: '',
    medicalHistory: '',
    medications: '',
    imageUri: ''
  });

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setIsLoading(true);
      const patientData = await getPatientById(patientId);

      if (!patientData) {
        throw new Error('Patient non trouvé');
      }

      setPatient(patientData);
      setFormData({
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
        birthDate: patientData.birthDate || '',
        gender: patientData.gender || '',
        diagnosis: patientData.diagnosis || '',
        medicalHistory: patientData.medicalHistory || '',
        medications: patientData.medications || '',
        imageUri: patientData.imageUrl || '' // Note: Changed from imageUri to imageUrl to match your DataContext
      });

      setLocalImageUri(patientData.imageUrl || null);
    } catch (error) {
      console.error('Erreur lors du chargement du patient:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du patient');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos pour télécharger des images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images','videos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setLocalImageUri(selectedImage.uri);
        // We'll handle the actual upload in the save function
      }
    } catch (error) {
      console.error('Erreur du sélecteur d\'images:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // If a new image was selected, upload it first
      let imageUrl = formData.imageUri;
      if (localImageUri && localImageUri !== formData.imageUri) {
        imageUrl = await uploadPatientImage(patientId, localImageUri);
      }

      // Update patient with all data including the new image URL
      await updatePatient(patientId, {
        ...formData,
        imageUrl
      });

      setIsEditing(false);
      await loadPatient(); // Refresh data
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du patient:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les données du patient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le patient',
      'Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deletePatient(patientId);
              router.replace('/patients');
            } catch (error) {
              console.error('Erreur lors de la suppression du patient:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le patient');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleChange = (key: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddObservation = async () => {
    try {
      const observationId = await createObservationForPatient(patientId);
      router.push(`/observation/${observationId}`);
    } catch (error) {
      console.error('Erreur lors de la création de l\'observation:', error);
      Alert.alert('Erreur', 'Impossible de créer une nouvelle observation');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des données du patient...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Impossible de charger les données du patient</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerTitle: isEditing ? 'Modifier le patient' : `${patient.firstName} ${patient.lastName}`,
          headerRight: () => (
            <View style={styles.headerButtons}>
              {isEditing ? (
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveButton}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Modifier</Text>
                  </TouchableOpacity>
                  {!isDeleting ? (
                    <TouchableOpacity
                      onPress={handleDelete}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  ) : (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  )}
                </>
              )}
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {isEditing ? (
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Photo de profil</Text>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {localImageUri ? (
                  <Image
                    source={{ uri: localImageUri }}
                    style={styles.profileImage}
                    onError={() => setLocalImageUri(null)}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>+ Ajouter{'\n'}une photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Prénom</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    placeholder="Prénom"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nom de famille</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    placeholder="Nom de famille"
                  />
                </View>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date de naissance</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.birthDate}
                    onChangeText={(value) => handleChange('birthDate', value)}
                    placeholder="JJ/MM/AAAA"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Genre</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.gender}
                    onChangeText={(value) => handleChange('gender', value)}
                    placeholder="Homme/Femme"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Informations médicales</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Diagnostic</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.diagnosis}
                  onChangeText={(value) => handleChange('diagnosis', value)}
                  placeholder="Diagnostic principal"
                  multiline
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Antécédents médicaux</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={formData.medicalHistory}
                  onChangeText={(value) => handleChange('medicalHistory', value)}
                  placeholder="Antécédents médicaux"
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Médicaments</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={formData.medications}
                  onChangeText={(value) => handleChange('medications', value)}
                  placeholder="Médicaments actuels"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.patientCard}>
              <View style={styles.patientHeader}>
                {patient.imageUrl ? (
                  <Image
                    source={{ uri: patient.imageUrl }}
                    style={styles.profileImageDisplay}
                    onError={() => console.log('Impossible de charger l\'image du patient')}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileInitials}>
                      {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.patientInfoContainer}>
                  <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                  <Text style={styles.patientInfo}>
                    {patient.gender && patient.birthDate
                      ? `${patient.gender} • ${patient.birthDate}`
                      : patient.gender || patient.birthDate || 'Aucune information'}
                  </Text>
                </View>
              </View>

              {patient.diagnosis && (
                <View style={styles.diagnosisContainer}>
                  <Text style={styles.diagnosisLabel}>Diagnostic</Text>
                  <Text style={styles.diagnosisText}>{patient.diagnosis}</Text>
                </View>
              )}
            </View>

            <PatientVitals patientId={patientId} />

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informations médicales</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Antécédents médicaux</Text>
                  <Text style={styles.infoText}>
                    {patient.medicalHistory || 'Aucun antécédent médical enregistré'}
                  </Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Médicaments actuels</Text>
                  <Text style={styles.infoText}>
                    {patient.medications || 'Aucun médicament enregistré'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.observationsSection}>
              <View style={styles.observationsHeader}>
                <Text style={styles.sectionTitle}>Observations</Text>
                <TouchableOpacity
                  style={styles.addObservationButton}
                  onPress={handleAddObservation}
                >
                  <Plus size={16} color="white" />
                  <Text style={styles.addObservationText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
              <PatientObservations patientId={patientId} />
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/observations')}
              >
                <Text style={styles.viewAllText}>Voir toutes les observations</Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    zIndex:2
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 12,
  },
  editButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  deleteButton: {},
  deleteButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.error,
  },
  saveButton: {
    alignContent:"center",
    backgroundColor: COLORS.primary,
    padding:2,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
  },
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  patientName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  patientInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  profileImageDisplay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignContent:'center',
    backgroundColor: '#E2E8F0', // Added a background color for cases where image load fails
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: COLORS.primary,
  },
  diagnosisContainer: {
    backgroundColor: '#EFF6FF', // Example color
    borderRadius: 8,
    padding: 12,
    marginTop: 8, // Added margin for separation
  },
  diagnosisLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  diagnosisText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textDark,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoItem: {
    padding: 16,
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  observationsSection: {
    marginBottom: 24,
  },
  observationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addObservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addObservationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 12,
    borderWidth: 1, // Added border for better visibility
    borderColor: COLORS.primaryLight, // Example color
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
  // Form Styles
  formContainer: {
    gap: 24, // Using gap for spacing between form sections
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12, // Using gap for spacing between inputs in a row
    // marginBottom: 12, // No longer needed if inputContainer has marginBottom
  },
  inputContainer: {
    flex: 1,
    marginBottom: 12, // For spacing below each input or input row
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark, // Ensure text color is set for inputs
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top', // Important for multiline inputs
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0', // Background for image picker preview
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePlaceholderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    alignSelf:"center"
  },
});