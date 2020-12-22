FROM debian:10.7-slim as build

# https://github.com/WebAssembly/wasi-libc
# https://github.com/WebAssembly/wasi-sdk
# The easiest way to get started with this is to use wasi-sdk, which includes a build of WASI Libc in its sysroot.

# Inspired by https://github.com/rene-fonseca/docker-webassembly/tree/master/wasisdk

# download and install wasi-sdk
RUN apt-get -y update
RUN apt-get -y install wget
RUN wget -q https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-12/wasi-sdk-12.0-linux.tar.gz
RUN tar xf /wasi-sdk-12.0-linux.tar.gz -C /

FROM debian:10.7-slim

COPY --from=build /wasi-sdk-12.0 /wasi-sdk

RUN mkdir code

WORKDIR /code
