import React, { FC, ReactNode } from "react";

interface Props {
  title: string;
  onCancel: () => void;
  children: ReactNode;
}

const Modal: FC<Props> = ({ title, onCancel, children }) => {
  return (
    <div className="overflow-y-auto flex overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full max-h-full bg-black bg-opacity-70">
      <div className="relative p-4 w-max max-w-md max-h-full min-w-[90%]">
        {/* <!-- Modal content --> */}
        <div className="relative bg-gray-50 rounded-lg shadow overflow-hidden">
          {/* <!-- Modal header --> */}
          <div className="flex items-center justify-between md:p-5 border-b rounded-t dark:border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mz">{title}</h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onCancel}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* <!-- Modal body --> */}
          <div className="overflow-y-auto min-h-fit max-h-[70vh]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
