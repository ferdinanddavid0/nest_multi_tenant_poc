import { InjectQueue, Process, Processor } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { Connection } from 'typeorm';

import { JobPriority } from '../../core/constant/job.constant';
import { MultiTenantService } from '../../core/multi-tenant/multi-tenant.service';
import { Tenant } from '../../core/multi-tenant/tenant.entity';
import { User } from '../user.entity';
import { UserService } from '../user.service';

@Processor()
export class CheckTenantWorker {
  private readonly userService: UserService;
  constructor(
    private readonly connection: Connection,
    private readonly multiTenantService: MultiTenantService,
    // private readonly userService: UserService,
    @InjectQueue() private readonly queue: Queue
  ) {}

  @Process({ name: 'check-tenant' })
  async process(): Promise<void> {
    const tenants: Array<Tenant> = await this.multiTenantService.findAll(); // find the repo
    const count: number = tenants.length;
    console.log('tenants:' + count);
    const delay: number = count * 3;
    const jobs: Array<Bull.Job<any>> = await this.queue.getActive();

    console.log('jobs test count:', jobs.length);
    console.log('latest jobs test ID:', jobs[jobs.length - 1].id);
    const strJobID: string = jobs[jobs.length - 1].id.toString();
    const tenantName: string = strJobID.substring(strJobID.indexOf(':') + 1, strJobID.length);
    console.log('tenant name:', tenantName);
    console.log('latest jobs test data:\n', jobs[jobs.length - 1].data);
    const jobData: string = jobs[jobs.length - 1].data.id;
    const jobId: string = tenantName + ':pull-employee';
    await this.queue.add('pull-employee', { tenant: tenantName, id: jobData }, { jobId, priority: JobPriority.Medium, delay });
  }

  // ideally, it should be one worker one tasks
  @Process({ name: 'pull-employee' })
  async pull(): Promise<void> {
    const jobs: Array<Bull.Job<any>> = await this.queue.getActive();
    console.log('pull employee job ID:', jobs[jobs.length - 1].id);
    console.log('pull employee job:', jobs[jobs.length - 1].data);
    const tenantName = jobs[jobs.length - 1].data.tenant;
    const employeeID = jobs[jobs.length - 1].data.id;
    console.log('searching from tenant', tenantName, 'and ID', employeeID);

    const employee: User = await this.userService.findOne({ where: { id: employeeID } });

    console.log('found employee', employee);

    return Promise.resolve();
  }
}
