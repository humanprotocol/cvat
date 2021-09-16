// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import ReactDOM from 'react-dom';

import ObjectItemContainer from 'containers/annotation-page/standard-workspace/objects-side-bar/object-item';
import { Workspace } from 'reducers/interfaces';

interface Props {
    readonly: boolean;
    workspace: Workspace;
    contextMenuClientID: number | null;
    objectStates: any[];
    visible: boolean;
    left: number;
    top: number;
}

export default function CanvasContextMenu(props: Props): JSX.Element | null {
    const {
        contextMenuClientID,
        objectStates,
        visible,
        left,
        top,
        readonly,
    } = props;

    if (!visible || contextMenuClientID === null) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className='cvat-canvas-context-menu' style={{ top, left }}>
            <ObjectItemContainer
                readonly={readonly}
                key={contextMenuClientID}
                clientID={contextMenuClientID}
                objectStates={objectStates}
                initialCollapsed
            />
        </div>,
        window.document.body,
    );
}
