// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

const labelName = `Main task`;
const taskName = `New annotation task for ${labelName}`;

context('When clicking on the Logout button, get the user session closed.', () => {
    const issueId = '1810';
    let taskId;
    let authKey;

    function login() {
        cy.request({
            method: 'POST',
            url: '/api/v1/auth/login',
            body: {
                email: Cypress.env('regularUserEmail'),
                wallet_address: Cypress.env('regularUserWalletAddress'),
                signed_email: Cypress.env('regularUserSignedEmail'),
            },
        }).then((response) => {
            authKey = response['body']['key'];
        });
        cy.visit('/');
    }

    before(() => {
        cy.request({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: {
                username: Cypress.env('regularUserEmail'),
                email: Cypress.env('regularUserEmail'),
                wallet_address: Cypress.env('regularUserWalletAddress'),
                signed_email: Cypress.env('regularUserSignedEmail'),
            },
        });
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

        it('Login and open task', () => {
            login();
            cy.visit('/', {
                headers: {
                    Authorization: `Token ${authKey}`,
                },
            });
            cy.visit('/');
            cy.openTask(taskName);
            // get id task
            cy.url().then((link) => {
                taskId = Number(link.split('/').slice(-1)[0]);
            });
        });

        it('Logout and login to task via token', () => {
            cy.logout();
            // get token and login to task
            cy.request({
                method: 'POST',
                url: '/api/v1/auth/login',
                body: {
                    email: Cypress.env('regularUserEmail'),
                    wallet_address: Cypress.env('regularUserWalletAddress'),
                    signed_email: Cypress.env('regularUserSignedEmail'),
                },
            }).then(async (response) => {
                response = await response['headers']['set-cookie'];
                const csrfToken = response[0].match(/csrftoken=\w+/)[0].replace('csrftoken=', '');
                const sessionId = response[1].match(/sessionid=\w+/)[0].replace('sessionid=', '');
                cy.visit(`/login-with-token/${sessionId}/${csrfToken}?next=/tasks/${taskId}`);
                cy.contains('.cvat-task-details-task-name', `${taskName}`).should('be.visible');
            });
            cy.logout();
        });
    });
});
