import "./styles/global.css";
import { BrowserRouter } from "react-router-dom";
import MainContext from "./components/Context/mainContext";
import AppRoutes from "./routes/AppRoutes";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./store";

const queryClient = new QueryClient();

const App = () => {
  return (
    // <Elements stripe={stripePromise}>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <MainContext>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster position="top-center" />
        </MainContext>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </Provider>
    </QueryClientProvider>
    // </Element />
  );
};

export default App;
