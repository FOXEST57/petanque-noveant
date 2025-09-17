import React from 'react';
import TeamManagement from '../components/TeamManagement';

const TestTeamManagement = () => {
    const handleStatsUpdate = () => {
        console.log('Stats updated');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Test du composant TeamManagement
                </h1>
                <TeamManagement onStatsUpdate={handleStatsUpdate} />
            </div>
        </div>
    );
};

export default TestTeamManagement;