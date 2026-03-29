import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, List, Divider, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext.js';
import { COLORS, spacing } from '../../constants/theme.js';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user?.name?.charAt(0) || 'U'} style={styles.avatar} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      <ScrollView style={styles.content}>
        <List.Section>
          <List.Subheader>Account Information</List.Subheader>
          {user?.phoneNumber && (
            <List.Item
              title="Phone"
              description={user.phoneNumber}
              left={props => <List.Icon {...props} icon="phone" />}
            />
          )}
          {user?.rollNumber && (
            <List.Item
              title="Roll Number"
              description={user.rollNumber}
              left={props => <List.Icon {...props} icon="card-account-details" />}
            />
          )}
          {user?.hostel && (
            <List.Item
              title="Hostel"
              description={`${user.hostel}, Room ${user.roomNumber}`}
              left={props => <List.Icon {...props} icon="home" />}
            />
          )}
          {user?.category && (
            <List.Item
              title="Category"
              description={user.category}
              left={props => <List.Icon {...props} icon="hammer-wrench" />}
            />
          )}
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
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, alignItems: 'center', padding: spacing.xl, paddingTop: 60 },
  avatar: { backgroundColor: COLORS.secondary, marginBottom: spacing.md },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: spacing.xs },
  email: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: spacing.xs },
  role: { fontSize: 12, color: '#fff', opacity: 0.8, textTransform: 'uppercase' },
  content: { flex: 1 },
  logoutButton: { margin: spacing.lg, marginTop: spacing.xl },
});