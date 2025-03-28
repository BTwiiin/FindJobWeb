import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from './location.entity';
import { JobPost } from './job-post.entity';
import { Review } from './review.entity';
import { SavedPost } from './saved-post.entity';
import { Role } from './enums/role.enum';
import { CalendarEvent } from '../calendar/calendar.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.EMPLOYEE
  })
  role: Role;

  @Column({ nullable: true })
  taxNumber: string;
  
  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  about: string;

  @OneToOne(() => Location, location => location.user)
  location: Location;

  @OneToMany(() => JobPost, jobPost => jobPost.employer)
  jobPosts: JobPost[];

  @OneToMany(() => Review, review => review.reviewer)
  givenReviews: Review[];

  @OneToMany(() => Review, review => review.reviewedUser)
  receivedReviews: Review[];

  @OneToMany(() => SavedPost, savedPost => savedPost.user)
  savedPosts: SavedPost[];

  @OneToMany(() => CalendarEvent, calendarEvent => calendarEvent.user)
  calendarEvents: CalendarEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
