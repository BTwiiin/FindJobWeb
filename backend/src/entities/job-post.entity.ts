import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { User } from './user.entity';
import { Location } from './location.entity';
import { SavedPost } from './saved-post.entity'
import { JobPostStatus } from './enums/job-post-status.enum';
import { JobPostCategory } from './enums/job-post-category.enum';
import { CalendarEvent } from '../calendar/calendar.entity';

@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, user => user.jobPosts)
  employer: User;

  @ManyToOne(() => User, { nullable: true })
  employee: User;

  @Column('int')
  paymentAmount: number;

  @Column('timestamp')
  deadline: Date;

  @Column({ 
    type: 'boolean',
    default: false
  })
  isArchived: boolean;

  @Column({
    type: 'enum',
    enum: JobPostStatus,
    default: JobPostStatus.OPEN
  })
  status: JobPostStatus;

  @Column({
    type: 'enum',
    enum: JobPostCategory
  })
  category: JobPostCategory;

  @ManyToOne(() => Location)
  location: Location;

  @OneToMany(() => SavedPost, savedPost => savedPost.jobPost)
  savedPosts: SavedPost[];

  @Column('simple-array', { nullable: true })
  photoUrls: string[];

  @OneToMany(() => CalendarEvent, calendarEvent => calendarEvent.jobPost)
  calendarEvents: CalendarEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
