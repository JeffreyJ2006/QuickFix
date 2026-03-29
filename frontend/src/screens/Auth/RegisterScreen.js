// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, RadioButton, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext.js';
import { COLORS, spacing } from '../../constants/theme.js';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    phoneNumber: '',
    rollNumber: '',
    hostel: '',
    roomNumber: '',
    employeeId: '',
    category: 'Electrical',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phoneNumber: formData.phoneNumber,
    };

    if (formData.role === 'STUDENT') {
      userData.rollNumber = formData.rollNumber;
      userData.hostel = formData.hostel;
      userData.roomNumber = formData.roomNumber;
    } else if (formData.role === 'WORKER') {
      userData.employeeId = formData.employeeId;
      userData.category = formData.category;
    }

    setLoading(true);
    const result = await register(userData);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join QuickFix</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>I am a:</Text>
          <RadioButton.Group
            onValueChange={(value) => updateFormData('role', value)}
            value={formData.role}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioItem}>
                <RadioButton value="STUDENT" />
                <Text>Student</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="WORKER" />
                <Text>Worker</Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Full Name *"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormData('phoneNumber', text)}
            mode="outlined"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Password *"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="info">At least 6 characters</HelperText>

          <TextInput
            label="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData('confirmPassword', text)}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
          />

          {formData.role === 'STUDENT' && (
            <>
              <TextInput
                label="Roll Number"
                value={formData.rollNumber}
                onChangeText={(text) => updateFormData('rollNumber', text)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="card-account-details" />}
              />

              <TextInput
                label="Hostel"
                value={formData.hostel}
                onChangeText={(text) => updateFormData('hostel', text)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="home" />}
                placeholder="e.g., Hostel A"
              />

              <TextInput
                label="Room Number"
                value={formData.roomNumber}
                onChangeText={(text) => updateFormData('roomNumber', text)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="door" />}
                placeholder="e.g., 101"
              />
            </>
          )}

          {formData.role === 'WORKER' && (
            <>
              <TextInput
                label="Employee ID"
                value={formData.employeeId}
                onChangeText={(text) => updateFormData('employeeId', text)}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="badge-account" />}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => updateFormData('category', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Electrical" value="Electrical" />
                  <Picker.Item label="Plumbing" value="Plumbing" />
                  <Picker.Item label="Cleaning" value="Cleaning" />
                  <Picker.Item label="Carpentry" value="Carpentry" />
                  <Picker.Item label="IT" value="IT" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
              <HelperText type="info">
                Worker accounts require admin verification
              </HelperText>
            </>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Register
          </Button>

          <View style={styles.loginContainer}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: COLORS.text,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  input: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});