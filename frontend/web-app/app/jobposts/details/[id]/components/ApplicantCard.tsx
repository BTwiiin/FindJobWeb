import React from "react";
import { JobPostRequest } from "@/types";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import { updateApplicationStatus } from "@/app/actions/jobPostActions";
import toast from "react-hot-toast";

interface ApplicantCardProps {
  applicant: JobPostRequest;
  onClick?: () => void;
  isModal?: boolean;
  onStatusChange?: () => void;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const formatDateString = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
};

const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant, onClick, isModal = false, onStatusChange }) => {
    const handleStatusUpdate = async (status: number) => {
        try {
          var response = await updateApplicationStatus(applicant.jobPostId, applicant.employee, status);

          var statusString = status === 1 ? 'Approved' : 'Rejected';
          
          if (response.status === statusString) {
            toast.success('Application status updated successfully');
          }
          else {
            toast.error('Failed to update application status: ' + response.status);
          }
          if (onStatusChange) {
            onStatusChange();
          }
        } catch (error) {
          console.error('Error updating application status:', error);
          toast.error('Failed to update application status');
        }
      };

  return (
    <div
      onClick={!isModal ? onClick : undefined}
      className={`p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 
        ${!isModal ? "hover:bg-gray-100 hover:cursor-pointer" : ""}`}
    >
      <div className="flex items-center mb-2">
        <FaUser className="mr-2 text-gray-600 text-lg flex-shrink-0" />
        <p className="font-medium text-gray-800">
          {isModal ? applicant.employee : truncateText(applicant.employee, 20)}
        </p>
      </div>
      <div className="flex items-center mb-2">
        <FaEnvelope className="mr-2 text-gray-600 text-lg flex-shrink-0" />
        <p className="text-gray-600">
          {isModal ? applicant.email : truncateText(applicant.email, 25)}
        </p>
      </div>
      <div className="flex items-center mb-2">
        <FaPhone className="mr-2 text-gray-600 text-lg flex-shrink-0" />
        <p className="text-gray-600">
          {isModal ? applicant.phone : truncateText(applicant.phone, 15)}
        </p>
      </div>
      <div className="flex items-center mb-2">
        <MdMessage className="mr-2 text-gray-600 text-lg flex-shrink-0" />
        <p className="text-gray-600">
          {isModal ? applicant.message : truncateText(applicant.message, 30)}
        </p>
      </div>
      <div className="flex items-center mb-2">
        <FaInfoCircle className="mr-2 text-gray-600 text-lg flex-shrink-0" />
        <p className="text-gray-600">
          Status: {isModal ? applicant.status : truncateText(applicant.status, 15)}
        </p>
      </div>
      <div className="flex items-center">
        <FaCalendarAlt className="mr-2 text-gray-600 text-lg flex-shrink-0" />
        <p className="text-gray-600">Applied on: {formatDateString(applicant.applyDate)}</p>
      </div>

      {isModal && (
        <div className="flex gap-2 mt-4">
        {/* Approve Button */}
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 dark:border-white dark:bg-gray-800 dark:hover:bg-gray-600 dark:focus:bg-gray-600 flex-1"
          onClick={() => handleStatusUpdate(1)}
        >
          Approve
        </button>
      
        {/* Reject Button */}
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-500 focus:ring-2 focus:ring-red-500 focus:bg-red-500 dark:border-red-400 dark:bg-red-700 dark:hover:bg-red-600 dark:focus:bg-red-600 flex-1"
          onClick={() => handleStatusUpdate(2)}
        >
          Reject
        </button>
      </div>
      
      )}
    </div>
  );
};

export default ApplicantCard;
