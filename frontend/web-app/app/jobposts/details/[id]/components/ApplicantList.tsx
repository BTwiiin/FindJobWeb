"use client";

import TemplateModal from "@/app/components/TemplateModal";
import { JobPostRequest } from "@/types";
import React, { useState } from "react";
import ApplicantCard from "./ApplicantCard";

interface ApplicantListProps {
  applicantList: JobPostRequest[] | null;
}

const ApplicantList: React.FC<ApplicantListProps> = ({ applicantList }) => {
  const [selectedApplicant, setSelectedApplicant] = useState<JobPostRequest | null>(null);

  const handleStatusChange = () => {
    setSelectedApplicant(null);
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {applicantList && applicantList.length > 0 ? (
        applicantList.map((applicant) => (
          <ApplicantCard 
            key={applicant.id} 
            applicant={applicant} 
            onClick={() => setSelectedApplicant(applicant)}
          />
        ))
      ) : (
        <p className="col-span-full text-center text-gray-600">No applicants yet.</p>
      )}

      {selectedApplicant && (
        <TemplateModal 
          show={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          title="Applicant Info"
        >
          <ApplicantCard applicant={selectedApplicant} isModal={true} onStatusChange={handleStatusChange}/>
        </TemplateModal>
      )}
    </div>
  );
};

export default ApplicantList;
