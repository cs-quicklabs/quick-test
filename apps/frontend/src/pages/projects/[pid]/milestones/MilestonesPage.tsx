import PageMilestone from "../../../../components/Milestones/Listing";

export default function MilestonesPage() {
  return (
    <>
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
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/milestones`}
      />
      <PageMilestone />
    </>
  );
}
