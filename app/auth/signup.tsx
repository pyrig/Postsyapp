import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Phone, Lock, User, RefreshCw, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { generateHandle } from '@/utils/handleGenerator';

const { width } = Dimensions.get('window');

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; phoneNumber?: string; password?: string; confirmPassword?: string}>({});

  // Generate initial handle on component mount
  useEffect(() => {
    setHandle(generateHandle());
  }, []);

  const regenerateHandle = () => {
    setHandle(generateHandle());
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters except + at the beginning
    const cleaned = text.replace(/[^\d+]/g, '');
    
    // If it starts with +, keep the + and format accordingly
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // For US numbers without country code, format as (XXX) XXX-XXXX
    if (cleaned.length <= 10 && !cleaned.startsWith('+')) {
      if (cleaned.length >= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      } else if (cleaned.length >= 3) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else {
        return cleaned;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const validateForm = () => {
    const newErrors: {email?: string; phoneNumber?: string; password?: string; confirmPassword?: string} = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone number validation - support international numbers
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (cleanPhone.startsWith('+')) {
      // International number - should be at least 7 digits after country code
      if (cleanPhone.length < 8) {
        newErrors.phoneNumber = 'Please enter a valid international phone number';
      }
    } else {
      // US number - should be exactly 10 digits
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit US phone number or use international format (+1234567890)';
      }
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and symbol';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Clean phone number before sending to API
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      await signup(email, cleanPhone, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingShape, styles.shape1]} />
          <View style={[styles.floatingShape, styles.shape2]} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#E2E8F0" />
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the anonymous storytelling community</Text>
          </View>

          {/* Handle Preview */}
          <View style={styles.handleSection}>
            <Text style={styles.handleLabel}>Your Anonymous Handle</Text>
            <View style={styles.handleContainer}>
              <View style={styles.handleDisplay}>
                <User size={20} color="#00FFFF" style={styles.handleIcon} />
                <Text style={styles.handleText}>@{handle}</Text>
              </View>
              <TouchableOpacity 
                style={styles.regenerateButton}
                onPress={regenerateHandle}
                activeOpacity={0.7}
              >
                <RefreshCw size={18} color="#00FFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.handleDescription}>
              This will be your anonymous identity. You can regenerate it anytime.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Mail size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#718096"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputWrapperError]}>
                <Phone size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  placeholder="+1 (555) 123-4567 or (555) 123-4567"
                  placeholderTextColor="#718096"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              <Text style={styles.phoneNote}>
                We'll send a verification code to this number. Use international format (+country code) for non-US numbers.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <Lock size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#718096"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#718096" />
                  ) : (
                    <Eye size={20} color="#718096" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
                <Lock size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor="#718096"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#718096" />
                  ) : (
                    <Eye size={20} color="#718096" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#374151', '#374151'] : ['#00FFFF', '#00E5E5']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.submitButtonText, loading && styles.submitButtonTextDisabled]}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.termsSection}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkHighlight}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.08,
  },
  shape1: {
    width: 150,
    height: 150,
    backgroundColor: '#00FFFF',
    top: '15%',
    right: '-10%',
  },
  shape2: {
    width: 100,
    height: 100,
    backgroundColor: '#00FFFF',
    bottom: '25%',
    left: '-8%',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(45, 55, 72, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: width * 0.5,
    height: 80,
    maxWidth: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 22,
  },
  handleSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  handleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  handleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 55, 72, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00FFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  handleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  handleIcon: {
    marginRight: 12,
  },
  handleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  regenerateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  handleDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 55, 72, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A5568',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputWrapperError: {
    borderColor: '#F56565',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F56565',
    marginLeft: 4,
  },
  phoneNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#0a0a0f',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: '#718096',
  },
  termsSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#00FFFF',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
    paddingHorizontal: 16,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginLinkText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#00FFFF',
    fontWeight: '600',
  },
});