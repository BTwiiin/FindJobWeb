import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JobPost } from './job-post.entity';
import { User } from './user.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

@Entity()
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @ManyToOne(() => JobPost, { onDelete: 'CASCADE' })
  jobPost: JobPost;

  @Column()
  jobPostId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  applicant: User;

  @Column()
  applicantId: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ type: 'text', nullable: true })
  employerNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ default: false })
  isArchived: boolean;
} 