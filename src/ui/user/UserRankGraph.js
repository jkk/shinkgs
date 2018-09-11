import React, { PureComponent as Component } from "react";
import dateFormat from "date-fns/format";
import get from "lodash.get";
/* @noflow */
import type { RankGraph } from "./types";
import { Spinner } from "../common";

let Chartist;
let ChartistGraph;

type Props = {
  graph: ?RankGraph,
};

export default class UserRankGraph extends Component<Props> {
  constructor(props) {
    super(props);

    if (!Chartist || !ChartistGraph) {
      //require.ensure([], require => {
      import("./UserRankGraph").then(() => {
        ChartistGraph = require("react-chartist").default;
        Chartist = require("chartist");
        this.forceUpdate();
      });
    }
  }

  _renderGraph() {
    const series = get(this.props.graph, "data.series[0]", []);
    const months = get(this.props.graph, "months", []);

    const yValues = series.map(point => point.y).filter(y => y !== null);

    const min = Math.min.apply(null, yValues);
    const max = Math.max.apply(null, yValues);

    const yMin = Math.floor(min / 100) * 100;
    const yMax = Math.ceil(max / 100) * 100;

    const yTicks = [];
    for (let i = yMin; i <= yMax; i += 100) {
      yTicks.push(i);
    }

    const options = {
      height: "250px",
      axisY: {
        type: Chartist.FixedScaleAxis,
        low: yMin,
        high: yMax,
        ticks: yTicks,
        labelInterpolationFnc: function(value) {
          let label = value < 0 ? "k" : "d";
          let rank = Math.abs(value / 100);
          // Because there's no rank between 1 kyu and 1 dan, dan ranks
          // need to be bumped up by one
          if (label === "d") {
            rank += 1;
          }

          if ((rank <= 9 && label === "d") || (rank <= 30 && label === "k")) {
            return `${rank}${label}`;
          } else {
            return null;
          }
        },
      },
      axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: series.length,
        labelInterpolationFnc: function(value, index) {
          const d = new Date(value);
          const day = dateFormat(d, "DD");
          const month = dateFormat(d, "MMM");

          // When we have multiple months of rank data
          if (months.length > 2) {
            // Only show the year for January and the first month on
            // the graph
            const format = index < 31 || month === "Jan" ? "MMM YYYY" : "MMM";

            // Show the label only on the first day of the month
            return day === "01" ? dateFormat(d, format) : null;
          } else {
            // When we have less than one month of rank data
            let format;
            let ticks = 10;
            let ratio = series.length / ticks;

            if (index === 0) {
              format = "MMM D, YYYY";
            } else {
              if (day === "01") {
                format = "MMM D";
              } else {
                format = "MMM D";
              }
            }
            return Math.floor(index % ratio) === 0
              ? dateFormat(d, format)
              : null;
          }
        },
      },
      fullWidth: true,
      showPoint: false,
      chartPadding: {
        right: 40,
        bottom: 10,
      },
    };

    const type = "Line";

    if (!series.length) {
      return (
        <div className="UserDetailsModal-no-rank-graph">
          No rank graph available.
        </div>
      );
    } else {
      return (
        <ChartistGraph
          data={this.props.graph.data}
          options={options}
          type={type}
        />
      );
    }
  }

  render() {
    return (
      <div>
        {this.props.graph && Chartist && ChartistGraph ? (
          this._renderGraph()
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
}
