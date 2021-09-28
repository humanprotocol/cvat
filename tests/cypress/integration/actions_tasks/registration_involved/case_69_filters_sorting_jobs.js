// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

context('Filters, sorting jobs.', () => {
    const caseId = '69';
    const labelName = `Case ${caseId}`;
    const taskName = `New annotation task for ${labelName}`;
    const attrName = `Attr for ${labelName}`;
    const textDefaultValue = 'Some default value for type Text';
    const imagesCount = 15;
    const imageFileName = `image_${labelName.replace(' ', '_').toLowerCase()}`;
    const width = 800;
    const height = 800;
    const posX = 10;
    const posY = 10;
    const color = 'gray';
    const archiveName = `${imageFileName}.zip`;
    const archivePath = `cypress/fixtures/${archiveName}`;
    const imagesFolder = `cypress/fixtures/${imageFileName}`;
    const directoryToArchive = imagesFolder;
    const advancedConfigurationParams = {
        multiJobs: true,
        segmentSize: 5,
    };

    function checkJobsTableRowCount(expectedCount) {
        if (expectedCount !== 0) {
            cy.get('.cvat-task-jobs-table-row').then(($jobsTableRows) => {
                expect($jobsTableRows.length).to.be.equal(expectedCount);
            });
        } else {
            cy.get('.cvat-task-jobs-table-row').should('not.exist');
        }
    }

    function checkContentsRow(index, status, assignee) {
        cy.get('.cvat-task-jobs-table-row').then(($jobsTableRows) => {
            cy.get($jobsTableRows[index]).within(() => {
                cy.get('.cvat-job-item-status').invoke('text').should('equal', status);
                [
                    ['.cvat-job-assignee-selector', assignee],
                ].forEach(([el, val]) => {
                    cy.get(el).find('[type="search"]').invoke('val').should('equal', val);
                });
            });
        });
    }

    function testSetJobFilter({ column, menuItem, reset }) {
        cy.get(column).find('[role="button"]').click().wait(300); // Waiting for dropdown menu transition
        cy.get('.ant-dropdown')
            .not('.ant-dropdown-hidden')
            .within(() => {
                if (!reset) {
                    cy.contains('[role="menuitem"]', menuItem)
                        .find('[type="checkbox"]')
                        .should('not.be.checked')
                        .check()
                        .should('be.checked');
                    cy.contains('[type="button"]', 'OK').click();
                } else {
                    cy.contains('[type="button"]', 'Reset').click();
                }
            });
    }

    before(() => {
        // Preparing a jobs
        cy.visit('/');
        cy.userRegistration(
            Cypress.env('regularUserEmail'),
            Cypress.env('regularUserEmail'),
            Cypress.env('regularUserWalletAddress'),
            Cypress.env('regularUserSignedEmail'),
        );
        cy.logout();
        cy.imageGenerator(imagesFolder, imageFileName, width, height, color, posX, posY, labelName, imagesCount);
        cy.createZipArchive(directoryToArchive, archivePath);
        cy.visit('/admin');
        cy.login();
        cy.createAnnotationTask(
            taskName,
            labelName,
            attrName,
            textDefaultValue,
            archiveName,
            false,
            advancedConfigurationParams,
        );
        cy.openTask(taskName);
        cy.assignJobToUser(0, Cypress.env('regularUserEmail'));
        cy.assignJobToUser(1, Cypress.env('regularUserEmail'));

        // The first job is transferred to the complete status
        cy.openJob(1);
        cy.interactMenu('Finish the job');
        cy.contains('[type="button"]', 'Continue').click();
    });

    after(() => {
        cy.deletingRegisteredUsers([Cypress.env('regularUserEmail')]);
        cy.visit('/admin');
        cy.login();
        cy.deleteTask(taskName);
    });

    describe(`Testing "${labelName}".`, () => {
        it('Filtering jobs by status.', () => {
            testSetJobFilter({ column: '.cvat-job-item-status', menuItem: 'annotation' });
            checkJobsTableRowCount(2);
            checkContentsRow(1, 'annotation', '');
        });

        it('Filtering jobs by status and by assignee.', () => {
            testSetJobFilter({ column: '.cvat-job-item-assignee', menuItem: Cypress.env('regularUserEmail') });
            checkJobsTableRowCount(1);
            testSetJobFilter({ column: '.cvat-job-item-assignee', reset: true });
            checkJobsTableRowCount(2);
            testSetJobFilter({ column: '.cvat-job-item-status', reset: true });
        });

        it('Filtering jobs by status. Annotation', () => {
            testSetJobFilter({ column: '.cvat-job-item-status', menuItem: 'annotation' });
            checkJobsTableRowCount(2);
            checkContentsRow(1, 'annotation', '');
        });

        it('Filtering jobs by status. Annotation, completed', () => {
            testSetJobFilter({ column: '.cvat-job-item-status', menuItem: 'completed' });
            checkJobsTableRowCount(3);
            checkContentsRow(1, 'completed', Cypress.env('regularUserEmail'));
            checkContentsRow(2, 'annotation', '');
            testSetJobFilter({ column: '.cvat-job-item-status', reset: true }); // Reset filter by status
        });
    });
});
