// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

describe('Delete users and tasks created during the test run.', () => {
    it('Get a list of users and delete all except id:1', () => {
        cy.request({
            url: '/api/v1/users',
            auth: {
                username: Cypress.env('user'),
                password: Cypress.env('password'),
            },
        }).then(async (response) => {
            const responceResult = await response['body']['results'];
            for (let user of responceResult) {
                let userId = user['id'];
                if (userId !== 1) {
                    cy.request({
                        method: 'DELETE',
                        url: `/api/v1/users/${userId}`,
                        auth: {
                            username: Cypress.env('user'),
                            password: Cypress.env('password'),
                        },
                    });
                }
            }
        });
    });
    it('Get a list of tasks and delete them all', () => {
        cy.request({
            url: '/api/v1/tasks?page_size=1000',
            auth: {
                username: Cypress.env('user'),
                password: Cypress.env('password'),
            },
        }).then(async (response) => {
            const responceResult = await response['body']['results'];
            for (let tasks of responceResult) {
                let taskId = tasks['id'];
                cy.request({
                    method: 'DELETE',
                    url: `/api/v1/tasks/${taskId}`,
                    auth: {
                        username: Cypress.env('user'),
                        password: Cypress.env('password'),
                    },
                });
            }
        });
    });
    it('Get a list of projects and delete them all', () => {
        cy.request({
            url: '/api/v1/projects?page_size=all',
            auth: {
                username: Cypress.env('user'),
                password: Cypress.env('password'),
            },
        }).then(async (response) => {
            const responceResult = await response['body']['results'];
            for (let tasks of responceResult) {
                let taskId = tasks['id'];
                cy.request({
                    method: 'DELETE',
                    url: `/api/v1/projects/${taskId}`,
                    auth: {
                        username: Cypress.env('user'),
                        password: Cypress.env('password'),
                    },
                });
            }
        });
    });
});
