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
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext'; // Assuming AuthContext is correctly set up
import { COLORS } from '@/constants/colors'; // Assuming COLORS is correctly defined
import { TriangleAlert as AlertTriangle, Eye, EyeOff } from 'lucide-react-native'; // Added Eye and EyeOff

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Call the sign-in function from the context
      await signIn(email, password);

      // Redirect to the dashboard if login is successful
      router.replace('/(tabs)'); // Ensure this route is correct for your setup

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/croix.jpg')} // Ensure this path is correct
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>MediTrack</Text>
          <Text style={styles.subtitle}>Suivi médical, même hors connexion</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <AlertTriangle color={COLORS.error} size={20} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => { /* Optionally focus next input */ }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput} // Adjusted style
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible} // Controlled by state
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIconContainer}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increases touchable area
                >
                  {isPasswordVisible ? (
                    <EyeOff color={COLORS.textLight} size={22} />
                  ) : (
                    <Eye color={COLORS.textLight} size={22} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ?</Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>S'inscrire</Text>
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
    backgroundColor: '#F5F8FA', // Consider using COLORS.background or similar
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40, // Adjusted padding
    // justifyContent: 'center', // Center content vertically if less than screen height
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100, // Slightly reduced size
    height: 100,
    // borderRadius: 50, // If your logo is circular, uncomment
  },
  title: {
    fontFamily: 'Poppins-SemiBold', // Ensure this font is loaded in your project
    fontSize: 28,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular', // Ensure this font is loaded
    fontSize: 16,
    color: COLORS.text, // Assuming COLORS.text is defined
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins-Medium', // Ensure this font is loaded
    fontSize: 14,
    color: COLORS.textDark, // Assuming COLORS.textDark is defined
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'white',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Consider using a color from COLORS
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textDark, // Added text color for input
  },
  // Styles for password input wrapper and icon
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1, // Take available space
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%', // Fill the wrapper height
    color: COLORS.textDark,
  },
  eyeIconContainer: {
    paddingHorizontal: 12, // Add some padding around the icon
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16, // Added some margin top
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', // Align items vertically
    marginTop: 24,
    gap: 6, // Use gap for spacing if supported, otherwise margin
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight, // Assuming COLORS.textLight is defined
  },
  linkText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2', // Example error background
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA', // Example error border
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.error, // Assuming COLORS.error is defined
    marginLeft: 8,
    flexShrink: 1, // Allow text to wrap if long
  },
});
