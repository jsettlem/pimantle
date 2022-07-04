import { MutableRefObject } from "react";

export type PlotProperties = {
  plotData: Plotly.Data[];
  hoverEnabled: MutableRefObject<boolean>;
};
