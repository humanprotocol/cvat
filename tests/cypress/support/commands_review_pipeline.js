// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

Cypress.Commands.add('assignTaskToUser', (user) => {
    cy.get('.cvat-task-details-user-block').within(() => {
        user !== ''
            ? cy.get('.cvat-user-search-field').find('[type="search"]').type(`${user}{Enter}`)
            : cy.get('.cvat-user-search-field').find('[type="search"]').clear().type('{Enter}');
    });
});

Cypress.Commands.add('assignJobToUser', (jobID, user) => {
    cy.getJobNum(jobID).then(($job) => {
        cy.get('.cvat-task-jobs-table')
            .contains('a', `Job #${$job}`)
            .parents('.cvat-task-jobs-table-row')
            .find('.cvat-job-assignee-selector')
            .click();
    });
    cy.get('.ant-select-dropdown')
        .not('.ant-select-dropdown-hidden')
        .contains(new RegExp(`^${user}$`, 'g'))
        .click();
});

Cypress.Commands.add('checkJobStatus', (jobID, status, assignee) => {
    cy.getJobNum(jobID).then(($job) => {
        cy.get('.cvat-task-jobs-table')
            .contains('a', `Job #${$job}`)
            .parents('.cvat-task-jobs-table-row')
            .within(() => {
                cy.get('.cvat-job-item-status').should('have.text', status);
                cy.get('.cvat-job-assignee-selector').within(() => {
                    cy.get('input[type="search"]').should('have.value', assignee);
                });
            });
    });
});
