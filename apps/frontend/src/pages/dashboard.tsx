import UserDashboard from "../components/Home/UserDashboard";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!(sessionStorage.getItem("token") || localStorage.getItem("token")));
  }, []);

  return (
    <>
      <meta
        name="description"
        content="Dashboard page or home page of Quick Test. You can see your active and favorite projects, and keep track of the progress you've made in those projects."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Dashboard, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/dashboard`}
      />
      {isLoggedIn && (
        <div className="flex flex-col grow">
          <UserDashboard />
        </div>
      )}
    </>
  );
};

export default Dashboard;
