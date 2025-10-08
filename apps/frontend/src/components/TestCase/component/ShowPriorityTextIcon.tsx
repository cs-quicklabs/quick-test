import criticalPriorityIcon from "./../../../assets/images/priority-icons/critical.svg";
import lowPriorityIcon from "./../../../assets/images/priority-icons/low.svg";
import highPriorityIcon from "./../../../assets/images/priority-icons/high.svg";
import mediumPriorityIcon from "./../../../assets/images/priority-icons/medium.svg";
import { t } from "i18next";

export default function ShowPriorityTextIcon({ value }: { value: string }) {
  const priorityText = value?.toUpperCase();
  const priorityIcons = {
    MEDIUM: { icon: mediumPriorityIcon, text: "mediumPriorityIcon" },
    HIGH: { icon: highPriorityIcon, text: "highPriorityIcon" },
    LOW: { icon: lowPriorityIcon, text: "lowPriorityIcon" },
    CRITICAL: { icon: criticalPriorityIcon, text: "criticalPriorityIcon" },
  };
  const selected = priorityIcons[priorityText as keyof typeof priorityIcons];
  return (
    <span className="flex items-center gap-3">
      <img className=" h-4 w-4" alt={selected?.text} src={selected?.icon}></img>
      <p className="text-sm font-normal"> {t(priorityText)}</p>
    </span>
  );
}
