// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import { UserOutlined } from '@ant-design/icons';

export interface LoginData {
    email: string;
}

interface Props {
    fetching: boolean;
    onSubmit(loginData: LoginData): void;
}

function LoginFormComponent(props: Props): JSX.Element {
    const { fetching, onSubmit } = props;
    return (
        <Form onFinish={onSubmit} className='login-form'>
            <Form.Item
                hasFeedback
                name='email'
                rules={[
                    {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                    },
                    {
                        required: true,
                        message: 'Please specify a email',
                    },
                ]}
            >
                <Input
                    autoComplete='email'
                    prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                    placeholder='Email'
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type='primary'
                    loading={fetching}
                    disabled={fetching}
                    htmlType='submit'
                    className='login-form-button'
                >
                    Sign in
                </Button>
            </Form.Item>
        </Form>
    );
}

export default React.memo(LoginFormComponent);
