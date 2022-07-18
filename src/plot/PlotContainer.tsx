import Plot from "react-plotly.js";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PlotProperties } from "./plot.model";
import { PlotRelayoutEvent } from "plotly.js-dist-min";
import { Word } from "../guesses/guesses.model";

function DumbPlotContainer({
  plotProperties,
  plotLayout,
  revision,
  setDisplayedXRange,
  setDisplayedYRange,
  onInit,
}: {
  plotProperties: PlotProperties;
  parsedWords: Word[];
  plotLayout: Plotly.Layout;
  revision: number;
  setDisplayedXRange: Dispatch<SetStateAction<number[]>>;
  setDisplayedYRange: Dispatch<SetStateAction<number[]>>;
  onInit: () => void;
}) {
  function onRelayout(newLayout: PlotRelayoutEvent) {
    if (newLayout.autosize) {
      return;
    }
    console.log("RELAYOUT");
    setDisplayedXRange((old) => [
      newLayout?.["xaxis.range[0]"] ?? old[0],
      newLayout?.["xaxis.range[1]"] ?? old[1],
    ]);
    setDisplayedYRange((old) => [
      newLayout?.["yaxis.range[0]"] ?? old[0],
      newLayout?.["yaxis.range[1]"] ?? old[1],
    ]);
  }

  return (
    <div
      className="bg-plot-container"
      // style={{
      //   ["--plot-center-x" as any]: `${plotCenter[0] * 100}%`,
      //   ["--plot-center-y" as any]: `${plotCenter[1] * 100}%`,
      // }}
    >
      <Plot
        className="plot"
        data={plotProperties.plotData}
        layout={plotLayout}
        config={{
          scrollZoom: true,
          doubleClick: false,
          modeBarButtonsToRemove: [
            "zoom2d",
            "pan2d",
            "select2d",
            "lasso2d",
            "autoScale2d",
            "resetScale2d",
            "toImage",
          ],
          displaylogo: false,
          displayModeBar: true,
        }}
        onInitialized={onInit}
        onBeforeHover={(event) => plotProperties.hoverEnabled?.current}
        // onUpdate={(figure) => {
        //   console.log("i'm in on-update!", figure);
        //   // setPlotState(figure);
        // }}
        revision={revision}
        useResizeHandler={true}
        onRelayout={onRelayout}
        divId="plot-div"
      />
    </div>
  );
}

const PlotContainer = React.memo(DumbPlotContainer, (prev, next) => {
  return prev.revision === next.revision;
});

export default PlotContainer;
