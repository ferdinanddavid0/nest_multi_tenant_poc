import { InjectQueue } from '@nestjs/bull';
import { Controller, Get, Header, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Request, Response } from 'express';
import { CheckTenantWorker } from '../consumer/check-tenant.worker';

import { JobPriority } from '../../core/constant/job.constant';

@Controller({
  path: '/api/job'
})
export class ProducerController {
  constructor(@InjectQueue() private readonly queue: Queue) {}

  @Get('/')
  async getIndex(@Req() request: Request, @Res() response: Response): Promise<any> {
    const { tenant } = request.headers;

    // const jobId: string = `${tenant}:pull-employee`;
    const jobId: string = `check-tenant:${tenant}`;

    const worker = CheckTenantWorker;
    // const job: Array<Job> = await this.queue.getJobs(['completed', 'waiting', 'active', 'delayed', 'failed', 'paused']);
    const job = await this.queue.getJob(jobId);

    // const status: HttpStatus = job === null ? HttpStatus.OK : HttpStatus.NOT_FOUND;
    // console.log(job);
    response.status(200).send({ job });

    // return { message: 'Hello!' };
  }

  @Post('/')
  async postIndex(@Req() request: Request, @Res() response: Response) {
    const { data } = request.body;
    const { tenant } = request.headers;

    const jobId: string = `check-tenant:${tenant}`;

    let job: Job = await this.queue.getJob(jobId);
    const status: HttpStatus = job === null ? HttpStatus.CREATED : HttpStatus.ACCEPTED;
    if (job === null) {
      job = await this.queue.add('check-tenant', data, { jobId, priority: JobPriority.Medium });
    }
    console.log('job created:', { id: job.id, data: job.data });
    response.status(status).send({ message: 'job created', job: { id: job.id, data: job.data } });
  }
}
