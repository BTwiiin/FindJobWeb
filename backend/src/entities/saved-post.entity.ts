import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { JobPost } from './job-post.entity';

@Entity('saved_posts')
export class SavedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => JobPost, jobPost => jobPost.savedPosts)
  jobPost: JobPost;

  @CreateDateColumn()
  savedAt: Date;
} 