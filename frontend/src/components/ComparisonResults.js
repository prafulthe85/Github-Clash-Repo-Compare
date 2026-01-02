import "./ComparisonResults.scss";
import UserCard from "./UserCard";
import AIComparison from "./AIComparison";

const ComparisonResults = ({
  results,
  onReset,
  isStreaming = false,
  onRoast,
  disabledRoastButtons = [],
}) => {
  const { user1, user2, comparison } = results;

  // Disable "Compare Another" button while streaming
  const isCompareAnotherDisabled = isStreaming;

  const handleReset = () => {
    // Prevent reset if streaming
    if (isStreaming) return;
    onReset();
  };

  return (
    <div className="comparison-results">
      <div className="results-header">
        <h2>Comparison Results</h2>
        <button
          className={`reset-button ${
            isCompareAnotherDisabled ? "disabled" : ""
          }`}
          onClick={handleReset}
          disabled={isCompareAnotherDisabled}
        >
          Compare Another
        </button>
      </div>

      <div className="users-comparison">
        <UserCard user={user1} position="left" />
        <div className="vs-badge">VS</div>
        <UserCard user={user2} position="right" />
      </div>

      <AIComparison
        comparison={comparison || ""}
        isStreaming={isStreaming}
        user1={user1}
        user2={user2}
        onRoast={onRoast}
        disabledButtons={disabledRoastButtons}
      />
    </div>
  );
};

export default ComparisonResults;
