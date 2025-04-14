import { Tooltip } from "react-tooltip";
import type { CSSProperties } from "react";

const ToolTips = ({
  id,
  style = {},
}: {
  id: string;
  style?: CSSProperties;
}) => {
  const defaultStyle: CSSProperties = {
    position: "absolute",
    maxWidth: "24rem",
    display: "inline-block",
    padding: "4px 8px",
    fontSize: "12px",
    color: "white",
    transitionProperty: "opacity",
    transitionDuration: "300ms",
    backgroundColor: "rgb(17 24 39 / var(--tw-bg-opacity, 1))",
    borderRight: "5px",
  };

  return <Tooltip id={id} style={{ ...defaultStyle, ...style }} />;
};

export default ToolTips;
