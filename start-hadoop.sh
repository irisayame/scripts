#!/bin/bash -x

ssh hadoop@r16s09 start-dfs.sh
ssh hadoop@r16s11 start-yarn.sh 
