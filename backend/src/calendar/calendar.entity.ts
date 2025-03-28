import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../entities/user.entity';
import { JobPost } from '../entities/job-post.entity';
import { EventType } from '../entities/enums/event-type.enum';


@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.JOB_POST_DEADLINE
  })
  type: EventType;

  @ManyToOne(() => User, user => user.calendarEvents)
  user: User;

  @ManyToOne(() => JobPost, jobPost => jobPost.calendarEvents)
  jobPost: JobPost;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 

export { EventType };
