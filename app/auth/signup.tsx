import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { COLORS } from '@/constants/colors';
import { TriangleAlert as AlertTriangle, Eye, EyeOff } from 'lucide-react-native';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp } = useContext(AuthContext);
  const router = useRouter();

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await signUp({
        firstName,
        lastName,
        email,
        password
      });

      setSuccess('Inscription réussie. Redirection...');
      setTimeout(() => {
        router.replace('/auth');
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez MediTrack pour un suivi médical efficace</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <AlertTriangle color={COLORS.error} size={20} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre prénom"
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  returnKeyType="next"
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  returnKeyType="next"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre email"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Au moins 6 caractères"
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                  secureTextEntry={!isPasswordVisible}
                  returnKeyType="next"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIconContainer}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isPasswordVisible ? (
                    <EyeOff color={COLORS.textLight} size={22} />
                  ) : (
                    <Eye color={COLORS.textLight} size={22} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                  secureTextEntry={!isConfirmPasswordVisible}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  style={styles.eyeIconContainer}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff color={COLORS.textLight} size={22} />
                  ) : (
                    <Eye color={COLORS.textLight} size={22} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte ?</Text>
              <Link href="/auth" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Se connecter</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  successContainer: {
    backgroundColor: '#E5F9E7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: COLORS.success,
    fontFamily: 'Poppins-Regular',
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Poppins-Regular',
    backgroundColor: COLORS.white,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textDark,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%',
    color: COLORS.textDark,
  },
  eyeIconContainer: {
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.text,
    marginRight: 4,
  },
  linkText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: COLORS.primary,
  },
});
