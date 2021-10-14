#!/bin/bash

ln -s /opt/sharemyfiles/sharemyfiles.service /etc/systemd/system/sharemyfiles.service

systemctl daemon-reload
systemctl start sharemyfiles
systemctl enable sharemyfiles
