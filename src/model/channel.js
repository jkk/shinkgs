// @flow
import type {
  AppState,
  KgsMessage,
  ChannelMembership,
  Index,
  Conversation,
  RankGraph
} from './types';

import moment from 'moment';

export function handleChannelMessage(
  prevState: AppState,
  msg: KgsMessage
): AppState {
  if (msg.type === 'JOIN_COMPLETE' && msg.channelId && prevState.channelMembership[msg.channelId]) {
    let chanMem: ChannelMembership = {...prevState.channelMembership};
    chanMem[msg.channelId] = {...chanMem[msg.channelId], complete: true};
    return {...prevState, channelMembership: chanMem};
  } else if ((msg.type === 'UNJOIN' || msg.type === 'CLOSE') && msg.channelId) {
    let chanMem: ChannelMembership = {...prevState.channelMembership};
    delete chanMem[msg.channelId];
    let nextState = {...prevState, channelMembership: chanMem};
    if (prevState.activeConversationId === msg.channelId) {
      nextState.activeConversationId = null;
    }
    if (prevState.conversationsById[msg.channelId]) {
      let conversationsById: Index<Conversation> = {...prevState.conversationsById};
      delete conversationsById[msg.channelId];
      nextState.conversationsById = conversationsById;
    }
    return nextState;
  }
  return prevState;
}

// Turn KGS's rank graph into a format suited for Chartist.js
export function parseRankGraph(data: Array<number>): RankGraph {
  let newRankGraph:Object = { rendered: false };

  // The data is an array of ranks on individual days, ending at yesterday.
  // Generate dates for each of the data points.
  let series:Array<Object> = data.map((rank, i) => {
    var d = new Date();
    d.setDate(d.getDate() - (data.length - i));
    return {
      x: d,
      y: rank
    };
  });

  newRankGraph.data = {
    series: [series]
  };

  // Create a list of the unique months present in the graph data for labeling
  newRankGraph.months = [];
  series.forEach((d) => {
    let str = moment(d.x).format('MMMM YYYY');
    if (newRankGraph.months.indexOf(str) === -1) {
      newRankGraph.months.push(str);
    }
  });

  return newRankGraph;
}
