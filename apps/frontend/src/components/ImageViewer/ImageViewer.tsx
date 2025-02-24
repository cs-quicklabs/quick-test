import { Fragment, SetStateAction, useRef } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import download from "downloadjs";

interface PropTypes {
  source: string;
  alt: string;
  open: boolean;
  setOpen: (ele: SetStateAction<boolean>) => void;
}

export default function ImageViewer({ source, alt, open, setOpen }: PropTypes) {
  const cancelButtonRef = useRef(null);

  const downloadHandler = () => {
    download(source);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={setOpen}
        initialFocus={cancelButtonRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed w-screen inset-0 bg-black bg-opacity-95 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="absolute top-5 right-6 cursor-pointer flex gap-8">
            <button className="h-8 w-8" onClick={downloadHandler}>
              <ArrowDownTrayIcon
                className="text-neutral-700 "
                aria-hidden="true"
              />
            </button>
            <button ref={cancelButtonRef} className="h-8 w-8" onClick={() => setOpen(false)}>
              <XMarkIcon
                className="text-neutral-700"
              />
            </button>
          </div>
          <div className="flex flex-col h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransformWrapper initialScale={1}>
              {({ zoomIn, zoomOut, ...rest }) => (
                <>
                  <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  >
                    <div className="relative transform overflow-hidden rounded-lg transition-all bg-transparent text-left shadow-xl border-none border-0 mx-auto flex justify-center items-center">
                      <TransformComponent>
                        <img
                          className="block sm:w-full h-[75vh] flex-auto"
                          src={source}
                          alt={alt}
                        />
                      </TransformComponent>
                    </div>
                  </TransitionChild>
                  <div className="flex justify-center items-center h-20 w-28 gap-10 cursor-pointer z-100">
                    <button onClick={() => zoomIn()}>
                      <MagnifyingGlassPlusIcon
                        className="text-neutral-700"
                        aria-hidden="true"
                      />
                    </button>
                    <button onClick={() => zoomOut()}>
                      <MagnifyingGlassMinusIcon
                        className="text-neutral-700"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
