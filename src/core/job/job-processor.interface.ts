import { Job, JobOptions, Queue } from 'bull';
import { v4 as uuid } from 'uuid';

import { JobPriority } from '../constant/job.constant';
import { JsonObject } from '../interface/json-object.interface';

export enum JobStatus {
  Error = -1,
  Unknown,
  Pending,
  InProgress,
  Done
}

export interface JobProgress {
  current: number;
  total: number;
}

export interface JobResult {
  status: JobStatus;
  value: JsonObject;
  error?: Error;
}

export abstract class JobProcessor<T> {
  protected abstract readonly jobName: string;
  protected readonly defaultOptions: Partial<JobOptions> = {
    priority: JobPriority.Medium
  };

  protected constructor(protected readonly queue: Queue<T>) {}

  async add(data: T, options: Partial<JobOptions> = {}): Promise<string> {
    const jobId: string = `${this.jobName}:${uuid()}`;
    const job: Job<T> = await this.enqueue(jobId, data, options);

    // convert `number | string` to `string`
    return job.id.toString();
  }

  abstract process(job: Job<T>): Promise<void>;

  protected async enqueue(id: string, data: T, options: Partial<JobOptions>): Promise<Job<T>> {
    const jobOptions: Partial<JobOptions> = { jobId: id, ...this.defaultOptions, ...options };
    return this.queue.add(this.jobName, data, jobOptions);
  }

  protected async exist(id: string): Promise<Job<T>> {
    return this.queue.getJob(id);
  }
}
