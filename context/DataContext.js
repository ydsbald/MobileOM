import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SQLite from 'expo-sqlite';
import { AuthContext } from './AuthContext';
import uuid from 'react-native-uuid';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Créer le contexte pour les données
export const DataContext = createContext();

// Fonction pour ouvrir la base de données
const openDatabase = () => {
  return SQLite.openDatabaseAsync('meditrack.db');
};

// Fournisseur de données
export const DataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [observations, setObservations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Initialisation de la base de données
  useEffect(() => {
    const initializeDatabase = async () => {
      try {

        setIsLoading(true);
        // Ouvrir une nouvelle base de données
        const database = await openDatabase();
        setDb(database);

        // Créer les tables si elles n'existent pas
        await database.execAsync(`
          PRAGMA foreign_keys = ON;  
          CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            birthDate TEXT,
            gender TEXT,
            diagnosis TEXT,
            medicalHistory TEXT,
            medications TEXT,
            imageUrl TEXT,
            userId TEXT NOT NULL,
            lastUpdate TEXT NOT NULL,
            createdAt TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS observations (
            id TEXT PRIMARY KEY,
            patientId TEXT,
            type TEXT,
            date TEXT NOT NULL,
            temperature REAL,
            bloodPressure TEXT,
            heartRate INTEGER,
            oxygenSaturation INTEGER,
            respiratoryRate INTEGER,
            notes TEXT,
            userId TEXT NOT NULL,
            lastUpdate TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            patientId TEXT,
            observationId TEXT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            userId TEXT NOT NULL,
            FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL,
            FOREIGN KEY (observationId) REFERENCES observations(id) ON DELETE SET NULL
          );
        `);

        // Charger les données initiales
        await loadData(database);

      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      initializeDatabase();
    }

    return () => {
      // Nettoyage: fermer la base de données lorsque le composant est démonté
      if (db) {
        db.closeAsync().catch(error => {
          console.error('Erreur lors de la fermeture de la base de données:', error);
        });
      }
    };
  }, [user]);

  // Charger les données depuis la base de données
  const loadData = async (database) => {
    try {
      if (!user) return;
      
      // Charger les patients
      const patientsResult = await database.getAllAsync(
        'SELECT * FROM patients WHERE userId = ? ORDER BY lastName ASC, firstName ASC',
        [user.id]
      );
      setPatients(patientsResult || []);

      // Charger les observations
      const observationsResult = await database.getAllAsync(
        'SELECT o.*, p.firstName || " " || p.lastName as patientName FROM observations o ' +
        'LEFT JOIN patients p ON o.patientId = p.id ' +
        'WHERE o.userId = ? ' +
        'ORDER BY date DESC',
        [user.id]
      );
      setObservations(observationsResult || []);

      // Générer les alertes basées sur les observations
      const generatedAlerts = generateAlerts(observationsResult || [], patientsResult || []);
      setAlerts(generatedAlerts);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Fonction pour générer des alertes basées sur les observations
  const generateAlerts = (observations, patients) => {
    const alerts = [];
    observations.forEach(obs => {
      const patient = patients.find(p => p.id === obs.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';

      // Alerte pour température élevée
      if (obs.temperature && obs.temperature >= 38.5) {
        alerts.push({
          id: uuid.v4(),
          patientId: obs.patientId,
          observationId: obs.id,
          type: 'Fièvre',
          message: `Température élevée: ${obs.temperature}°C`,
          severity: obs.temperature >= 39.5 ? 'high' : 'medium',
          date: obs.date,
          status: 'active',
          patientName
        });
      }

      // Alerte pour fréquence cardiaque anormale
      if (obs.heartRate) {
        if (obs.heartRate > 100) {
          alerts.push({
            id: uuid.v4(),
            patientId: obs.patientId,
            observationId: obs.id,
            type: 'Tachycardie',
            message: `Fréquence cardiaque élevée: ${obs.heartRate} bpm`,
            severity: obs.heartRate > 120 ? 'high' : 'medium',
            date: obs.date,
            status: 'active',
            patientName
          });
        } else if (obs.heartRate < 60) {
          alerts.push({
            id: uuid.v4(),
            patientId: obs.patientId,
            observationId: obs.id,
            type: 'Bradycardie',
            message: `Fréquence cardiaque basse: ${obs.heartRate} bpm`,
            severity: obs.heartRate < 50 ? 'high' : 'medium',
            date: obs.date,
            status: 'active',
            patientName
          });
        }
      }

      // Alerte pour saturation en oxygène basse
      if (obs.oxygenSaturation && obs.oxygenSaturation < 95) {
        alerts.push({
          id: uuid.v4(),
          patientId: obs.patientId,
          observationId: obs.id,
          type: 'Hypoxémie',
          message: `Saturation O₂ basse: ${obs.oxygenSaturation}%`,
          severity: obs.oxygenSaturation < 90 ? 'high' : 'medium',
          date: obs.date,
          status: 'active',
          patientName
        });
      }

      // Alerte pour tension artérielle anormale
      if (obs.bloodPressure) {
        const [systolic, diastolic] = obs.bloodPressure.split('/').map(Number);
        if (systolic && diastolic) {
          if (systolic > 140 || diastolic > 90) {
            alerts.push({
              id: uuid.v4(),
              patientId: obs.patientId,
              observationId: obs.id,
              type: 'Hypertension',
              message: `Tension artérielle élevée: ${obs.bloodPressure}`,
              severity: systolic > 160 || diastolic > 100 ? 'high' : 'medium',
              date: obs.date,
              status: 'active',
              patientName
            });
          } else if (systolic < 90 || diastolic < 60) {
            alerts.push({
              id: uuid.v4(),
              patientId: obs.patientId,
              observationId: obs.id,
              type: 'Hypotension',
              message: `Tension artérielle basse: ${obs.bloodPressure}`,
              severity: systolic < 80 || diastolic < 50 ? 'high' : 'medium',
              date: obs.date,
              status: 'active',
              patientName
            });
          }
        }
      }
    });

    // Trier les alertes par date (les plus récentes en premier)
    return alerts.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Fonction pour télécharger l'image du patient
  const uploadPatientImage = async (patientId, uri) => {
    try {
      if (!db || !user) throw new Error('Base de données ou utilisateur non disponible');
      
      // Générer un nom de fichier unique
      const filename = `${uuid.v4()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${filename}`;
      
      // Copier le fichier dans le répertoire de l'application
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });
      
      // Mettre à jour le patient avec la nouvelle URL de l'image
      const now = new Date().toISOString();
      await db.runAsync(
        `UPDATE patients SET
          imageUrl = ?,
          lastUpdate = ?
        WHERE id = ?`,
        [newPath, now, patientId]
      );
      
      // Actualiser les données
      await loadData(db);
      
      return newPath;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw error;
    }
  };

  // Fonctions pour manipuler les patients
  const getPatientById = async (id) => {
    try {
      if (!db) return null;
      const result = await db.getFirstAsync(
        'SELECT * FROM patients WHERE id = ?',
        [id]
      );
      
      // Si une image existe, vérifier qu'elle est accessible
      if (result?.imageUrl) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(result.imageUrl);
          if (!fileInfo.exists) {
            result.imageUrl = null;
            // Mettre à jour la base de données pour refléter ce changement
            await db.runAsync(
              `UPDATE patients SET imageUrl = NULL WHERE id = ?`,
              [id]
            );
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du fichier image:', error);
          result.imageUrl = null;
        }
      }
      
      return result || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du patient:', error);
      throw error;
    }
  };

  const addPatient = async (patientData = {}) => {
    try {
      if (!db || !user) throw new Error('Base de données ou utilisateur non disponible');
      
      const patientId = uuid.v4();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO patients (
          id, firstName, lastName, birthDate, gender, diagnosis,
          medicalHistory, medications, imageUrl, userId, lastUpdate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          patientId,
          patientData.firstName || '',
          patientData.lastName || '',
          patientData.birthDate || null,
          patientData.gender || null,
          patientData.diagnosis || null,
          patientData.medicalHistory || null,
          patientData.medications || null,
          patientData.imageUrl || null,
          user.id,
          now,
          now
        ]
      );

      // Actualiser la liste des patients
      await loadData(db);

      return patientId;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du patient:', error);
      throw error;
    }
  };

  const updatePatient = async (id, patientData) => {
    try {
      if (!db) throw new Error('Base de données non disponible');
      
      const now = new Date().toISOString();

      await db.runAsync(
        `UPDATE patients SET
          firstName = ?,
          lastName = ?,
          birthDate = ?,
          gender = ?,
          diagnosis = ?,
          medicalHistory = ?,
          medications = ?,
          imageUrl = ?,
          lastUpdate = ?
        WHERE id = ?`,
        [
          patientData.firstName || '',
          patientData.lastName || '',
          patientData.birthDate || null,
          patientData.gender || null,
          patientData.diagnosis || null,
          patientData.medicalHistory || null,
          patientData.medications || null,
          patientData.imageUrl || null,
          now,
          id
        ]
      );

      // Actualiser la liste des patients
      await loadData(db);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du patient:', error);
      throw error;
    }
  };

  const deletePatient = async (id) => {
    try {
      if (!db) throw new Error('Base de données non disponible');
      
      // Récupérer l'URL de l'image pour la supprimer
      const patient = await getPatientById(id);
      if (patient?.imageUrl) {
        try {
          await FileSystem.deleteAsync(patient.imageUrl);
        } catch (error) {
          console.error('Erreur lors de la suppression du fichier image:', error);
        }
      }
      
      // Les observations liées seront automatiquement supprimées grâce à ON DELETE CASCADE
      await db.runAsync('DELETE FROM patients WHERE id = ?', [id]);

      // Actualiser les données
      await loadData(db);
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      throw error;
    }
  };

  // Fonctions pour manipuler les observations
  const getObservationById = async (id) => {
    try {
      if (!db) return null;
      const result = await db.getFirstAsync(
        'SELECT o.*, p.firstName || " " || p.lastName as patientName FROM observations o ' +
        'LEFT JOIN patients p ON o.patientId = p.id ' +
        'WHERE o.id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'observation:', error);
      throw error;
    }
  };

  const getObservationsByPatientId = async (patientId) => {
    try {
      if (!db) return [];
      const result = await db.getAllAsync(
        'SELECT * FROM observations WHERE patientId = ? ORDER BY date DESC',
        [patientId]
      );
      return result || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des observations du patient:', error);
      throw error;
    }
  };

  const createEmptyObservation = async () => {
    try {
      if (!db || !user) throw new Error('Base de données ou utilisateur non disponible');
      const observationId = uuid.v4();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO observations (
          id, patientId, type, date, temperature, bloodPressure,
          heartRate, oxygenSaturation, respiratoryRate, notes, userId, lastUpdate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          observationId,
          null,
          '',
          now,
          null,
          null,
          null,
          null,
          null,
          '',
          user.id,
          now,
          now
        ]
      );

      // Actualiser la liste des observations
      await loadData(db);

      return observationId;
    } catch (error) {
      console.error('Erreur lors de la création de l\'observation:', error);
      throw error;
    }
  };

  const createObservationForPatient = async (patientId) => {
    try {
      if (!db || !user) throw new Error('Base de données ou utilisateur non disponible');
      const observationId = uuid.v4();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO observations (
          id, patientId, type, date, temperature, bloodPressure,
          heartRate, oxygenSaturation, respiratoryRate, notes, userId, lastUpdate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          observationId,
          patientId,
          '',
          now,
          null,
          null,
          null,
          null,
          null,
          '',
          user.id,
          now,
          now
        ]
      );

      // Actualiser la liste des observations
      await loadData(db);

      return observationId;
    } catch (error) {
      console.error('Erreur lors de la création de l\'observation pour le patient:', error);
      throw error;
    }
  };

  const updateObservation = async (id, observationData) => {
    try {
      if (!db) throw new Error('Base de données non disponible');
      const now = new Date().toISOString();

      await db.runAsync(
        `UPDATE observations SET
          patientId = ?,
          type = ?,
          date = ?,
          temperature = ?,
          bloodPressure = ?,
          heartRate = ?,
          oxygenSaturation = ?,
          respiratoryRate = ?,
          notes = ?,
          lastUpdate = ?
        WHERE id = ?`,
        [
          observationData.patientId || null,
          observationData.type || '',
          observationData.date || now,
          observationData.temperature || null,
          observationData.bloodPressure || null,
          observationData.heartRate || null,
          observationData.oxygenSaturation || null,
          observationData.respiratoryRate || null,
          observationData.notes || '',
          now,
          id
        ]
      );

      // Actualiser les données
      await loadData(db);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'observation:', error);
      throw error;
    }
  };

  const deleteObservation = async (id) => {
    try {
      if (!db) throw new Error('Base de données non disponible');
      await db.runAsync('DELETE FROM observations WHERE id = ?', [id]);

      // Actualiser les données
      await loadData(db);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'observation:', error);
      throw error;
    }
  };

  // Fonction pour effacer toutes les données
  const clearAllData = async () => {
    try {
      if (!db || !user) throw new Error('Base de données ou utilisateur non disponible');
      
      // Supprimer toutes les images des patients
      const patients = await db.getAllAsync(
        'SELECT * FROM patients WHERE userId = ?',
        [user.id]
      );
      
      for (const patient of patients) {
        if (patient.imageUrl) {
          try {
            await FileSystem.deleteAsync(patient.imageUrl);
          } catch (error) {
            console.error('Erreur lors de la suppression du fichier image:', error);
          }
        }
      }
      
      await db.execAsync('DELETE FROM patients WHERE userId = ?', [user.id]);
      await db.execAsync('DELETE FROM observations WHERE userId = ?', [user.id]);
      await db.execAsync('DELETE FROM alerts WHERE userId = ?', [user.id]);

      // Actualiser les données
      await loadData(db);
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données:', error);
      throw error;
    }
  };

  // Obtenir les dernières observations
  const getRecentObservations = () => {
    return observations.slice(0, 10);
  };

  // Fonction pour réinitialiser complètement la base de données
  const resetDatabase = async () => {
    try {
      setIsLoading(true);
      
      // Fermer la base de données existante
      if (db) {
        await db.closeAsync();
      }
      
      // Supprimer le fichier de base de données
      await FileSystem.deleteAsync(`${FileSystem.documentDirectory}SQLite/meditrack.db`);
      
      // Réinitialiser l'état local
      setPatients([]);
      setObservations([]);
      setAlerts([]);
      
      // Recréer la base de données
      const database = await openDatabase();
      setDb(database);
      
      // Recréer les tables
      await database.execAsync(`
        PRAGMA foreign_keys = ON;
        
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          birthDate TEXT,
          gender TEXT,
          diagnosis TEXT,
          medicalHistory TEXT,
          medications TEXT,
          imageUrl TEXT,
          userId TEXT NOT NULL,
          lastUpdate TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS observations (
          id TEXT PRIMARY KEY,
          patientId TEXT,
          type TEXT,
          date TEXT NOT NULL,
          temperature REAL,
          bloodPressure TEXT,
          heartRate INTEGER,
          oxygenSaturation INTEGER,
          respiratoryRate INTEGER,
          notes TEXT,
          userId TEXT NOT NULL,
          lastUpdate TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          patientId TEXT,
          observationId TEXT,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          severity TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          userId TEXT NOT NULL,
          FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL,
          FOREIGN KEY (observationId) REFERENCES observations(id) ON DELETE SET NULL
        );
      `);
      
      // Recharger les données (qui seront vides)
      await loadData(database);
      
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la base de données:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        db,
        patients,
        observations,
        alerts,
        recentObservations: getRecentObservations(),
        isLoading,
        getPatientById,
        addPatient,
        updatePatient,
        deletePatient,
        getObservationById,
        getObservationsByPatientId,
        createEmptyObservation,
        createObservationForPatient,
        updateObservation,
        deleteObservation,
        clearAllData,
        uploadPatientImage,
        resetDatabase,
        loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};