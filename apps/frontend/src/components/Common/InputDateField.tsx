import { FC } from "react";
// @ts-ignore
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormikContext } from "formik";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface Iprops {
  error?: string;
  touched?: boolean | string;
  disabled?: boolean;
  validation?: boolean;
  value: Date;
  name: string;
  minDate?: Date;
  maxDate?: Date;
}

const InputDateField: FC<Iprops> = ({ ...props }: Iprops) => {
  const { value, name, touched, error, disabled, validation, ...rest } = {
    ...props,
  };

  const formik = useFormikContext();
  const { setFieldValue } = formik;

  return (
    <>
      <DatePicker
        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none  focus:border-indigo-500 sm:text-sm  ${(error && touched) || (validation && error)
          ? " border-red-300 pr-10"
          : " border-gray-300"
          } ${disabled ? "bg-gray-100" : ""}`}
        {...rest}
        id={name}
        disabled={disabled}
        selected={value}
        onChange={(e: any) => setFieldValue(name, e ? e : "")}
        dateFormat={"dd/MM/yyyy"}
        scrollableYearDropdown={true}
        yearDropdownItemNumber={30}
        autoComplete="off"
        showPopperArrow={false}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <CalendarIcon className="w-4 h-4 text-gray-700" />
      </div>
    </>
  );
};

export default InputDateField;
