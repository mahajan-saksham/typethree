import React from 'react';
import { Edit, Eye, Trash2, Check, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Project {
  id: string;
  title: string;
  location: string;
  capacity: number;
  short_description: string;
  detailed_description: string;
  thumbnail_url: string;
  total_investment: number;
  min_token_investment: number;
  roi_percentage: number;
  irr_percentage: number;
  wattage_credits: number;
  funding_deadline: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'paused' | 'completed';
  created_at: string;
  current_investment?: number; // Optional, calculated from investments
}

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewInvestors: (project: Project) => void;
  onToggleStatus: (project: Project) => void;
  loading: boolean;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onEdit,
  onDelete,
  onViewInvestors,
  onToggleStatus,
  loading
}) => {
  if (loading || projects.length === 0) {
    return null; // These states are handled in the parent component
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-light">
        <thead className="bg-dark-200 text-light/70 text-sm uppercase">
          <tr>
            <th className="px-4 py-3 text-left">Project Name</th>
            <th className="px-4 py-3 text-left">Location</th>
            <th className="px-4 py-3 text-right">Investment Target</th>
            <th className="px-4 py-3 text-right">Current Funding</th>
            <th className="px-4 py-3 text-center">ROI</th>
            <th className="px-4 py-3 text-center">IRR</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-left">Start Date</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-dark-200/50 transition-colors">
              <td className="px-4 py-4 text-light font-medium">{project.title}</td>
              <td className="px-4 py-4 text-light/70">{project.location}</td>
              <td className="px-4 py-4 text-light/70 text-right">
                {formatCurrency(project.total_investment)}
              </td>
              <td className="px-4 py-4 text-right">
                <div>
                  <div className="text-light/70">
                    {formatCurrency(project.current_investment || 0)}
                  </div>
                  <div className="w-full bg-dark-300 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{
                        width: `${Math.min(
                          ((project.current_investment || 0) / project.total_investment) * 100, 
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-light/50 mt-1">
                    {Math.round(((project.current_investment || 0) / project.total_investment) * 100)}%
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-light/70 text-center">{project.roi_percentage}%</td>
              <td className="px-4 py-4 text-light/70 text-center">{project.irr_percentage}%</td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${project.status === 'open' ? 'bg-green-200 text-green-800' : ''}
                  ${project.status === 'paused' ? 'bg-yellow-200 text-yellow-800' : ''}
                  ${project.status === 'closed' ? 'bg-red-200 text-red-800' : ''}
                  ${project.status === 'completed' ? 'bg-blue-200 text-blue-800' : ''}
                `}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 text-light/70">
                {formatDate(project.start_date)}
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-center space-x-1">
                  <button 
                    onClick={() => onEdit(project)}
                    className="p-1.5 text-light/70 hover:text-primary rounded-lg hover:bg-dark-300 transition-colors"
                    title="Edit Project"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onViewInvestors(project)}
                    className="p-1.5 text-light/70 hover:text-primary rounded-lg hover:bg-dark-300 transition-colors"
                    title="View Investors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onToggleStatus(project)}
                    className={`p-1.5 rounded-lg hover:bg-dark-300 transition-colors
                      ${project.status === 'open' ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'}
                    `}
                    title={project.status === 'open' ? 'Pause Project' : 'Activate Project'}
                  >
                    {project.status === 'open' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => onDelete(project)}
                    className="p-1.5 text-light/70 hover:text-red-500 rounded-lg hover:bg-dark-300 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
