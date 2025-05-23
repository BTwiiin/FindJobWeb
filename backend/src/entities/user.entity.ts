import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Location } from './location.entity';
import { JobPost } from './job-post.entity';
import { Review } from './review.entity';
import { SavedPost } from './saved-post.entity';
import { JobApplication } from './job-application.entity';
import { Role } from './enums/role.enum';
import { CalendarEvent } from '../calendar/calendar.entity';
import { Token } from './token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  emailVerified: boolean;
  
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

  @OneToOne(() => Location, location => location.user, { cascade: true })
  @JoinColumn()
  location: Location;

  @OneToMany(() => JobPost, jobPost => jobPost.employer)
  jobPosts: JobPost[];

  @OneToMany(() => Review, review => review.reviewer, { cascade: true } )
  givenReviews: Review[];

  @OneToMany(() => Review, review => review.reviewedUser, { cascade: true })
  receivedReviews: Review[];

  @OneToMany(() => SavedPost, savedPost => savedPost.user, { cascade: true })
  savedPosts: SavedPost[];

  @OneToMany(() => CalendarEvent, calendarEvent => calendarEvent.user)
  calendarEvents: CalendarEvent[];

  @OneToMany(() => JobApplication, application => application.applicant)
  applications: JobApplication[];

  @OneToMany(() => Token, token => token.user)
  tokens: Token[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
