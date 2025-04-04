'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';

export type EventType = 'CUSTOM' | 'JOB_POST_DEADLINE' | 'JOB_POST_START_DATE' | 'JOB_POST_END_DATE' | 'INTERVIEW' | 'MEETING';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  type: EventType;
  jobPostId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCalendarEventDto {
  title: string;
  description: string;
  eventDate: string;
  type: EventType;
  jobPostId?: string;
  userId?: string;
}

export async function getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  return await fetchWrapper.get(`calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
}

export async function createCalendarEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
  return await fetchWrapper.post('calendar', data);
}

export async function updateCalendarEvent(id: string, data: Partial<CreateCalendarEventDto>): Promise<CalendarEvent> {
  return await fetchWrapper.put(`calendar/${id}`, data);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  return await fetchWrapper.del(`calendar/${id}`);
}

export async function getEventsByJobPost(jobPostId: string): Promise<CalendarEvent[]> {
  return await fetchWrapper.get(`calendar/job-post/${jobPostId}`);
} 