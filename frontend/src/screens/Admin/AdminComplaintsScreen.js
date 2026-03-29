import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, Menu, Button, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { complaintAPI, adminAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';

export default function AdminComplaintsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [reassignDialogVisible, setReassignDialogVisible] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await adminAPI.getAllComplaints();
      if (response.data && response.data.complaints) {
        setComplaints(response.data.complaints);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]); // Set empty array as fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableWorkers = async (category) => {
    try {
      const response = await adminAPI.getWorkers({ category, status: 'Available' });
      setAvailableWorkers(response.data.workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleReassign = async (workerId) => {
    try {
      await adminAPI.reassignComplaint(selectedComplaint._id, workerId);
      fetchComplaints();
      setReassignDialogVisible(false);
    } catch (error) {
      console.error('Error reassigning complaint:', error);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || complaint.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const statusColors = {
      'Registered': COLORS.warning,
      'Assigned': COLORS.info,
      'In Progress': COLORS.primary,
      'Resolved': COLORS.success,
      'Cancelled': COLORS.error
    };
    return statusColors[status] || COLORS.textSecondary;
  };

  const renderComplaint = (complaint) => (
    <Card 
      key={complaint._id}
      style={styles.card}
      onPress={() => {
        setSelectedComplaint(complaint);
        setMenuVisible(true);
      }}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>{complaint.title}</Text>
          <Chip 
            mode="flat" 
            style={{ backgroundColor: getStatusColor(complaint.status) }}
            textStyle={{ color: '#fff' }}
          >
            {complaint.status}
          </Chip>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {complaint.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {complaint.location.hostel}, Room {complaint.location.roomNumber}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {complaint.reporterId?.name || 'Unknown'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search complaints..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchComplaints} />
        }
      >
        <View style={styles.filters}>
          {['All', 'Registered', 'Assigned', 'In Progress', 'Resolved'].map(status => (
            <Chip
              key={status}
              selected={filterStatus === status}
              onPress={() => setFilterStatus(status)}
              style={[
                styles.filterChip,
                filterStatus === status && { backgroundColor: COLORS.primary }
              ]}
              textStyle={filterStatus === status ? { color: '#fff' } : {}}
            >
              {status}
            </Chip>
          ))}
        </View>

        {filteredComplaints.map(renderComplaint)}
      </ScrollView>

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ComplaintDetail', { complaintId: selectedComplaint?._id });
            }}
            title="View Details"
            icon="eye"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              fetchAvailableWorkers(selectedComplaint?.category);
              setReassignDialogVisible(true);
            }}
            title="Reassign Worker"
            icon="account-switch"
          />
        </Menu>

        <Dialog visible={reassignDialogVisible} onDismiss={() => setReassignDialogVisible(false)}>
          <Dialog.Title>Reassign Complaint</Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              {availableWorkers.map(worker => (
                <Button
                  key={worker._id}
                  mode="outlined"
                  style={styles.workerButton}
                  onPress={() => handleReassign(worker._id)}
                >
                  {worker.name} - {worker.category}
                </Button>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReassignDialogVisible(false)}>Cancel</Button>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
  },
  cardFooter: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  workerButton: {
    marginVertical: spacing.xs,
  },
});