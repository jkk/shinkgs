// @flow
import React, { useState, useRef, useEffect } from "react";
import { Button, CheckboxInput, SelectInput, Spinner } from "../common";
import { formatGameScore, formatGameType } from "../../model/game";
import { formatLocaleDateTime } from "../../util/date";
import type { GameSummary, GameChannel, Room } from "../../model";

type Props = {
  activeConversationId: ?number,
  game: GameSummary,
  onCloseUserDetail: () => void,
  onJoinGame: (gameId: number | string) => void,
  onLoadGame: (
    timestamp: string,
    channelId: number,
    privateGame: boolean
  ) => void,
  onLeaveGame: (game: GameChannel | number) => void,
  reviewGameId: ?number,
  rooms?: Room[],
};

export default function UserGameSummary(props: Props) {
  let {
    onCloseUserDetail,
    onLoadGame,
    onJoinGame,
    rooms = [],
    activeConversationId,
    game,
    reviewGameId,
    onLeaveGame,
  } = props;
  let [privateGame, setPrivate] = useState(true);
  let [showSpinner, setShowSpinner] = useState(false);
  let reviewGameIdRef = useRef(reviewGameId);
  let defaultTargetRoom = activeConversationId;

  if (!defaultTargetRoom && rooms.length) {
    defaultTargetRoom = rooms[0].id;
  }

  let [targetRoom, setTargetRoom] = useState(defaultTargetRoom);

  useEffect(() => {
    if (reviewGameId && reviewGameIdRef.current !== reviewGameId) {
      // A new review game has been loaded.
      if (reviewGameIdRef.current) {
        // Leave the game that is currently being reviewed.
        onLeaveGame(reviewGameIdRef.current);
      }

      onJoinGame(reviewGameId);
      onCloseUserDetail();
    }
  }, [reviewGameId, reviewGameIdRef.current]);

  return (
    <div className="UserGameSummary">
      <table>
        <tbody>
          <tr>
            <th>White</th>
            <td>{game.players.white.name}</td>
          </tr>

          <tr>
            <th>Black</th>
            <td>{game.players.black.name}</td>
          </tr>

          {game.score && (
            <tr>
              <th>Result</th>
              <td>{formatGameScore(game.score)}</td>
            </tr>
          )}

          <tr>
            <th>Date</th>
            <td>{formatLocaleDateTime(game.timestamp)}</td>
          </tr>

          <tr>
            <th>Type</th>
            <td>{formatGameType(game.type)}</td>
          </tr>
        </tbody>
      </table>

      <hr />

      {!targetRoom && (
        <p>
          <strong>Please join a room in order to load a game.</strong>
        </p>
      )}

      {targetRoom && !showSpinner && (
        <form>
          {rooms.length > 1 && (
            <div className="UserGameLoadForm-fields">
              <label htmlFor="game-load-room">Load game in:</label>{" "}
              <SelectInput
                name="rooms"
                id="game-load-room"
                value={targetRoom}
                onChange={(e: SyntheticInputEvent<HTMLSelectElement>) => {
                  setTargetRoom(Number(e.target.value));
                }}>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </SelectInput>
            </div>
          )}

          {rooms.length === 1 && (
            <p>
              Game will be loaded in <strong>{rooms[0].name}</strong>
            </p>
          )}

          <div className="UserGameLoadForm-fields">
            <CheckboxInput
              name="privateGame"
              label="Private"
              value="true"
              checked={privateGame}
              onChange={() => {
                setPrivate(!privateGame);
              }}
            />
          </div>

          <div className="UserGameLoadForm-fields">
            <Button
              primary
              onClick={() => {
                setShowSpinner(true);
                onLoadGame(game.timestamp, targetRoom, privateGame);
              }}>
              Load game
            </Button>
          </div>
        </form>
      )}

      {showSpinner && <Spinner />}
    </div>
  );
}
