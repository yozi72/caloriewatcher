
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  name: string;
  target: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
}

interface GoalSettingProps {
  goals: Goal[];
  onSaveGoals: (goals: Goal[]) => void;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ goals, onSaveGoals }) => {
  const [editedGoals, setEditedGoals] = useState<Goal[]>(goals);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: '',
      target: 0,
      unit: '',
      priority: 'medium',
    };
    
    setEditedGoals([...editedGoals, newGoal]);
    setIsEditing(true);
  };

  const handleUpdateGoal = (id: string, field: keyof Goal, value: any) => {
    const updatedGoals = editedGoals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    );
    setEditedGoals(updatedGoals);
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = editedGoals.filter(goal => goal.id !== id);
    setEditedGoals(updatedGoals);
  };

  const handleSave = () => {
    const validGoals = editedGoals.filter(goal => goal.name.trim() !== '');
    onSaveGoals(validGoals);
    setIsEditing(false);
    
    toast({
      title: "Goals saved",
      description: "Your health goals have been updated",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-health-red';
      case 'medium': return 'bg-health-orange';
      case 'low': return 'bg-health-green';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Health Goals</h2>
        
        {isEditing ? (
          <button 
            onClick={handleSave}
            className="py-2 px-4 bg-health-blue text-white rounded-lg shadow-sm"
          >
            Save Goals
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="py-2 px-4 border border-health-blue text-health-blue rounded-lg"
          >
            Edit Goals
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {editedGoals.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No goals set yet</p>
            <button 
              onClick={handleAddGoal}
              className="mt-4 py-2 px-6 bg-health-blue text-white rounded-full shadow-sm"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          editedGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl p-4 shadow-subtle">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => handleUpdateGoal(goal.id, 'name', e.target.value)}
                    placeholder="Goal name"
                    className="w-full p-2 border rounded-lg"
                  />
                  
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={goal.target}
                      onChange={(e) => handleUpdateGoal(goal.id, 'target', parseFloat(e.target.value))}
                      className="w-20 p-2 border rounded-lg"
                    />
                    
                    <input
                      type="text"
                      value={goal.unit}
                      onChange={(e) => handleUpdateGoal(goal.id, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="w-20 p-2 border rounded-lg"
                    />
                    
                    <select
                      value={goal.priority}
                      onChange={(e) => handleUpdateGoal(goal.id, 'priority', e.target.value as 'high' | 'medium' | 'low')}
                      className="flex-1 p-2 border rounded-lg"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} />
                      <h3 className="font-medium">{goal.name}</h3>
                    </div>
                    <p className="text-gray-500 mt-1">Target: {goal.target} {goal.unit}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isEditing && (
          <button 
            onClick={handleAddGoal}
            className="w-full py-3 bg-gray-100 rounded-xl text-gray-600 font-medium"
          >
            + Add Another Goal
          </button>
        )}
      </div>
    </div>
  );
};

export default GoalSetting;
