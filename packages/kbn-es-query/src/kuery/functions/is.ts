/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { get, isUndefined } from 'lodash';
import { getPhraseScript } from '../../filters';
import { getFields } from './utils/get_fields';
import { getTimeZoneFromSettings } from '../../utils';
import { getFullFieldNameNode } from './utils/get_full_field_name_node';
import { IndexPatternBase, KueryNode, IndexPatternFieldBase } from '../..';

import * as ast from '../ast';

import * as literal from '../node_types/literal';
import * as wildcard from '../node_types/wildcard';

export function buildNodeParams(fieldName: string, value: any, isPhrase: boolean = false) {
  if (isUndefined(fieldName)) {
    throw new Error('fieldName is a required argument');
  }
  if (isUndefined(value)) {
    throw new Error('value is a required argument');
  }
  const fieldNode =
    typeof fieldName === 'string'
      ? ast.fromLiteralExpression(fieldName)
      : literal.buildNode(fieldName);
  const valueNode =
    typeof value === 'string' ? ast.fromLiteralExpression(value) : literal.buildNode(value);
  const isPhraseNode = literal.buildNode(isPhrase);
  return {
    arguments: [fieldNode, valueNode, isPhraseNode],
  };
}

export function toElasticsearchQuery(
  node: KueryNode,
  indexPattern?: IndexPatternBase,
  config: Record<string, any> = {},
  context: Record<string, any> = {}
) {
  const {
    arguments: [fieldNameArg, valueArg, isPhraseArg],
  } = node;

  const isExistsQuery = valueArg.type === 'wildcard' && valueArg.value === wildcard.wildcardSymbol;
  const isAllFieldsQuery =
    fieldNameArg.type === 'wildcard' && fieldNameArg.value === wildcard.wildcardSymbol;
  const isMatchAllQuery = isExistsQuery && isAllFieldsQuery;

  if (isMatchAllQuery) {
    return { match_all: {} };
  }

  const fullFieldNameArg = getFullFieldNameNode(
    fieldNameArg,
    indexPattern,
    context?.nested ? context.nested.path : undefined
  );
  const value = !isUndefined(valueArg) ? ast.toElasticsearchQuery(valueArg) : valueArg;
  const type = isPhraseArg.value ? 'phrase' : 'best_fields';
  if (fullFieldNameArg.value === null) {
    if (valueArg.type === 'wildcard') {
      return {
        query_string: {
          query: wildcard.toQueryStringQuery(valueArg),
        },
      };
    }

    return {
      multi_match: {
        type,
        query: value,
        lenient: true,
      },
    };
  }

  const fields = indexPattern ? getFields(fullFieldNameArg, indexPattern) : [];
  // If no fields are found in the index pattern we send through the given field name as-is. We do this to preserve
  // the behaviour of lucene on dashboards where there are panels based on different index patterns that have different
  // fields. If a user queries on a field that exists in one pattern but not the other, the index pattern without the
  // field should return no results. It's debatable whether this is desirable, but it's been that way forever, so we'll
  // keep things familiar for now.
  if (fields && fields.length === 0) {
    fields.push({
      name: (ast.toElasticsearchQuery(fullFieldNameArg) as unknown) as string,
      scripted: false,
      type: '',
    });
  }

  // Special case for wildcards where there are no fields or all fields share the same prefix
  if (isExistsQuery && (!fields?.length || fields?.length === indexPattern?.fields.length)) {
    return { match_all: {} };
  }

  const queries = fields!.reduce((accumulator: any, field: IndexPatternFieldBase) => {
    const wrapWithNestedQuery = (query: any) => {
      // Wildcards can easily include nested and non-nested fields. There isn't a good way to let
      // users handle this themselves so we automatically add nested queries in this scenario.
      if (
        !(fullFieldNameArg.type === 'wildcard') ||
        !get(field, 'subType.nested') ||
        context?.nested
      ) {
        return query;
      } else {
        return {
          nested: {
            path: field.subType!.nested!.path,
            query,
            score_mode: 'none',
          },
        };
      }
    };

    if (field.scripted) {
      // Exists queries don't make sense for scripted fields
      if (!isExistsQuery) {
        return [
          ...accumulator,
          {
            script: {
              ...getPhraseScript(field, value as any),
            },
          },
        ];
      }
    } else if (isExistsQuery) {
      return [
        ...accumulator,
        wrapWithNestedQuery({
          exists: {
            field: field.name,
          },
        }),
      ];
    } else if (valueArg.type === 'wildcard') {
      return [
        ...accumulator,
        wrapWithNestedQuery({
          query_string: {
            fields: [field.name],
            query: wildcard.toQueryStringQuery(valueArg),
          },
        }),
      ];
    } else if (field.type === 'date') {
      /*
      If we detect that it's a date field and the user wants an exact date, we need to convert the query to both >= and <= the value provided to force a range query. This is because match and match_phrase queries do not accept a timezone parameter.
      dateFormatTZ can have the value of 'Browser', in which case we guess the timezone using moment.tz.guess.
    */
      const timeZoneParam = config.dateFormatTZ
        ? { time_zone: getTimeZoneFromSettings(config!.dateFormatTZ) }
        : {};
      return [
        ...accumulator,
        wrapWithNestedQuery({
          range: {
            [field.name]: {
              gte: value,
              lte: value,
              ...timeZoneParam,
            },
          },
        }),
      ];
    } else {
      const queryType = type === 'phrase' ? 'match_phrase' : 'match';
      return [
        ...accumulator,
        wrapWithNestedQuery({
          [queryType]: {
            [field.name]: value,
          },
        }),
      ];
    }
  }, []);

  return {
    bool: {
      should: queries || [],
      minimum_should_match: 1,
    },
  };
}
