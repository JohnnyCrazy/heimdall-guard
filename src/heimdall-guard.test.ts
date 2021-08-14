import { GuardBuilder } from './heimdall-guard';
import { BoundCanType } from './types';

type SimpleCtx = 'user1' | 'user2';
interface AdvancedCtx {
  userId: string;
}
interface BlogPost {
  id: string;
  userId: string;
}

type CustomResources = 'blog-post';
type CustomActions = 'archive';

describe('basic functionality', () => {
  it('empty rules', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const { can } = GuardBuilder(() => {});

    expect(can('create', 'all')).toBeFalsy();
    expect(can('manage', 'all')).toBeFalsy();
  });

  it('single can rule', () => {
    const { can } = GuardBuilder((_, { can }) => {
      can('create', 'all');
    });

    expect(can('create', 'all')).toBeTruthy();
  });

  it('single can rule & cannot', () => {
    const { can } = GuardBuilder((_, { can, cannot }) => {
      can('create', 'all');
      cannot('delete', 'all');
    });

    expect(can('create', 'all')).toBeTruthy();
    expect(can('delete', 'all')).toBeFalsy();
  });

  it('single can rule with contexts', () => {
    const { can } = GuardBuilder<void, void, SimpleCtx>((ctx, { can }) => {
      if (ctx === 'user1') {
        can('list', 'all');
      }
      if (ctx === 'user2') {
        can('create', 'all');
      }
    });

    expect(can('list', 'all', 'user1')).toBeTruthy();
    expect(can('create', 'all', 'user1')).toBeFalsy();

    expect(can('list', 'all', 'user2')).toBeFalsy();
    expect(can('create', 'all', 'user2')).toBeTruthy();
  });

  it('with custom guard', () => {
    const post: BlogPost = { id: '1', userId: 'user1' };

    const { can } = GuardBuilder<void, void, AdvancedCtx>((ctx, { can }) => {
      can('update', 'all', (post: BlogPost) => post.userId === ctx.userId);
    });

    expect(can('update', 'all', { userId: 'user1' }, post)).toBeTruthy();
    expect(can('update', 'all', { userId: 'user2' }, post)).toBeFalsy();
  });

  it('with custom guard which throws', () => {
    const post: BlogPost = { id: '1', userId: 'user1' };

    const { can } = GuardBuilder<void, void, AdvancedCtx>((ctx, { can }) => {
      can('update', 'all', () => {
        throw new Error('Hello World');
      });
    });

    expect(() => can('update', 'all', { userId: 'user1' }, post)).toThrow();
  });

  it('with custom resources', () => {
    const { can } = GuardBuilder<CustomResources>((ctx, { can }) => {
      can('create', 'blog-post');
    });

    expect(can('create', 'blog-post')).toBeTruthy();
    expect(can('create', 'all')).toBeFalsy();
  });

  it('with custom resources & actions', () => {
    const { can } = GuardBuilder<CustomResources, CustomActions>((ctx, { can }) => {
      can('archive', 'blog-post');
    });

    expect(can('archive', 'blog-post')).toBeTruthy();
    expect(can('create', 'all')).toBeFalsy();
  });

  it('with custom resources & actions & guard', () => {
    const post: BlogPost = { id: '1', userId: 'user1' };

    const { can } = GuardBuilder<CustomResources, CustomActions, AdvancedCtx>((ctx, { can }) => {
      can('archive', 'blog-post', (post: BlogPost) => post.userId === ctx.userId);
    });

    expect(can('archive', 'blog-post', { userId: 'user1' }, post)).toBeTruthy();
    expect(can('archive', 'blog-post', { userId: 'user2' }, post)).toBeFalsy();
  });

  it('with custom resources & actions & guard', () => {
    const post: BlogPost = { id: '1', userId: 'user1' };
    const ctx = { userId: 'user1' };

    const { can } = GuardBuilder<CustomResources, CustomActions, AdvancedCtx>((ctx, { can }) => {
      can('archive', 'blog-post', (post: BlogPost) => post.userId === ctx.userId);
    });

    const boundCan: BoundCanType<CustomResources, CustomActions> = (ability, resource, args) =>
      can(ability, resource, ctx, args);

    expect(boundCan('archive', 'blog-post', post)).toBeTruthy();
    expect(boundCan('create', 'blog-post', post)).toBeFalsy();
  });
});
