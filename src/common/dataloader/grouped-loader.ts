import DataLoader from 'dataloader';
import { type GraphqlContext } from '../graphql/graphql-context.js';

export abstract class GroupedLoader<TKey, TItem> {
  private readonly loadersByContext = new WeakMap<GraphqlContext, DataLoader<TKey, TItem[]>>();

  protected abstract findByKeys(keys: readonly TKey[]): Promise<TItem[]>;

  protected abstract keyOf(item: TItem): TKey;

  load(context: GraphqlContext, key: TKey): Promise<TItem[]> {
    return this.loaderFor(context).load(key);
  }

  private loaderFor(context: GraphqlContext): DataLoader<TKey, TItem[]> {
    const existingLoader = this.loadersByContext.get(context);

    if (existingLoader) {
      return existingLoader;
    }

    const loader = new DataLoader<TKey, TItem[]>((keys) => this.groupByKeys(keys));
    this.loadersByContext.set(context, loader);

    return loader;
  }

  private async groupByKeys(keys: readonly TKey[]): Promise<TItem[][]> {
    const groups = new Map<TKey, TItem[]>(keys.map((key) => [key, []]));

    for (const item of await this.findByKeys(keys)) {
      groups.get(this.keyOf(item))?.push(item);
    }

    return keys.map((key) => groups.get(key) ?? []);
  }
}
