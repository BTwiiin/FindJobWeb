import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @ManyToOne(() => User, user => user.givenReviews)
  reviewer: User;

  @ManyToOne(() => User, user => user.receivedReviews)
  reviewedUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 