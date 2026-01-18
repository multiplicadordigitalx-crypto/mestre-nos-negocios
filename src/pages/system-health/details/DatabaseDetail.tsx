
import React from 'react';
import { Activity } from '../../../components/Icons';

export const DatabaseDetail: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400"/> Operações (Reads vs Writes)</h4>
                     <div className="h-40 flex items-end gap-2 px-2">
                        {[50, 70, 40, 90, 60, 80, 50, 65, 85, 55].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full">
                                <div className="w-full bg-blue-500/80 rounded-t" style={{height: `${val/2}%`}} title="Reads"></div>
                                <div className="w-full bg-purple-500/80 rounded-b" style={{height: `${val/3}%`}} title="Writes"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
