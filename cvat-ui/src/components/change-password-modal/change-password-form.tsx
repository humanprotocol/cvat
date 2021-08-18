// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Form, { RuleRender, RuleObject } from 'antd/lib/form';
import { LockOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';

import patterns from 'utils/validation-patterns';

export interface ChangePasswordData {
    oldPassword: string;
    newPassword1: string;
    newPassword2: string;
}

interface Props {
    fetching: boolean;
    onSubmit(loginData: ChangePasswordData): void;
}

export const validatePassword: RuleRender = (): RuleObject => ({
    validator(_: RuleObject, value: string): Promise<void> {
        if (!patterns.validatePasswordLength.pattern.test(value)) {
            return Promise.reject(new Error(patterns.validatePasswordLength.message));
        }

        if (!patterns.passwordContainsNumericCharacters.pattern.test(value)) {
            return Promise.reject(new Error(patterns.passwordContainsNumericCharacters.message));
        }

        if (!patterns.passwordContainsUpperCaseCharacter.pattern.test(value)) {
            return Promise.reject(new Error(patterns.passwordContainsUpperCaseCharacter.message));
        }

        if (!patterns.passwordContainsLowerCaseCharacter.pattern.test(value)) {
            return Promise.reject(new Error(patterns.passwordContainsLowerCaseCharacter.message));
        }

        return Promise.resolve();
    },
});

export const validateConfirmation: (firstFieldName: string) => RuleRender = (firstFieldName: string): RuleRender => ({
    getFieldValue,
}): RuleObject => ({
    validator(_: RuleObject, value: string): Promise<void> {
        if (value && value !== getFieldValue(firstFieldName)) {
            return Promise.reject(new Error('Two passwords that you enter is inconsistent!'));
        }

        return Promise.resolve();
    },
});

function ChangePasswordFormComponent({ fetching, onSubmit }: Props): JSX.Element {
    return (
        <Form onFinish={onSubmit} className='change-password-form'>
            <Form.Item
                hasFeedback
                name='oldPassword'
                rules={[
                    {
                        required: true,
                        message: 'Please input your current password!',
                    },
                ]}
            >
                <Input.Password
                    autoComplete='current-password'
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                    placeholder='Current password'
                />
            </Form.Item>

            <Form.Item
                hasFeedback
                name='newPassword1'
                rules={[
                    {
                        required: true,
                        message: 'Please input new password!',
                    },
                    validatePassword,
                ]}
            >
                <Input.Password
                    autoComplete='new-password'
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                    placeholder='New password'
                />
            </Form.Item>

            <Form.Item
                hasFeedback
                name='newPassword2'
                dependencies={['newPassword1']}
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your new password!',
                    },
                    validateConfirmation('newPassword1'),
                ]}
            >
                <Input.Password
                    autoComplete='new-password'
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                    placeholder='Confirm new password'
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type='primary'
                    htmlType='submit'
                    className='change-password-form-button'
                    loading={fetching}
                    disabled={fetching}
                >
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
}

export default React.memo(ChangePasswordFormComponent);
