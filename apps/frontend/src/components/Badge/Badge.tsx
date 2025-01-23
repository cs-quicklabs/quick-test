import { JSX } from "react";

export default function Badge(props: any): JSX.Element {
  const { className, children, ...rest } = props;
  return (
    <>
      <span
        {...rest}
        className={`capitalize inline-flex items-center px-2 py-0.5 rounded font-medium ${className ?? "bg-gray-100 text-gray-800"
          }`}
      >
        {children}
      </span>
    </>
  );
}
