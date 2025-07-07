import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import { Content } from "./pages/Content/Content";
import { Login } from "./pages/Login/Login";
import { PageNotFound } from "./pages/PagesNotFound/PagesNotFound";
import Questions from "./pages/Qusetions/Questions";
import { Register } from "./pages/Register/Register";
import { Welcome } from "./pages/Welcome/Welcome";
import { Topic } from "./pages/Topic/Topic";
import { Account } from "./pages/Account/Account";
import Training from "./pages/Training/Training";
import Subscription from './pages/Subscription/Subscription';

const pageVariants = {
  initial: {
    opacity: 0,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  in: {
    opacity: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  out: {
    opacity: 0,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.3,
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export function App() {
  const location = useLocation();

  return (
    <div className="App">
      <div className="page-wrapper">
        <AnimatePresence initial={false} mode="sync">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <Welcome />
                </AnimatedPage>
              }
            />
            <Route
              path="/content"
              element={
                <AnimatedPage>
                  <Content />
                </AnimatedPage>
              }
            />
            <Route
              path="/content/quiz"
              element={
                <AnimatedPage>
                  <Questions />
                </AnimatedPage>
              }
            />
            <Route
              path="/account"
              element={
                <AnimatedPage>
                  <Account />
                </AnimatedPage>
              }
            />
            <Route
              path="/training"
              element={
                <AnimatedPage>
                  <Training />
                </AnimatedPage>
              }
            />
            <Route
              path="/subscription"
              element={
                <AnimatedPage>
                  <Subscription />
                </AnimatedPage>
              }
            />
            <Route
              path="/trivia-quiz"
              element={
                <AnimatedPage>
                  <Questions />
                </AnimatedPage>
              }
            />
            <Route
              path="/login"
              element={
                <AnimatedPage>
                  <Login />
                </AnimatedPage>
              }
            />
            <Route
              path="/register/login"
              element={
                <AnimatedPage>
                  <Login />
                </AnimatedPage>
              }
            />
            <Route
              path="/register"
              element={
                <AnimatedPage>
                  <Register />
                </AnimatedPage>
              }
            />
            <Route
              path="/topic/:id"
              element={
                <AnimatedPage>
                  <Topic />
                </AnimatedPage>
              }
            />
            <Route
              path="*"
              element={
                <AnimatedPage>
                  <PageNotFound />
                </AnimatedPage>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}