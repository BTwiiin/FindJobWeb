export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
  CANCELLED = 'cancelled'
}

export interface JobApplication {
  id: string
  jobPostId: string
  jobPost: {
    id: string
    title: string
  }
  applicant: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  email: string
  phone: string
  coverLetter?: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface JobPostRequest {
  id: string
  jobPostId: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  email: string
  phone: string
  coverLetter?: string
  applicant: {
    id: string
    firstName: string
    lastName: string
  }
} 