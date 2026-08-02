import 'dotenv/config';

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient as GeneratedPrismaClient } from '../../generated/prisma/client';
import { getDataNamespace } from '../environment/environment.config';

@Injectable()
export class PrismaService
  extends GeneratedPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const dataNamespace = getDataNamespace();
    const url = new URL(process.env.DATABASE_URL ?? '');
    ['schema', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert'].forEach((key) => {
      url.searchParams.delete(key);
    });

    const pool = new Pool({
      connectionString: url.toString(),
      ssl: {
        rejectUnauthorized: false,
      },
      options: `-c search_path=${dataNamespace}`,
    });

    super({
      adapter: new PrismaPg(pool, {
        schema: dataNamespace,
        disposeExternalPool: true,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
