/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as t from 'io-ts';
import { toNumberRt } from '@kbn/io-ts-utils';
import { setupRequest } from '../lib/helpers/setup_request';
import { environmentRt, kueryRt, offsetRt, rangeRt } from './default_api_types';
import { createApmServerRoute } from './create_apm_server_route';
import { createApmServerRouteRepository } from './create_apm_server_route_repository';
import { getMetadataForBackend } from '../lib/backends/get_metadata_for_backend';
import { getLatencyChartsForBackend } from '../lib/backends/get_latency_charts_for_backend';
import { getTopBackends } from '../lib/backends/get_top_backends';
import { getUpstreamServicesForBackend } from '../lib/backends/get_upstream_services_for_backend';

const topBackendsRoute = createApmServerRoute({
  endpoint: 'GET /api/apm/backends/top_backends',
  params: t.intersection([
    t.type({
      query: t.intersection([rangeRt, t.type({ numBuckets: toNumberRt })]),
    }),
    t.partial({
      query: t.intersection([environmentRt, offsetRt]),
    }),
  ]),
  options: {
    tags: ['access:apm'],
  },
  handler: async (resources) => {
    const setup = await setupRequest(resources);

    const { start, end } = setup;
    const { environment, offset, numBuckets } = resources.params.query;

    const opts = { setup, start, end, numBuckets, environment };

    const [currentBackends, previousBackends] = await Promise.all([
      getTopBackends(opts),
      offset ? getTopBackends({ ...opts, offset }) : Promise.resolve([]),
    ]);

    return {
      backends: currentBackends.map((backend) => {
        const { stats, ...rest } = backend;
        const prev = previousBackends.find(
          (item) => item.location.id === backend.location.id
        );
        return {
          ...rest,
          currentStats: stats,
          previousStats: prev?.stats ?? null,
        };
      }),
    };
  },
});

const upstreamServicesForBackendRoute = createApmServerRoute({
  endpoint: 'GET /api/apm/backends/{backendName}/upstream_services',
  params: t.intersection([
    t.type({
      path: t.type({
        backendName: t.string,
      }),
      query: t.intersection([rangeRt, t.type({ numBuckets: toNumberRt })]),
    }),
    t.partial({
      query: t.intersection([environmentRt, offsetRt]),
    }),
  ]),
  options: {
    tags: ['access:apm'],
  },
  handler: async (resources) => {
    const setup = await setupRequest(resources);

    const { start, end } = setup;
    const {
      path: { backendName },
      query: { environment, offset, numBuckets },
    } = resources.params;

    const opts = { backendName, setup, start, end, numBuckets, environment };

    const [currentServices, previousServices] = await Promise.all([
      getUpstreamServicesForBackend(opts),
      offset
        ? getUpstreamServicesForBackend({ ...opts, offset })
        : Promise.resolve([]),
    ]);

    return {
      services: currentServices.map((service) => {
        const { stats, ...rest } = service;
        const prev = previousServices.find(
          (item) => item.location.id === service.location.id
        );
        return {
          ...rest,
          currentStats: stats,
          previousStats: prev?.stats ?? null,
        };
      }),
    };
  },
});

const backendMetadataRoute = createApmServerRoute({
  endpoint: 'GET /api/apm/backends/{backendName}/metadata',
  params: t.type({
    path: t.type({
      backendName: t.string,
    }),
    query: rangeRt,
  }),
  options: {
    tags: ['access:apm'],
  },
  handler: async (resources) => {
    const setup = await setupRequest(resources);
    const { params } = resources;
    const { backendName } = params.path;

    const { start, end } = setup;

    const metadata = await getMetadataForBackend({
      backendName,
      setup,
      start,
      end,
    });

    return { metadata };
  },
});

const backendLatencyChartsRoute = createApmServerRoute({
  endpoint: 'GET /api/apm/backends/{backendName}/charts/latency',
  params: t.type({
    path: t.type({
      backendName: t.string,
    }),
    query: t.intersection([rangeRt, kueryRt, environmentRt, offsetRt]),
  }),
  options: {
    tags: ['access:apm'],
  },
  handler: async (resources) => {
    const setup = await setupRequest(resources);
    const { params } = resources;
    const { backendName } = params.path;
    const { kuery, environment, offset } = params.query;

    const { start, end } = setup;

    const [currentTimeseries, comparisonTimeseries] = await Promise.all([
      getLatencyChartsForBackend({
        backendName,
        setup,
        start,
        end,
        kuery,
        environment,
      }),
      offset
        ? getLatencyChartsForBackend({
            backendName,
            setup,
            start,
            end,
            kuery,
            environment,
            offset,
          })
        : null,
    ]);

    return { currentTimeseries, comparisonTimeseries };
  },
});

export const backendsRouteRepository = createApmServerRouteRepository()
  .add(topBackendsRoute)
  .add(upstreamServicesForBackendRoute)
  .add(backendMetadataRoute)
  .add(backendLatencyChartsRoute);
