// src/screens/Student/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, FAB, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext.js';
import { complaintAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setError(false);
    try {
      const data = await complaintAPI.getAll({ limit: 5 });
      setComplaints(data);

      setStats({
        total: data.length,
        pending: data.filter(c => c.status !== 'Resolved').length,
        resolved: data.filter(c => c.status === 'Resolved').length,
      });
    } catch (error) {
      console.error('Fetch complaints error:', error);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Registered': return COLORS.registered;
      case 'Assigned': return COLORS.assigned;
      case 'In Progress': return COLORS.inProgress;
      case 'Resolved': return COLORS.resolved;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Registered': return 'clock-outline';
      case 'Assigned': return 'account-check';
      case 'In Progress': return 'hammer-wrench';
      case 'Resolved': return 'check-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { padding: 20 }]}>
        <MaterialCommunityIcons name="wifi-off" size={64} color={COLORS.error} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Network Error</Text>
        <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: 10, marginBottom: 20 }}>
          Could not connect to the server. Please check your connection and IP address.
        </Text>
        <Button mode="contained" onPress={fetchComplaints} style={{ width: '100%', marginBottom: 10 }}>
          Retry
        </Button>
        <Button mode="outlined" onPress={handleLogout} style={{ width: '100%' }} textColor={COLORS.error}>
          Logout
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
        <Text style={styles.subtitle}>Welcome to QuickFix</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: COLORS.warning }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: COLORS.success }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Complaints</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyComplaints')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {complaints.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons 
                  name="clipboard-text-outline" 
                  size={64} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.emptyText}>No complaints yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to create your first complaint
                </Text>
              </Card.Content>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <TouchableOpacity
                key={complaint._id}
                onPress={() => navigation.navigate('ComplaintDetail', { complaintId: complaint._id })}
              >
                <Card style={styles.complaintCard}>
                  <Card.Content>
                    <View style={styles.complaintHeader}>
                      <Text style={styles.complaintTitle} numberOfLines={1}>
                        {complaint.title}
                      </Text>
                      <Chip
                        mode="flat"
                        textStyle={{ fontSize: 10 }}
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                      >
                        {complaint.status}
                      </Chip>
                    </View>

                    <Text style={styles.complaintDescription} numberOfLines={2}>
                      {complaint.description}
                    </Text>

                    <View style={styles.complaintFooter}>
                      <View style={styles.categoryBadge}>
                        <MaterialCommunityIcons 
                          name={getStatusIcon(complaint.status)} 
                          size={16} 
                          color={COLORS.primary} 
                        />
                        <Text style={styles.categoryText}>{complaint.category}</Text>
                      </View>
                      <Text style={styles.dateText}>
                        {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyComplaints')}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>View All Complaints</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Complaint"
        onPress={() => navigation.navigate('CreateComplaint')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: spacing.lg,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: -30,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyCard: {
    marginBottom: spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  complaintCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  complaintDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: COLORS.primary,
  },
});