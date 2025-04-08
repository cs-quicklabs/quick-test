import { useMemo } from "react";

export default function Button(props: any) {
  const renderStyle = useMemo(() => {
    if (props.loading) {
      const doc: DOMRect | undefined = document
        .getElementById(props.id)
        ?.getBoundingClientRect();
      return {
        width: doc?.width,
      };
    }
  }, [props]);

  const propsNew = { ...props };
  delete propsNew["loading"];

  return (
    <>
      <button
        type="submit"
        {...propsNew}
        className={`inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-indigo-600  focus:outline-hidden ${
          props.hover === "false"
            ? "hover:bg-indigo-600"
            : "hover:bg-indigo-700"
        } ${props?.className} my-submit-button`}
        disabled={props?.loading || props?.disabled ? true : false}
        style={renderStyle}
      >
        {props?.loading ? (
          <div>
            <svg className="animate-spin h-4" viewBox="0 0 100 100">
              <path
                fill="#fff"
                d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  dur="1s"
                  from="0 50 50"
                  to="360 50 50"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
        ) : props?.children ? (
          props?.children
        ) : null}
      </button>
    </>
  );
}
