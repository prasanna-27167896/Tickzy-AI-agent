import React from "react";

export default function ConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl w-[90%] max-w-sm text-white relative">
        {/* Title */}
        <h3 className="text-lg font-semibold text-blue-400 mb-3">
          Confirm Deletion
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-300 mb-6">
          Are you sure you want to delete this ticket? This action cannot be
          undone.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
