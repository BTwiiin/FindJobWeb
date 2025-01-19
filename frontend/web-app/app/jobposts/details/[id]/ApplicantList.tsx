import { JobPostRequest } from '@/types';
import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

interface ApplicantListProps {
  applicantList: JobPostRequest[] | null;
}

const formatDateString = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long', // or 'short' for Jan, Feb, etc.
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
};

const ApplicantList: React.FC<ApplicantListProps> = ({ applicantList }) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {applicantList && applicantList.length > 0 ? (
        applicantList.map((applicant) => (
          <div
            key={applicant.id}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center mb-2">
              <FaUser className="mr-2 text-gray-600" />
              <p className="font-medium text-gray-800">{applicant.employee}</p>
            </div>
            <div className="flex items-center mb-2">
              <FaEnvelope className="mr-2 text-gray-600" />
              <p className="text-gray-600">{applicant.email}</p>
            </div>
            <div className="flex items-center mb-2">
              <FaPhone className="mr-2 text-gray-600" />
              <p className="text-gray-600">{applicant.phone}</p>
            </div>
            <div className="flex items-center mb-2">
              <FaInfoCircle className="mr-2 text-gray-600" />
              <p className="text-gray-600">{applicant.message}</p>
            </div>
            <div className="flex items-center mb-2">
              <FaInfoCircle className="mr-2 text-gray-600" />
              <p className="text-gray-600">Status: {applicant.status}</p>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-600" />
              <p className="text-gray-600">Applied on: {formatDateString(applicant.applyDate)}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="col-span-full text-center text-gray-600">No applicants yet.</p>
      )}
    </div>
  );
};

export default ApplicantList;