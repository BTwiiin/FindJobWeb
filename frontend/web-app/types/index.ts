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
}