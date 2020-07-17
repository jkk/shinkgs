// @flow
import type {
  AppState,
  KgsMessage,
  ChannelMembership,
  Index,
  Conversation,
} from "./types";

export function handleChannelMessage(
  prevState: AppState,
  msg: KgsMessage
): AppState {
  if (
    msg.type === "JOIN_COMPLETE" &&
    msg.channelId &&
    prevState.channelMembership[msg.channelId]
  ) {
    let chanMem: ChannelMembership = { ...prevState.channelMembership };
    chanMem[msg.channelId] = { ...chanMem[msg.channelId], complete: true };
    return { ...prevState, channelMembership: chanMem };
  } else if ((msg.type === "UNJOIN" || msg.type === "CLOSE") && msg.channelId) {
    let chanMem: ChannelMembership = { ...prevState.channelMembership };
    delete chanMem[msg.channelId];
    let nextState = { ...prevState, channelMembership: chanMem };
    if (prevState.activeConversationId === msg.channelId) {
      nextState.activeConversationId = null;
    }
    if (msg.channelId && prevState.conversationsById[msg.channelId]) {
      let conversationsById: Index<Conversation> = {
        ...prevState.conversationsById,
      };
      delete conversationsById[msg.channelId];
      nextState.conversationsById = conversationsById;
    }
    return nextState;
  }
  return prevState;
}
