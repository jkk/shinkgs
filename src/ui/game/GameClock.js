// @flow
import React, { PureComponent as Component } from "react";
import type { ClockState, GameRules } from "../../model";

function formatTime(time: ?number) {
  if (typeof time !== "number") {
    return "--";
  }
  if (time < 0) {
    time = 0;
  }
  let mins = Math.floor(time / 60);
  let secs = Math.ceil(time - mins * 60);
  if (secs === 60) {
    mins += 1;
    secs = 0;
  }
  return "" + mins + ":" + (secs < 10 ? "0" : "") + secs;
}

// Hacky compensation for network/rendering lag
const TIME_SKEW = 300;

type TimeCountdownProps = {
  nodeId: ?number,
  clock: ClockState,
  byoYomiTime: ?number,
  byoYomiPeriods: ?number,
  byoYomiStones: ?number
};

class TimeCountdown extends Component<TimeCountdownProps> {
  _startTime: number;
  _interval: any;

  constructor(props: TimeCountdownProps, context: any) {
    super(props, context);
    let { clock } = this.props;
    this.state = {
      seconds: clock.time || 0,
      periods: clock.periodsLeft,
      stones: clock.stonesLeft
    };
    this._startTime = new Date().getTime() - TIME_SKEW;
  }

  componentDidUpdate(nextProps: TimeCountdownProps) {
    let oldClock = this.props.clock;
    let newClock = nextProps.clock;
    if (
      this.props.nodeId === nextProps.nodeId &&
      oldClock.time === newClock.time &&
      oldClock.periodsLeft === newClock.periodsLeft &&
      oldClock.stonesLeft === newClock.stonesLeft
    ) {
      return;
    }
    this._startTime = new Date().getTime() - TIME_SKEW;
    this.setState({
      seconds: newClock.time || 0,
      periods: newClock.periodsLeft,
      stones: newClock.stonesLeft
    });
  }

  componentDidMount() {
    this._interval = setInterval(() => {
      let { clock, byoYomiTime, byoYomiPeriods, byoYomiStones } = this.props;
      let secondsElapsed = (Date.now() - this._startTime) / 1000;
      let mainTime = (clock.time || 0) - secondsElapsed;
      let periods = clock.periodsLeft;
      let stones = clock.stonesLeft;
      let seconds;
      if (mainTime > 0) {
        seconds = mainTime;
      } else if (mainTime < 0 && byoYomiTime) {
        if (typeof periods === "number" && byoYomiPeriods) {
          let periodsLeft = periods ? periods - 1 : byoYomiPeriods;
          // Byo yomi overtime
          periods = Math.max(
            0,
            periodsLeft - Math.floor(-mainTime / byoYomiTime)
          );
          seconds = periods
            ? byoYomiTime + mainTime + byoYomiTime * (periodsLeft - periods)
            : 0;
        } else if (stones === 0 && byoYomiStones) {
          // Canadian overtime
          stones = byoYomiStones;
          seconds = byoYomiTime + mainTime;
        } else {
          seconds = 0;
        }
      } else {
        seconds = 0;
      }
      this.setState({ seconds, periods, stones });
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  render() {
    let { clock } = this.props;
    let seconds;
    let periods;
    let stones;
    if (clock.running && !clock.paused && typeof clock.time === "number") {
      seconds = this.state.seconds;
      periods = this.state.periods;
      stones = this.state.stones;
    } else {
      seconds = clock.time;
      periods = clock.periodsLeft;
      stones = clock.stonesLeft;
    }
    let timeQualifier;
    let sd;
    if (periods !== undefined) {
      timeQualifier = periods === 1 ? "SD" : periods ? ` (${periods})` : "";
      sd = periods === 1;
    } else if (stones) {
      timeQualifier = " / " + stones;
      sd = true;
    } else if (seconds && stones === undefined) {
      timeQualifier = " SD";
      sd = true;
    }
    let className =
      "TimeCountdown" +
      (sd && typeof seconds === "number" && seconds < 3
        ? " TimeCountdown-urgent"
        : "");
    return (
      <div className={className}>
        {formatTime(seconds)} {timeQualifier}
      </div>
    );
  }
}

type Props = {
  nodeId: ?number,
  active: boolean,
  clock: ClockState,
  timeLeft: number,
  gameRules?: ?GameRules
};

export default class GameClock extends Component<Props> {
  render() {
    let { nodeId, active, clock, timeLeft, gameRules } = this.props;
    let className =
      "GameClock " +
      ((active ? "GameClock-active" : "GameClock-inactive") +
        (active && clock.running && !clock.paused ? " GameClock-running" : "") +
        (clock.paused ? " GameClock-paused" : ""));

    let byoYomiTime;
    let byoYomiPeriods;
    let byoYomiStones;
    if (gameRules) {
      byoYomiTime = gameRules.byoYomiTime;
      byoYomiPeriods = gameRules.byoYomiPeriods;
      byoYomiStones = gameRules.byoYomiStones;
    }

    return (
      <div className={className}>
        <div className="GameClock-time">
          {active ? (
            <TimeCountdown
              nodeId={nodeId}
              clock={clock}
              byoYomiTime={byoYomiTime}
              byoYomiPeriods={byoYomiPeriods}
              byoYomiStones={byoYomiStones}
            />
          ) : (
            <div className="GameClock-time-frozen">{formatTime(timeLeft)}</div>
          )}
        </div>
      </div>
    );
  }
}
