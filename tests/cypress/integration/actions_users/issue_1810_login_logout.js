// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

const labelName = `Main task`;
const taskName = `New annotation task for ${labelName}`;

context('When clicking on the Logout button, get the user session closed.', () => {
    const issueId = '1810';
    let taskId;

    before(() => {
        cy.userRegistration(
            Cypress.env('regularUserEmail'),
            Cypress.env('regularUserEmail'),
            Cypress.env('regularUserWalletAddress'),
            Cypress.env('regularUserSignedEmail'),
        );
    });

    after(() => {
        cy.deletingRegisteredUsers([Cypress.env('regularUserEmail')]);
    });

    describe(`Testing issue "${issueId}"`, () => {
        it('Login and logout', () => {
            cy.closeModalUnsupportedPlatform();
            cy.visit('/');
            cy.logout(Cypress.env('regularUserEmail'));
            cy.url().should('include', '/auth/login');
        });

        // it('Login and open task', () => {
        //     cy.regularUserLogin(Cypress.env('regularUserEmail'), Cypress.env('regularUserWalletAddress'), Cypress.env('regularUserSignedEmail'));
        //     cy.openTask(taskName);
        //     // get id task
        //     cy.url().then((link) => {
        //         taskId = Number(link.split('/').slice(-1)[0]);
        //     });
        // });

        // it('Logout and login to task via token', () => {
        //     cy.logout();
        //     // get token and login to task
        //     cy.request({
        //         method: 'POST',
        //         url: '/api/v1/auth/login',
        //         body: {
        //             email: Cypress.env('regularUserEmail'),
        //             wallet_address: Cypress.env('regularUserWalletAddress'),
        //             signed_email: Cypress.env('regularUserSignedEmail'),
        //         },
        //     }).then(async (response) => {
        //         response = await response['headers']['set-cookie'];
        //         const csrfToken = response[0].match(/csrftoken=\w+/)[0].replace('csrftoken=', '');
        //         const sessionId = response[1].match(/sessionid=\w+/)[0].replace('sessionid=', '');
        //         cy.visit(`/login-with-token/${sessionId}/${csrfToken}?next=/tasks/${taskId}`);
        //         cy.contains('.cvat-task-details-task-name', `${taskName}`).should('be.visible');
        //     });
        //     cy.logout();
        // });

        it('Correct email and incorrect wallet', () => {
            cy.request({
                method: 'POST',
                url: '/api/v1/auth/login',
                failOnStatusCode: false,
                body: {
                    email: Cypress.env('regularUserEmail'),
                    wallet_address: 'NonExistingWalletAddress',
                    signed_email: 'IncorrectSignedEmail',
                },
            }).then((response) => {
                expect(response.status).to.eq(500);
            });
            cy.visit('/');
            cy.url().should('include', '/auth/login');
        });

        it('Inorrect email and correct wallet', () => {
            cy.request({
                method: 'POST',
                url: '/api/v1/auth/login',
                failOnStatusCode: false,
                body: {
                    email: 'NonExistingWallet@test.com',
                    wallet_address: Cypress.env('regularUserWalletAddress'),
                    signed_email: 'IncorrectSignedEmail',
                },
            }).then((response) => {
                expect(response.status).to.eq(500);
            });
            cy.visit('/');
            cy.url().should('include', '/auth/login');
        });
    });
});
