import { Tooltip } from "react-tooltip";

const Tooltips = ({ id }: { id: string }) => {
  return (
    <Tooltip
      id={id}
      style={{
        zIndex: 9999,
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
      }}
    />
  );
};

export default Tooltips;
