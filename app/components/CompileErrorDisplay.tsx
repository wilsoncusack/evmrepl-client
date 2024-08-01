import { CompilationResult } from "../types";

interface ErrorDisplayProps {
  errors: CompilationResult["errors"];
}

const CompileErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="p-4 bg-red-100">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Compilation Issues:
      </h3>
      {errors.map((error, index) => (
        <div
          key={index}
          className={`mb-2 p-2 rounded ${error.severity === "error" ? "bg-red-200" : "bg-yellow-200"}`}
        >
          <p className="font-semibold">
            {error.severity}: {error.message}
          </p>
          {error.formattedMessage && <p>{error.formattedMessage}</p>}
        </div>
      ))}
    </div>
  );
};

export default CompileErrorDisplay;
