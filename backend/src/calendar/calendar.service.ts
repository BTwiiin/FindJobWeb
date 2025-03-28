import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CalendarEvent, EventType } from './calendar.entity';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { JobPost } from '../entities/job-post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CalendarService {
  private calendarEventRepository: Repository<CalendarEvent>;
  private jobPostRepository: Repository<JobPost>;
  private userRepository: Repository<User>;

  constructor(
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {
    this.calendarEventRepository = this.dataSource.getRepository(CalendarEvent);
    this.jobPostRepository = this.dataSource.getRepository(JobPost);
    this.userRepository = this.dataSource.getRepository(User);
  }

  async create(createCalendarEventDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: createCalendarEventDto.jobPostId },
      relations: ['employer', 'employee'],
    });

    if (!jobPost) {
      throw new NotFoundException(`Job post with ID ${createCalendarEventDto.jobPostId} not found`);
    }

    let user: User | undefined;
    if (createCalendarEventDto.userId) {
      const foundUser = await this.userRepository.findOne({
        where: { id: createCalendarEventDto.userId },
      });
      if (foundUser) {
        user = foundUser;
      }
    }

    // If no user is specified, use the job post's employer or employee based on event type
    if (!user) {
      if (createCalendarEventDto.type === EventType.JOB_POST_DEADLINE) {
        user = jobPost.employer;
      } else if (jobPost.employee) {
        user = jobPost.employee;
      }
    }

    const event = this.calendarEventRepository.create({
      title: createCalendarEventDto.title,
      description: createCalendarEventDto.description,
      eventDate: createCalendarEventDto.eventDate,
      type: createCalendarEventDto.type,
      jobPost,
      user,
    });

    return this.calendarEventRepository.save(event);
  }

  async findAll(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return this.calendarEventRepository.find({
      where: [
        { user: { id: userId } },
        { jobPost: { employer: { id: userId } } },
        { jobPost: { employee: { id: userId } } },
      ],
      relations: ['jobPost', 'user', 'jobPost.employer', 'jobPost.employee'],
      order: { eventDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.calendarEventRepository.findOne({
      where: { id },
      relations: ['jobPost', 'user', 'jobPost.employer', 'jobPost.employee'],
    });

    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = await this.findOne(id);
    Object.assign(event, updateData);
    return this.calendarEventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.calendarEventRepository.remove(event);
  }

  async getEventsByJobPost(jobPostId: string): Promise<CalendarEvent[]> {
    return this.calendarEventRepository.find({
      where: { jobPost: { id: jobPostId } },
      relations: ['jobPost', 'user', 'jobPost.employer', 'jobPost.employee'],
      order: { eventDate: 'ASC' },
    });
  }
} 