import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { messageAPI } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.js';
import { COLORS, spacing } from '../../constants/theme.js';
import { format } from 'date-fns';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../api/config.js';

export default function ChatScreen({ route, navigation }) {
  const { complaintId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const setupSocket = () => {
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('joinComplaint', complaintId);
    });

   newSocket.on('newMessage', (message) => {
  if (message && message._id) {
    setMessages(prev => [...prev, message]);
  } else {
    console.warn('Invalid socket message received:', message);
  }
});


    setSocket(newSocket);
  };

  const fetchMessages = async () => {
  try {
    const response = await messageAPI.getHistory(complaintId);
    const messages = response?.data?.data?.messages || [];
    // Filter out invalid entries
    const validMessages = messages.filter(m => m && m._id);
    setMessages(validMessages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    setMessages([]); // ✅ never leave undefined
  }
};

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await messageAPI.send({
        complaintId,
        content: inputText.trim(),
      });

      setInputText('');
      if (socket) {
        socket.emit('sendMessage', {
          complaintId,
          message: response.data.data.message,
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

 const renderMessage = ({ item }) => {
  const isMyMessage = item?.senderId?._id === user?.id;

  return (
    <View
      style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}
    >
      {!isMyMessage && (
        <Text style={styles.senderName}>
          {item?.senderId?.name || 'Unknown'}
        </Text>
      )}
      <Text style={styles.messageText}>{item?.content || ''}</Text>
      {item?.createdAt && (
        <Text style={styles.messageTime}>
          {format(new Date(item.createdAt), 'HH:mm')}
        </Text>
      )}
    </View>
  );
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{ width: 24 }} />
      </View>

    <FlatList
  ref={flatListRef}
  data={messages?.filter(m => m && m._id)} // ✅ removes undefined/null
  renderItem={({ item }) => item ? renderMessage({ item }) : null}
  keyExtractor={(item, index) => item?._id?.toString() || index.toString()} // ✅ fallback key
  contentContainerStyle={styles.messagesList}
  onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
/>


      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          style={styles.input}
          mode="outlined"
          multiline
          maxLength={500}
        />
        <IconButton
          icon="send"
          size={24}
          iconColor={COLORS.primary}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  messagesList: { padding: spacing.md },
  messageContainer: { maxWidth: '75%', padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: COLORS.surface },
  senderName: { fontSize: 12, fontWeight: 'bold', marginBottom: spacing.xs, color: COLORS.textSecondary },
  messageText: { fontSize: 14, color: COLORS.text },
  messageTime: { fontSize: 10, color: COLORS.textSecondary, marginTop: spacing.xs, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', padding: spacing.md, backgroundColor: COLORS.surface, alignItems: 'center' },
  input: { flex: 1, marginRight: spacing.sm },
});
