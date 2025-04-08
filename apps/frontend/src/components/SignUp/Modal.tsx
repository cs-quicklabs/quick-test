import { Link } from "react-router-dom";

interface Props {
  toggleModal: (arg: boolean) => void | boolean;
  headline: string;
  text: string;
  buttonText: string;
  linkText?: string;
  customCss?: string;
  dataAttr?: string;
}

export default function PopUp({
  toggleModal,
  headline,
  text,
  buttonText,
  linkText,
  customCss,
  dataAttr,
}: Props) {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={() => toggleModal(false)}
          ></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                {headline}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{text}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 flex justify-center">
            <Link to={`/${linkText}`}>
              <button
                type="button"
                data-cy={dataAttr}
                className={`mt-1 py-1.5 px-2.5 text-xs inline-flex items-center border border-transparent rounded-md shadow-xs  font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden justify-center ${customCss}`}
              >
                {buttonText}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
