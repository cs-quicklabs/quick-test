import { FC } from "react";
interface Iprops {
  error?: string;
  touched?: boolean | string;
  disabled?: boolean;
  validation?: boolean;
  optionsForSelect?: any[];
  sendIdAsValue?: boolean;
}
const InputSelect: FC<Iprops> = ({ ...props }: Iprops) => {
  const {
    touched,
    error,
    disabled,
    validation,
    optionsForSelect,
    sendIdAsValue,
    ...rest
  } = {
    ...props,
  };

  return (
    <select
      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none  focus:border-indigo-500 sm:text-sm pr-10 ${(error && touched) || (validation && error)
        ? " border-red-300"
        : " border-gray-300"
        } ${disabled ? "bg-gray-100" : ""}`}
      {...rest}
      disabled={disabled}
      id="prioritySelect"
    >
      <option value='' disabled>Select</option>
      {optionsForSelect?.map((options) => {
        return options.id === "default" ? (
          <option key={options.id} className="hidden" disabled value="">
            {options.name}
          </option>
        ) : (
          <option
            key={options.id}
            value={sendIdAsValue === true ? options.id : options.name}
          >
            {options.name}
          </option>
        );
      })}
    </select>
  );
};

export default InputSelect;
