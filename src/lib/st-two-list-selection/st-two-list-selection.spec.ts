/*
 * © 2017 Stratio Big Data Inc., Sucursal en España.
 *
 * This software is licensed under the Apache License, Version 2.0.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the terms of the License for more details.
 *
 * SPDX-License-Identifier: Apache-2.0.
 */
import { SimpleChange, SimpleChanges } from '@angular/core';
import {
   times as _times,
   cloneDeep as _cloneDeep
} from 'lodash';

import { StTwoListSelection } from './st-two-list-selection';
import { StTwoListSelectionElement } from './st-two-list-selection.model';

let cd;
let changeEmitter;

function generateData(numData: number): StTwoListSelectionElement[] {
   return _times(10, (i) => {
      return {
         id: i,
         name: i > 5 ? `${i}Element` : `Element${i}`
      };
   });
}

let originalAllElements: StTwoListSelectionElement[] = generateData(20);
let selectedElements: StTwoListSelectionElement[] = [];

describe('[StTwoListSelection]', () => {
   let twoListSelection: StTwoListSelection;
   let allElements: StTwoListSelectionElement[];

   beforeEach(() => {
      cd = jasmine.createSpyObj('changeDetector', ['markForCheck']);
      changeEmitter = jasmine.createSpyObj('emitter', ['emit']);
      twoListSelection = new StTwoListSelection(cd);
      selectedElements = [];
      allElements = _cloneDeep(originalAllElements);

      twoListSelection.init(allElements, selectedElements, changeEmitter, 'id');
   });

   describe('ListItem', () => {
      it('Should init correctly', () => {
         expect(twoListSelection.copyAllElement).toBeDefined();
         expect(twoListSelection.copyAllElement).toEqual(originalAllElements);
         expect(twoListSelection.copySelectedElements).toBeDefined();
         expect(twoListSelection.copySelectedElements).toEqual([]);
         expect(twoListSelection.originalAll).toBeDefined();
         expect(twoListSelection.originalAll).toEqual(originalAllElements);
         expect(twoListSelection.originalSelected).toBeDefined();
         expect(twoListSelection.originalSelected).toEqual([]);

         expect(twoListSelection.copyAllElement[0]).toEqual(originalAllElements[0]);

         twoListSelection.init(allElements, selectedElements, changeEmitter, 'name');
         expect(twoListSelection.copyAllElement[0]).toEqual(originalAllElements[6]);
      });

      it('Should order by correct field', () => {
         expect(twoListSelection.copyAllElement[0]).toEqual(originalAllElements[0]);

         twoListSelection.init(allElements, selectedElements, changeEmitter, 'name');
         expect(twoListSelection.copyAllElement[0]).toEqual(originalAllElements[6]);

         twoListSelection.init(allElements, selectedElements, changeEmitter, undefined);
         expect(twoListSelection.copyAllElement[0]).toEqual(originalAllElements[0]);
      });

      it('Should select an element for first time', () => {
         let el: StTwoListSelectionElement = {
            id: 1,
            name: 'test1'
         };

         // All List
         expect(el.selected).toBeUndefined();
         twoListSelection.onSelectAllElement(el);
         expect(el.selected).toBeDefined();
         expect(el.selected).toEqual(true);

         twoListSelection.onSelectAllElement(el);
         expect(el.selected).toBeDefined();
         expect(el.selected).toEqual(false);

         twoListSelection.init([], [], changeEmitter, undefined);
         twoListSelection.onSelectAllElement(el);
         expect(el.selected).toEqual(false);


         // Selected List
         let el2: StTwoListSelectionElement = {
            id: 2,
            name: 'test2'
         };
         twoListSelection.init([], [el2], changeEmitter, undefined);
         expect(el2.selected).toBeUndefined();
         twoListSelection.onSelectSelectedElement(el2);
         expect(el2.selected).toBeDefined();
         expect(el2.selected).toEqual(true);

         twoListSelection.onSelectSelectedElement(el2);
         expect(el2.selected).toBeDefined();
         expect(el2.selected).toEqual(false);

         twoListSelection.init([], [], changeEmitter, undefined);
         twoListSelection.onSelectSelectedElement(el2);
         expect(el2.selected).toEqual(false);
      });


      it('Should update search values', () => {
         expect(twoListSelection.allSearch).toEqual('');
         expect(twoListSelection.selectedSearch).toEqual('');

         let searchText: string = 'test';
         twoListSelection.onSearchOverAll(searchText);
         expect(twoListSelection.allSearch).toEqual(searchText);
         expect(twoListSelection.selectedSearch).toEqual('');

         twoListSelection.onSearchOverSelected(searchText);
         expect(twoListSelection.allSearch).toEqual(searchText);
         expect(twoListSelection.selectedSearch).toEqual(searchText);
      });

      it('Should move to selected', () => {
         twoListSelection.onSelectAllElement(twoListSelection.copyAllElement[2]);

         twoListSelection.onMoveToSelected(new Event(''));
         expect(changeEmitter.emit).toHaveBeenCalled();
         expect(changeEmitter.emit).toHaveBeenCalledTimes(1);
         expect(changeEmitter.emit).toHaveBeenCalledWith([allElements[2]]);
      });

      it('Should move all to selected', () => {
         twoListSelection.onMoveAllToSelected(new Event(''));
         expect(changeEmitter.emit).toHaveBeenCalled();
         expect(changeEmitter.emit).toHaveBeenCalledTimes(1);
         expect(changeEmitter.emit).toHaveBeenCalledWith(allElements);
      });

      it('Should move to all', () => {
         selectedElements = _cloneDeep(allElements.slice(0, 2));
         twoListSelection.init(allElements, selectedElements, changeEmitter, 'id');
         twoListSelection.onSelectSelectedElement(twoListSelection.copySelectedElements[0]);
         expect(twoListSelection.copySelectedElements[0].selected).toBe(true);

         twoListSelection.onMoveToAll(new Event(''));
         expect(changeEmitter.emit).toHaveBeenCalled();
         expect(changeEmitter.emit).toHaveBeenCalledTimes(1);
         expect(changeEmitter.emit).toHaveBeenCalledWith(selectedElements.slice(1, 2));
      });

      it('Should move all to all', () => {
         let el2: StTwoListSelectionElement = {
            id: 2,
            name: 'test2'
         };
         twoListSelection.init(allElements, [el2], changeEmitter, 'id');

         twoListSelection.onMoveAllToAll(new Event(''));
         expect(changeEmitter.emit).toHaveBeenCalled();
         expect(changeEmitter.emit).toHaveBeenCalledTimes(1);
         expect(changeEmitter.emit).toHaveBeenCalledWith([]);
      });

      it('Should react to changes', () => {
         twoListSelection.init(allElements, [allElements[0]], changeEmitter, 'id');
         expect(twoListSelection.copyAllElement).toEqual(allElements.slice(1));
         expect(twoListSelection.copySelectedElements).toEqual(allElements.slice(0, 1));

         twoListSelection.onSelectSelectedElement(twoListSelection.copySelectedElements[0]);
         expect(twoListSelection.copySelectedElements[0].selected).toBe(true);

         let newAllList = _cloneDeep(allElements);
         let newSelectedList = [];

         // Update all List
         newAllList.push({
            id: 99,
            name: ''
         });
         let change: SimpleChanges = { allElements: new SimpleChange(twoListSelection.copyAllElement, newAllList, true) };
         twoListSelection.checkChanges(change, 'allElements', 'selectedElements');
         expect(twoListSelection.copyAllElement).toEqual(newAllList.slice(1));

         // Update selected List
         newSelectedList = _cloneDeep(allElements.slice(0, 2));
         let expectedResult = _cloneDeep(allElements.slice(0, 2));
         expectedResult[0].selected = true;
         change = { selectedElements: new SimpleChange(twoListSelection.copySelectedElements, newSelectedList, true) };
         twoListSelection.checkChanges(change, 'allElements', 'selectedElements');
         expect(twoListSelection.copySelectedElements).toEqual(expectedResult);
         expect(twoListSelection.copySelectedElements[0].selected).toBe(true);


         change = {};
         twoListSelection.checkChanges(change, 'allElements', 'selectedElements');
         expect(twoListSelection.copyAllElement).toEqual(newAllList.slice(2));
         expect(twoListSelection.copySelectedElements).toEqual(expectedResult);
         expect(twoListSelection.copySelectedElements[0].selected).toBe(true);
      });
   });
});





