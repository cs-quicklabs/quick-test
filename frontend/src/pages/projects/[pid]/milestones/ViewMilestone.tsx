import ViewMilestone from "../../../../components/Milestones/ViewMilestone";
import { Helmet } from "react-helmet-async";

export default function Comp() {
  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="View already defined Milestone. You can view Milestones and testruns associated with them."
        />
        <meta
          name="keywords"
          content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Edit Milestones, Delete Milestone, Projects"
        />
        <link
          rel="canonical"
          href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/milestones/:id/milestone`}
        />
      </Helmet>

      <ViewMilestone />
    </>
  );
}
