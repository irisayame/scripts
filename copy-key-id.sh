#!/bin/bash

ssh-keygen
hosts="09 10 11 12"
for h in $hosts
do
	ssh-copy-id -i ~/.ssh/id_rsa.pub r16s$h
done
