import React from "react";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed insert-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-[400px]"
        style={{ background: "#f9f9f9" }}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Odjavi se!</h2>
        <p className="text-gray-700 mb-6">
          Da li ste sigurni da želite da se izlogujete?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Otkaži
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Odjavi se
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
