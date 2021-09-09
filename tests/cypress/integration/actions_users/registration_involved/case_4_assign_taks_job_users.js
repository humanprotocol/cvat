// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

context('Multiple users. Assign task, job.', () => {
    const caseId = '4';
    const labelName = `Case ${caseId}`;
    const taskName = `New annotation task for ${labelName}`;
    const attrName = `Attr for ${labelName}`;
    const textDefaultValue = 'Some default value for type Text';
    const imagesCount = 1;
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

    before(() => {
        cy.imageGenerator(imagesFolder, imageFileName, width, height, color, posX, posY, labelName, imagesCount);
        cy.createZipArchive(directoryToArchive, archivePath);
    });

    after(() => {
        cy.deletingRegisteredUsers([Cypress.env('regularUserEmail'), Cypress.env('regularUser2Email')]);
        cy.visit('/admin');
        cy.login();
        cy.deleteTask(taskName);
    });

    describe(`Testing case "${caseId}"`, () => {
        // First user is "admin".
        it('Register second user, tries to create task and logout.', () => {
            cy.visit('/');
            cy.url().should('include', '/login');
            cy.userRegistration(
                Cypress.env('regularUserEmail'),
                Cypress.env('regularUserEmail'),
                Cypress.env('regularUserWalletAddress'),
                Cypress.env('regularUserSignedEmail'),
            );
            cy.createAnnotationTask(
                taskName,
                labelName,
                attrName,
                textDefaultValue,
                archiveName,
                null,
                null,
                false,
                false,
                null,
                'fail',
            );
            cy.closeNotification('.cvat-notification-notice-create-task-failed');
            cy.contains('.cvat-item-task-name', `${taskName}`).should('not.exist');
            cy.logout();
        });
        it('Register third user and logout.', () => {
            cy.visit('/');
            cy.url().should('include', '/login');
            cy.userRegistration(
                Cypress.env('regularUser2Email'),
                Cypress.env('regularUser2Email'),
                Cypress.env('regularUser2WalletAddress'),
                Cypress.env('regularUser2SignedEmail'),
            );
            cy.logout();
        });
        it('First user login, create a task and logout', () => {
            cy.visit('/admin');
            cy.login();
            cy.createAnnotationTask(taskName, labelName, attrName, textDefaultValue, archiveName);
            cy.logout();
        });
        it('Second user login, tries to add label and logout', () => {
            cy.regularUserLogin(
                Cypress.env('regularUserEmail'),
                Cypress.env('regularUserWalletAddress'),
                Cypress.env('regularUserSignedEmail'),
            );
            cy.openTask(taskName);
            cy.addNewLabel('failAddLabel');
            cy.closeNotification('.cvat-notification-notice-update-task-failed');
            cy.contains('.cvat-constructor-viewer-item', 'failAddLabel').should('not.exist');
            cy.logout();
        });
        it('Assign the task to the second user and logout', () => {
            cy.visit('/admin');
            cy.login();
            cy.openTask(taskName);
            cy.assignTaskToUser(Cypress.env('regularUserEmail'));
            cy.logout();
        });
        it('Second user login. The task can be opened. Logout', () => {
            cy.regularUserLogin(
                Cypress.env('regularUserEmail'),
                Cypress.env('regularUserWalletAddress'),
                Cypress.env('regularUserSignedEmail'),
            );
            cy.contains('strong', taskName).should('exist');
            cy.openTask(taskName);
            cy.logout();
        });
        it('Third user login. The task not exist. Logout', () => {
            cy.regularUserLogin(
                Cypress.env('regularUser2Email'),
                Cypress.env('regularUser2WalletAddress'),
                Cypress.env('regularUser2SignedEmail'),
            );
            cy.contains('strong', taskName).should('not.exist');
            cy.logout();
        });
        it('First user login and assign the job to the third user. Logout', () => {
            cy.visit('/admin');
            cy.login();
            cy.openTask(taskName);
            cy.assignJobToUser(0, Cypress.env('regularUser2Email'));
            cy.logout();
        });
        it('Third user login. Tries to delete task. The task can be opened.', () => {
            cy.regularUserLogin(
                Cypress.env('regularUser2Email'),
                Cypress.env('regularUser2WalletAddress'),
                Cypress.env('regularUser2SignedEmail'),
            );
            cy.contains('strong', taskName).should('exist');
            cy.deleteTask(taskName);
            cy.closeNotification('.cvat-notification-notice-delete-task-failed');
            cy.openTask(taskName);
            cy.logout();
        });
    });
});
