import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  projectName: string;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  projectName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div 
        className="bg-dark-100 rounded-xl shadow-xl max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-light mb-2">Close Project</h3>
          <p className="text-light/70 mb-6">
            Are you sure you want to close <span className="font-semibold text-light">"{projectName}"</span>?
            This action will mark the project as closed and hide it from active investments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-dark-300 text-light rounded-lg hover:bg-dark-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Close Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
