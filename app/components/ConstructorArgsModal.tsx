import type { AbiConstructor } from "abitype";
import type React from "react";

interface ConstructorArgsModalProps {
  isOpen: boolean;
  onClose: () => void;
  constructorInputs: AbiConstructor["inputs"];
  constructorArgs: string[];
  setConstructorArgs: React.Dispatch<React.SetStateAction<string[]>>;
}

const ConstructorArgsModal: React.FC<ConstructorArgsModalProps> = ({
  isOpen,
  onClose,
  constructorInputs,
  constructorArgs,
  setConstructorArgs,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleInputChange = (index: number, value: string) => {
    const newArgs = [...constructorArgs];
    newArgs[index] = value;
    setConstructorArgs(newArgs);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Constructor Arguments
        </h2>
        <form onSubmit={handleSubmit}>
          {constructorInputs.map((input, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {input.name} ({input.type})
              </label>
              <input
                type="text"
                value={constructorArgs[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="mt-1 px-2 py-1 border block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>
          ))}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConstructorArgsModal;
