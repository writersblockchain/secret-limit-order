import React from 'react';

function SuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-brand-tan rounded-lg shadow-lg p-8">
        <p className="text-lg font-bold text-center text-brand-orange">Storing confidential limit order on Secret Network...</p>
        <button
          onClick={onClose}
          className="mt-4 bg-brand-blue text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
