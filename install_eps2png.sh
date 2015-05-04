#!/bin/bash -x

eps2png

if [[ $? != 255 ]]; then
    wget http://www.cpan.org/authors/id/J/JV/JV/eps2png-2.7.tar.gz
    tar xvzf eps2png-2.7.tar.gz
    cd eps2png-2.7
    perl Makefile.PL
    make all
    make test
    sudo make install
    cd ..
    rm -rf eps2png*
fi
