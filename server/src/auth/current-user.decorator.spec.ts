import 'reflect-metadata';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { type ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

function createExecutionContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
  } as ExecutionContext;
}

class TestController {
  // The decorator stores its factory in Nest route-args metadata.
  handler(@CurrentUser() user: unknown, @CurrentUser('id') id: string) {
    void user;
    void id;
  }
}

describe('CurrentUser', () => {
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    'handler',
  ) as Record<
    string,
    {
      data?: 'id';
      factory: (data: 'id' | undefined, context: ExecutionContext) => unknown;
    }
  >;

  const wholeUserFactory = Object.values(metadata).find(
    (entry) => entry.data === undefined,
  )?.factory;
  const idFactory = Object.values(metadata).find(
    (entry) => entry.data === 'id',
  )?.factory;

  it('returns the whole current user context when no field is requested', () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };

    expect(wholeUserFactory).toBeDefined();
    expect(
      wholeUserFactory?.(undefined, createExecutionContext(currentUser)),
    ).toEqual(currentUser);
  });

  it('returns a specific field when requested', () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };

    expect(idFactory).toBeDefined();
    expect(idFactory?.('id', createExecutionContext(currentUser))).toBe(
      'user-id',
    );
  });

  it('returns null when the request has no current user', () => {
    expect(wholeUserFactory).toBeDefined();
    expect(idFactory).toBeDefined();
    expect(
      wholeUserFactory?.(undefined, createExecutionContext(null)),
    ).toBeNull();
    expect(idFactory?.('id', createExecutionContext(undefined))).toBeNull();
  });
});
