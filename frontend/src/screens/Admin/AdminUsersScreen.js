import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, Searchbar, Button, Portal, Dialog, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminAPI } from '../../api/endpoints.js';
import { COLORS, spacing, USER_ROLES } from '../../constants/theme.js';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getWorkers();
      if (response.data && response.data.workers) {
        setUsers(response.data.workers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array as fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerifyWorker = async (workerId) => {
    try {
      await adminAPI.verifyWorker(workerId);
      Alert.alert('Success', 'Worker verified successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error verifying worker:', error);
      Alert.alert('Error', 'Failed to verify worker');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteWorker(selectedUser._id);
      Alert.alert('Success', 'User deleted successfully');
      setDeleteDialogVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const renderUser = (user) => (
    <Card key={user._id} style={styles.card}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Avatar.Text size={40} label={user.name.charAt(0)} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
          <Chip mode="flat" style={styles.roleChip}>
            {user.role}
          </Chip>
        </View>

        <View style={styles.userBody}>
          {user.phoneNumber && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{user.phoneNumber}</Text>
            </View>
          )}

          {user.role === USER_ROLES.WORKER && (
            <>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="hammer-wrench" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>Category: {user.category}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons 
                  name={user.availabilityStatus === 'Available' ? 'check-circle' : 'clock-outline'} 
                  size={16} 
                  color={user.availabilityStatus === 'Available' ? COLORS.success : COLORS.warning} 
                />
                <Text style={styles.infoText}>Status: {user.availabilityStatus}</Text>
              </View>
            </>
          )}
        </View>

        {user.role === USER_ROLES.WORKER && !user.isVerified && (
          <Button
            mode="contained"
            onPress={() => handleVerifyWorker(user._id)}
            style={styles.verifyButton}
          >
            Verify Worker
          </Button>
        )}

        <Button
          mode="outlined"
          onPress={() => {
            setSelectedUser(user);
            setDeleteDialogVisible(true);
          }}
          style={styles.deleteButton}
          textColor={COLORS.error}
        >
          Delete User
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
        }
      >
        <View style={styles.filters}>
          {['All', 'STUDENT', 'WORKER'].map(role => (
            <Chip
              key={role}
              selected={filterRole === role}
              onPress={() => setFilterRole(role)}
              style={[
                styles.filterChip,
                filterRole === role && { backgroundColor: COLORS.primary }
              ]}
              textStyle={filterRole === role ? { color: '#fff' } : {}}
            >
              {role}
            </Chip>
          ))}
        </View>

        {filteredUsers.map(renderUser)}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete User</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete {selectedUser?.name}?</Text>
            <Text style={styles.warningText}>This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteUser} textColor={COLORS.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: spacing.md,
    paddingTop: spacing.xl + spacing.lg,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  roleChip: {
    backgroundColor: COLORS.primary,
  },
  userBody: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  verifyButton: {
    marginBottom: spacing.sm,
    backgroundColor: COLORS.success,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  warningText: {
    color: COLORS.error,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});