import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { Users, Clipboard, Chrome as Home, Settings, CirclePlus as PlusCircle } from 'lucide-react-native';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { DataContext } from '@/context/DataContext';

export default function TabLayout() {
  const router = useRouter();
  const { createEmptyObservation } = useContext(DataContext);

  const handleAddObservation = async () => {
    try {
      const newObservationId = await createEmptyObservation();
      router.push(`/observation/${newObservationId}`);
    } catch (error) {
      console.error('Erreur lors de la création d\'observation:', error);
      // Gérer l'erreur (par exemple avec une notification Toast)
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.addButtonContainer}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddObservation}
              >
                <PlusCircle size={28} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Empêche la navigation par défaut vers l'onglet
            e.preventDefault();
            handleAddObservation();
          },
        })}
      />
      <Tabs.Screen
        name="observations"
        options={{
          title: 'Observations',
          tabBarIcon: ({ color, size }) => (
            <Clipboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    width: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});