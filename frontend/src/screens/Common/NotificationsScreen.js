import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, spacing } from '../../constants/theme.js';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: spacing.lg, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
