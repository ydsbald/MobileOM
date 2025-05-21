import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { DataContext } from '@/context/DataContext';
import VitalSigns from '@/components/observations/VitalSigns';
import { ArrowLeft, Printer, Share2, Trash2 } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const OBSERVATION_TYPES = [
  'Examen général',
  'Suivi post-opératoire',
  'Consultation de routine',
  'Urgence',
  'Suivi de traitement'
];

export default function ObservationScreen() {
  const { id } = useLocalSearchParams();
  const observationId = id as string;
  const router = useRouter();
  
  const { 
    getObservationById, 
    updateObservation, 
    deleteObservation,
    getPatientById,
    patients
  } = useContext(DataContext);
  
  const [observation, setObservation] = useState(null);
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // État pour l'édition des observations
  const [formData, setFormData] = useState({
    type: '',
    patientId: '',
    notes: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    date: new Date().toISOString()
  });
  
  // État pour la sélection du patient
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  
  useEffect(() => {
    loadObservation();
  }, [observationId]);
  
  const loadObservation = async () => {
    try {
      setIsLoading(true);
      const observationData = await getObservationById(observationId);
      setObservation(observationData);
      
      if (observationData.patientId) {
        const patientData = await getPatientById(observationData.patientId);
        setPatient(patientData);
      }
      
      setFormData({
        type: observationData.type || '',
        patientId: observationData.patientId || '',
        notes: observationData.notes || '',
        temperature: observationData.temperature ? observationData.temperature.toString() : '',
        bloodPressure: observationData.bloodPressure || '',
        heartRate: observationData.heartRate ? observationData.heartRate.toString() : '',
        oxygenSaturation: observationData.oxygenSaturation ? observationData.oxygenSaturation.toString() : '',
        respiratoryRate: observationData.respiratoryRate ? observationData.respiratoryRate.toString() : '',
        date: observationData.date || new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'observation:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de l\'observation.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Convertir les valeurs numériques
      const updatedData = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
      };
      
      await updateObservation(observationId, updatedData);
      await loadObservation();
      
      Alert.alert('Succès', 'Observation enregistrée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'observation:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'observation',
      'Êtes-vous sûr de vouloir supprimer cette observation ? Cette action est irréversible.',
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
              setIsDeleting(true);
              await deleteObservation(observationId);
              router.replace('/observations');
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'observation:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'observation.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  const handleSelectPatient = (patientId) => {
    handleChange('patientId', patientId);
    setShowPatientSelector(false);
    
    // Mettre à jour l'objet patient
    const selectedPatient = patients.find(p => p.id === patientId);
    setPatient(selectedPatient);
  };
  
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      if (!patient) {
        Alert.alert('Erreur', 'Veuillez sélectionner un patient pour cette observation avant de générer un PDF.');
        setIsGeneratingPDF(false);
        return;
      }
      
      const dateFormatted = new Date(observation.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Construire le HTML du PDF
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Observation Médicale</title>
            <style>
              body {
                font-family: 'Helvetica', sans-serif;
                margin: 0;
                padding: 20px;
                color: #334155;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #0A6EBD;
                margin-bottom: 5px;
              }
              .title {
                font-size: 20px;
                margin-bottom: 5px;
              }
              .date {
                font-size: 14px;
                color: #64748B;
              }
              .section {
                margin-bottom: 25px;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #E2E8F0;
              }
              .patient-info {
                background-color: #F8FAFC;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
              }
              .patient-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .patient-details {
                font-size: 14px;
                color: #64748B;
              }
              .vitals-grid {
                display: flex;
                flex-wrap: wrap;
                margin: 0 -10px;
              }
              .vital-item {
                width: calc(50% - 20px);
                margin: 0 10px 15px;
                background-color: #F8FAFC;
                padding: 10px;
                border-radius: 5px;
              }
              .vital-label {
                font-size: 14px;
                color: #64748B;
                margin-bottom: 5px;
              }
              .vital-value {
                font-size: 16px;
                font-weight: bold;
              }
              .notes {
                background-color: #F8FAFC;
                padding: 15px;
                border-radius: 5px;
                white-space: pre-wrap;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #64748B;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">MediTrack</div>
              <div class="title">Observation Médicale</div>
              <div class="date">${dateFormatted}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Informations du patient</div>
              <div class="patient-info">
                <div class="patient-name">${patient.firstName} ${patient.lastName}</div>
                <div class="patient-details">
                  ${patient.gender ? patient.gender + ' • ' : ''}
                  ${patient.birthDate ? patient.birthDate : ''}
                  ${patient.diagnosis ? '<br>Diagnostic: ' + patient.diagnosis : ''}
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Type d'observation</div>
              <div>${observation.type || 'Non spécifié'}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Signes vitaux</div>
              <div class="vitals-grid">
                <div class="vital-item">
                  <div class="vital-label">Température</div>
                  <div class="vital-value">${observation.temperature ? observation.temperature + ' °C' : 'Non mesuré'}</div>
                </div>
                <div class="vital-item">
                  <div class="vital-label">Tension artérielle</div>
                  <div class="vital-value">${observation.bloodPressure || 'Non mesuré'}</div>
                </div>
                <div class="vital-item">
                  <div class="vital-label">Fréquence cardiaque</div>
                  <div class="vital-value">${observation.heartRate ? observation.heartRate + ' bpm' : 'Non mesuré'}</div>
                </div>
                <div class="vital-item">
                  <div class="vital-label">Saturation en oxygène</div>
                  <div class="vital-value">${observation.oxygenSaturation ? observation.oxygenSaturation + ' %' : 'Non mesuré'}</div>
                </div>
                <div class="vital-item">
                  <div class="vital-label">Fréquence respiratoire</div>
                  <div class="vital-value">${observation.respiratoryRate ? observation.respiratoryRate + ' /min' : 'Non mesuré'}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Notes</div>
              <div class="notes">${observation.notes || 'Aucune note'}</div>
            </div>
            
            <div class="footer">
              Document généré via l'application MediTrack le ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </body>
        </html>
      `;
      
      // Générer le PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // Partager le fichier
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de l'observation...</Text>
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
          headerTitle: 'Observation médicale',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              {isGeneratingPDF ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <TouchableOpacity
                  onPress={generatePDF}
                  style={styles.headerButton}
                  disabled={!patient}
                >
                  <Printer size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.headerButton}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                  <Trash2 size={20} color={COLORS.error} />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          <Text style={styles.dateText}>
            {new Date(formData.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Patient</Text>
          
          {patient ? (
            <TouchableOpacity 
              style={styles.patientCard}
              onPress={() => setShowPatientSelector(true)}
            >
              <View>
                <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                <Text style={styles.patientInfo}>
                  {patient.gender && patient.birthDate 
                    ? `${patient.gender} • ${patient.birthDate}`
                    : patient.gender || patient.birthDate || 'Informations non renseignées'}
                </Text>
              </View>
              <Text style={styles.changeText}>Changer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.selectPatientButton}
              onPress={() => setShowPatientSelector(true)}
            >
              <Text style={styles.selectPatientText}>Sélectionner un patient</Text>
            </TouchableOpacity>
          )}
          
          {showPatientSelector && (
            <View style={styles.patientSelector}>
              <Text style={styles.patientSelectorTitle}>Sélectionner un patient</Text>
              
              <ScrollView style={styles.patientsList} nestedScrollEnabled={true}>
                {patients.map(patient => (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.patientItem}
                    onPress={() => handleSelectPatient(patient.id)}
                  >
                    <Text style={styles.patientItemName}>{patient.firstName} {patient.lastName}</Text>
                    <Text style={styles.patientItemInfo}>
                      {patient.gender && patient.birthDate 
                        ? `${patient.gender} • ${patient.birthDate}`
                        : patient.gender || patient.birthDate || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {patients.length === 0 && (
                  <Text style={styles.noPatients}>Aucun patient enregistré</Text>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPatientSelector(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Type d'observation</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeButtonsContainer}
          >
            {OBSERVATION_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive
                ]}
                onPress={() => handleChange('type', type)}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextActive
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <VitalSigns
          formData={formData}
          handleChange={handleChange}
        />
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="Ajoutez vos observations, symptômes, traitements..."
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer l'observation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
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
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textDark,
  },
  backButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  formSection: {
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
    marginBottom: 12,
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  patientInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  changeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  selectPatientButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  selectPatientText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  patientSelector: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientSelectorTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  patientsList: {
    maxHeight: 200,
  },
  patientItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  patientItemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  patientItemInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  noPatients: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 16,
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
  },
  typeButtonsContainer: {
    paddingVertical: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  notesInput: {
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
  },
});