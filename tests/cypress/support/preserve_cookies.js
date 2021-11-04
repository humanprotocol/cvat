// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

beforeEach(() => {
    Cypress.Cookies.preserveOnce('csrftoken', 'remember_token');
    Cypress.Cookies.preserveOnce('sessionid', 'remember_token');
});
