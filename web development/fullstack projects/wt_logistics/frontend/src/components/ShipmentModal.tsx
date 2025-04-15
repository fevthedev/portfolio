'use client';
import React from 'react';
import { useEffect } from 'react';

interface ShipmentModalProps {
    isOpen: boolean;
    shipment: any;
    onClose: () => void;
}

export default function ShipmentModal({ isOpen, shipment, onClose }: ShipmentModalProps) {
    if (!isOpen || !shipment) return null;

    // allow use of ESC key for escaping modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded w-[90%] max-w-xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Shipment Details</h2>
                <ul className="text-sm space-y-1">
                    {Object.entries(shipment).map(([key, value]) => (
                        <li key={key}>
                            <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {String(value)}
                        </li>
                    ))}
                </ul>
                <div className="text-right mt-6">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
