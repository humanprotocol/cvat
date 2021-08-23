# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

import requests

from cvat.apps.authentication.models import WalletToUser
from cvat.apps.engine.log import slogger
from cvat.settings.base import CVAT_URL, CVAT_EXCHANGE_URL

def notify_jobflow(db_jobs, db_task):
    try:
        payouts = []
        for job in db_jobs:
            wallet_to_user = WalletToUser.objects.get(user=job.assignee)
            wallet_address = wallet_to_user.wallet_address
            payout = {
                "wallet_address": wallet_address,
                "job_url": f'{CVAT_URL}/tasks/{job.segment.task.id}/jobs/{job.id}'
            }
            payouts.append(payout)

        payload = {
            "task_id": db_task.id,
            "task_address": db_task.name,
            "payouts": payouts
        }
        requests.post(f'{CVAT_EXCHANGE_URL}/notify', json=payload)
        db_task.is_exchange_notified = True
    except requests.ConnectionError:
        slogger.task[db_task.id].error('Could not connect to the exchange and notify. Task {}'.format(db_task.id))
