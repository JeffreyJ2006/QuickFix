// src/screens/Student/ComplaintDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Chip, Divider, Portal, Modal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { complaintAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';

export default function ComplaintDetailScreen({ route, navigation }) {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, []);

  const fetchComplaint = async () => {
    try {
      const complaint = await complaintAPI.getById(complaintId);
      if (!complaint) {
        throw new Error('Complaint not found');
      }
      setComplaint(complaint);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      Alert.alert('Error', 'Failed to load complaint details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      await complaintAPI.submitFeedback(complaintId, { rating, comment });
      Alert.alert('Success', 'Feedback submitted successfully');
      setFeedbackVisible(false);
      fetchComplaint();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  if (loading || !complaint) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', { complaintId })}>
          <MaterialCommunityIcons name="message" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{complaint.title}</Text>
              <Chip mode="flat">{complaint.status}</Chip>
            </View>
            <Text style={styles.description}>{complaint.description}</Text>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="tag" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{complaint.category}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {complaint.location.hostel}, Room {complaint.location.roomNumber}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {format(new Date(complaint.createdAt), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>

            {complaint.assignedWorkerId && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account-wrench" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  Assigned to: {complaint.assignedWorkerId.name}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {complaint.imageUrls && complaint.imageUrls.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Images</Text>
              {complaint.imageUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.image} />
              ))}
            </Card.Content>
          </Card>
        )}

        {complaint.status === 'Resolved' && !complaint.feedback && (
          <Button mode="contained" onPress={() => setFeedbackVisible(true)} style={styles.button}>
            Submit Feedback
          </Button>
        )}

        {complaint.feedback && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Your Feedback</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <MaterialCommunityIcons
                    key={star}
                    name={star <= complaint.feedback.rating ? 'star' : 'star-outline'}
                    size={24}
                    color={COLORS.warning}
                  />
                ))}
              </View>
              {complaint.feedback.comment && <Text style={styles.feedbackComment}>{complaint.feedback.comment}</Text>}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Modal visible={feedbackVisible} onDismiss={() => setFeedbackVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Submit Feedback</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={COLORS.warning}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            label="Comment (Optional)"
            value={comment}
            onChangeText={setComment}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <Button mode="contained" onPress={submitFeedback} style={styles.button}>
            Submit
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: spacing.md },
  card: { marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  description: { fontSize: 16, color: COLORS.textSecondary, marginBottom: spacing.md },
  divider: { marginVertical: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  infoText: { fontSize: 14, marginLeft: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.sm },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: spacing.sm },
  button: { marginVertical: spacing.md },
  modal: { backgroundColor: '#fff', margin: spacing.lg, padding: spacing.lg, borderRadius: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: spacing.md },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md },
  input: { marginBottom: spacing.md },
  feedbackComment: { fontSize: 14, color: COLORS.textSecondary, marginTop: spacing.sm },
});