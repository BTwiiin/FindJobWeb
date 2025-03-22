import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchParams } from './interfaces/search-params.interface';
import { JobPost } from '../entities/job-post.entity';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly index = 'jobposts';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    await this.createIndex();
  }

  private async createIndex() {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: this.index,
    });

    if (!indexExists) {
      await this.elasticsearchService.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { 
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: { type: 'text' },
              employer: {
                type: 'object',
                properties: {
                  id: { type: 'keyword' },
                  username: { type: 'keyword' }
                }
              },
              employee: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              paymentAmount: { type: 'integer' },
              deadline: { type: 'date' },
              status: { type: 'keyword' },
              category: { type: 'keyword' },
              location: {
                type: 'nested',
                properties: {
                  country: { type: 'keyword' },
                  city: { type: 'keyword' },
                  address: { type: 'text' },
                  state: { type: 'keyword' },
                  postalCode: { type: 'keyword' },
                  latitude: { type: 'float' },
                  longitude: { type: 'float' },
                  formattedAddress: { type: 'text' }
                }
              }
            }
          }
        }
      });
    }
  }

  async indexJobPost(jobPost: JobPost) {
    return this.elasticsearchService.index({
      index: this.index,
      id: jobPost.id.toString(),
      document: {
        id: jobPost.id,
        title: jobPost.title,
        description: jobPost.description,
        employer: jobPost.employer,
        employee: jobPost.employee,
        createdAt: jobPost.createdAt,
        updatedAt: jobPost.updatedAt,
        paymentAmount: jobPost.paymentAmount,
        deadline: jobPost.deadline,
        status: jobPost.status,
        category: jobPost.category,
        location: jobPost.location,
      },
    });
  }

  async search(searchParams: SearchParams) {
    const { searchTerm, pageNumber = 1, pageSize = 10, orderBy, filterBy, minSalary, maxSalary } = searchParams;

    const query = {
      bool: {
        must: [] as any[],
        filter: [] as any[],
      },
    };

    if (searchTerm) {
      query.bool.must.push({
        multi_match: {
          query: searchTerm,
          fields: [
            'title^3',
            'description',
            'category',
            'location.country',
            'location.city',
            'location.address',
            'location.formattedAddress'
          ],
          fuzziness: 'AUTO',
          operator: 'or',
          type: 'best_fields'
        },
      });
    }

    if (filterBy) {
      query.bool.filter.push({
        term: { category: filterBy.toLowerCase() },
      });
    }

    if (minSalary || maxSalary) {
      query.bool.filter.push({
        range: {
          paymentAmount: {
            ...(minSalary && { gte: minSalary }),
            ...(maxSalary && { lte: maxSalary }),
          },
        },
      });
    }

    try {
      const { hits } = await this.elasticsearchService.search<JobPost>({
        index: this.index,
        body: {
          from: (pageNumber - 1) * pageSize,
          size: pageSize,
          sort: this.getSortCriteria(orderBy),
          query,
          track_total_hits: true
        },
      });

      const total = typeof hits.total === 'number' ? hits.total : hits.total?.value || 0;

      return {
        results: hits.hits.map((hit) => hit._source as JobPost),
        totalCount: total,
        pageCount: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async updateJobPost(jobPost: JobPost) {
    return this.elasticsearchService.update({
      index: this.index,
      id: jobPost.id.toString(),
      doc: {
        title: jobPost.title,
        description: jobPost.description,
        employer: jobPost.employer,
        employee: jobPost.employee,
        updatedAt: jobPost.updatedAt,
        paymentAmount: jobPost.paymentAmount,
        deadline: jobPost.deadline,
        status: jobPost.status,
        category: jobPost.category,
        location: jobPost.location,
      },
    });
  }

  async deleteJobPost(jobPostId: string) {
    return this.elasticsearchService.delete({
      index: this.index,
      id: jobPostId,
    });
  }

  private getSortCriteria(orderBy?: string) {
    switch (orderBy) {
      case 'new':
        return [{ createdAt: 'desc' }];
      case 'paymentAmount':
        return [{ paymentAmount: 'desc' }];
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  async reindexAll(jobPosts: JobPost[]) {
    const operations = jobPosts.flatMap(jobPost => [
      { index: { _index: this.index, _id: jobPost.id.toString() } },
      {
        id: jobPost.id,
        title: jobPost.title,
        description: jobPost.description,
        employer: jobPost.employer,
        employee: jobPost.employee,
        createdAt: jobPost.createdAt,
        updatedAt: jobPost.updatedAt,
        paymentAmount: jobPost.paymentAmount,
        deadline: jobPost.deadline,
        status: jobPost.status,
        category: jobPost.category,
        location: jobPost.location,
      }
    ]);

    if (operations.length > 0) {
      const { errors } = await this.elasticsearchService.bulk({ operations });
      if (errors) {
        console.error('Bulk indexing encountered errors:', errors);
      }
    }
  }
} 