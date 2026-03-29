// src/screens/Student/CreateComplaintScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { complaintAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';

export default function CreateComplaintScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electrical',
    hostel: '',
    roomNumber: '',
    priority: 'Medium',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only upload up to 3 images');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only upload up to 3 images');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.hostel || !formData.roomNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.title.length > 100) {
      Alert.alert('Error', 'Title must be less than 100 characters');
      return;
    }

    if (formData.description.length > 500) {
      Alert.alert('Error', 'Description must be less than 500 characters');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('location', JSON.stringify({
        hostel: formData.hostel,
        roomNumber: formData.roomNumber,
      }));

      images.forEach((image, index) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        data.append('images', {
          uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
          name: `complaint_${Date.now()}_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });

      await complaintAPI.create(data);

      Alert.alert(
        'Success',
        'Complaint created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Create complaint error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Complaint</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          label="Title *"
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
          mode="outlined"
          style={styles.input}
          maxLength={100}
          placeholder="Brief description of the issue"
        />
        <Text style={styles.charCount}>{formData.title.length}/100</Text>

        <TextInput
          label="Description *"
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          maxLength={500}
          placeholder="Detailed description of the problem"
        />
        <Text style={styles.charCount}>{formData.description.length}/500</Text>

        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.category}
            onValueChange={(value) => updateFormData('category', value)}
            style={styles.picker}
          >
            <Picker.Item label="⚡ Electrical" value="Electrical" />
            <Picker.Item label="🚰 Plumbing" value="Plumbing" />
            <Picker.Item label="🧹 Cleaning" value="Cleaning" />
            <Picker.Item label="🔨 Carpentry" value="Carpentry" />
            <Picker.Item label="💻 IT" value="IT" />
            <Picker.Item label="📦 Other" value="Other" />
          </Picker>
        </View>

        <View style={styles.row}>
          <TextInput
            label="Hostel *"
            value={formData.hostel}
            onChangeText={(text) => updateFormData('hostel', text)}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
            placeholder="e.g., Hostel A"
          />
          <TextInput
            label="Room Number *"
            value={formData.roomNumber}
            onChangeText={(text) => updateFormData('roomNumber', text)}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
            placeholder="e.g., 101"
          />
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          {['Low', 'Medium', 'High'].map((priority) => (
            <Chip
              key={priority}
              selected={formData.priority === priority}
              onPress={() => updateFormData('priority', priority)}
              style={[
                styles.priorityChip,
                formData.priority === priority && { backgroundColor: COLORS.primary },
              ]}
              textStyle={formData.priority === priority && { color: '#fff' }}
            >
              {priority}
            </Chip>
          ))}
        </View>

        <Text style={styles.label}>Images (Optional - Max 3)</Text>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 3 && (
            <View style={styles.imageActionsContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <MaterialCommunityIcons name="camera" size={32} color={COLORS.primary} />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <MaterialCommunityIcons name="image" size={32} color={COLORS.primary} />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Submit Complaint
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.md },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: spacing.md },
  input: { marginBottom: spacing.xs },
  charCount: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  pickerContainer: { borderWidth: 1, borderColor: COLORS.textSecondary, borderRadius: 4, marginBottom: spacing.md },
  picker: { height: 50 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  priorityContainer: { flexDirection: 'row', marginBottom: spacing.md },
  priorityChip: { marginRight: spacing.sm },
  imageContainer: { marginBottom: spacing.lg },
  imageWrapper: { position: 'relative', marginBottom: spacing.sm },
  image: { width: '100%', height: 200, borderRadius: 8 },
  removeButton: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  imageActionsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  imageButton: { alignItems: 'center', padding: spacing.lg, backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', width: '45%' },
  imageButtonText: { marginTop: spacing.sm, color: COLORS.primary, fontWeight: '600' },
  submitButton: { marginTop: spacing.md, marginBottom: spacing.xl },
  submitButtonContent: { paddingVertical: spacing.sm },
});