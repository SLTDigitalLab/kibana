/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiDataGridColumn } from '@elastic/eui';
import type { Filter, FilterManager } from '../../../../../../src/plugins/data/public';
import type { TimelineNonEcsData } from '../../../common/search_strategy';
import type {
  ColumnHeaderOptions,
  DataProvider,
  TimelineExpandedDetail,
  SortColumnTimeline,
  SerializedFilterQuery,
} from '../../../common/types/timeline';
import { RowRendererId } from '../../../common/types/timeline';

export interface TGridModelSettings {
  documentType: string;
  defaultColumns: Array<
    Pick<EuiDataGridColumn, 'display' | 'displayAsText' | 'id' | 'initialWidth'> &
      ColumnHeaderOptions
  >;
  /** A list of Ids of excluded Row Renderers */
  excludedRowRendererIds: RowRendererId[];
  filterManager?: FilterManager;
  footerText?: string | React.ReactNode;
  loadingText?: string | React.ReactNode;
  queryFields: string[];
  selectAll: boolean;
  showCheckboxes?: boolean;
  title: string;
  unit?: (n: number) => string | React.ReactNode;
}
export interface TGridModel extends TGridModelSettings {
  /** The columns displayed in the timeline */
  columns: Array<
    Pick<EuiDataGridColumn, 'display' | 'displayAsText' | 'id' | 'initialWidth'> &
      ColumnHeaderOptions
  >;
  /** The sources of the event data shown in the timeline */
  dataProviders: DataProvider[];
  /** Specifies the granularity of the date range (e.g. 1 Day / Week / Month) applicable to the mini-map */
  dateRange: {
    start: string;
    end: string;
  };
  /** Events to not be rendered **/
  deletedEventIds: string[];
  /** This holds the view information for the flyout when viewing timeline in a consuming view (i.e. hosts page) or the side panel in the primary timeline view */
  expandedDetail: TimelineExpandedDetail;
  filters?: Filter[];
  /** When non-empty, display a graph view for this event */
  graphEventId?: string;
  /** the KQL query in the KQL bar */
  kqlQuery: {
    // TODO convert to nodebuilder
    filterQuery: SerializedFilterQuery | null;
  };
  /** Uniquely identifies the timeline */
  id: string;
  indexNames: string[];
  isLoading: boolean;
  /** If selectAll checkbox in header is checked **/
  isSelectAllChecked: boolean;
  /** The number of items to show in a single page of results */
  itemsPerPage: number;
  /** Displays a series of choices that when selected, become the value of `itemsPerPage` */
  itemsPerPageOptions: number[];
  /** Events to be rendered as loading **/
  loadingEventIds: string[];
  /** When true, shows checkboxes enabling selection. Selected events store in selectedEventIds **/
  showCheckboxes: boolean;
  /**  Specifies which column the timeline is sorted on, and the direction (ascending / descending) */
  sort: SortColumnTimeline[];
  /** Events selected on this timeline -- eventId to TimelineNonEcsData[] mapping of data required for batch actions **/
  selectedEventIds: Record<string, TimelineNonEcsData[]>;
  savedObjectId: string | null;
  version: string | null;
}

export type TGridModelForTimeline = Pick<
  TGridModel,
  | 'columns'
  | 'dataProviders'
  | 'dateRange'
  | 'deletedEventIds'
  | 'excludedRowRendererIds'
  | 'expandedDetail'
  | 'filters'
  | 'graphEventId'
  | 'kqlQuery'
  | 'id'
  | 'indexNames'
  | 'isLoading'
  | 'isSelectAllChecked'
  | 'itemsPerPage'
  | 'itemsPerPageOptions'
  | 'loadingEventIds'
  | 'showCheckboxes'
  | 'sort'
  | 'selectedEventIds'
  | 'savedObjectId'
  | 'title'
  | 'version'
>;

export type SubsetTGridModel = Readonly<
  Pick<
    TGridModel,
    | 'columns'
    | 'dateRange'
    | 'deletedEventIds'
    | 'excludedRowRendererIds'
    | 'expandedDetail'
    | 'filters'
    | 'kqlQuery'
    | 'indexNames'
    | 'isLoading'
    | 'isSelectAllChecked'
    | 'itemsPerPage'
    | 'itemsPerPageOptions'
    | 'loadingEventIds'
    | 'showCheckboxes'
    | 'sort'
    | 'selectedEventIds'
    | 'savedObjectId'
    | 'version'
  >
>;
