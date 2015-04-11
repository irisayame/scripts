#!/bin/bash -x

echo "usage sync-scripts"
hosts="10 11 12"

for h in $hosts
do
	scp -r scripts r16s$h:
done
