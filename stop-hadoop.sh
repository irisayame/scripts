#!/bin/bash -x

ssh hadoop@r16s09 stop-dfs.sh
ssh hadoop@r16s11 stop-yarn.sh 
