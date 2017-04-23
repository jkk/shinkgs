// @flow
import uuidV4 from 'uuid/v4';
import {isTempId} from './tempId';
import type {
  AppState,
  KgsMessage,
  Conversation,
  ChannelMembership,
  ConversationMessage,
  Index
} from './types';

function createConversation(msg: KgsMessage) {
  if (!msg.channelId) {
    throw new Error('Missing channelId');
  }
  let convo: Conversation = {
    id: msg.channelId,
    messages: [],
    status: isTempId(msg.channelId) ? 'pending' : 'created'
  };
  if (msg.callbackKey) {
    convo.callbackKey = msg.callbackKey;
  }
  if (msg.user) {
    convo.user = msg.user.name;
  }
  return convo;
}

export function handleConversationMessage(
  prevState: AppState,
  msg: KgsMessage
): AppState {
  let chanId = msg.channelId;
  if ((msg.type === 'CONVO_JOIN' || msg.type === 'ROOM_JOIN') && chanId) {
    let conversationsById: Index<Conversation> = {...prevState.conversationsById};
    let convo = createConversation(msg);

    let tempConvoId;
    if (msg.callbackKey) {
      tempConvoId = Object.keys(conversationsById).find(cid =>
        isTempId(conversationsById[cid].id) &&
        conversationsById[cid].callbackKey === msg.callbackKey
      );
      if (tempConvoId) {
        tempConvoId = parseInt(tempConvoId, 10);
        convo = {...conversationsById[tempConvoId], ...convo};
        delete conversationsById[tempConvoId];
      }
    }
    conversationsById[chanId] = convo;

    let nextState = {...prevState, conversationsById};

    // Channel membership
    if (msg.type === 'CONVO_JOIN') {
      let chanMem: ChannelMembership = {...prevState.channelMembership};
      chanMem[chanId] = {type: 'conversation', complete: false, stale: false};
      if (tempConvoId) {
        delete chanMem[tempConvoId];
      }
      nextState.channelMembership = chanMem;
    }

    if (msg.joinNow) {
      nextState.activeConversationId = convo.id;
      nextState.userDetailsRequest = null;
    } else if (tempConvoId && prevState.activeConversationId === tempConvoId) {
      nextState.activeConversationId = chanId;
    }

    return nextState;
  } else if ((msg.type === 'CHAT' || msg.type === 'ANNOUNCE' || msg.type === 'MODERATED_CHAT') && chanId) {
    let conversationsById: Index<Conversation> = {...prevState.conversationsById};
    if (!conversationsById[chanId]) {
      conversationsById[chanId] = createConversation(msg);
    }
    let convoMsg: ConversationMessage = {
      id: uuidV4(),
      sender: msg.user.name,
      body: msg.text,
      date: new Date()
    };
    if (msg.type === 'ANNOUNCE') {
      convoMsg.announcement = true;
    }
    if (msg.type === 'MODERATED_CHAT') {
      convoMsg.moderated = true;
    }
    let messages;
    if (msg.sending) {
      convoMsg.sending = true;
      messages = [...conversationsById[chanId].messages];
    } else {
      let matchingMsg = conversationsById[chanId].messages.find(m =>
        m.sending && m.body === convoMsg.body && m.sender === convoMsg.sender
      );
      if (matchingMsg) {
        let matchingId = matchingMsg.id;
        messages = conversationsById[chanId].messages.filter(m =>
          m.id !== matchingId
        );
        convoMsg.date = matchingMsg.date;
      } else {
        messages = [...conversationsById[chanId].messages];
      }
    }
    messages.push(convoMsg);
    let newConvo: Conversation = {
      ...conversationsById[chanId],
      messages
    };
    let isUnseen = (
      prevState.nav !== 'chat' ||
      prevState.activeConversationId !== newConvo.id
    );
    if (isUnseen) {
      newConvo.unseenCount = (newConvo.unseenCount || 0) + 1;
    }
    conversationsById[chanId] = newConvo;
    return {...prevState, conversationsById};
  } else if (msg.type === 'ANNOUNCEMENT') {
    // Global announcement - add to all conversations
    let convoMsg: ConversationMessage = {
      id: uuidV4(),
      sender: msg.user && msg.user.name,
      body: msg.text,
      date: new Date(),
      announcement: true
    };
    let conversationsById: Index<Conversation> = {...prevState.conversationsById};
    for (let convoId of Object.keys(conversationsById)) {
      conversationsById[convoId] = {
        ...conversationsById[convoId],
        messages: [...conversationsById[convoId].messages, convoMsg]
      };
    }
    return {...prevState, conversationsById};
  } else if (msg.type === 'CONVO_NO_SUCH_USER') {
    // TODO
  } else if (msg.type === 'CLOSE_CONVERSATION') {
    let convoId = msg.conversationId;
    let conversationsById: Index<Conversation> = {...prevState.conversationsById};
    if (conversationsById[convoId]) {
      conversationsById[convoId] = {
        ...conversationsById[convoId],
        status: 'closed'
      };
      let nextState = {...prevState, conversationsById};
      if (prevState.activeConversationId === convoId) {
        nextState.activeConversationId = null;
      }
      return nextState;
    }
  } else if (msg.type === 'CONVERSATION_CHANGE') {
    return {
      ...prevState,
      activeConversationId: msg.conversationId
    };
  } else if (msg.type === 'SAW_CONVERSATION') {
    let convoId = msg.conversationId;
    let conversationsById: Index<Conversation> = {...prevState.conversationsById};
    if (conversationsById[convoId]) {
      conversationsById[convoId] = {
        ...conversationsById[convoId],
        lastSeen: Date.now(),
        unseenCount: 0
      };
      return {...prevState, conversationsById};
    }
  }
  return prevState;
}
