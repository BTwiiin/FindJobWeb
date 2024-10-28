import React from 'react';

type JobPost = {
  title: string;
  description: string;
  employer: string;
  createdAt: string;
  updatedAt: string;
  paymentAmount: number;
  deadline: string;
  status: string;
  category: string;
  id: string;
};

type Props = {
  jobpost: JobPost;
};

export default function JobPostCard({ jobpost }: Props) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{jobpost.title}</h3>
      <p style={styles.employer}>Employer: {jobpost.employer}</p>
      <p style={styles.description}>{jobpost.description}</p>
      <p style={styles.payment}>Payment: {jobpost.paymentAmount} PLN</p>
      <p style={styles.status}>Status: {jobpost.status}</p>
      <p style={styles.deadline}>Deadline: {new Date(jobpost.deadline).toLocaleString()}</p>
      <p style={styles.category}>Category: {jobpost.category}</p>
      <p style={styles.createdAt}>Created At: {new Date(jobpost.createdAt).toLocaleString()}</p>
      <p style={styles.updatedAt}>Updated At: {new Date(jobpost.updatedAt).toLocaleString()}</p>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ccc', // Lighter border for a flatter look
    borderRadius: '4px', // Reduced border radius for a sharper look
    padding: '12px', // Less padding
    margin: '10px', // Less margin
    backgroundColor: '#fff', // White background
  },
  title: {
    fontSize: '16px',
    fontWeight: '600', // Slightly bold for emphasis
    margin: '0 0 6px 0', // Adjusted margin
  },
  employer: {
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  description: {
    fontSize: '14px',
    color: '#333', // Darker color for better readability
    margin: '0 0 4px 0',
  },
  payment: {
    fontSize: '14px',
    color: '#4CAF50', // Green for payment
    margin: '0 0 4px 0',
  },
  status: {
    fontSize: '14px',
    margin: '0 0 4px 0',
  },
  deadline: {
    fontSize: '14px',
    color: '#FF5722', // Orange for deadline
    margin: '0 0 4px 0',
  },
  category: {
    fontSize: '14px',
    margin: '0 0 4px 0',
  },
  createdAt: {
    fontSize: '12px',
    color: '#888', // Gray for date
    margin: '0 0 4px 0',
  },
  updatedAt: {
    fontSize: '12px',
    color: '#888',
    margin: '0',
  },
};
