import Plot from "react-plotly.js";
import React, { MutableRefObject } from "react";

export type PlotProperties = {
  data: any;
  layout: any;
  onInit: () => void;
  hoverEnabled: MutableRefObject<boolean>;
  revision: number;
};

function PlotContainer({
  data,
  layout,
  onInit,
  hoverEnabled,
  revision,
}: PlotProperties) {
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
        data={data}
        layout={layout}
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
        onBeforeHover={(event) => hoverEnabled?.current}
        // onUpdate={(figure) => {
        //   console.log("i'm in on-update!", figure);
        //   // setPlotState(figure);
        // }}
        revision={revision}
        useResizeHandler={true}
        divId="plot-div"
      />
    </div>
  );
}

export default PlotContainer;
