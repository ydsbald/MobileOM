import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle } from 'lucide-react-native';

// Composant pour afficher une alerte (température élevée, etc.)
const AlertBadge = ({ title, description, severity, date, onPress }) => {
  // Définir les couleurs en fonction de la sévérité
  const getSeverityColor = () => {
    switch (severity) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.primary;
      default:
        return COLORS.textLight;
    }
  };
  
  // Obtenir l'icône en fonction de la sévérité
  const SeverityIcon = severity === 'high' ? AlertCircle : AlertTriangle;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { borderLeftColor: getSeverityColor() }
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <SeverityIcon size={20} color={getSeverityColor()} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {date && (
          <Text style={styles.date}>
            {new Date(date).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: COLORS.textLight,
  },
});

export default AlertBadge;