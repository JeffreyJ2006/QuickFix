import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { complaintAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  console.log('TaskDetailScreen - taskId:', taskId); // Debug log
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      const complaint = await complaintAPI.getById(taskId);
      console.log('Task details:', complaint); // Debug log
      if (!complaint) {
        throw new Error('Task not found');
      }
      setTask(complaint);
    } catch (error) {
      console.error('Fetch task error:', error);
      Alert.alert(
        'Error',
        'Failed to load task details. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await complaintAPI.updateStatus(taskId, newStatus);
      Alert.alert('Success', `Status updated to ${newStatus}`);
      fetchTask();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading || !task) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', { complaintId: taskId })}>
          <MaterialCommunityIcons name="message" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{task.title}</Text>
              <Chip mode="flat">{task.status}</Chip>
            </View>
            <Text style={styles.description}>{task.description}</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="tag" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{task.category}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {task.location.hostel}, Room {task.location.roomNumber}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Reported by: {task.reporterId.name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{task.reporterId.phoneNumber}</Text>
            </View>
          </Card.Content>
        </Card>

        {task.imageUrls && task.imageUrls.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Images</Text>
              {task.imageUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.image} />
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Update Status</Text>
            {task.status === 'Assigned' && (
              <Button
                mode="contained"
                onPress={() => updateStatus('In Progress')}
                loading={updatingStatus}
                disabled={updatingStatus}
                style={styles.button}
                icon="play"
              >
                Start Working
              </Button>
            )}
            {task.status === 'In Progress' && (
              <Button
                mode="contained"
                onPress={() => updateStatus('Resolved')}
                loading={updatingStatus}
                disabled={updatingStatus}
                style={styles.button}
                icon="check"
                buttonColor={COLORS.success}
              >
                Mark as Resolved
              </Button>
            )}
            {task.status === 'Resolved' && (
              <Text style={styles.resolvedText}>✅ Task completed successfully!</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: spacing.md },
  card: { marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  description: { fontSize: 16, color: COLORS.textSecondary, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  infoText: { fontSize: 14, marginLeft: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.sm },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: spacing.sm },
  button: { marginTop: spacing.sm },
  resolvedText: { fontSize: 16, color: COLORS.success, textAlign: 'center', fontWeight: 'bold' },
});
