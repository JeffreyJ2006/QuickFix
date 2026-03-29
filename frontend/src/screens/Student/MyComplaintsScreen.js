// src/screens/Student/MyComplaintsScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, FAB } from 'react-native-paper';
import { complaintAPI } from '../../api/endpoints.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';

export default function MyComplaintsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, filter, searchQuery]);

  const fetchComplaints = async () => {
    try {
      const data = await complaintAPI.getAll();
      setComplaints(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (filter !== 'All') {
      filtered = filtered.filter(c => c.status === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  };

  const getStatusColor = (status) => {
    const statusCOLORS = {
      'Registered': COLORS.registered,
      'Assigned': COLORS.assigned,
      'In Progress': COLORS.inProgress,
      'Resolved': COLORS.resolved,
    };
    return statusCOLORS[status] || COLORS.textSecondary;
  };

  const renderComplaint = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item._id })}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Chip mode="flat" textStyle={{ fontSize: 10 }} style={{ backgroundColor: getStatusColor(item.status) }}>
              {item.status}
            </Chip>
          </View>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.date}>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Complaints</Text>
      </View>

      <Searchbar
        placeholder="Search complaints..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        {['All', 'Registered', 'Assigned', 'In Progress', 'Resolved'].map(status => (
          <Chip
            key={status}
            selected={filter === status}
            onPress={() => setFilter(status)}
            style={styles.filterChip}
          >
            {status}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredComplaints}
        renderItem={renderComplaint}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchComplaints(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints found</Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateComplaint')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: spacing.lg, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  searchBar: { margin: spacing.md },
  filterContainer: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm, flexWrap: 'wrap' },
  filterChip: { marginRight: spacing.sm, marginBottom: spacing.xs },
  list: { padding: spacing.md },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  description: { fontSize: 14, color: COLORS.textSecondary, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { fontSize: 12, color: COLORS.primary },
  date: { fontSize: 12, color: COLORS.textSecondary },
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md, backgroundColor: COLORS.primary },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});