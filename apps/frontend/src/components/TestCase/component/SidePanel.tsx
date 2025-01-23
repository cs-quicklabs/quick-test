import { Dispatch, FC, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

interface SidePanelProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<any>>;
  expandRedirectTo: string;
  children?: any;
  onClickNavigate?: () => void;
}

const SidePanel: FC<SidePanelProps> = ({
  isOpen,
  setIsOpen,
  expandRedirectTo,
  children,
  onClickNavigate
}) => {
  const navigate = useNavigate();
  const togglePanel = () => {
    setIsOpen(null);
  };
  return (
    <div
      className={`fixed top-0 right-0 h-full w-3/4 bg-gray-100 border-l-2 drop-shadow-lg transform transition-transform overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
        } md:w-1/2 z-20`}
    >
      <div className="mt-10 flex">
        <button className="mt-4 ml-4 text-xl" onClick={togglePanel}>
          &#x2715;
        </button>
        <button
          className="mt-4 ml-4 text-xl"
          onClick={() => onClickNavigate ? onClickNavigate() : navigate(expandRedirectTo)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-move-diagonal h-4 w-4 text-custom-text-400 hover:text-custom-text-200"
          >
            <polyline points="13 5 19 5 19 11"></polyline>
            <polyline points="11 19 5 19 5 13"></polyline>
            <line x1="19" x2="5" y1="5" y2="19"></line>
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
};

export default SidePanel;
