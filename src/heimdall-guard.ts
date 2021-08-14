import {
  AbilityType,
  CanType,
  IAbilities,
  IGuard,
  IGuardBuilder,
  IRule,
  ResourceType,
  _CanType,
  _CannotType,
} from './types';

export * from './types';

const isAbility = <T>(ruleAbility: AbilityType<T>, ability: AbilityType<T>) =>
  ruleAbility === ability || ruleAbility === 'manage';

const isResource = <T>(ruleResource: ResourceType<T>, resource: ResourceType<T>) =>
  ruleResource === resource || ruleResource === 'all';

class Rule<IResource, IAbility> implements IRule<IResource, IAbility> {
  constructor(
    public behavior: boolean,
    public ability: AbilityType<IAbility>,
    public resource: ResourceType<IResource>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public guard?: (args: any) => Promise<boolean> | boolean,
  ) {}
}

export class Guard<T, R, Ctx> implements IGuard<T, R, Ctx> {
  private rules: IRule<T, R>[];
  ability: IGuard<T, R, Ctx>['ability'];

  constructor(ability: IAbilities<T, R, Ctx>) {
    if (!ability) throw new Error('GUARD: Ability file not present');
    this.ability = ability;
    this.rules = [];
  }

  can: CanType<T, R, Ctx> = (ability, resource, ctx, args) => {
    if (!ability) throw new Error('GUARD: ability cannot be empty');
    if (!resource) throw new Error('GUARD: resource cannot be empty');

    try {
      this.rules = [];
      this.ability(ctx, {
        can: this._can,
        cannot: this._cannot,
      });
    } catch (e: unknown) {
      throw new Error(`GUARD: You should not throw errors in the ability file \n\r ${e}`);
    }

    let can = false;
    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i];

      const matchAll = rule.resource === 'all' && rule.ability === 'manage';

      if (matchAll) {
        can = rule.behavior;
        break;
      }

      if (isResource(rule.resource, resource) && isAbility(rule.ability, ability)) {
        if (rule.guard) {
          if (rule.guard(args)) {
            can = rule.behavior;
          } else {
            continue;
          }
        } else {
          can = rule.behavior;
        }

        break;
      }
    }
    return can;
  };

  getPreviouslyRanRules = (): IRule<T, R>[] => this.rules;

  _can: _CanType<T, R> = (ability, resource, guard) => {
    const newRule = new Rule<T, R>(true, ability, resource, guard);
    this.rules = [newRule, ...this.rules];
    return newRule;
  };

  _cannot: _CannotType<T, R> = (ability, resource, guard) => {
    const newRule = new Rule<T, R>(false, ability, resource, guard);
    this.rules = [newRule, ...this.rules];
    return newRule;
  };
}

export function GuardBuilder<T = void, R = void, Ctx = void>(ability: IAbilities<T, R, Ctx>): IGuardBuilder<T, R, Ctx> {
  const instance = new Guard<T, R, Ctx>(ability);
  return {
    instance,
    can: instance.can,
  };
}
