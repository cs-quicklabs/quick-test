const InputCheckbox = ({ ...props }) => {
  const { touched, error, validation, ...rest } = { ...props };
  return (
    <input
      id={props.name}
      className={`checkbox ${
        (error && touched) || (validation && error)
          ? " border-red-300"
          : " border-gray-300"
      }`}
      {...rest}
    />
  );
};

export default InputCheckbox;
