import { Body, Controller, Get, Header, HttpStatus, Param, Post, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UpdateResult } from 'typeorm';

import { RollingKeyEncryptionService } from '../core/cryptography/rolling-key-encryption.service';
import { EncryptedData } from '../core/cryptography/shared/encrypted-data.model';
import { JsonObject } from '../core/interface/json-object.interface';
import { LocaleService } from '../core/locale/locale.service';

import { User } from './user.entity';

import { UserService } from './user.service';
import { CreateTenantDto } from '../core/multi-tenant/create-tenant.dto';
import { Tenant } from '../core/multi-tenant/tenant.entity';
import { MultiTenantService } from '../core/multi-tenant/multi-tenant.service';

@Controller({
  path: '/api'
})
export class ApiController {
  constructor(public readonly locale: LocaleService, private readonly cipherSuite: RollingKeyEncryptionService, private readonly userService: UserService) {}

  @Get('/')
  async getIndex(): Promise<any> {
    const message: string = await this.locale.translate('HELLO');
    return { message };
  }

  @Post('/encrypt')
  @Header('cache-control', 'no-store, max-age=0')
  async postEncrypt(@Req() request: Request, @Res() response: Response) {
    const { data } = request.body;
    const result: string = await this.cipherSuite.encrypt(Buffer.from(data, 'utf-8')).then((encrypted: EncryptedData) => encrypted.toBase64());

    response.status(HttpStatus.OK).send({ result });
  }

  @Post('/decrypt')
  @Header('cache-control', 'no-store, max-age=0')
  async postDecrypt(@Req() request: Request, @Res() response: Response) {
    const { data } = request.body;
    const result: string = await this.cipherSuite.decrypt(EncryptedData.fromBase64(data)).then((plain: Buffer) => plain.toString('utf-8'));

    response.status(HttpStatus.OK).send({ result });
  }

  @Post('/user')
  @Header('cache-control', 'no-store, max-age=0')
  async postUser(@Req() request: Request, @Res() response: Response) {
    const { username, password } = request.body;
    // testing with passing user credentials in body (ONLY FOR POC, never do in prod)
    const user: User = await this.userService.create({ username: username, password: password });
    const result: User = await this.userService.save(user);
    console.log(user);
    response.status(HttpStatus.OK).send(result);
  }

  @Get('/user/:id')
  @Header('cache-control', 'no-store, max-age=0')
  async getUser(@Req() request: Request, @Res() response: Response, @Param() params: JsonObject) {
    const { id } = params;
    const user: User = await this.userService.findOne({ where: { id } });
    console.log(user);

    if (user == undefined) {
      response.status(HttpStatus.NOT_FOUND).send({ message: 'User not found' });
    } else {
      response.status(HttpStatus.OK).send(user);
    }
  }

  @Put('/user/:id')
  @Header('cache-control', 'no-store, max-age=0')
  async putUser(@Req() request: Request, @Res() response: Response, @Param() params: JsonObject) {
    const { id } = params;
    const data: Partial<User> = request.body;
    const result: UpdateResult = await this.userService.update({ id }, data);

    response.status(HttpStatus.OK).send(result);
  }
}
