export type Review = {
    id: string
    rating: number
    comment: string
    jobApplicationId: string
    reviewer: {
      id: string
      name: string
      username: string

    }
    reviewedUser: {
      id: string
      name: string
      username: string
    }
    createdAt: string
  }

export type PagedResult<T> = {
    results: T[]
    pageCount: number
    totalCount: number
}

export type Location = {
    country: string;
    city?: string;
    district?: string;
    street?: string;
    latitude?: number;
    longitude?: number;
    state?: string;
    postalCode?: string;
    formattedAddress?: string;
};

export type Employer = {
    id: string;
    username: string;
};

export type JobPost = {
    title: string
    description: string
    employer: Employer
    employee?: string
    createdAt: string
    updatedAt: string
    paymentAmount: number
    deadline: string
    status: string
    category: string
    location: Location
    id: string
    isSaved?: boolean
    isArchived?: boolean
    reviews?: Review[]
}

export type SavedPost = {
    username: string
    jobPostId: string
    savedAt: string
}

export type JobPostRequest = {
    id: string
    jobPostId: string
    applicant: {
        id: string
        username: string
    }
    applyDate: string
    status: string
    email: string
    phone: string
    message: string
    contactType: string
    createdAt: string
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  name?: string;
  role?: string;
  phoneNumber?: string | null;
  location?: Location | null;
  about?: string;
  taxNumber?: string;
  accessToken?: string;
}

export type GetUserDto = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: Location;
  about: string;
  taxNumber: string;
  createdAt: string;
  role?: string;
  reviews?: any[];
}


export enum RegisterRole {
  EMPLOYEE = 'employee',
  EMPLOYER = 'employer'
}