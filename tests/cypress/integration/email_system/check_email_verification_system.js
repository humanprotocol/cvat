// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

const randomString = (isPassword) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i <= 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return isPassword ? `${result}${Math.floor(Math.random() * 10)}` : result;
};

context('Check email verification system', () => {
    const caseId = 'Email verification system';

    before(() => {
        cy.visit('/');
        cy.url().should('include', '/auth/login');
    });

    after(() => {
        cy.deletingRegisteredUsers([Cypress.env('regularUserEmail')]);
    });

    describe(`Case: "${caseId}"`, () => {
        it('Register user. Notification exist. The response status is successful.', () => {
            cy.intercept('POST', '/api/v1/auth/register').as('userRegister');
            cy.userRegistration(
                Cypress.env('regularUserEmail'),
                Cypress.env('regularUserEmail'),
                Cypress.env('regularUserWalletAddress'),
                Cypress.env('regularUserSignedEmail'),
            );
            cy.get('.ant-notification-topRight')
                .contains(`We have sent an email with a confirmation link to ${Cypress.env('regularUserEmail')}.`)
                .should('exist');
            cy.wait('@userRegister').its('response.statusCode').should('eq', 201);
        });
    });
});
