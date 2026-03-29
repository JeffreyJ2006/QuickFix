import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Avatar, List, Divider, Button } from 'react-native-paper';
import { adminAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { useAuth } from '../../context/AuthContext.js';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            logout();
            // The navigation to login screen will happen automatically due to the
            // condition in AppNavigator (!isAuthenticated ? <AuthStack /> : ...)
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  if (!stats) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.totalComplaints}</Text>
              <Text style={styles.statLabel}>Total Complaints</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: COLORS.warning }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.activeComplaints}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: COLORS.success }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.resolvedComplaints}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: COLORS.info }]}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.totalWorkers}</Text>
              <Text style={styles.statLabel}>Workers</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Avatar.Text size={60} label={user?.name?.charAt(0) || 'A'} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profileRole}>{user?.role}</Text>
            </View>
          </View>

          <List.Section>
            <List.Subheader>Account Information</List.Subheader>
            {user?.phoneNumber && (
              <List.Item
                title="Phone"
                description={user.phoneNumber}
                left={props => <List.Icon {...props} icon="phone" />}
              />
            )}
            <List.Item
              title="Role"
              description="System Administrator"
              left={props => <List.Icon {...props} icon="shield-account" />}
            />
          </List.Section>

          <Divider />

          <List.Section>
            <List.Subheader>Settings</List.Subheader>
            <List.Item
              title="Edit Profile"
              left={props => <List.Icon {...props} icon="account-edit" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Edit profile feature will be available soon')}
            />
            <List.Item
              title="System Settings"
              left={props => <List.Icon {...props} icon="cog" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'System settings will be available soon')}
            />
          </List.Section>

          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor={COLORS.error}
            icon="logout"
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: spacing.lg, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', marginBottom: spacing.md, elevation: 4 },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  statLabel: { fontSize: 14, color: '#fff', textAlign: 'center', marginTop: spacing.xs },
  profileSection: { 
    marginTop: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: spacing.md,
    elevation: 2
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  profileRole: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});