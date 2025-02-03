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
  };

export type JobPost = {
    title: string
    description: string
    employer: string
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
}

export type SavedPost = {
    username: string
    jobPostId: string
    savedAt: string
}

export type JobPostRequest = {
    id: string
    jobPostId: string
    employee: string
    applyDate: string
    status: string
    email: string
    phone: string
    message: string
}