import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
interface UserDTO {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  // etc.
}

interface MessageDTO {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: UserDTO;
}

interface ConversationDTO {
  conversationId: number;
  createdAt: string;
  lastMessageAt: string;
  name: string;
  isGroup: boolean;
  users: UserDTO[];
  messages: MessageDTO[];
}
interface MessagesState {
  conversations: ConversationDTO[];
  currentConversation: ConversationDTO | null;
  loading: boolean;
}
const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  loading: false,
};

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async () => {
    const res = await axios.get('/api/message/conversations');
    return res.data;
  }
);

export const fetchConversationById = createAsyncThunk(
  'messages/fetchConversationById',
  async (id: number) => {
    const res = await axios.get(`/api/message/conversations/${id}`);
    return res.data;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }: { conversationId: number; content: string }) => {
    const res = await axios.post('/api/message', { conversationId, content });
    return res.data;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.currentConversation?.messages.push(action.payload);
      });
  },
});

export default messagesSlice.reducer;
