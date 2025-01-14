/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getAlertInstanceSummaryRoute } from './get_alert_instance_summary';
import { httpServiceMock } from 'src/core/server/mocks';
import { licenseStateMock } from '../../lib/license_state.mock';
import { mockHandlerArguments } from './../_mock_handler_arguments';
import { SavedObjectsErrorHelpers } from 'src/core/server';
import { rulesClientMock } from '../../rules_client.mock';
import { AlertInstanceSummary } from '../../types';

const rulesClient = rulesClientMock.create();
jest.mock('../../lib/license_api_access.ts', () => ({
  verifyApiAccess: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('getAlertInstanceSummaryRoute', () => {
  const dateString = new Date().toISOString();
  const mockedAlertInstanceSummary: AlertInstanceSummary = {
    id: '',
    name: '',
    tags: [],
    alertTypeId: '',
    consumer: '',
    muteAll: false,
    throttle: null,
    enabled: false,
    statusStartDate: dateString,
    statusEndDate: dateString,
    status: 'OK',
    errorMessages: [],
    instances: {},
  };

  it('gets alert instance summary', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    getAlertInstanceSummaryRoute(router, licenseState);

    const [config, handler] = router.get.mock.calls[0];

    expect(config.path).toMatchInlineSnapshot(`"/api/alerts/alert/{id}/_instance_summary"`);

    rulesClient.getAlertInstanceSummary.mockResolvedValueOnce(mockedAlertInstanceSummary);

    const [context, req, res] = mockHandlerArguments(
      { rulesClient },
      {
        params: {
          id: '1',
        },
        query: {},
      },
      ['ok']
    );

    await handler(context, req, res);

    expect(rulesClient.getAlertInstanceSummary).toHaveBeenCalledTimes(1);
    expect(rulesClient.getAlertInstanceSummary.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "dateStart": undefined,
          "id": "1",
        },
      ]
    `);

    expect(res.ok).toHaveBeenCalled();
  });

  it('returns NOT-FOUND when alert is not found', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    getAlertInstanceSummaryRoute(router, licenseState);

    const [, handler] = router.get.mock.calls[0];

    rulesClient.getAlertInstanceSummary = jest
      .fn()
      .mockResolvedValueOnce(SavedObjectsErrorHelpers.createGenericNotFoundError('alert', '1'));

    const [context, req, res] = mockHandlerArguments(
      { rulesClient },
      {
        params: {
          id: '1',
        },
        query: {},
      },
      ['notFound']
    );

    expect(await handler(context, req, res)).toEqual(undefined);
  });
});
