import { Action, createReducer, on } from '@ngrx/store';
import * as states from './item.actions';
import { ItemImageState } from './item.states';

export const initialItemsState: ItemImageState = { text: '', items: [] };

const _itemImageReducer = createReducer(
  initialItemsState,
  on(states.SetItemImage, (state, item) => item)
);

export function itemImageReducer(
  state: ItemImageState | undefined,
  action: Action
) {
  return _itemImageReducer(state, action);
}
