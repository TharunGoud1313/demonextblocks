import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  const suggestionQueries = [
    {
      desktop: "Show all plans by status",
      mobile: "Plan status",
    },
    {
      desktop: "What's the average progress percentage of plans?",
      mobile: "Avg progress",
    },
    {
      desktop: "List plans ending this month",
      mobile: "Ending plans",
    },
    {
      desktop: "Group plans by category",
      mobile: "Plan categories",
    },
    {
      desktop: "Show plans with progress over 75%",
      mobile: "High progress",
    },
    {
      desktop: "Compare planned vs actual days",
      mobile: "Plan timeline",
    },
    {
      desktop: "Plans created in the last 3 months",
      mobile: "Recent plans",
    },
    {
      desktop: "Show plans by business",
      mobile: "By business",
    },
    {
      desktop: "List phases by completion status",
      mobile: "Phase status",
    },
    {
      desktop: "Show average duration of phases",
      mobile: "Phase duration",
    },
    {
      desktop: "Phases with highest progress percentage",
      mobile: "Top phases",
    },
    // New task related queries
    {
      desktop: "Show tasks grouped by status",
      mobile: "Task status",
    },
    {
      desktop: "List overdue tasks",
      mobile: "Overdue tasks",
    },
    {
      desktop: "Show tasks by assignee",
      mobile: "Task assignees",
    },
    {
      desktop: "Compare task planned vs actual days",
      mobile: "Task timelines",
    },
  ];

  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Try these queries:
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestionQueries.map((suggestion, index) => (
          <Button
            key={index}
            className={index > 5 ? "hidden sm:inline-block" : ""}
            type="button"
            variant="outline"
            onClick={() => handleSuggestionClick(suggestion.desktop)}
          >
            <span className="sm:hidden">{suggestion.mobile}</span>
            <span className="hidden sm:inline">{suggestion.desktop}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
