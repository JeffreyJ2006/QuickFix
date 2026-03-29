// ===================================
// src/screens/Worker/AssignedTasksScreen.js
// ===================================
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { complaintAPI, userAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext.js';

export default function AssignedTasksScreen({ navigation }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(user?.availabilityStatus || 'Available');

  // fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const complaints = await complaintAPI.getAll();
      setTasks(complaints);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // toggle worker availability
  const toggleAvailability = async () => {
    const newStatus = availability === 'Available' ? 'Off-duty' : 'Available';
    try {
      await userAPI.updateAvailability(newStatus);
      setAvailability(newStatus);
    } catch (error) {
      console.error('Update availability error:', error);
    }
  };

  // status color utility
  const getStatusColor = (status) => {
    const statusColors = {
      Assigned: COLORS.assigned,
      'In Progress': COLORS.inProgress,
      Resolved: COLORS.resolved,
    };
    return statusColors[status] || COLORS.textSecondary;
  };

  // render each task card
  const renderTask = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Chip mode="flat" style={{ backgroundColor: getStatusColor(item.status) }}>
            {item.status}
          </Chip>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.location}>
            📍 {item.location?.hostel}, Room {item.location?.roomNumber}
          </Text>
          <Text style={styles.date}>{format(new Date(item.createdAt), 'MMM dd')}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <Chip
          icon={availability === 'Available' ? 'check-circle' : 'close-circle'}
          mode="flat"
          style={{
            backgroundColor: availability === 'Available' ? COLORS.success : COLORS.error,
          }}
          textStyle={{ color: '#fff' }}
          onPress={toggleAvailability}
        >
          {availability}
        </Chip>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={tasks.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTasks();
            }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks assigned yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    padding: spacing.lg,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  description: { fontSize: 14, color: COLORS.textSecondary, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  location: { fontSize: 12, color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
