import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Input, Button, Icon } from './ui';
import { Colors } from './config/colors';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleEmailContinue = () => {
    if (email.trim()) {
      // Handle email login logic
      console.log('Continue with email:', email);
    }
  };

  const handleSocialLogin = (provider: 'facebook' | 'google' | 'apple') => {
    // Handle social login logic
    console.log('Login with:', provider);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.sheet}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" type="Feather" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text variant="h1" weight="bold" style={styles.title}>
              What email did you use?
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Input
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.emailInput}
                leftIcon={<Icon name="mail" type="Feather" size={20} color={Colors.textSecondary} />}
              />
              
              {email.trim() && (
                <Button
                  title="Continue"
                  onPress={handleEmailContinue}
                  variant="primary"
                  style={styles.continueButton}
                />
              )}
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => handleSocialLogin('facebook')}
                activeOpacity={0.8}
              >
                <Icon name="facebook" type="FontAwesome" size={20} color="#fff" />
                <Text style={[styles.socialButtonText, styles.facebookText]}>
                  Continue with Facebook
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => handleSocialLogin('google')}
                activeOpacity={0.8}
              >
                <Icon name="google" type="FontAwesome" size={20} color={Colors.textPrimary} />
                <Text style={[styles.socialButtonText, styles.googleText]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={() => handleSocialLogin('apple')}
                activeOpacity={0.8}
              >
                <Icon name="apple" type="FontAwesome" size={20} color="#fff" />
                <Text style={[styles.socialButtonText, styles.appleText]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Legal Disclaimer */}
          <View style={styles.footer}>
            <Text style={styles.legalText}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 40,
    lineHeight: 34,
  },
  inputContainer: {
    marginBottom: 32,
  },
  emailInput: {
    marginBottom: 16,
  },
  continueButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  facebookText: {
    color: '#fff',
  },
  googleButton: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  googleText: {
    color: Colors.textPrimary,
  },
  appleButton: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  appleText: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  legalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  sheet: {
    height: '80%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
});

export default LoginScreen;