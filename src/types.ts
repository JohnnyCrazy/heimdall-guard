export type BasicAbilities = 'create' | 'read' | 'update' | 'delete' | 'list' | 'manage';

export type AbilityType<T> = BasicAbilities | T;

export type ResourceType<IResource> = 'all' | IResource;

export interface IRule<IResource, IAbility> {
  behavior: boolean;
  ability: AbilityType<IAbility>;
  resource: ResourceType<IResource>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  guard?: (args: any) => Promise<boolean> | boolean;
}

export type _CanType<IResource, IAbility> = (
  ability: AbilityType<IAbility>,
  resource: ResourceType<IResource>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  guard?: (args: any) => Promise<boolean> | boolean,
) => IRule<IResource, IAbility>;

export type _CannotType<IResource, IAbility> = (
  ability: AbilityType<IAbility>,
  resource: ResourceType<IResource>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  guard?: (args?: any) => Promise<boolean> | boolean,
) => IRule<IResource, IAbility>;

export type CanType<IResource, IAbility, Ctx> = (
  ability: AbilityType<IAbility>,
  resource: ResourceType<IResource>,
  ctx: Ctx,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any,
) => boolean;

export type BoundCanType<IResource, IAbility> = (
  ability: AbilityType<IAbility>,
  resource: ResourceType<IResource>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any,
) => boolean;

export type AbilitiesParamsType<IResource, IAbility> = {
  can: _CanType<IResource, IAbility>;
  cannot: _CannotType<IResource, IAbility>;
};
export type IAbilities<IResource, IAbility, Ctx> = (ctx: Ctx, params: AbilitiesParamsType<IResource, IAbility>) => void;

export interface IGuard<IResource, IAbility, Ctx> {
  ability: IAbilities<IResource, IAbility, Ctx>;
  getPreviouslyRanRules(): IRule<IResource, IAbility>[];
  can: CanType<IResource, IAbility, Ctx>;
}

export interface IGuardBuilder<
  IResource = Record<string, never>,
  IAbility = Record<string, never>,
  Ctx = Record<string, never>,
> {
  instance: IGuard<IResource, IAbility, Ctx>;
  can: IGuard<IResource, IAbility, Ctx>['can'];
}
