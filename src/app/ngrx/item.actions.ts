import { createAction, props } from '@ngrx/store';
import { ItemImageState } from './item.states';

export const SetItemImage = createAction('SetItems', props<ItemImageState>());
